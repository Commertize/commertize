import { Router } from 'express';
import { PlaidApi, Configuration, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { getFirestore } from 'firebase-admin/firestore';

const router = Router();
const db = getFirestore();

// Initialize Plaid client based on environment
const getPlaidClient = () => {
  const plaidEnv = process.env.PLAID_ENV || 'sandbox';
  let basePath;
  
  switch (plaidEnv) {
    case 'production':
      basePath = PlaidEnvironments.production;
      break;
    case 'development':
      basePath = PlaidEnvironments.development;
      break;
    default:
      basePath = PlaidEnvironments.sandbox;
  }

  const configuration = new Configuration({
    basePath,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  });
  return new PlaidApi(configuration);
};

// Create Link Token - Step 1 in Plaid flow
router.post('/create-link-token', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const client = getPlaidClient();
    
    const request = {
      client_name: 'Commertize',
      user: {
        client_user_id: userId,
      },
      products: [Products.IdentityVerification, Products.Auth, Products.Transactions, Products.Identity],
      country_codes: [CountryCode.Us],
      language: 'en',
    };

    const createTokenResponse = await client.linkTokenCreate(request);
    
    res.json({
      success: true,
      link_token: createTokenResponse.data.link_token,
      expiration: createTokenResponse.data.expiration,
      request_id: createTokenResponse.data.request_id
    });
  } catch (error: any) {
    console.error('Error creating link token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create link token',
      details: error.response?.data || error.message
    });
  }
});

// Exchange Public Token for Access Token - Step 3 in Plaid flow with Database Storage
router.post('/exchange-public-token', async (req, res) => {
  try {
    const { public_token, userId } = req.body;
    
    if (!public_token) {
      return res.status(400).json({
        success: false,
        error: 'Public token is required'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const client = getPlaidClient();
    
    const request = {
      public_token,
    };

    const response = await client.itemPublicTokenExchange(request);
    
    // Get account information immediately after exchange
    const accountsResponse = await client.accountsGet({
      access_token: response.data.access_token,
    });

    // Get identity information for KYC
    let identityData = null;
    try {
      const identityResponse = await client.identityGet({
        access_token: response.data.access_token,
      });
      identityData = identityResponse.data.accounts;
    } catch (identityError) {
      console.warn('Could not fetch identity data:', identityError);
    }

    // Get auth information for account/routing numbers
    let authData = null;
    try {
      const authResponse = await client.authGet({
        access_token: response.data.access_token,
      });
      authData = authResponse.data;
    } catch (authError) {
      console.warn('Could not fetch auth data:', authError);
    }

    // Store complete banking data in Firestore
    const bankingData = {
      userId: userId,
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
      requestId: response.data.request_id,
      accounts: accountsResponse.data.accounts.map(account => ({
        accountId: account.account_id,
        mask: account.mask,
        name: account.name,
        officialName: account.official_name,
        type: account.type,
        subtype: account.subtype,
        balances: {
          available: account.balances.available,
          current: account.balances.current,
          limit: account.balances.limit,
          isoCurrencyCode: account.balances.iso_currency_code
        }
      })),
      institution: accountsResponse.data.item.institution_id,
      identityVerified: identityData ? true : false,
      identityData: identityData ? identityData.map(account => ({
        accountId: account.account_id,
        owners: account.owners.map(owner => ({
          names: owner.names,
          phoneNumbers: owner.phone_numbers,
          emails: owner.emails,
          addresses: owner.addresses
        }))
      })) : null,
      authData: authData ? {
        accounts: authData.accounts?.map(account => ({
          accountId: account.account_id,
          accountNumber: authData.numbers?.ach?.find(ach => ach.account_id === account.account_id)?.account,
          routingNumber: authData.numbers?.ach?.find(ach => ach.account_id === account.account_id)?.routing,
          wireRouting: authData.numbers?.ach?.find(ach => ach.account_id === account.account_id)?.wire_routing
        }))
      } : null,
      status: 'active',
      environment: process.env.PLAID_ENV || 'sandbox',
      connectedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Store in user-banking-data collection
    await db.collection('user-banking-data').doc(userId).set(bankingData);

    // Also store a summary in the user's profile
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      bankingConnected: true,
      bankingProvider: 'plaid',
      bankingConnectedAt: new Date().toISOString(),
      primaryBankAccount: {
        mask: accountsResponse.data.accounts[0]?.mask,
        name: accountsResponse.data.accounts[0]?.name,
        type: accountsResponse.data.accounts[0]?.type,
        subtype: accountsResponse.data.accounts[0]?.subtype
      }
    });

    console.log(`✅ Banking data stored for user ${userId} with ${accountsResponse.data.accounts.length} accounts`);
    
    res.json({
      success: true,
      access_token: response.data.access_token,
      item_id: response.data.item_id,
      request_id: response.data.request_id,
      accounts: accountsResponse.data.accounts,
      accountsCount: accountsResponse.data.accounts.length,
      identityVerified: identityData ? true : false
    });
  } catch (error: any) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to exchange public token',
      details: error.response?.data || error.message
    });
  }
});

// Get All Banking Data for Admin Dashboard
router.get('/admin/banking-data', async (req, res) => {
  try {
    const bankingSnapshot = await db.collection('user-banking-data').get();
    const usersSnapshot = await db.collection('users').get();
    
    const users = usersSnapshot.docs.reduce((acc, doc) => {
      const userData = doc.data();
      acc[doc.id] = {
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email || '',
        phone: userData.phoneNumber || userData.phone || ''
      };
      return acc;
    }, {} as Record<string, any>);

    const bankingData = bankingSnapshot.docs.map(doc => {
      const data = doc.data();
      const user = users[doc.id];
      
      return {
        userId: doc.id,
        userName: user?.name || 'Unknown User',
        userEmail: user?.email || 'Unknown Email',
        userPhone: user?.phone || '',
        accountsCount: data.accounts?.length || 0,
        totalBalance: data.accounts?.reduce((sum: number, account: any) => 
          sum + (account.balances?.current || 0), 0) || 0,
        institution: data.institution || 'Unknown',
        status: data.status || 'unknown',
        environment: data.environment || 'sandbox',
        identityVerified: data.identityVerified || false,
        connectedAt: data.connectedAt || '',
        lastUpdated: data.lastUpdated || '',
        accounts: data.accounts || []
      };
    });

    res.json({
      success: true,
      data: bankingData,
      totalUsers: bankingData.length,
      totalAccounts: bankingData.reduce((sum, user) => sum + user.accountsCount, 0),
      totalBalance: bankingData.reduce((sum, user) => sum + user.totalBalance, 0),
      verifiedUsers: bankingData.filter(user => user.identityVerified).length
    });
  } catch (error: any) {
    console.error('Error getting admin banking data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get banking data',
      details: error.message
    });
  }
});

// Get User Banking Details
router.get('/user/:userId/banking', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const doc = await db.collection('user-banking-data').doc(userId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Banking data not found for user'
      });
    }

    const data = doc.data()!;
    
    // Remove sensitive data for client response
    const { accessToken, ...safeData } = data;
    
    res.json({
      success: true,
      data: safeData
    });
  } catch (error: any) {
    console.error('Error getting user banking data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user banking data',
      details: error.message
    });
  }
});

// Refresh Account Balances
router.post('/refresh-balances/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get stored banking data
    const doc = await db.collection('user-banking-data').doc(userId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Banking data not found for user'
      });
    }

    const bankingData = doc.data()!;
    const client = getPlaidClient();
    
    // Get fresh balance data
    const response = await client.accountsBalanceGet({
      access_token: bankingData.accessToken,
    });

    // Update stored data with new balances
    const updatedAccounts = bankingData.accounts.map((storedAccount: any) => {
      const freshAccount = response.data.accounts.find((acc: any) => acc.account_id === storedAccount.accountId);
      if (freshAccount) {
        return {
          ...storedAccount,
          balances: {
            available: freshAccount.balances.available,
            current: freshAccount.balances.current,
            limit: freshAccount.balances.limit,
            isoCurrencyCode: freshAccount.balances.iso_currency_code
          }
        };
      }
      return storedAccount;
    });

    // Update database
    await db.collection('user-banking-data').doc(userId).update({
      accounts: updatedAccounts,
      lastUpdated: new Date().toISOString()
    });

    res.json({
      success: true,
      accounts: updatedAccounts,
      lastUpdated: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error refreshing balances:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh balances',
      details: error.response?.data || error.message
    });
  }
});

// Get Recent Transactions for a User
router.post('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { start_date, end_date } = req.body;
    
    // Get stored banking data
    const doc = await db.collection('user-banking-data').doc(userId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Banking data not found for user'
      });
    }

    const bankingData = doc.data()!;
    const client = getPlaidClient();
    
    const request: any = {
      access_token: bankingData.accessToken,
      start_date: start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end_date: end_date || new Date().toISOString().split('T')[0], // today
    };

    const response = await client.transactionsGet(request);
    
    res.json({
      success: true,
      transactions: response.data.transactions,
      accounts: response.data.accounts,
      total_transactions: response.data.total_transactions,
      request_id: response.data.request_id
    });
  } catch (error: any) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions',
      details: error.response?.data || error.message
    });
  }
});

// Remove Banking Connection
router.delete('/disconnect/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get stored banking data to retrieve access token
    const doc = await db.collection('user-banking-data').doc(userId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Banking data not found for user'
      });
    }

    const bankingData = doc.data()!;
    const client = getPlaidClient();
    
    // Remove the item from Plaid
    try {
      await client.itemRemove({
        access_token: bankingData.accessToken,
      });
    } catch (plaidError) {
      console.warn('Error removing item from Plaid (may already be removed):', plaidError);
    }

    // Remove from database
    await db.collection('user-banking-data').doc(userId).delete();
    
    // Update user profile
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      bankingConnected: false,
      bankingProvider: null,
      bankingConnectedAt: null,
      primaryBankAccount: null
    });

    res.json({
      success: true,
      message: 'Banking connection removed successfully'
    });
  } catch (error: any) {
    console.error('Error disconnecting banking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect banking',
      details: error.message
    });
  }
});

// Legacy endpoints for backward compatibility
router.post('/accounts', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'Access token is required'
      });
    }

    const client = getPlaidClient();
    
    const request = {
      access_token,
    };

    const response = await client.accountsGet(request);
    
    res.json({
      success: true,
      accounts: response.data.accounts,
      item: response.data.item,
      request_id: response.data.request_id
    });
  } catch (error: any) {
    console.error('Error getting accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get accounts',
      details: error.response?.data || error.message
    });
  }
});

router.post('/balances', async (req, res) => {
  try {
    const { access_token, account_ids } = req.body;
    
    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'Access token is required'
      });
    }

    const client = getPlaidClient();
    
    const request: any = {
      access_token,
    };
    
    if (account_ids) {
      request.account_ids = account_ids;
    }

    const response = await client.accountsBalanceGet(request);
    
    res.json({
      success: true,
      accounts: response.data.accounts,
      item: response.data.item,
      request_id: response.data.request_id
    });
  } catch (error: any) {
    console.error('Error getting balances:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get balances',
      details: error.response?.data || error.message
    });
  }
});

router.post('/transactions', async (req, res) => {
  try {
    const { access_token, start_date, end_date, account_ids } = req.body;
    
    if (!access_token || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Access token, start_date, and end_date are required'
      });
    }

    const client = getPlaidClient();
    
    const request: any = {
      access_token,
      start_date,
      end_date,
    };
    
    if (account_ids) {
      request.account_ids = account_ids;
    }

    const response = await client.transactionsGet(request);
    
    res.json({
      success: true,
      accounts: response.data.accounts,
      transactions: response.data.transactions,
      total_transactions: response.data.total_transactions,
      item: response.data.item,
      request_id: response.data.request_id
    });
  } catch (error: any) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions',
      details: error.response?.data || error.message
    });
  }
});

router.post('/identity', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'Access token is required'
      });
    }

    const client = getPlaidClient();
    
    const request = {
      access_token,
    };

    const response = await client.identityGet(request);
    
    res.json({
      success: true,
      accounts: response.data.accounts,
      item: response.data.item,
      request_id: response.data.request_id
    });
  } catch (error: any) {
    console.error('Error getting identity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get identity',
      details: error.response?.data || error.message
    });
  }
});

router.post('/auth', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'Access token is required'
      });
    }

    const client = getPlaidClient();
    
    const request = {
      access_token,
    };

    const response = await client.authGet(request);
    
    res.json({
      success: true,
      accounts: response.data.accounts,
      numbers: response.data.numbers,
      item: response.data.item,
      request_id: response.data.request_id
    });
  } catch (error: any) {
    console.error('Error getting auth data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get auth data',
      details: error.response?.data || error.message
    });
  }
});

router.post('/item', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'Access token is required'
      });
    }

    const client = getPlaidClient();
    
    const request = {
      access_token,
    };

    const response = await client.itemGet(request);
    
    res.json({
      success: true,
      item: response.data.item,
      status: response.data.status,
      request_id: response.data.request_id
    });
  } catch (error: any) {
    console.error('Error getting item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get item',
      details: error.response?.data || error.message
    });
  }
});

export default router;