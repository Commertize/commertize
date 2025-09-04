import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CommertIzerXDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [orchestrationStats, setOrchestrationStats] = useState({
    totalWorkflows: 0,
    completedWorkflows: 0,
    investorProfiles: 0,
    sponsorProfiles: 0,
    dealsProcessed: 0
  });

  const createInvestorProfile = async () => {
    try {
      // Using legacy endpoint for demo purposes - actual backend service is internal
      const response = await fetch('/api/commertizer-x/investor-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo_investor_' + Date.now(),
          kycData: { email: 'demo@investor.com' }
        })
      });
      
      if (response.ok) {
        setOrchestrationStats(prev => ({ ...prev, investorProfiles: prev.investorProfiles + 1 }));
        console.log('Commertizer X: Investor profile created via backend service');
      }
    } catch (error) {
      console.error('Demo error:', error);
    }
  };

  const createSponsorProfile = async () => {
    try {
      const response = await fetch('/api/commertizer-x/sponsor-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo_sponsor_' + Date.now(),
          companyData: { name: 'Demo Sponsor LLC' }
        })
      });
      
      if (response.ok) {
        setOrchestrationStats(prev => ({ ...prev, sponsorProfiles: prev.sponsorProfiles + 1 }));
        console.log('Commertizer X: Sponsor profile created');
      }
    } catch (error) {
      console.error('Demo error:', error);
    }
  };

  const submitProperty = async () => {
    try {
      const response = await fetch('/api/commertizer-x/submit-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo_sponsor_' + Date.now(),
          propertyData: {
            name: 'Demo Commercial Property',
            location: 'Los Angeles, CA',
            type: 'Office Complex'
          },
          documents: ['financial_statement.pdf', 'property_photos.zip']
        })
      });
      
      if (response.ok) {
        setOrchestrationStats(prev => ({ ...prev, dealsProcessed: prev.dealsProcessed + 1 }));
        console.log('Commertizer X: Property submitted for processing');
      }
    } catch (error) {
      console.error('Demo error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-black">Commertizer X Demo</h1>
              <p className="text-sm text-gray-600 mt-1">
                Workflow Orchestration Agent - Plan → Validate → Execute → Audit
              </p>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              Dual AI System Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="investor-ops">InvestorOps</TabsTrigger>
            <TabsTrigger value="sponsor-ops">SponsorOps</TabsTrigger>
            <TabsTrigger value="deal-ops">DealOps</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black font-light">Commertizer X Architecture</CardTitle>
                <CardDescription>
                  Comprehensive workflow orchestration agent complementing RUNE.CTZ strategic intelligence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-black">RUNE.CTZ (Master Intelligence)</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Strategic insights and analysis</li>
                      <li>• Deal Quality Index computation</li>
                      <li>• Market intelligence and recommendations</li>
                      <li>• Risk assessment and scoring</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-medium text-black">Commertizer X (Execution Agent)</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• End-to-end workflow orchestration</li>
                      <li>• Investor/Sponsor onboarding automation</li>
                      <li>• Document processing and extraction</li>
                      <li>• Compliance and audit trail management</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-black mb-2">Five Operational Modes</h4>
                  <div className="grid grid-cols-5 gap-4 text-xs">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full mx-auto mb-1"></div>
                      <span className="font-medium">DealOps</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1"></div>
                      <span className="font-medium">InvestorOps</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full mx-auto mb-1"></div>
                      <span className="font-medium">SponsorOps</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full mx-auto mb-1"></div>
                      <span className="font-medium">ComplianceOps</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full mx-auto mb-1"></div>
                      <span className="font-medium">IntegrationOps</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investor-ops" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black font-light">InvestorOps Demo</CardTitle>
                <CardDescription>
                  KYC/AML onboarding, portfolio dashboards, investment flow automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <Button onClick={createInvestorProfile} className="bg-yellow-600 hover:bg-yellow-700">
                    Create Investor Profile
                  </Button>
                  <Button variant="outline">
                    View Portfolio Dashboard
                  </Button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-black mb-3">Investor Onboarding Checklist</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">KYC/AML Identity Verification</span>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accredited Investor Verification</span>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">MetaMask Wallet Connection</span>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Initial Funding Setup</span>
                      <Badge variant="secondary">Optional</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-medium text-black mb-2">Sample Portfolio</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Value:</span>
                        <span className="font-medium">$75,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Return:</span>
                        <span className="font-medium text-green-600">+10.35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Properties:</span>
                        <span className="font-medium">2</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-medium text-black mb-2">Recent Activity</h5>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div>Distribution: The Axis - $4,250</div>
                      <div>Distribution: Meridian - $3,050</div>
                      <div>Purchase: The Axis - 100 tokens</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sponsor-ops" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black font-light">SponsorOps Demo</CardTitle>
                <CardDescription>
                  Sponsor onboarding, property submission, deal pipeline management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <Button onClick={createSponsorProfile} className="bg-yellow-600 hover:bg-yellow-700">
                    Create Sponsor Profile
                  </Button>
                  <Button variant="outline">
                    View Sponsor Dashboard
                  </Button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-black mb-3">Sponsor Submission Checklist</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Company Verification & KYB</span>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Property Documentation Upload</span>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Financial Statement Review</span>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">DQI Computation & Review</span>
                      <Badge variant="outline">Required</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-light text-black">{orchestrationStats.dealsProcessed}</div>
                    <div className="text-xs text-gray-600">Submitted</div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-light text-black">0</div>
                    <div className="text-xs text-gray-600">Approved</div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-light text-black">0</div>
                    <div className="text-xs text-gray-600">Tokenizing</div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-light text-black">0</div>
                    <div className="text-xs text-gray-600">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deal-ops" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black font-light">DealOps Demo</CardTitle>
                <CardDescription>
                  Document processing, financial extraction, DQI computation, tokenization prep
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <Button onClick={submitProperty} className="bg-yellow-600 hover:bg-yellow-700">
                    Submit Property
                  </Button>
                  <Button variant="outline">
                    Process Documents
                  </Button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-black mb-3">Property Processing Pipeline</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Document Intake</span>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Financial Extraction</span>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Data Reconciliation</span>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">DQI Computation</span>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black font-light">Orchestration Analytics</CardTitle>
                <CardDescription>
                  Real-time metrics across all Commertizer X operational modes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-light text-black">{orchestrationStats.investorProfiles}</div>
                    <div className="text-sm text-gray-600">Investor Profiles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-black">{orchestrationStats.sponsorProfiles}</div>
                    <div className="text-sm text-gray-600">Sponsor Profiles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-black">{orchestrationStats.dealsProcessed}</div>
                    <div className="text-sm text-gray-600">Deals Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-black">95%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-black mb-3">System Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">RUNE.CTZ:</span>
                      <Badge className="ml-2 bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div>
                      <span className="font-medium">Commertizer X:</span>
                      <Badge className="ml-2 bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div>
                      <span className="font-medium">Database:</span>
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800">In-Memory</Badge>
                    </div>
                    <div>
                      <span className="font-medium">Integration:</span>
                      <Badge className="ml-2 bg-blue-100 text-blue-800">Ready</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}