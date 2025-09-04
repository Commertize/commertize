import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePlumeConfig, usePlumeNetworkStatus, useKYCStatus } from "@/hooks/usePlumeConfig";
import { Loader2, CheckCircle, XCircle, Network, Wallet, Shield, AlertCircle, Copy, ExternalLink, Zap, Lock, Users, Sparkles, ArrowRight } from "lucide-react";

export function PlumeIntegration() {
  const [walletAddress, setWalletAddress] = useState("");
  const [testWallet, setTestWallet] = useState<string | null>(null);

  const { data: config, isLoading: configLoading } = usePlumeConfig();
  const { data: networkStatus, isLoading: networkLoading } = usePlumeNetworkStatus();
  const { data: kycStatus, isLoading: kycLoading } = useKYCStatus(testWallet);

  const handleTestKYC = () => {
    if (walletAddress.trim()) {
      setTestWallet(walletAddress.trim());
    }
  };

  const handleClearTest = () => {
    setTestWallet(null);
    setWalletAddress("");
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl flex items-center justify-center border border-yellow-200">
            <Network className="w-10 h-10 text-yellow-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-normal text-gray-900">Plume Blockchain Integration</h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real-world asset tokenization on Plume network with enterprise-grade security and compliance
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Configuration Card */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-900 font-normal">
              <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center">
                <Network className="w-5 h-5 text-white" />
              </div>
              Network Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {configLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="space-y-3 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-600 mx-auto" />
                  <p className="text-sm text-gray-600">Loading configuration...</p>
                </div>
              </div>
            ) : config ? (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal text-gray-700">Chain ID</Label>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg font-mono text-sm text-gray-900 border">
                    {config.PLUME_CHAIN_ID}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal text-gray-700">RPC URL</Label>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg font-mono text-xs text-gray-900 break-all border">
                    {config.PLUME_RPC_URL}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal text-gray-700">Contract Address</Label>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg font-mono text-xs text-gray-900 break-all border">
                    {config.CONTRACT_ADDRESS}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Failed to load configuration</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Network Status Card */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-900 font-normal">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {networkLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="space-y-3 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
                  <p className="text-sm text-gray-600">Checking network status...</p>
                </div>
              </div>
            ) : networkStatus ? (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-gray-700">Network</span>
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 font-normal">
                      {networkStatus.networkName}
                    </Badge>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-gray-700">Connection Status</span>
                    <div className="flex items-center gap-2">
                      {networkStatus.status === 'operational' ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-normal text-green-600 capitalize">
                            {networkStatus.status}
                          </span>
                        </>
                      ) : networkStatus.status === 'degraded' ? (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-normal text-yellow-600 capitalize">
                            {networkStatus.status}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-normal text-red-600 capitalize">
                            {networkStatus.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {networkStatus.statusMessage && (
                    <div className="mt-2 text-xs text-gray-500">
                      {networkStatus.statusMessage}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal text-gray-700">Chain ID</Label>
                    <div className="text-sm font-mono text-gray-900">{networkStatus.chainId}</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal text-gray-700">Last Checked</Label>
                    <div className="text-xs text-gray-500">
                      {new Date(networkStatus.lastChecked).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Failed to load network status</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KYC Testing Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-gray-900 font-normal">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            KYC Verification Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <Label className="text-sm font-normal text-gray-700 mb-3 block">Wallet Address</Label>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter wallet address (0x...)"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="font-mono text-sm border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
              />
              <Button 
                onClick={handleTestKYC}
                disabled={!walletAddress.trim() || kycLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 h-11 group"
              >
                {kycLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Verify KYC</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
              {testWallet && (
                <Button 
                  variant="outline" 
                  onClick={handleClearTest}
                  className="border-gray-300 hover:bg-gray-50 h-11"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {testWallet && kycStatus && (
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${kycStatus.verified ? 'bg-green-100' : 'bg-red-100'}`}>
                  {kycStatus.verified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <h4 className="font-normal text-lg text-gray-900">KYC Verification Result</h4>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-gray-700">Wallet Address</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="font-mono text-xs text-gray-900 break-all block mt-2">{kycStatus.wallet}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-normal text-gray-700">Verification Status</span>
                  <div className="flex items-center gap-2">
                    {kycStatus.verified ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 font-normal">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200 font-normal">
                        <XCircle className="w-3 h-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                {kycStatus.complianceLevel && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-gray-700">Compliance Level</span>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-normal capitalize">
                      {kycStatus.complianceLevel}
                    </Badge>
                  </div>
                )}
                
                {kycStatus.status && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-gray-700">Processing Status</span>
                    <span className="text-sm text-gray-600 capitalize">{kycStatus.status.replace('_', ' ')}</span>
                  </div>
                )}
                
                {kycStatus.verificationDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-gray-700">Verified On</span>
                    <span className="text-sm text-gray-600">
                      {new Date(kycStatus.verificationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-yellow-600 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-normal text-gray-900">Fast Tokenization</h3>
            <p className="text-sm text-gray-600">Deploy ERC-3643 compliant tokens in minutes with automated smart contract generation</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-green-600 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-normal text-gray-900">Built-in Compliance</h3>
            <p className="text-sm text-gray-600">Automatic KYC verification and regulatory compliance for all token transactions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-normal text-gray-900">Fractional Ownership</h3>
            <p className="text-sm text-gray-600">Enable global access to commercial real estate through fractional token ownership</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="text-center space-y-4 py-6">
        <div className="space-y-2">
          <h3 className="text-xl font-normal text-gray-900">Enterprise-Grade Blockchain Integration</h3>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Plume blockchain integration enables secure tokenization of commercial real estate assets
            with built-in compliance, KYC verification, and regulatory compliance for institutional-grade investments.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-normal px-3 py-1">
            ERC-3643 Compliant
          </Badge>
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-normal px-3 py-1">
            KYC Integrated
          </Badge>
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-normal px-3 py-1">
            Regulatory Ready
          </Badge>
        </div>
      </div>
    </div>
  );
}