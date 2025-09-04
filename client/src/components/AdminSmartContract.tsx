import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, AlertTriangle, CheckCircle2, Clock, Zap, Settings, Code, DollarSign, Building2, Shield, Users, FileText, Coins, Network, Database, Eye, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContractInfo {
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  propertyValue: number;
  contractAddresses?: {
    identityRegistry: string;
    compliance: string;
    realEstateToken: string;
    tokenFactory?: string;
    vault?: string;
  };
  network: string;
  deploymentTimestamp: string;
  success: boolean;
  tokenInfo: {
    name: string;
    symbol: string;
    totalSupply: number;
    pricePerToken: number;
  };
  networkInfo?: {
    name: string;
    chainId: string;
  };
  deployerAddress?: string;
}

interface Property {
  id: string;
  name: string;
  location: string;
  propertyValue?: number;
  targetEquity?: number;
  pricePerToken?: number;
}

export default function AdminSmartContract() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [deploymentParams, setDeploymentParams] = useState({
    network: "testnet",
    tokenName: "",
    tokenSymbol: "",
    totalTokenSupply: 1000000,
    pricePerToken: 100
  });

  // Fetch all properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const response = await fetch("/api/admin/properties");
      if (!response.ok) throw new Error("Failed to fetch properties");
      const result = await response.json();
      return result.data as Property[];
    },
  });

  // Fetch deployed contracts
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["smart-contracts"],
    queryFn: async () => {
      const response = await fetch("/api/smart-contracts/list");
      if (!response.ok) throw new Error("Failed to fetch contracts");
      const result = await response.json();
      return result.data as ContractInfo[];
    },
  });

  // Fetch deployment cost estimate
  const { data: costEstimate } = useQuery({
    queryKey: ["deployment-cost", deploymentParams.network],
    queryFn: async () => {
      const response = await fetch(`/api/smart-contracts/estimate-cost?network=${deploymentParams.network}`);
      if (!response.ok) throw new Error("Failed to fetch cost estimate");
      const result = await response.json();
      return result.data;
    },
  });

  // Deploy smart contract mutation (with Arc integration)
  const deployContractMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      // Try Arc tokenization first (if enabled), then fallback to bridge
      const property = properties.find(p => p.id === propertyId);
      
      try {
        // Attempt Arc tokenization for Q1 2025 readiness
        const arcResponse = await fetch('/api/arc/tokenize', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetType: 'real-estate',
            assetDetails: {
              name: property?.name || 'Property',
              symbol: deploymentParams.tokenSymbol || 'PROP',
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
              totalSupply: deploymentParams.totalTokenSupply,
              initialPrice: deploymentParams.pricePerToken,
              minimumInvestment: 1000,
              transferRestrictions: true
            }
          }),
        });

        if (arcResponse.ok) {
          const arcResult = await arcResponse.json();
          if (arcResult.success && arcResult.arcIntegration?.status !== 'waitlist') {
            return arcResult; // Arc tokenization successful
          }
        }
      } catch (arcError) {
        console.log('Arc tokenization not ready, using bridge tokenization');
      }

      // Fallback to bridge tokenization
      const response = await fetch(`/api/smart-contracts/generate/${propertyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...deploymentParams,
          arcFallback: true // Flag to indicate this is bridge tokenization
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Deployment failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Smart Contract Deployed",
        description: `Successfully deployed contract for ${data.data.propertyId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["smart-contracts"] });
      setSelectedProperty("");
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Compile contracts mutation
  const compileContractsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/smart-contracts/compile", {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Compilation failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Compilation Successful",
        description: "ERC-3643 contracts compiled successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Compilation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove contract mutation
  const removeContractMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await fetch(`/api/smart-contracts/remove/${propertyId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove contract");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contract Removed",
        description: "Smart contract deployment record removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["smart-contracts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Removal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeploy = () => {
    if (!selectedProperty) {
      toast({
        title: "No Property Selected",
        description: "Please select a property to deploy a smart contract for",
        variant: "destructive",
      });
      return;
    }

    const property = properties.find(p => p.id === selectedProperty);
    if (!property) return;

    // Auto-fill token details if not provided
    const params = {
      ...deploymentParams,
      tokenName: deploymentParams.tokenName || `${property.name} Token`,
      tokenSymbol: deploymentParams.tokenSymbol || property.name.substring(0, 4).toUpperCase(),
      pricePerToken: deploymentParams.pricePerToken || property.pricePerToken || 100
    };

    setDeploymentParams(params);
    deployContractMutation.mutate(selectedProperty);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const getNetworkExplorer = (network: string, address: string) => {
    const explorers = {
      testnet: `https://testnet-explorer.plume.org/address/${address}`,
      mainnet: `https://explorer.plume.org/address/${address}`,
      "plume-testnet": `https://testnet-explorer.plume.org/address/${address}`,
      "plume-mainnet": `https://explorer.plume.org/address/${address}`,
      localhost: `http://localhost:8545/address/${address}`,
    };
    return explorers[network as keyof typeof explorers] || "#";
  };

  const getNetworkBadgeColor = (network: string) => {
    switch (network) {
      case "mainnet":
      case "plume-mainnet":
        return "bg-green-100 text-green-800 border-green-200";
      case "testnet":
      case "plume-testnet":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "localhost":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black">Smart Contract Management</h2>
          <p className="text-gray-600">Deploy and manage ERC-3643 compliant smart contracts for tokenized real estate</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => compileContractsMutation.mutate()}
            disabled={compileContractsMutation.isPending}
            variant="outline"
          >
            {compileContractsMutation.isPending ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <Code className="w-4 h-4 mr-2" />
                Compile Contracts
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="deploy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="deploy">Deploy Contract</TabsTrigger>
          <TabsTrigger value="arc">Arc Tokenization</TabsTrigger>
          <TabsTrigger value="nest">Nest Yield</TabsTrigger>
          <TabsTrigger value="contracts">Deployed Contracts</TabsTrigger>
          <TabsTrigger value="manage">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deployment Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-yellow-600" />
                  Deployment Configuration
                </CardTitle>
                <CardDescription>
                  Configure the parameters for smart contract deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Property</Label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty} disabled={propertiesLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={propertiesLoading ? "Loading properties..." : "Choose a property to tokenize"} />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.length === 0 && !propertiesLoading ? (
                        <SelectItem value="" disabled>
                          No properties available
                        </SelectItem>
                      ) : (
                        properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              {property.name} - {property.location}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Select
                      value={deploymentParams.network}
                      onValueChange={(value) =>
                        setDeploymentParams(prev => ({ ...prev, network: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="testnet">
                          <Badge variant="secondary">Testnet</Badge> Plume Testnet (Chain: 98867)
                        </SelectItem>
                        <SelectItem value="mainnet">
                          <Badge variant="default">Mainnet</Badge> Plume Mainnet (Chain: 98866)
                        </SelectItem>
                        <SelectItem value="localhost">
                          <Badge variant="outline">Local</Badge> Local Development
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Total Token Supply</Label>
                    <Input
                      type="number"
                      value={deploymentParams.totalTokenSupply}
                      onChange={(e) =>
                        setDeploymentParams(prev => ({
                          ...prev,
                          totalTokenSupply: parseInt(e.target.value) || 0
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Token Name (Optional)</Label>
                    <Input
                      value={deploymentParams.tokenName}
                      onChange={(e) =>
                        setDeploymentParams(prev => ({ ...prev, tokenName: e.target.value }))
                      }
                      placeholder="Auto-generated from property name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Token Symbol (Optional)</Label>
                    <Input
                      value={deploymentParams.tokenSymbol}
                      onChange={(e) =>
                        setDeploymentParams(prev => ({ ...prev, tokenSymbol: e.target.value }))
                      }
                      placeholder="Auto-generated"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Price Per Token (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={deploymentParams.pricePerToken}
                    onChange={(e) =>
                      setDeploymentParams(prev => ({
                        ...prev,
                        pricePerToken: parseFloat(e.target.value) || 0
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cost Estimate & Deploy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  Deployment Cost & Actions
                </CardTitle>
                <CardDescription>
                  Estimated gas costs and deployment controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {costEstimate && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-yellow-800">Estimated Costs</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Gas Estimate:</span>
                        <div className="font-mono">{parseInt(costEstimate.estimatedGas).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Cost (ETH):</span>
                        <div className="font-mono">{costEstimate.estimatedCostETH} ETH</div>
                      </div>
                      {costEstimate.estimatedCostUSD && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Cost (USD):</span>
                          <div className="font-mono text-lg font-bold text-yellow-700">
                            ${costEstimate.estimatedCostUSD}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Make sure you have sufficient funds in your deployment wallet for gas fees.
                    Contracts will be deployed with ERC-3643 compliance for regulatory adherence.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleDeploy}
                  disabled={!selectedProperty || deployContractMutation.isPending}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                >
                  {deployContractMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Deploying Contracts...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Deploy Smart Contract
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployed Contracts</CardTitle>
              <CardDescription>
                Manage and monitor deployed smart contracts for your properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contractsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Clock className="w-6 h-6 animate-spin mr-2" />
                  Loading contracts...
                </div>
              ) : contracts.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  No smart contracts deployed yet
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {contracts.map((contract) => (
                      <Card key={contract.propertyId} className="border-yellow-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{contract.propertyName}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={contract.network === 'mainnet' ? 'default' : 'secondary'}>
                                  {contract.network}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  Deployed {new Date(contract.deploymentTimestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {contract.contractAddresses && (
                            <div className="space-y-3">
                              <div className="grid gap-3">
                                {Object.entries(contract.contractAddresses).map(([name, address]) => (
                                  <div key={name} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div>
                                      <div className="font-medium capitalize">
                                        {name.replace(/([A-Z])/g, ' $1').trim()}
                                      </div>
                                      <div className="font-mono text-sm text-gray-600">{address}</div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyToClipboard(address)}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(getNetworkExplorer(contract.network, address), '_blank')}
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <Separator />
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Token Name:</span>
                                  <div className="font-medium">{contract.tokenInfo.name}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Symbol:</span>
                                  <div className="font-medium">{contract.tokenInfo.symbol}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Total Supply:</span>
                                  <div className="font-medium">{contract.tokenInfo.totalSupply.toLocaleString()}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Price per Token:</span>
                                  <div className="font-medium">${contract.tokenInfo.pricePerToken}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arc" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Arc Tokenization Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Arc Tokenization Engine
                </CardTitle>
                <CardDescription>
                  Plume's official tokenization superapp (Q1 2025 launch)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Arc is launching Q1 2025. Current properties use bridge tokenization via ERC-3643.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Arc Features (Coming Q1 2025)</h4>
                    <ul className="text-sm space-y-1 text-blue-700">
                      <li>• No-code tokenization interface</li>
                      <li>• Automated compliance (Reg D/A+/CF)</li>
                      <li>• KYC/KYB integration (Parallel Markets)</li>
                      <li>• Institutional custody (Anchorage, Fireblocks)</li>
                      <li>• Multi-asset support (Real Estate, Credits, Bonds)</li>
                    </ul>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('https://forms.plumenetwork.xyz/arc-waitlist', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Arc Waitlist
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Bridge Tokenization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-green-600" />
                  Current Bridge Tokenization
                </CardTitle>
                <CardDescription>
                  ERC-3643 compliant tokens ready for Arc migration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Current Capabilities</h4>
                    <ul className="text-sm space-y-1 text-green-700">
                      <li>• ERC-3643 compliance & transfer restrictions</li>
                      <li>• Identity registry integration</li>
                      <li>• Automated compliance checks</li>
                      <li>• Compatible with Arc migration path</li>
                      <li>• Immediate tokenization available</li>
                    </ul>
                  </div>

                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      All properties tokenized now will seamlessly migrate to Arc when it launches.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nest" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nest Protocol Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Nest RWA Yield Protocol
                </CardTitle>
                <CardDescription>
                  Earn institutional-grade yields from real-world assets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Available Vaults</h4>
                    <div className="space-y-2 text-sm text-purple-700">
                      <div className="flex justify-between">
                        <span>Treasury Vault</span>
                        <span className="font-semibold">5.2% APY</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PayFi Vault</span>
                        <span className="font-semibold">8.7% APY</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Private Credit</span>
                        <span className="font-semibold">12.4% APY</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Institutional</span>
                        <span className="font-semibold">15.8% APY</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('https://app.nest.credit', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Access Nest Protocol
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Integration Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  Tokenized Asset Benefits
                </CardTitle>
                <CardDescription>
                  Enhanced yields for tokenized real estate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Nest Integration</h4>
                    <ul className="text-sm space-y-1 text-yellow-700">
                      <li>• Stake tokenized property dividends</li>
                      <li>• Compound returns through DeFi yields</li>
                      <li>• Access to institutional-grade assets</li>
                      <li>• Diversified risk across asset classes</li>
                      <li>• No lockup periods on most vaults</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-lg text-purple-600">$303M</div>
                      <div className="text-gray-600">Total Value Locked</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg text-purple-600">10.2%</div>
                      <div className="text-gray-600">Average APY</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contract Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-yellow-600" />
                  Contract Operations
                </CardTitle>
                <CardDescription>
                  Perform advanced operations on deployed ERC-3643 contracts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Contract</Label>
                  <Select disabled={contractsLoading || contracts.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        contractsLoading 
                          ? "Loading contracts..." 
                          : contracts.length === 0 
                            ? "No contracts deployed yet" 
                            : "Choose a deployed contract"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts.length === 0 && !contractsLoading ? (
                        <SelectItem value="" disabled>
                          No deployed contracts available
                        </SelectItem>
                      ) : (
                        contracts.map((contract) => (
                          <SelectItem key={contract.propertyId} value={contract.propertyId}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              {contract.propertyName} ({contract.network})
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Users className="w-4 h-4 mr-2" />
                    Manage KYC
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Shield className="w-4 h-4 mr-2" />
                    Update Compliance
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Coins className="w-4 h-4 mr-2" />
                    Mint Tokens
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Recover Address
                  </Button>
                </div>
                
                {contracts.length === 0 && (
                  <Alert>
                    <Building2 className="h-4 w-4" />
                    <AlertDescription>
                      No smart contracts have been deployed yet. Go to the "Deploy New Contract" tab to deploy your first tokenized property contract.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Advanced contract management features are currently in development.
                    These operations require careful validation for regulatory compliance.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Contract Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-yellow-600" />
                  Contract Analytics
                </CardTitle>
                <CardDescription>
                  View on-chain statistics and compliance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-green-800 font-semibold">{contracts.length}</div>
                    <div className="text-green-600 text-sm">Total Contracts</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-blue-800 font-semibold">
                      {contracts.filter(c => c.network === 'mainnet').length}
                    </div>
                    <div className="text-blue-600 text-sm">Mainnet Deploys</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-yellow-800 font-semibold">
                      {contracts.filter(c => c.success).length}
                    </div>
                    <div className="text-yellow-600 text-sm">Successful</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-purple-800 font-semibold">ERC-3643</div>
                    <div className="text-purple-600 text-sm">Compliance</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Network Distribution</h4>
                  {Array.from(new Set(contracts.map(c => c.network))).map(network => {
                    const count = contracts.filter(c => c.network === network).length;
                    const percentage = contracts.length > 0 ? (count / contracts.length) * 100 : 0;
                    return (
                      <div key={network} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{network}</span>
                          <span>{count} contracts ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getNetworkBadgeColor(network).includes('green') ? 'bg-green-500' : 
                              getNetworkBadgeColor(network).includes('blue') ? 'bg-blue-500' : 'bg-gray-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blockchain Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-yellow-600" />
                  Blockchain Configuration
                </CardTitle>
                <CardDescription>
                  Current network settings and deployment parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Plume Testnet</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-blue-600">RPC URL:</span> https://testnet-rpc.plumenetwork.xyz/http</div>
                      <div><span className="text-blue-600">Chain ID:</span> 161221135</div>
                      <div><span className="text-blue-600">Explorer:</span> https://testnet-explorer.plumenetwork.xyz</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Plume Mainnet</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-green-600">RPC URL:</span> https://mainnet-rpc.plumenetwork.xyz/http</div>
                      <div><span className="text-green-600">Chain ID:</span> 98865</div>
                      <div><span className="text-green-600">Explorer:</span> https://mainnet-explorer.plumenetwork.xyz</div>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Network settings are configured via environment variables. 
                    Contact your system administrator to modify RPC endpoints, private keys, and network configurations.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Contract Standards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-600" />
                  ERC-3643 Standards
                </CardTitle>
                <CardDescription>
                  Compliance and regulatory standards implemented
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Identity Registry</span>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Compliance Module</span>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Token Factory</span>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium">ERC-4626 Vault</span>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                </div>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    All contracts are deployed with ERC-3643 compliance for regulatory adherence, 
                    including KYC/AML verification and transfer restrictions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}