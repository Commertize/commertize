import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { Property } from "@/pages/AdminDashboard";
import { ArrowLeft, Edit2, X, Search, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, AlertCircle, Building2, DollarSign, Calculator, BarChart3, FileText, Wallet, Users, Activity } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import DealQualityIndex from "@/components/DealQualityIndex";
import LeaseAnalysis from "@/components/LeaseAnalysis";
import ExpenseBenchmarking from "@/components/ExpenseBenchmarking";

interface AdminPropertyManagementProps {
  properties: Property[];
  refetch: () => void;
}

// Arc & Nest Status Cards Component
const ArcNestStatusCards = () => {
  const { data: arcStatus, isLoading: arcLoading } = useQuery({
    queryKey: ['arc-status'],
    queryFn: async () => {
      const response = await fetch('/api/arc/status');
      if (!response.ok) throw new Error('Failed to fetch Arc status');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: nestStats, isLoading: nestLoading } = useQuery({
    queryKey: ['nest-stats'],
    queryFn: async () => {
      const response = await fetch('/api/nest/stats');
      if (!response.ok) throw new Error('Failed to fetch Nest stats');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: nestVaults, isLoading: vaultsLoading } = useQuery({
    queryKey: ['nest-vaults'],
    queryFn: async () => {
      const response = await fetch('/api/nest/vaults');
      if (!response.ok) throw new Error('Failed to fetch Nest vaults');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (arcLoading || nestLoading || vaultsLoading) {
    return (
      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Find top performing vaults
  const topVaults = nestVaults?.slice(0, 3)?.sort((a: any, b: any) => b.apy - a.apy) || [];

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Arc Tokenization Engine</h4>
          <span className={`px-2 py-1 text-xs rounded-full ${
            arcStatus?.isLive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {arcStatus?.isLive ? 'Live' : arcStatus?.launchDate || 'Q1 2025 Launch'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          {arcStatus?.isLive 
            ? 'Production tokenization platform by Plume Network'
            : 'Next-generation tokenization platform by Plume Network'
          }
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={`${
              arcStatus?.isLive ? 'text-green-600' : 'text-amber-600'
            }`}>
              {arcStatus?.estimatedLaunchPhase || 'Waitlist'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Network:</span>
            <span className={`${
              arcStatus?.networkStatus === 'optimal' ? 'text-green-600' :
              arcStatus?.networkStatus === 'good' ? 'text-blue-600' : 'text-amber-600'
            }`}>
              {arcStatus?.networkStatus || 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Waitlist:</span>
            <span className="text-blue-600">{arcStatus?.waitlistCount?.toLocaleString() || '2,800+'}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3">
          {arcStatus?.isLive ? 'Start Tokenizing' : 'Join Arc Waitlist'}
        </Button>
      </div>

      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Nest Protocol Vaults</h4>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Live
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Earn yield from institutional-grade real-world assets
        </p>
        <div className="space-y-2 text-sm">
          {topVaults.map((vault: any, index: number) => (
            <div key={vault.type} className="flex justify-between">
              <span>{vault.name?.replace(' Vault', '')}:</span>
              <span className="text-green-600">{vault.apy?.toFixed(1)}%</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Total TVL:</span>
            <span>${(nestStats?.totalValueLocked / 1000000)?.toFixed(0)}M</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Avg APY:</span>
            <span>{nestStats?.averageAPY?.toFixed(1)}%</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3">
          View Nest Vaults
        </Button>
      </div>
    </div>
  );
};

export const AdminPropertyManagement = ({
  properties,
  refetch,
}: AdminPropertyManagementProps) => {
  const { toast } = useToast();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties[0]?.id || ""
  );
  const [editingData, setEditingData] = useState<Partial<Property>>({});

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  const updateProperty = useMutation({
    mutationFn: async (property: Partial<Property>) => {
      if (!selectedPropertyId) return;
      const propertyRef = doc(db, "properties", selectedPropertyId);
      await updateDoc(propertyRef, property);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      setEditingData({});
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const handleUpdate = (field: keyof Property, value: any) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveUpdates = () => {
    if (Object.keys(editingData).length > 0) {
      updateProperty.mutate(editingData);
    }
  };

  const getCurrentValue = (field: keyof Property) => {
    return editingData[field] !== undefined
      ? editingData[field]
      : selectedProperty?.[field];
  };

  const getStringValue = (field: keyof Property): string => {
    const value = getCurrentValue(field);
    return typeof value === 'string' ? value : (value?.toString() || '');
  };

  const getNumberValue = (field: keyof Property): number => {
    const value = getCurrentValue(field);
    return typeof value === 'number' ? value : (parseFloat(value?.toString() || '0') || 0);
  };

  if (!selectedProperty) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No properties available</p>
      </div>
    );
  }

  // Generate realistic performance data based on property's actual NOI
  const baseNOI = getNumberValue("netOperatingIncome") || 0;
  const monthlyNOI = baseNOI / 12;
  const performanceData = [
    { month: "Jan", occupancy: 94, revenue: monthlyNOI * 1.1, noi: monthlyNOI * 0.95 },
    { month: "Feb", occupancy: 96, revenue: monthlyNOI * 1.15, noi: monthlyNOI * 1.02 },
    { month: "Mar", occupancy: 93, revenue: monthlyNOI * 1.08, noi: monthlyNOI * 0.92 },
    { month: "Apr", occupancy: 97, revenue: monthlyNOI * 1.18, noi: monthlyNOI * 1.08 },
    { month: "May", occupancy: 95, revenue: monthlyNOI * 1.12, noi: monthlyNOI * 0.98 },
    { month: "Jun", occupancy: 98, revenue: monthlyNOI * 1.22, noi: monthlyNOI * 1.12 },
  ];

  const totalTokens = getNumberValue("totalTokens") || 0;
  const availableTokens = getNumberValue("tokensAvailable") || 0;
  const soldTokens = totalTokens - availableTokens;
  
  const tokenDistribution = [
    { name: "Available", value: availableTokens, color: "#f59e0b" },
    { name: "Sold", value: soldTokens, color: "#10b981" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ArrowLeft className="h-5 w-5 text-gray-600 cursor-pointer" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{selectedProperty.name}</h1>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} - {property.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {selectedProperty.status || "Active"}
            </Badge>
            <Button 
              onClick={saveUpdates}
              disabled={Object.keys(editingData).length === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Property Overview */}
          <div className="col-span-3 space-y-6">
            {/* Property Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Building2 className="h-5 w-5 mr-2 text-amber-600" />
                  Property Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">
                    ${getNumberValue("propertyValue")?.toLocaleString() || "Not Set"}
                  </div>
                  <div className="text-sm text-gray-600">Property Value</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{getNumberValue("squareFeet")?.toLocaleString() || "N/A"}</div>
                    <div className="text-gray-600">Sq Ft</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{getNumberValue("units") || "N/A"}</div>
                    <div className="text-gray-600">Units</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{getNumberValue("yearBuilt") || "N/A"}</div>
                    <div className="text-gray-600">Built</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{getStringValue("propertyClass") || "N/A"}</div>
                    <div className="text-gray-600">Class</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Activity className="h-5 w-5 mr-2 text-amber-600" />
                  Token Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tokenDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {tokenDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} tokens`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    Available: {availableTokens.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Sold: {soldTokens.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Wallet className="h-4 w-4 mr-2" />
                  View Blockchain Details
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Investors
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="property-details">Property Details</TabsTrigger>
                <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Property Name</Label>
                        <Input
                          id="name"
                          value={getStringValue("name")}
                          onChange={(e) => handleUpdate("name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={getStringValue("location")}
                          onChange={(e) => handleUpdate("location", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select
                          value={getStringValue("propertyType")}
                          onValueChange={(value) => handleUpdate("propertyType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Industrial">Industrial</SelectItem>
                            <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                            <SelectItem value="Residential">Residential</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={getStringValue("description")}
                          onChange={(e) => handleUpdate("description", e.target.value)}
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip formatter={(value, name) => [`${name === 'occupancy' ? value + '%' : '$' + value.toLocaleString()}`, name]} />
                            <Legend />
                            <Line yAxisId="right" type="monotone" dataKey="occupancy" stroke="#f59e0b" strokeWidth={2} name="Occupancy" />
                            <Line yAxisId="left" type="monotone" dataKey="noi" stroke="#10b981" strokeWidth={2} name="NOI" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {getNumberValue("expectedAnnualReturn") || getNumberValue("projectedAnnualIncomeApr") || "N/A"}%
                      </div>
                      <div className="text-sm text-gray-600">Expected Annual Return</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {getNumberValue("investmentReturn") || "N/A"}%
                      </div>
                      <div className="text-sm text-gray-600">Investment Return</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {getNumberValue("riskFactor") || "N/A"}/10
                      </div>
                      <div className="text-sm text-gray-600">Risk Score</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {getNumberValue("targetPeriod") || "N/A"} yrs
                      </div>
                      <div className="text-sm text-gray-600">Target Period</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Financials Tab */}
              <TabsContent value="financials" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Investment Structure */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                        Investment Structure
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="propertyValue">Property Value ($)</Label>
                          <Input
                            id="propertyValue"
                            type="number"
                            value={getNumberValue("propertyValue")}
                            onChange={(e) => handleUpdate("propertyValue", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minInvestment">Min Investment ($)</Label>
                          <Input
                            id="minInvestment"
                            type="number"
                            value={getNumberValue("minInvestment")}
                            onChange={(e) => handleUpdate("minInvestment", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pricePerToken">Price Per Token ($)</Label>
                          <Input
                            id="pricePerToken"
                            type="number"
                            value={getNumberValue("pricePerToken")}
                            onChange={(e) => handleUpdate("pricePerToken", Number(e.target.value))}
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="totalTokens">Total Tokens</Label>
                          <Input
                            id="totalTokens"
                            type="number"
                            value={getNumberValue("totalTokens")}
                            onChange={(e) => handleUpdate("totalTokens", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Projections */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                        Financial Projections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="targetedIRR">Targeted IRR (%)</Label>
                          <Input
                            id="targetedIRR"
                            type="number"
                            value={getNumberValue("targetedIRR")}
                            onChange={(e) => handleUpdate("targetedIRR", Number(e.target.value))}
                            step="0.1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="targetedYield">Targeted Yield (%)</Label>
                          <Input
                            id="targetedYield"
                            type="number"
                            value={getNumberValue("targetedYield")}
                            onChange={(e) => handleUpdate("targetedYield", Number(e.target.value))}
                            step="0.1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="equityMultiple">Equity Multiple</Label>
                          <Input
                            id="equityMultiple"
                            type="number"
                            value={getNumberValue("equityMultiple")}
                            onChange={(e) => handleUpdate("equityMultiple", Number(e.target.value))}
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="holdPeriod">Hold Period (years)</Label>
                          <Input
                            id="holdPeriod"
                            type="number"
                            value={getNumberValue("holdPeriod")}
                            onChange={(e) => handleUpdate("holdPeriod", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Income & Expenses */}
                <Card>
                  <CardHeader>
                    <CardTitle>Income & Operating Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Rental Income</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="projectedRentalIncome">Projected Annual Rent ($)</Label>
                            <Input
                              id="projectedRentalIncome"
                              type="number"
                              value={getNumberValue("projectedRentalIncome")}
                              onChange={(e) => handleUpdate("projectedRentalIncome", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="netOperatingIncome">Net Operating Income ($)</Label>
                            <Input
                              id="netOperatingIncome"
                              type="number"
                              value={getNumberValue("netOperatingIncome")}
                              onChange={(e) => handleUpdate("netOperatingIncome", Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Operating Expenses</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="propertyManagement">Property Management ($)</Label>
                            <Input
                              id="propertyManagement"
                              type="number"
                              value={getNumberValue("propertyManagement")}
                              onChange={(e) => handleUpdate("propertyManagement", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="propertyInsurance">Property Insurance ($)</Label>
                            <Input
                              id="propertyInsurance"
                              type="number"
                              value={getNumberValue("propertyInsurance")}
                              onChange={(e) => handleUpdate("propertyInsurance", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="utilities">Utilities ($)</Label>
                            <Input
                              id="utilities"
                              type="number"
                              value={getNumberValue("utilities")}
                              onChange={(e) => handleUpdate("utilities", Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Reserve Funds</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="maintenanceReserve">Maintenance Reserve ($)</Label>
                            <Input
                              id="maintenanceReserve"
                              type="number"
                              value={getNumberValue("maintenanceReserve")}
                              onChange={(e) => handleUpdate("maintenanceReserve", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="repairReplacementReserve">Repair & Replacement ($)</Label>
                            <Input
                              id="repairReplacementReserve"
                              type="number"
                              value={getNumberValue("repairReplacementReserve")}
                              onChange={(e) => handleUpdate("repairReplacementReserve", Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                {/* Deal Quality Index */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-amber-600" />
                      Deal Quality Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DealQualityIndex propertyId={selectedPropertyId} />
                  </CardContent>
                </Card>

                {/* Lease Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Lease Portfolio Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LeaseAnalysis propertyId={selectedPropertyId} />
                  </CardContent>
                </Card>

                {/* Expense Benchmarking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calculator className="h-5 w-5 mr-2 text-green-600" />
                      Expense Benchmarking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExpenseBenchmarking propertyId={selectedPropertyId} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Property Details Tab */}
              <TabsContent value="property-details" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Physical Characteristics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Physical Characteristics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="squareFeet">Square Feet</Label>
                          <Input
                            id="squareFeet"
                            type="number"
                            value={getNumberValue("squareFeet")}
                            onChange={(e) => handleUpdate("squareFeet", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="units">Number of Units</Label>
                          <Input
                            id="units"
                            type="number"
                            value={getNumberValue("units")}
                            onChange={(e) => handleUpdate("units", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yearBuilt">Year Built</Label>
                          <Input
                            id="yearBuilt"
                            type="number"
                            value={getNumberValue("yearBuilt")}
                            onChange={(e) => handleUpdate("yearBuilt", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="propertyClass">Property Class</Label>
                          <Select
                            value={getStringValue("propertyClass")}
                            onValueChange={(value) => handleUpdate("propertyClass", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Class A</SelectItem>
                              <SelectItem value="B">Class B</SelectItem>
                              <SelectItem value="C">Class C</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Assessment */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="riskFactor">Risk Factor (1-10)</Label>
                        <Input
                          id="riskFactor"
                          type="number"
                          min="1"
                          max="10"
                          value={getNumberValue("riskFactor")}
                          onChange={(e) => handleUpdate("riskFactor", Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ltv">Loan-to-Value Ratio (%)</Label>
                        <Input
                          id="ltv"
                          type="number"
                          value={getNumberValue("ltv")}
                          onChange={(e) => handleUpdate("ltv", Number(e.target.value))}
                          step="0.1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="assetType">Asset Type</Label>
                        <Input
                          id="assetType"
                          value={getStringValue("assetType")}
                          onChange={(e) => handleUpdate("assetType", e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Blockchain Tab */}
              <TabsContent value="blockchain" className="space-y-6">
                {/* Tokenization Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wallet className="h-5 w-5 mr-2 text-purple-600" />
                      Tokenization Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-amber-50 rounded-lg border">
                        <div className="text-2xl font-bold text-amber-600">
                          {property?.contractAddress ? 'DEPLOYED' : 'READY'}
                        </div>
                        <div className="text-sm text-gray-600">Contract Status</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600">
                          {getNumberValue("totalTokens") || "1,000,000"}
                        </div>
                        <div className="text-sm text-gray-600">Total Tokens</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border">
                        <div className="text-2xl font-bold text-green-600">
                          ${getNumberValue("pricePerToken") || "100"}
                        </div>
                        <div className="text-sm text-gray-600">Price Per Token</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Smart Contract Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Smart Contract Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="tokenName">Token Name</Label>
                          <Input
                            id="tokenName"
                            value={getStringValue("tokenName") || `${property?.name} Token`}
                            onChange={(e) => handleUpdate("tokenName", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="symbol">Token Symbol</Label>
                          <Input
                            id="symbol"
                            value={getStringValue("symbol") || property?.name?.substring(0, 4).toUpperCase()}
                            onChange={(e) => handleUpdate("symbol", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="walletAddress">Contract Address</Label>
                          <Input
                            id="walletAddress"
                            value={getStringValue("contractAddress") || "Not deployed"}
                            readOnly
                            className="font-mono text-sm bg-gray-50"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="totalTokens">Total Token Supply</Label>
                          <Input
                            id="totalTokens"
                            type="number"
                            value={getNumberValue("totalTokens") || 1000000}
                            onChange={(e) => handleUpdate("totalTokens", parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pricePerToken">Price Per Token ($)</Label>
                          <Input
                            id="pricePerToken"
                            type="number"
                            value={getNumberValue("pricePerToken") || 100}
                            onChange={(e) => handleUpdate("pricePerToken", parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="network">Blockchain Network</Label>
                          <select
                            id="network"
                            value={getStringValue("network") || "plume-testnet"}
                            onChange={(e) => handleUpdate("network", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="plume-testnet">Plume Testnet</option>
                            <option value="plume-mainnet">Plume Mainnet</option>
                            <option value="ethereum">Ethereum</option>
                            <option value="polygon">Polygon</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Payment Options */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Payment Options</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="usdPayment"
                            checked={getCurrentValue("usdPayment") || false}
                            onChange={(e) => handleUpdate("usdPayment", e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="usdPayment">USD Payment Enabled</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="usdcPayment"
                            checked={getCurrentValue("usdcPayment") || false}
                            onChange={(e) => handleUpdate("usdcPayment", e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="usdcPayment">USDC Payment Enabled</Label>
                        </div>
                      </div>
                    </div>

                    {/* Tokenization Actions */}
                    <div className="flex space-x-3 pt-4 border-t">
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={!property?.id}
                        onClick={() => {
                          // This would trigger the tokenization process
                          const tokenizeProperty = async () => {
                            try {
                              const response = await fetch(`/api/smart-contracts/tokenize/${property?.id}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  network: getStringValue("network") || "plume-testnet",
                                  tokenName: getStringValue("tokenName") || `${property?.name} Token`,
                                  tokenSymbol: getStringValue("symbol") || property?.name?.substring(0, 4).toUpperCase(),
                                  totalTokenSupply: getNumberValue("totalTokens") || 1000000,
                                  pricePerToken: getNumberValue("pricePerToken") || 100
                                })
                              });
                              const result = await response.json();
                              console.log('Tokenization result:', result);
                            } catch (error) {
                              console.error('Tokenization failed:', error);
                            }
                          };
                          tokenizeProperty();
                        }}
                      >
                        {property?.contractAddress ? 'Update Contract' : 'Deploy Smart Contract'}
                      </Button>
                      <Button variant="outline">
                        View on Explorer
                      </Button>
                      <Button variant="outline">
                        Generate Reports
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Arc & Nest Integration Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="h-5 w-5 mr-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded"></div>
                      Arc & Nest Protocol Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ArcNestStatusCards />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-gray-600" />
                      Property Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Document management system coming soon</p>
                      <Button variant="outline">
                        Upload Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};