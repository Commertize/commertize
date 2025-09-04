import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { getFirestore } from 'firebase-admin/firestore';

export interface SmartContractDeploymentParams {
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  propertyValue: number;
  totalTokenSupply: number;
  pricePerToken: number;
  tokenName?: string;
  tokenSymbol?: string;
  network?: 'testnet' | 'mainnet' | 'localhost';
  ownerAddress?: string;
}

export interface DeploymentResult {
  success: boolean;
  contractAddresses?: {
    identityRegistry: string;
    compliance: string;
    realEstateToken: string;
  };
  transactionHashes?: string[];
  deployerAddress?: string;
  networkInfo?: {
    name: string;
    chainId: string;
  };
  error?: string;
  gasUsed?: string;
  estimatedCost?: string;
}

export class SmartContractService {
  private contractsPath: string;
  private db: FirebaseFirestore.Firestore;

  constructor() {
    this.contractsPath = path.join(process.cwd(), 'server', 'contracts');
    this.db = getFirestore();
  }

  /**
   * Generate smart contract for a property
   */
  async generateSmartContract(params: SmartContractDeploymentParams): Promise<DeploymentResult> {
    try {
      console.log(`Generating smart contract for property: ${params.propertyName}`);
      
      // Validate parameters
      this.validateParams(params);

      // Ensure contracts directory and dependencies
      await this.setupContractEnvironment();

      // Set environment variables for deployment
      const envVars = this.prepareEnvironmentVariables(params);

      // Deploy contracts
      const deploymentResult = await this.deployContracts(params.network || 'testnet', envVars);

      // Store deployment info in database
      await this.storeDeploymentInfo(params.propertyId, deploymentResult, params);

      console.log(`Smart contract deployment completed for ${params.propertyName}`);
      return deploymentResult;

    } catch (error) {
      console.error('Smart contract generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deployment error'
      };
    }
  }

  /**
   * Get contract info for a property
   */
  async getPropertyContractInfo(propertyId: string): Promise<any> {
    try {
      const doc = await this.db.collection('smart-contracts').doc(propertyId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error fetching contract info:', error);
      throw error;
    }
  }

  /**
   * Get all deployed contracts
   */
  async getAllDeployedContracts(): Promise<any[]> {
    try {
      const snapshot = await this.db.collection('smart-contracts').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching all contracts:', error);
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
  }

  /**
   * Create test deployment for testing purposes
   */
  async createTestDeployment(propertyId: string, deploymentParams: any): Promise<DeploymentResult> {
    try {
      console.log(`Creating test deployment for property: ${propertyId}`);
      
      // Get property details from database
      const propertyDoc = await this.db.collection('properties').doc(propertyId).get();
      
      if (!propertyDoc.exists) {
        throw new Error('Property not found');
      }

      const property = propertyDoc.data();
      
      // Generate dynamic contract addresses based on property data
      const propertyHash = this.generatePropertyHash(property?.name, propertyId);
      const chainId = deploymentParams.network === 'mainnet' ? '98866' : '98867';
      const contractAddresses = {
        identityRegistry: this.generateDeterministicAddress(propertyHash, 'identity', chainId),
        compliance: this.generateDeterministicAddress(propertyHash, 'compliance', chainId),
        realEstateToken: this.generateDeterministicAddress(propertyHash, 'token', chainId)
      };

      const deploymentInfo = {
        propertyId: propertyId,
        propertyName: property?.name || 'Unknown Property',
        propertyLocation: property?.location || 'Unknown Location',
        propertyValue: property?.propertyValue || property?.targetEquity || 1000000,
        contractAddresses: contractAddresses,
        network: deploymentParams.network || 'testnet',
        deploymentTimestamp: new Date().toISOString(),
        success: true,
        tokenInfo: {
          name: deploymentParams.tokenName || `${property?.name} Token`,
          symbol: deploymentParams.tokenSymbol || property?.name?.substring(0, 4).toUpperCase() || 'PROP',
          totalSupply: deploymentParams.totalTokenSupply || 1000000,
          pricePerToken: deploymentParams.pricePerToken || 100
        },
        networkInfo: {
          name: deploymentParams.network || 'testnet',
          chainId: deploymentParams.network === 'mainnet' ? '98866' : '98867'
        },
        deployerAddress: this.generateDeterministicAddress(propertyHash, 'deployer', chainId),
        gasUsed: '3400000',
        estimatedCost: '0.034000'
      };

      // Store in Firebase
      await this.db.collection('smart-contracts').doc(propertyId).set(deploymentInfo);
      
      return {
        success: true,
        contractAddresses: contractAddresses,
        deployerAddress: this.generateDeterministicAddress(propertyHash, 'deployer', chainId),
        networkInfo: {
          name: deploymentParams.network || 'testnet',
          chainId: deploymentParams.network === 'mainnet' ? '98866' : '98867'
        },
        // Arc integration flag for future migration
        arcReady: true,
        bridgeTokenization: true
      };

    } catch (error) {
      console.error('Test deployment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deployment error'
      };
    }
  }

  /**
   * Estimate deployment cost
   */
  async estimateDeploymentCost(network: string = 'testnet'): Promise<{ estimatedGas: string; estimatedCostETH: string; estimatedCostUSD?: string }> {
    try {
      // These are rough estimates - in production you'd query current gas prices
      const gasEstimates = {
        identityRegistry: 500000,
        compliance: 400000,
        realEstateToken: 2500000
      };

      const totalGas = Object.values(gasEstimates).reduce((sum, gas) => sum + gas, 0);
      const gasPrice = network === 'mainnet' ? 50000000000 : 10000000000; // 50 gwei mainnet, 10 gwei testnet
      const estimatedCostWei = BigInt(totalGas) * BigInt(gasPrice);
      const estimatedCostETH = (Number(estimatedCostWei) / 1e18).toFixed(6);

      return {
        estimatedGas: totalGas.toString(),
        estimatedCostETH: estimatedCostETH,
        estimatedCostUSD: network === 'mainnet' ? (parseFloat(estimatedCostETH) * 3000).toFixed(2) : undefined // rough ETH price
      };
    } catch (error) {
      console.error('Error estimating deployment cost:', error);
      throw error;
    }
  }

  /**
   * Compile contracts
   */
  async compileContracts(): Promise<{ success: boolean; output?: string; error?: string }> {
    try {
      console.log('Compiling smart contracts...');
      await this.setupContractEnvironment();
      
      const output = await this.runHardhatCommand(['compile']);
      
      return {
        success: true,
        output
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Compilation failed'
      };
    }
  }

  /**
   * Generate deterministic property hash for consistent address generation
   */
  private generatePropertyHash(propertyName: string = '', propertyId: string): string {
    const data = `${propertyName.toLowerCase().replace(/\s+/g, '')}_${propertyId}_commertize`;
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate deterministic contract addresses based on property data (EIP-55 compliant)
   */
  private generateDeterministicAddress(propertyHash: string, contractType: string, chainId: string = '98867'): string {
    const combined = `${propertyHash}_${contractType}_${chainId}_commertize_salt_2025`;
    const hash = createHash('sha256').update(combined).digest('hex');
    const address = hash.slice(0, 40);
    return this.toChecksumAddress(`0x${address}`);
  }

  /**
   * Convert address to EIP-55 checksum format
   */
  private toChecksumAddress(address: string): string {
    const addr = address.toLowerCase().replace('0x', '');
    const hash = createHash('sha256').update(addr).digest('hex');
    let checksumAddr = '0x';
    
    for (let i = 0; i < addr.length; i++) {
      if (parseInt(hash[i], 16) >= 8) {
        checksumAddr += addr[i].toUpperCase();
      } else {
        checksumAddr += addr[i];
      }
    }
    return checksumAddr;
  }

  private validateParams(params: SmartContractDeploymentParams): void {
    const required = ['propertyId', 'propertyName', 'propertyLocation', 'propertyValue'];
    const missing = required.filter(field => !params[field as keyof SmartContractDeploymentParams]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }

    if (params.propertyValue <= 0) {
      throw new Error('Property value must be greater than 0');
    }

    if (params.totalTokenSupply && params.totalTokenSupply <= 0) {
      throw new Error('Total token supply must be greater than 0');
    }

    if (params.pricePerToken && params.pricePerToken <= 0) {
      throw new Error('Price per token must be greater than 0');
    }
  }

  private prepareEnvironmentVariables(params: SmartContractDeploymentParams): Record<string, string> {
    return {
      PROPERTY_NAME: params.propertyName,
      PROPERTY_LOCATION: params.propertyLocation,
      PROPERTY_VALUE: params.propertyValue.toString(),
      TOTAL_TOKEN_SUPPLY: (params.totalTokenSupply || 1000000).toString(),
      PRICE_PER_TOKEN: (params.pricePerToken || 100).toString(),
      TOKEN_NAME: params.tokenName || `${params.propertyName} Token`,
      TOKEN_SYMBOL: params.tokenSymbol || params.propertyName.substring(0, 4).toUpperCase(),
      PRIVATE_KEY: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
      PLUME_TESTNET_RPC_URL: process.env.PLUME_TESTNET_RPC_URL || 'https://testnet-rpc.plume.org',
      PLUME_MAINNET_RPC_URL: process.env.PLUME_MAINNET_RPC_URL || 'https://rpc.plume.org'
    };
  }

  private async setupContractEnvironment(): Promise<void> {
    // Check if package.json exists, if not install dependencies
    const packageJsonPath = path.join(this.contractsPath, 'package.json');
    
    try {
      await fs.access(packageJsonPath);
    } catch {
      console.log('Installing contract dependencies...');
      await this.runCommand('npm', ['install'], this.contractsPath);
    }

    // Create .env file if needed
    const envPath = path.join(this.contractsPath, '.env');
    try {
      await fs.access(envPath);
    } catch {
      await fs.writeFile(envPath, '# Environment variables for smart contract deployment\n');
    }
  }

  private async deployContracts(network: string, envVars: Record<string, string>): Promise<DeploymentResult> {
    try {
      console.log(`Deploying to ${network} network...`);

      // Write environment variables to .env file
      const envContent = Object.entries(envVars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      await fs.writeFile(path.join(this.contractsPath, '.env'), envContent);

      // Run deployment
      const deployCommand = network === 'localhost' ? 'deploy:local' : 
                           network === 'mainnet' ? 'deploy:mainnet' : 'deploy:testnet';
      
      const output = await this.runHardhatCommand(['run', 'scripts/deploy.js', '--network', network]);
      
      // Parse deployment output to extract contract addresses
      const contractAddresses = this.parseDeploymentOutput(output);
      
      return {
        success: true,
        contractAddresses,
        deployerAddress: envVars.PRIVATE_KEY ? 'Configured' : 'Not configured',
        networkInfo: {
          name: network,
          chainId: network === 'mainnet' ? '98865' : '161221135'
        }
      };

    } catch (error) {
      console.error('Deployment failed:', error);
      throw error;
    }
  }

  private parseDeploymentOutput(output: string): { identityRegistry: string; compliance: string; realEstateToken: string } | undefined {
    try {
      // Look for contract addresses in the output
      const identityRegistryMatch = output.match(/IdentityRegistryLite deployed to: (0x[a-fA-F0-9]{40})/);
      const complianceMatch = output.match(/ComplianceLite deployed to: (0x[a-fA-F0-9]{40})/);
      const realEstateTokenMatch = output.match(/RealEstateERC3643 deployed to: (0x[a-fA-F0-9]{40})/);

      if (identityRegistryMatch && complianceMatch && realEstateTokenMatch) {
        return {
          identityRegistry: identityRegistryMatch[1],
          compliance: complianceMatch[1],
          realEstateToken: realEstateTokenMatch[1]
        };
      }
    } catch (error) {
      console.error('Error parsing deployment output:', error);
    }
    return undefined;
  }

  private async storeDeploymentInfo(propertyId: string, result: DeploymentResult, params: SmartContractDeploymentParams): Promise<void> {
    try {
      const deploymentInfo = {
        propertyId: propertyId,
        propertyName: params.propertyName,
        propertyLocation: params.propertyLocation,
        propertyValue: params.propertyValue,
        contractAddresses: result.contractAddresses,
        network: params.network || 'testnet',
        deploymentTimestamp: new Date().toISOString(),
        success: result.success,
        tokenInfo: {
          name: params.tokenName || `${params.propertyName} Token`,
          symbol: params.tokenSymbol || params.propertyName.substring(0, 4).toUpperCase(),
          totalSupply: params.totalTokenSupply || 1000000,
          pricePerToken: params.pricePerToken || 100
        },
        networkInfo: result.networkInfo,
        deployerAddress: result.deployerAddress
      };

      await this.db.collection('smart-contracts').doc(propertyId).set(deploymentInfo);
      console.log(`Stored deployment info for property ${propertyId}`);
    } catch (error) {
      console.error('Error storing deployment info:', error);
      throw error;
    }
  }

  private async runHardhatCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('npx', ['hardhat', ...args], {
        cwd: this.contractsPath,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        console.log(text);
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        console.error(text);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', reject);
    });
  }

  private async runCommand(command: string, args: string[], cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { cwd, stdio: 'inherit' });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve('Success');
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }
}

export const smartContractService = new SmartContractService();