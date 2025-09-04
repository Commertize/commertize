import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Upload, CheckCircle, Clock, TrendingUp, DollarSign, Users, Building, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import InvestorPipelineModal from "@/components/InvestorPipelineModal";
import FundingStatusModal from "@/components/FundingStatusModal";
import ScenarioSimulator from "@/components/ScenarioSimulator";
import LeaseAnalysis from "@/components/LeaseAnalysis";
import ExpenseBenchmarking from "@/components/ExpenseBenchmarking";
import { UploadAnalyzeWidget, ReconciliationPanel, FinancialsTable, DebtCard, AssumptionsCard, useDealStore, fmt, maskTenants } from "@/pages/PropertyWhisperer";

interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  status: 'under_review' | 'approved' | 'tokenizing' | 'active' | 'rejected';
  dqiScore: number | null;
  submissionSteps: Array<{
    step: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: string;
  }>;
  tokenizationPipeline?: {
    spvDraft: 'pending' | 'in_progress' | 'completed';
    lienPackage: 'pending' | 'in_progress' | 'completed';
    disclosures: 'pending' | 'in_progress' | 'completed';
  };
  investorMetrics?: {
    totalSubscribed: number;
    targetRaise: number;
    investorCount: number;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface SponsorDashboardData {
  properties: Property[];
  dealPipeline: {
    submitted: number;
    approved: number;
    tokenizing: number;
    active: number;
  };
  notifications: Array<{
    id: string;
    type: 'info' | 'warning' | 'success';
    message: string;
    date: string;
  }>;
}

export default function SponsorDashboard() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSubmittingProperty, setIsSubmittingProperty] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showInvestorPipeline, setShowInvestorPipeline] = useState(false);
  const [showFundingStatus, setShowFundingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('properties');
  
  // Property submission form state
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'office',
    totalSqft: '',
    yearBuilt: '',
    description: ''
  });
  
  // Deal store for document extraction
  const setExtraction = useDealStore((s: any) => s.setExtraction);
  const extraction = useDealStore((s: any) => s.extraction);
  const [autoFilled, setAutoFilled] = useState(false);

  // Fetch sponsor dashboard data from local API
  const { data: dashboardData, refetch } = useQuery<SponsorDashboardData>({
    queryKey: ['sponsor-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/sponsor-dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      return result.dashboard;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const submitNewProperty = async () => {
    setIsSubmittingProperty(true);
    try {
      const response = await fetch('/api/sponsor-dashboard/submit-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyData: {
            name: 'New Property Submission',
            location: 'Commercial District',
            type: 'Office Building',
            targetRaise: 10000000
          },
          documents: [
            { name: 'Offering Memorandum.pdf', type: 'OM', status: 'uploaded' },
            { name: 'Financial Statements.xlsx', type: 'financials', status: 'uploaded' }
          ],
          sponsorId: 'demo_sponsor'
        })
      });
      
      if (response.ok) {
        refetch(); // Refresh with real data
      }
    } catch (error) {
      console.error('Property submission error:', error);
    } finally {
      setIsSubmittingProperty(false);
    }
  };

  const handleAutofill = () => {
    if (!extraction) return;

    // Auto-fill form with extracted data
    const autofillData = {
      ...formData,
      propertyName: extraction.debtTerms?.lender ? 
        `Property financed by ${extraction.debtTerms.lender}` : 
        'Analyzed Property',
      totalSqft: extraction.rentRoll?.reduce((total: number, unit: any) => total + (unit.sqft || 0), 0)?.toString() || formData.totalSqft,
    };

    setFormData(autofillData);
    setAutoFilled(true);
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmittingProperty(true);
    try {
      // Combine form data with extraction data
      const submitData = {
        propertyData: {
          ...formData,
          extractedFinancials: extraction,
          submittedAt: new Date().toISOString()
        },
        sponsorId: 'demo_sponsor'
      };

      const response = await fetch('/api/sponsor-dashboard/submit-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        // Reset form and switch back to properties tab
        setFormData({
          propertyName: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          propertyType: 'office',
          totalSqft: '',
          yearBuilt: '',
          description: ''
        });
        setExtraction(null);
        setAutoFilled(false);
        setActiveTab('properties');
        refetch(); // Refresh properties list
        alert('Property submitted successfully!');
      }
    } catch (error) {
      console.error('Property submission error:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmittingProperty(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDQIColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-logo font-light text-3xl text-black mb-2">
            Sponsor Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your property submissions, track tokenization progress, and monitor investor activity
          </p>
        </div>

        {/* Pipeline Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-logo font-light text-[#be8d00]">
                {dashboardData?.dealPipeline.submitted || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-logo font-light text-[#be8d00]">
                {dashboardData?.dealPipeline.approved || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Tokenizing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-logo font-light text-[#be8d00]">
                {dashboardData?.dealPipeline.tokenizing || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-logo font-light text-[#be8d00]">
                {dashboardData?.dealPipeline.active || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Your Properties
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Submit New Property
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Properties List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="font-logo font-light text-black">Your Properties</CardTitle>
                      <Button 
                        onClick={() => setActiveTab('submit')}
                        className="bg-[#be8d00] text-white hover:bg-[#a67800]"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Submit New Property
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData?.properties?.map((property) => (
                        <div 
                          key={property.id} 
                          className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedProperty(property)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-logo font-light text-lg text-black">{property.name}</h3>
                              <p className="text-sm text-gray-600">{property.location} • {property.type}</p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(property.status)}>
                              {property.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-6">
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-2 text-[#be8d00]" />
                              <span className="text-sm text-gray-600">DQI:</span>
                              <span className="ml-1 font-medium text-[#be8d00]">
                                {property.dqiScore || 'Pending'}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-[#be8d00]" />
                              <span className="text-sm text-gray-600">
                                Updated {new Date(property.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notifications & Quick Actions */}
              <div className="space-y-6">
                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-logo font-light text-black">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData?.notifications?.map((notification) => (
                        <div key={notification.id} className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full mt-2 bg-[#be8d00]" />
                          <div className="flex-1">
                            <p className="text-sm text-black">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-logo font-light text-black">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-gray-50"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <Building className="w-4 h-4 mr-2 text-[#be8d00]" />
                      Upload Documents
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-gray-50"
                      onClick={() => setShowInvestorPipeline(true)}
                    >
                      <Users className="w-4 h-4 mr-2 text-[#be8d00]" />
                      View Investor Pipeline
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-gray-50"
                      onClick={() => setShowFundingStatus(true)}
                    >
                      <DollarSign className="w-4 h-4 mr-2 text-[#be8d00]" />
                      Funding Status
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="submit" className="space-y-0">
            <div className="max-w-6xl mx-auto">
              {/* Upload Widget */}
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-logo font-light text-black">Upload Property Documents</CardTitle>
                    <CardDescription>Upload your OM/T‑12/Rent Roll to auto-fill the form and generate a DQI-ready financials pack</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UploadAnalyzeWidget onExtracted={setExtraction} context="submit" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Property Submission Form */}
                <div>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-logo font-light text-black">Property Details</CardTitle>
                        {extraction && !autoFilled && (
                          <Button
                            onClick={handleAutofill}
                            variant="outline"
                            className="border-[#be8d00] text-[#be8d00] hover:bg-[#be8d00] hover:text-white"
                          >
                            Accept & Autofill Form
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitProperty} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-logo font-light text-black mb-1">Property Name</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                              value={formData.propertyName}
                              onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-logo font-light text-black mb-1">Property Type</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                              value={formData.propertyType}
                              onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                            >
                              <option value="office">Office</option>
                              <option value="retail">Retail</option>
                              <option value="industrial">Industrial</option>
                              <option value="multifamily">Multifamily</option>
                              <option value="mixed-use">Mixed Use</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-logo font-light text-black mb-1">Address</label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-logo font-light text-black mb-1">City</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                              value={formData.city}
                              onChange={(e) => setFormData({...formData, city: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-logo font-light text-black mb-1">State</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                              value={formData.state}
                              onChange={(e) => setFormData({...formData, state: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-logo font-light text-black mb-1">ZIP Code</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                              value={formData.zipCode}
                              onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-logo font-light text-black mb-1">Total Square Feet</label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                              value={formData.totalSqft}
                              onChange={(e) => setFormData({...formData, totalSqft: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-logo font-light text-black mb-1">Year Built</label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                              value={formData.yearBuilt}
                              onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-logo font-light text-black mb-1">Description</label>
                          <textarea
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                          />
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button
                            type="submit"
                            disabled={!extraction || isSubmittingProperty}
                            className={`flex-1 ${
                              extraction && !isSubmittingProperty
                                ? 'bg-[#be8d00] text-white hover:bg-[#a67800]' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isSubmittingProperty ? 'Submitting...' : 'Submit Property for Review'}
                          </Button>
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setActiveTab('properties')}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Extracted Financial Data Preview */}
                <div>
                  {extraction ? (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-logo font-light text-black">Auto‑extracted Financial Snapshot</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <ReconciliationPanel data={extraction} />

                          <FinancialsTable
                            title="T‑12 Summary (Preview)"
                            columns={[
                              { key: "month", header: "Month" }, 
                              { key: "category", header: "Category" }, 
                              { key: "amount", header: "Amount", render: (v: number) => fmt(v) }
                            ]}
                            rows={extraction.t12Lines?.slice(0, 6) || []}
                            emptyHint="Upload to view parsed T‑12 lines"
                          />

                          <FinancialsTable
                            title="Rent Roll (Preview)"
                            columns={[
                              { key: "unit_id", header: "Unit" }, 
                              { key: "tenant_name", header: "Tenant (masked)" }, 
                              { key: "base_rent", header: "Base Rent", render: (v: number) => fmt(v) }
                            ]}
                            rows={maskTenants(extraction.rentRoll || []).slice(0, 4)}
                            emptyHint="Upload to view parsed rent roll"
                          />

                          <DebtCard data={extraction.debtTerms} covenants={extraction.covenants} />

                          <div className="border border-green-300 rounded-xl p-4 bg-green-50">
                            <h3 className="font-logo font-light text-green-800 mb-2">Ready for Submission</h3>
                            <p className="text-sm font-logo font-light text-green-700">
                              Document analysis complete. Financial data is ready to be attached to your property submission.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <h3 className="text-lg font-logo font-light text-black mb-2">Upload Document First</h3>
                        <p className="text-gray-600 font-logo font-light">
                          Upload your property documents to auto-extract financial data and populate the form.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Property Detail Modal/Panel */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-logo font-light text-xl text-black">
                      {selectedProperty.name}
                    </CardTitle>
                    <CardDescription>{selectedProperty.location} • {selectedProperty.type}</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedProperty(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="dqi">DQI Analysis</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="tokenization">Tokenization</TabsTrigger>
                    <TabsTrigger value="investors">Investors</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-logo font-light text-black mb-2">DQI Score</h4>
                        <div className="text-2xl font-medium text-[#be8d00]">
                          {selectedProperty.dqiScore || 'Processing...'}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-logo font-light text-black mb-2">Status</h4>
                        <Badge variant="outline" className={getStatusColor(selectedProperty.status)}>
                          {selectedProperty.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-logo font-light text-black mb-3">Submission Progress</h4>
                      <div className="space-y-2">
                        {selectedProperty.submissionSteps.map((step, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${
                              step.status === 'completed' ? 'bg-[#be8d00]' :
                              step.status === 'in_progress' ? 'bg-[#be8d00]' :
                              step.status === 'failed' ? 'bg-red-500' : 'bg-[#be8d00]'
                            }`} />
                            <span className="flex-1 text-sm text-black">{step.step}</span>
                            <span className="text-sm text-gray-500">{step.result}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="dqi" className="space-y-6 mt-6">
                    <div className="text-center mb-6">
                      <div className={`text-4xl font-logo font-light mb-2 ${getDQIColor(selectedProperty.dqiScore)}`}>
                        {selectedProperty.dqiScore || 'Processing...'}
                      </div>
                      <p className="text-gray-600">Deal Quality Index Score</p>
                      <p className="text-xs text-gray-500 mt-1">CommertizerX AI-powered analysis</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-6 mt-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-logo font-light text-black mb-2">Property Performance & Forecasting</h3>
                      <p className="text-sm text-gray-600">AI-powered scenario modeling, lease analysis, and expense benchmarking</p>
                      <p className="text-xs text-gray-500 mt-1">Powered by Commertizer X</p>
                    </div>

                    {/* Property Performance & Forecasting Section */}
                    <div className="space-y-6">
                      {/* Scenario Simulator */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-logo font-light text-black flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-[#be8d00]" />
                            Scenario Simulator
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScenarioSimulator propertyId={selectedProperty.id} />
                        </CardContent>
                      </Card>

                      {/* AI Lease Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-logo font-light text-black flex items-center">
                            <Users className="w-4 h-4 mr-2 text-[#be8d00]" />
                            AI Lease Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <LeaseAnalysis propertyId={selectedProperty.id} />
                        </CardContent>
                      </Card>

                      {/* Expense Benchmarking Tool */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-logo font-light text-black flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-[#be8d00]" />
                            Expense Benchmarking
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ExpenseBenchmarking propertyId={selectedProperty.id} />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="mt-6">
                    <div className="space-y-3">
                      {selectedProperty.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-black">{doc.name}</p>
                            <p className="text-sm text-gray-600">{doc.type}</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(doc.status)}>
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="tokenization" className="mt-6">
                    {selectedProperty.tokenizationPipeline ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>SPV Draft</span>
                          <Badge variant="outline" className={getStatusColor(selectedProperty.tokenizationPipeline.spvDraft)}>
                            {selectedProperty.tokenizationPipeline.spvDraft}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Lien Package</span>
                          <Badge variant="outline" className={getStatusColor(selectedProperty.tokenizationPipeline.lienPackage)}>
                            {selectedProperty.tokenizationPipeline.lienPackage}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Disclosures</span>
                          <Badge variant="outline" className={getStatusColor(selectedProperty.tokenizationPipeline.disclosures)}>
                            {selectedProperty.tokenizationPipeline.disclosures}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">Tokenization pipeline not yet started</p>
                    )}
                  </TabsContent>

                  <TabsContent value="investors" className="mt-6">
                    {selectedProperty.investorMetrics ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-logo font-light text-[#be8d00]">
                              ${selectedProperty.investorMetrics.totalSubscribed.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Total Subscribed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-logo font-light text-[#be8d00]">
                              ${selectedProperty.investorMetrics.targetRaise.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Target Raise</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-logo font-light text-[#be8d00]">
                              {selectedProperty.investorMetrics.investorCount}
                            </div>
                            <div className="text-sm text-gray-600">Investors</div>
                          </div>
                        </div>
                        
                        <Progress 
                          value={(selectedProperty.investorMetrics.totalSubscribed / selectedProperty.investorMetrics.targetRaise) * 100} 
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-600">No investor activity yet</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upload Documents Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-logo font-light text-black">Upload Documents</CardTitle>
                  <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-[#be8d00]" />
                  <p className="text-sm text-gray-600 mb-2">Drag files here or click to browse</p>
                  <Button className="bg-[#be8d00] text-white hover:bg-[#a67800]">
                    Choose Files
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-black">Required Documents:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Offering Memorandum (OM)</li>
                    <li>• T-12 Financial Statements</li>
                    <li>• Rent Roll</li>
                    <li>• Property Appraisal</li>
                    <li>• Environmental Reports</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Investor Pipeline Modal - Real-time data */}
        {showInvestorPipeline && <InvestorPipelineModal onClose={() => setShowInvestorPipeline(false)} />}

        {/* Funding Status Modal - Real-time data */}
        {showFundingStatus && dashboardData?.properties?.[0] && (
          <FundingStatusModal 
            propertyId={dashboardData.properties[0].id} 
            onClose={() => setShowFundingStatus(false)} 
          />
        )}
      </div>
    </div>
  );
}