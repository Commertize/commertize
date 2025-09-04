import { 
  Configuration, 
  PlaidApi, 
  PlaidEnvironments, 
  Products, 
  CountryCode,
  DepositoryAccountSubtype
} from 'plaid';
import { getFirestore } from 'firebase-admin/firestore';

export interface PlaidLinkTokenRequest {
  userId: string;
  userEmail: string;
  userName: string;
  phoneNumber?: string;
  purpose: 'investment' | 'verification' | 'payment';
}

export interface PlaidAccountInfo {
  accountId: string;
  accountType: string;
  accountSubtype: string;
  mask: string;
  name: string;
  officialName?: string;
  balance: {
    available: number;
    current: number;
    isoCurrencyCode: string;
  };
  verification?: {
    status: string;
    accountNumber?: string;
    routingNumber?: string;
  };
}

export interface PlaidTransactionInfo {
  transactionId: string;
  accountId: string;
  amount: number;
  date: string;
  name: string;
  merchantName?: string;
  category: string[];
  pending: boolean;
  isoCurrencyCode: string;
}

export class PlaidService {
  private client: PlaidApi;
  private db: FirebaseFirestore.Firestore;

  constructor() {
    // Initialize Plaid configuration
    const configuration = new Configuration({
      basePath: this.getPlaidEnvironment(),
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
          'PLAID-SECRET': process.env.PLAID_SECRET || '',
        },
      },
    });

    this.client = new PlaidApi(configuration);
    this.db = getFirestore();
  }

  private getPlaidEnvironment(): string {
    const env = process.env.PLAID_ENV || 'sandbox';
    console.log(`Plaid environment: ${env}`);
    switch (env) {
      case 'production':
        console.log('🟢 PRODUCTION MODE: Real bank connections, live data, actual transfers');
        return PlaidEnvironments.production;
      case 'development':
        console.log('🟡 DEVELOPMENT MODE: Test bank connections with real flow simulation');
        return PlaidEnvironments.development;
      default:
        console.log('🔵 SANDBOX MODE: Demo data only - switch to production for real banking');
        return PlaidEnvironments.sandbox;
    }
  }

  /**
   * Create a Link token for Plaid Link initialization
   */
  async createLinkToken(request: PlaidLinkTokenRequest): Promise<string> {
    try {
      console.log(`Creating Plaid Link token for user: ${request.userId}`);

      const products = this.getProductsForPurpose(request.purpose);
      
      const linkTokenRequest: any = {
        user: {
          client_user_id: request.userId,
          email_address: request.userEmail,
          legal_name: request.userName,
          phone_number: request.phoneNumber || undefined,
        },
        client_name: 'Commertize - Tokenized Real Estate Investment Platform',
        products: products,
        country_codes: [CountryCode.Us],
        language: 'en',
        // Add redirect_uri for production/development environments
        ...(process.env.PLAID_ENV !== 'sandbox' ? {
          redirect_uri: process.env.PLAID_ENV === 'production' 
            ? 'https://commertize.replit.app/investment-success'
            : `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:3000'}/investment-success`
        } : {}),
        account_filters: request.purpose === 'investment' ? {
          depository: {
            account_subtypes: [
              DepositoryAccountSubtype.Checking,
              DepositoryAccountSubtype.Savings,
              DepositoryAccountSubtype.MoneyMarket
            ]
          }
        } : undefined,
      };

      // Add webhook URL if configured (optional for sandbox)
      const webhookUrl = process.env.PLAID_WEBHOOK_URL;
      if (webhookUrl && webhookUrl.startsWith('http')) {
        linkTokenRequest.webhook = webhookUrl;
      }
      
      console.log('Creating Plaid Link token with request:', JSON.stringify(linkTokenRequest, null, 2));

      const response = await this.client.linkTokenCreate(linkTokenRequest);

      console.log(`Plaid Link token created successfully for ${request.userId}`);
      return response.data.link_token;

    } catch (error) {
      console.error('Error creating Plaid Link token:', error);
      throw new Error('Failed to create Plaid Link token');
    }
  }

  /**
   * Exchange public token for access token
   */
  async exchangePublicToken(publicToken: string, userId: string): Promise<{
    accessToken: string;
    itemId: string;
    accounts: PlaidAccountInfo[];
  }> {
    try {
      console.log(`Exchanging public token for user: ${userId}`);

      const response = await this.client.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      // Get account information
      const accounts = await this.getAccounts(accessToken);

      // Store access token securely in database
      await this.storeUserPlaidData(userId, {
        accessToken,
        itemId,
        accounts: accounts.map(acc => acc.accountId),
        connectedAt: new Date().toISOString(),
      });

      console.log(`Successfully exchanged token and stored data for user: ${userId}`);
      
      return {
        accessToken,
        itemId,
        accounts,
      };

    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw new Error('Failed to exchange public token');
    }
  }

  /**
   * Get account information
   */
  async getAccounts(accessToken: string): Promise<PlaidAccountInfo[]> {
    try {
      const response = await this.client.accountsGet({
        access_token: accessToken,
      });

      return response.data.accounts.map(account => ({
        accountId: account.account_id,
        accountType: account.type,
        accountSubtype: account.subtype || '',
        mask: account.mask || '',
        name: account.name,
        officialName: account.official_name || undefined,
        balance: {
          available: account.balances.available || 0,
          current: account.balances.current || 0,
          isoCurrencyCode: account.balances.iso_currency_code || 'USD',
        },
      }));

    } catch (error) {
      console.error('Error getting accounts:', error);
      throw new Error('Failed to get account information');
    }
  }

  /**
   * Get account and routing numbers for ACH transfers
   */
  async getAccountNumbers(accessToken: string, accountId: string): Promise<{
    accountNumber: string;
    routingNumber: string;
  }> {
    try {
      const response = await this.client.authGet({
        access_token: accessToken,
        options: {
          account_ids: [accountId],
        },
      });

      const account = response.data.numbers.ach.find(acc => acc.account_id === accountId);
      
      if (!account) {
        throw new Error('Account not found or not eligible for ACH');
      }

      return {
        accountNumber: account.account,
        routingNumber: account.routing,
      };

    } catch (error) {
      console.error('Error getting account numbers:', error);
      throw new Error('Failed to get account numbers');
    }
  }

  /**
   * Get recent transactions
   */
  async getTransactions(accessToken: string, accountId?: string, days: number = 30): Promise<PlaidTransactionInfo[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const requestOptions: any = {
        access_token: accessToken,
        start_date: startDate.toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
      };
      
      if (accountId) {
        requestOptions.options = { account_ids: [accountId] };
      }
      
      const response = await this.client.transactionsGet(requestOptions);

      return response.data.transactions.map(transaction => ({
        transactionId: transaction.transaction_id,
        accountId: transaction.account_id,
        amount: transaction.amount,
        date: transaction.date,
        name: transaction.name,
        merchantName: transaction.merchant_name || undefined,
        category: transaction.category || [],
        pending: transaction.pending,
        isoCurrencyCode: transaction.iso_currency_code || 'USD',
      }));

    } catch (error) {
      console.error('Error getting transactions:', error);
      throw new Error('Failed to get transactions');
    }
  }

  /**
   * Verify account ownership (micro-deposits)
   */
  async initiateAccountVerification(accessToken: string, accountId: string): Promise<{
    verificationId: string;
    status: string;
  }> {
    try {
      // For micro-deposit verification
      const response = await this.client.accountsGet({
        access_token: accessToken,
        options: {
          account_ids: [accountId],
        },
      });

      const account = response.data.accounts.find(acc => acc.account_id === accountId);
      
      if (!account) {
        throw new Error('Account not found');
      }

      // In production, you would initiate actual micro-deposit verification
      // For now, we'll simulate the process
      const verificationId = `verify_${Date.now()}_${accountId}`;
      
      // Store verification status
      await this.db.collection('plaid-verifications').doc(verificationId).set({
        accountId,
        accessToken: accessToken.substring(0, 10) + '***', // Store partial for reference
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      return {
        verificationId,
        status: 'pending',
      };

    } catch (error) {
      console.error('Error initiating account verification:', error);
      throw new Error('Failed to initiate account verification');
    }
  }

  /**
   * Get user's Plaid connection status
   */
  async getUserPlaidStatus(userId: string): Promise<{
    connected: boolean;
    accounts?: PlaidAccountInfo[];
    lastSync?: string;
  }> {
    try {
      const doc = await this.db.collection('user-plaid-data').doc(userId).get();
      
      if (!doc.exists) {
        return { connected: false };
      }

      const data = doc.data();
      const accessToken = data?.accessToken;

      if (!accessToken) {
        return { connected: false };
      }

      // Get current account information
      const accounts = await this.getAccounts(accessToken);

      return {
        connected: true,
        accounts,
        lastSync: data?.lastSync || data?.connectedAt,
      };

    } catch (error) {
      console.error('Error getting user Plaid status:', error);
      return { connected: false };
    }
  }

  /**
   * Disconnect user's Plaid account
   */
  async disconnectUser(userId: string): Promise<void> {
    try {
      const doc = await this.db.collection('user-plaid-data').doc(userId).get();
      
      if (doc.exists) {
        const data = doc.data();
        const accessToken = data?.accessToken;

        if (accessToken) {
          // Remove the item from Plaid
          await this.client.itemRemove({
            access_token: accessToken,
          });
        }

        // Remove from our database
        await this.db.collection('user-plaid-data').doc(userId).delete();
        
        console.log(`Successfully disconnected Plaid for user: ${userId}`);
      }

    } catch (error) {
      console.error('Error disconnecting user:', error);
      throw new Error('Failed to disconnect Plaid account');
    }
  }

  /**
   * Handle Plaid webhook events
   */
  async handleWebhook(webhookData: any): Promise<void> {
    try {
      const { webhook_type, webhook_code, item_id } = webhookData;

      console.log(`Received Plaid webhook: ${webhook_type}.${webhook_code} for item: ${item_id}`);

      switch (webhook_type) {
        case 'TRANSACTIONS':
          if (webhook_code === 'DEFAULT_UPDATE') {
            await this.handleTransactionUpdate(item_id, webhookData);
          }
          break;
        case 'ITEM':
          if (webhook_code === 'ERROR') {
            await this.handleItemError(item_id, webhookData);
          }
          break;
        case 'AUTH':
          if (webhook_code === 'AUTOMATICALLY_VERIFIED') {
            await this.handleAccountVerified(item_id, webhookData);
          }
          break;
      }

    } catch (error) {
      console.error('Error handling Plaid webhook:', error);
    }
  }

  private getProductsForPurpose(purpose: string): Products[] {
    switch (purpose) {
      case 'investment':
        return [Products.Auth, Products.Transactions];
      case 'verification':
        return [Products.Auth];
      case 'payment':
        return [Products.Auth];
      default:
        return [Products.Auth];
    }
  }

  private async storeUserPlaidData(userId: string, data: any): Promise<void> {
    await this.db.collection('user-plaid-data').doc(userId).set(data, { merge: true });
  }

  private async handleTransactionUpdate(itemId: string, webhookData: any): Promise<void> {
    // Handle transaction updates
    console.log(`Handling transaction update for item: ${itemId}`);
    
    // Update last sync timestamp
    const userQuery = await this.db.collection('user-plaid-data')
      .where('itemId', '==', itemId)
      .limit(1)
      .get();

    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      await userDoc.ref.update({
        lastSync: new Date().toISOString(),
      });
    }
  }

  private async handleItemError(itemId: string, webhookData: any): Promise<void> {
    console.error(`Plaid item error for item: ${itemId}`, webhookData.error);
    
    // Mark item as having an error
    const userQuery = await this.db.collection('user-plaid-data')
      .where('itemId', '==', itemId)
      .limit(1)
      .get();

    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      await userDoc.ref.update({
        hasError: true,
        lastError: webhookData.error,
        errorTimestamp: new Date().toISOString(),
      });
    }
  }

  private async handleAccountVerified(itemId: string, webhookData: any): Promise<void> {
    console.log(`Account automatically verified for item: ${itemId}`);
    
    // Update verification status
    const userQuery = await this.db.collection('user-plaid-data')
      .where('itemId', '==', itemId)
      .limit(1)
      .get();

    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      await userDoc.ref.update({
        verified: true,
        verifiedAt: new Date().toISOString(),
      });
    }
  }
}

export const plaidService = new PlaidService();