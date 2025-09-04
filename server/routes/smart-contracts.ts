import { Router } from 'express';
import { smartContractService, SmartContractDeploymentParams } from '../services/smartContractService';
import { ArcTokenizationService } from '../services/arcTokenizationService';
import { getFirestore } from 'firebase-admin/firestore';

const router = Router();

// Unified tokenization endpoint (Arc-first with bridge fallback)
router.post('/tokenize/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const {
      network = 'testnet',
      tokenName,
      tokenSymbol,
      totalTokenSupply,
      pricePerToken
    } = req.body;

    // Get property details from database
    const db = getFirestore();
    const propertyDoc = await db.collection('properties').doc(propertyId).get();
    
    if (!propertyDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    const property = propertyDoc.data();
    let result: any;
    let usedArc = false;

    // Step 1: Try Arc tokenization first (Q1 2025 readiness)
    try {
      const arcService = new ArcTokenizationService();
      const arcResult = await arcService.tokenizeAsset({
        assetType: 'real-estate',
        assetDetails: {
          name: property?.name || 'Property',
          symbol: tokenSymbol || property?.name?.substring(0, 4).toUpperCase() || 'PROP',
          totalValue: property?.propertyValue || 1000000,
          description: `Tokenized real estate: ${property?.name}`,
          location: property?.location
        },
        compliance: {
          jurisdiction: 'US',
          regulation: 'reg-d',
          kycRequired: true,
          accreditationRequired: true
        },
        tokenomics: {
          totalSupply: totalTokenSupply || 1000000,
          initialPrice: pricePerToken || property?.pricePerToken || 100,
          minimumInvestment: 1000,
          transferRestrictions: true
        }
      });

      if (arcResult.success && arcResult.arcIntegration?.status !== 'waitlist') {
        result = arcResult;
        usedArc = true;
        console.log(`Arc tokenization successful for property: ${property?.name}`);
      }
    } catch (arcError) {
      console.log('Arc tokenization not ready, falling back to bridge tokenization');
    }

    // Step 2: Fallback to bridge tokenization if Arc isn't ready
    if (!usedArc) {
      const deploymentParams: SmartContractDeploymentParams = {
        propertyId,
        propertyName: property?.name || 'Unknown Property',
        propertyLocation: property?.location || 'Unknown Location',
        propertyValue: property?.propertyValue || property?.targetEquity || 1000000,
        totalTokenSupply: totalTokenSupply || 1000000,
        pricePerToken: pricePerToken || (property?.pricePerToken || 100),
        tokenName: tokenName || `${property?.name} Token`,
        tokenSymbol: tokenSymbol || (property?.name?.substring(0, 4).toUpperCase() || 'PROP'),
        network
      };

      result = await smartContractService.createTestDeployment(propertyId, deploymentParams);
      result.bridgeTokenization = true;
      result.arcAttempted = true;
      result.arcStatus = 'fallback';
      console.log(`Bridge tokenization completed for property: ${property?.name}`);
    }

    if (result.success) {
      res.json({
        success: true,
        data: {
          propertyId,
          contractAddresses: result.contractAddresses,
          deploymentInfo: result,
          tokenizationMethod: usedArc ? 'arc' : 'bridge',
          arcReady: usedArc,
          message: `${usedArc ? 'Arc' : 'Bridge'} tokenization completed successfully`
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Tokenization failed'
      });
    }

  } catch (error) {
    console.error('Unified tokenization error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Generate and deploy smart contract for a property
router.post('/generate/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const {
      network = 'testnet',
      ownerAddress,
      tokenName,
      tokenSymbol,
      totalTokenSupply,
      pricePerToken
    } = req.body;

    // Get property details from database
    const db = getFirestore();
    const propertyDoc = await db.collection('properties').doc(propertyId).get();
    
    if (!propertyDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    const property = propertyDoc.data();
    
    // Prepare deployment parameters
    const deploymentParams: SmartContractDeploymentParams = {
      propertyId,
      propertyName: property?.name || 'Unknown Property',
      propertyLocation: property?.location || 'Unknown Location',
      propertyValue: property?.propertyValue || property?.targetEquity || 1000000,
      totalTokenSupply: totalTokenSupply || 1000000,
      pricePerToken: pricePerToken || (property?.pricePerToken || 100),
      tokenName: tokenName || `${property?.name} Token`,
      tokenSymbol: tokenSymbol || (property?.name?.substring(0, 4).toUpperCase() || 'PROP'),
      network,
      ownerAddress
    };

    console.log(`Deploying smart contract for property: ${deploymentParams.propertyName}`);
    
    // Deploy smart contract
    const result = await smartContractService.generateSmartContract(deploymentParams);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          propertyId,
          contractAddresses: result.contractAddresses,
          deploymentInfo: result,
          message: 'Smart contract deployed successfully'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Smart contract deployment failed'
      });
    }

  } catch (error) {
    console.error('Smart contract generation error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Get contract information for a property
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const contractInfo = await smartContractService.getPropertyContractInfo(propertyId);
    
    if (!contractInfo) {
      return res.status(404).json({
        success: false,
        error: 'No smart contract found for this property'
      });
    }

    res.json({
      success: true,
      data: contractInfo
    });

  } catch (error) {
    console.error('Error fetching contract info:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Get all deployed contracts
router.get('/list', async (req, res) => {
  try {
    const contracts = await smartContractService.getAllDeployedContracts();
    
    res.json({
      success: true,
      data: contracts
    });

  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Test deployment endpoint (creates mock deployment for testing)
router.post('/test-deploy', async (req, res) => {
  try {
    const { propertyId, network = 'testnet', tokenName, tokenSymbol, totalTokenSupply, pricePerToken } = req.body;
    
    const result = await smartContractService.createTestDeployment(propertyId, {
      network,
      tokenName,
      tokenSymbol,
      totalTokenSupply,
      pricePerToken
    });
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          propertyId,
          contractAddresses: result.contractAddresses,
          deploymentInfo: result,
          message: 'Test smart contract deployment created successfully'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Test deployment failed'
      });
    }

  } catch (error) {
    console.error('Test deployment error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Deploy real smart contract
router.post('/deploy', async (req, res) => {
  try {
    const { propertyId, network = 'testnet', tokenName, tokenSymbol, totalTokenSupply, pricePerToken } = req.body;
    
    // Get property details from database
    const db = getFirestore();
    const propertyDoc = await db.collection('properties').doc(propertyId).get();
    
    if (!propertyDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    const property = propertyDoc.data();
    
    // Prepare deployment parameters
    const deploymentParams: SmartContractDeploymentParams = {
      propertyId,
      propertyName: property?.name || 'Unknown Property',
      propertyLocation: property?.location || 'Unknown Location',
      propertyValue: property?.propertyValue || property?.targetEquity || 1000000,
      totalTokenSupply: totalTokenSupply || 1000000,
      pricePerToken: pricePerToken || (property?.pricePerToken || 100),
      tokenName: tokenName || `${property?.name} Token`,
      tokenSymbol: tokenSymbol || (property?.name?.substring(0, 4).toUpperCase() || 'PROP'),
      network,
    };

    console.log(`Deploying smart contract for property: ${deploymentParams.propertyName}`);
    
    // Deploy smart contract
    const result = await smartContractService.generateSmartContract(deploymentParams);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          propertyId,
          contractAddresses: result.contractAddresses,
          deploymentInfo: result,
          message: 'Smart contract deployed successfully'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Smart contract deployment failed'
      });
    }

  } catch (error) {
    console.error('Smart contract deployment error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Estimate deployment cost
router.get('/estimate-cost', async (req, res) => {
  try {
    const { network = 'testnet' } = req.query as { network?: string };
    
    const costEstimate = await smartContractService.estimateDeploymentCost(network);
    
    res.json({
      success: true,
      data: costEstimate
    });

  } catch (error) {
    console.error('Error estimating cost:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Compile contracts
router.post('/compile', async (req, res) => {
  try {
    console.log('Compiling smart contracts...');
    const result = await smartContractService.compileContracts();
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          message: 'Contracts compiled successfully',
          output: result.output
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Compilation error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Get contract deployment status
router.get('/status/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const contractInfo = await smartContractService.getPropertyContractInfo(propertyId);
    
    res.json({
      success: true,
      data: {
        deployed: !!contractInfo,
        propertyId,
        contractInfo: contractInfo || null
      }
    });

  } catch (error) {
    console.error('Error checking deployment status:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Update contract configuration
router.put('/configure/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const updates = req.body;

    // Get existing contract info
    const contractInfo = await smartContractService.getPropertyContractInfo(propertyId);
    
    if (!contractInfo) {
      return res.status(404).json({
        success: false,
        error: 'Smart contract not found for this property'
      });
    }

    // Update contract configuration in database
    const db = getFirestore();
    await db.collection('smart-contracts').doc(propertyId).update({
      ...updates,
      lastUpdated: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        message: 'Contract configuration updated successfully',
        propertyId,
        updates
      }
    });

  } catch (error) {
    console.error('Error updating contract configuration:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Remove contract deployment record
router.delete('/remove/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const db = getFirestore();
    const contractDoc = await db.collection('smart-contracts').doc(propertyId).get();
    
    if (!contractDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Smart contract not found for this property'
      });
    }

    // Remove the contract deployment record
    await db.collection('smart-contracts').doc(propertyId).delete();

    res.json({
      success: true,
      data: {
        message: 'Contract deployment record removed successfully',
        propertyId
      }
    });

  } catch (error) {
    console.error('Error removing contract:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

export default router;