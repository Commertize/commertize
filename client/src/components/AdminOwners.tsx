import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Download, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  Phone,
  Copy,
  Wallet,
  Building,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Owner {
  id: string;
  userId: string;
  propertyId: string;
  propertyName?: string;
  totalTokens: number;
  totalInvestment: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  userWallet?: string;
  registrationTime?: string;
  lastOnline?: string;
  status?: string;
  firstTransaction?: string;
  lastTransaction?: string;
  totalProperties?: number;
  averageInvestment?: number;
}

interface OwnershipAnalytics {
  totalOwners: number;
  totalTokensDistributed: number;
  totalValueLocked: number;
  averageOwnership: number;
  activeOwners: number;
  multiPropertyOwners: number;
  averageTokensPerOwner: number;
  topOwnerByTokens: string;
  topOwnerByValue: string;
  topProperty: string;
}

export function AdminOwners() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [tokensRange, setTokensRange] = useState({ min: "", max: "" });
  const [valueRange, setValueRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: owners = [], isLoading } = useQuery({
    queryKey: ["admin-owners"],
    queryFn: async () => {
      const investmentsSnapshot = await getDocs(collection(db, "investments"));
      const propertiesSnapshot = await getDocs(collection(db, "properties"));
      const usersSnapshot = await getDocs(collection(db, "users"));

      const properties = propertiesSnapshot.docs.reduce((acc, doc) => ({
        ...acc,
        [doc.id]: doc.data().name
      }), {} as Record<string, string>);

      const users = usersSnapshot.docs.reduce((acc, doc) => {
        const userData = doc.data();
        return {
          ...acc,
          [doc.id]: {
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            email: userData.email || '',
            phone: userData.phoneNumber || userData.phone || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            country: userData.country || '',
            userWallet: userData.walletAddress || userData.userWallet || '',
            registrationTime: userData.createdAt || '',
            lastOnline: userData.lastOnline || '',
            status: userData.status || 'active'
          }
        };
      }, {} as Record<string, { 
        name: string; 
        email: string; 
        phone: string;
        firstName: string; 
        lastName: string; 
        country: string; 
        userWallet: string; 
        registrationTime: string; 
        lastOnline: string; 
        status: string; 
      }>);

      // Group investments by user and property
      const ownershipMap = new Map<string, Owner>();
      const userSummary = new Map<string, { totalTokens: number; totalInvestment: number; properties: Set<string>; transactions: string[] }>();

      investmentsSnapshot.docs.forEach(doc => {
        const investment = doc.data();
        const key = `${investment.userId}-${investment.propertyId}`;
        
        // Update user summary
        if (!userSummary.has(investment.userId)) {
          userSummary.set(investment.userId, {
            totalTokens: 0,
            totalInvestment: 0,
            properties: new Set(),
            transactions: []
          });
        }
        const summary = userSummary.get(investment.userId)!;
        summary.totalTokens += investment.tokens || 0;
        summary.totalInvestment += investment.totalInvestment || 0;
        summary.properties.add(investment.propertyId);
        summary.transactions.push(investment.timestamp);
        
        if (ownershipMap.has(key)) {
          const existing = ownershipMap.get(key)!;
          existing.totalTokens += investment.tokens || 0;
          existing.totalInvestment += investment.totalInvestment || 0;
          existing.lastTransaction = investment.timestamp;
        } else {
          const user = users[investment.userId];
          ownershipMap.set(key, {
            id: key,
            userId: investment.userId,
            propertyId: investment.propertyId,
            propertyName: properties[investment.propertyId] || 'Unknown Property',
            totalTokens: investment.tokens || 0,
            totalInvestment: investment.totalInvestment || 0,
            userName: user?.name || 'Unknown User',
            userEmail: user?.email || 'Unknown Email',
            userPhone: user?.phone || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            country: user?.country || '',
            userWallet: user?.userWallet || '',
            registrationTime: user?.registrationTime || '',
            lastOnline: user?.lastOnline || '',
            status: user?.status || 'active',
            firstTransaction: investment.timestamp,
            lastTransaction: investment.timestamp,
            totalProperties: 0,
            averageInvestment: 0
          });
        }
      });

      // Enhance owners with user summary data
      const enhancedOwners = Array.from(ownershipMap.values()).map(owner => {
        const summary = userSummary.get(owner.userId);
        return {
          ...owner,
          totalProperties: summary?.properties.size || 1,
          averageInvestment: summary ? summary.totalInvestment / summary.properties.size : owner.totalInvestment
        };
      });

      return enhancedOwners;
    }
  });

  // Calculate analytics
  const analytics = useMemo<OwnershipAnalytics>(() => {
    const totalOwners = new Set(owners.map(o => o.userId)).size;
    const totalTokensDistributed = owners.reduce((sum, owner) => sum + owner.totalTokens, 0);
    const totalValueLocked = owners.reduce((sum, owner) => sum + owner.totalInvestment, 0);
    const averageOwnership = totalValueLocked / totalOwners || 0;
    
    const activeOwners = new Set(owners.filter(o => o.status?.toLowerCase() === 'active').map(o => o.userId)).size;
    const multiPropertyOwners = new Set(owners.filter(o => (o.totalProperties || 0) > 1).map(o => o.userId)).size;
    const averageTokensPerOwner = totalTokensDistributed / totalOwners || 0;

    // Find top owners
    const userTokens = owners.reduce((acc, owner) => {
      acc[owner.userName || ''] = (acc[owner.userName || ''] || 0) + owner.totalTokens;
      return acc;
    }, {} as Record<string, number>);
    
    const userValues = owners.reduce((acc, owner) => {
      acc[owner.userName || ''] = (acc[owner.userName || ''] || 0) + owner.totalInvestment;
      return acc;
    }, {} as Record<string, number>);

    const propertyOwnership = owners.reduce((acc, owner) => {
      acc[owner.propertyName || ''] = (acc[owner.propertyName || ''] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topOwnerByTokens = Object.entries(userTokens).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    const topOwnerByValue = Object.entries(userValues).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    const topProperty = Object.entries(propertyOwnership).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalOwners,
      totalTokensDistributed,
      totalValueLocked,
      averageOwnership,
      activeOwners,
      multiPropertyOwners,
      averageTokensPerOwner,
      topOwnerByTokens,
      topOwnerByValue,
      topProperty
    };
  }, [owners]);

  // Filter owners
  const filteredOwners = useMemo(() => {
    return owners.filter(owner => {
      const matchesSearch = searchTerm === "" || 
        owner.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.userPhone?.includes(searchTerm) ||
        owner.userWallet?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || owner.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesProperty = propertyFilter === "all" || owner.propertyName === propertyFilter;
      const matchesCountry = countryFilter === "all" || owner.country === countryFilter;
      
      const matchesTokensRange = (!tokensRange.min || owner.totalTokens >= Number(tokensRange.min)) &&
        (!tokensRange.max || owner.totalTokens <= Number(tokensRange.max));

      const matchesValueRange = (!valueRange.min || owner.totalInvestment >= Number(valueRange.min)) &&
        (!valueRange.max || owner.totalInvestment <= Number(valueRange.max));

      return matchesSearch && matchesStatus && matchesProperty && matchesCountry && matchesTokensRange && matchesValueRange;
    });
  }, [owners, searchTerm, statusFilter, propertyFilter, countryFilter, tokensRange, valueRange]);

  // Get unique values for filters
  const uniqueProperties = useMemo(() => {
    return Array.from(new Set(owners.map(o => o.propertyName).filter(Boolean)));
  }, [owners]);

  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(owners.map(o => o.country).filter(Boolean)));
  }, [owners]);

  const exportToCSV = () => {
    const csvData = filteredOwners.map(owner => ({
      'Property Name': owner.propertyName,
      'Owner Name': owner.userName,
      'Owner Email': owner.userEmail,
      'Owner Phone': owner.userPhone,
      'First Name': owner.firstName,
      'Last Name': owner.lastName,
      'Country': owner.country,
      'Wallet Address': owner.userWallet,
      'Token Balance': owner.totalTokens,
      'Investment Value': owner.totalInvestment,
      'Total Properties': owner.totalProperties,
      'Average Investment': owner.averageInvestment?.toFixed(2),
      'Registration Date': owner.registrationTime ? new Date(owner.registrationTime).toLocaleDateString() : '',
      'Last Online': owner.lastOnline ? new Date(owner.lastOnline).toLocaleDateString() : '',
      'First Transaction': owner.firstTransaction ? new Date(owner.firstTransaction).toLocaleDateString() : '',
      'Last Transaction': owner.lastTransaction ? new Date(owner.lastTransaction).toLocaleDateString() : '',
      'Status': owner.status
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-owners-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      suspended: "bg-red-100 text-red-800 border-red-200"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[statusLower as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Token Owners</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Token Owners</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            onClick={exportToCSV}
            className="flex items-center gap-2"
            disabled={filteredOwners.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value Locked</p>
                <h3 className="text-2xl font-bold">${analytics.totalValueLocked.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Ownership</p>
                <h3 className="text-2xl font-bold">${analytics.averageOwnership.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Owners</p>
                <h3 className="text-2xl font-bold">{analytics.totalOwners}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Owners</p>
                <h3 className="text-2xl font-bold">{analytics.activeOwners}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ownership Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                <h3 className="text-xl font-bold text-blue-600">{analytics.totalTokensDistributed.toLocaleString()}</h3>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {analytics.averageTokensPerOwner.toFixed(0)} avg/owner
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Multi-Property Owners</p>
                <h3 className="text-xl font-bold text-purple-600">{analytics.multiPropertyOwners}</h3>
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {analytics.totalOwners > 0 ? Math.round((analytics.multiPropertyOwners / analytics.totalOwners) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Property</p>
                <h3 className="text-lg font-bold text-green-600 truncate">{analytics.topProperty}</h3>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, property, or wallet address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {uniqueProperties.map(property => (
                    <SelectItem key={property} value={property}>{property}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-3 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {uniqueCountries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Token Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={tokensRange.min}
                    onChange={(e) => setTokensRange(prev => ({ ...prev, min: e.target.value }))}
                    placeholder="Min tokens"
                  />
                  <Input
                    type="number"
                    value={tokensRange.max}
                    onChange={(e) => setTokensRange(prev => ({ ...prev, max: e.target.value }))}
                    placeholder="Max tokens"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Value Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={valueRange.min}
                    onChange={(e) => setValueRange(prev => ({ ...prev, min: e.target.value }))}
                    placeholder="Min value"
                  />
                  <Input
                    type="number"
                    value={valueRange.max}
                    onChange={(e) => setValueRange(prev => ({ ...prev, max: e.target.value }))}
                    placeholder="Max value"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Owners Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Token Owners ({filteredOwners.length})</span>
            {analytics.topOwnerByValue !== 'N/A' && (
              <Badge variant="outline" className="text-sm">
                Top Owner: {analytics.topOwnerByValue}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Last Online</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      No token owners found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOwners.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell className="font-medium">{owner.propertyName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{owner.userName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {owner.userEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {owner.userPhone ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{owner.userPhone}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No phone</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{owner.country || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {owner.totalTokens.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${owner.totalInvestment.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {owner.totalProperties || 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {owner.userWallet ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono truncate max-w-[80px]" 
                                  title={owner.userWallet}>
                              {owner.userWallet.slice(0, 6)}...{owner.userWallet.slice(-4)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(owner.userWallet ?? '')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {owner.lastOnline ? new Date(owner.lastOnline).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>{getStatusBadge(owner.status ?? 'active')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}