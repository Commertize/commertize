import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Shield,
  Filter,
  Phone,
  RefreshCw,
  Trash2,
  Building2,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BankingUser {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  accountsCount: number;
  totalBalance: number;
  institution: string;
  status: string;
  environment: string;
  identityVerified: boolean;
  connectedAt: string;
  lastUpdated: string;
  accounts: BankAccount[];
}

interface BankAccount {
  accountId: string;
  mask: string;
  name: string;
  officialName?: string;
  type: string;
  subtype: string;
  balances: {
    available: number;
    current: number;
    limit?: number;
    isoCurrencyCode: string;
  };
}

interface BankingAnalytics {
  totalUsers: number;
  totalAccounts: number;
  totalBalance: number;
  verifiedUsers: number;
  averageBalance: number;
  sandboxUsers: number;
  productionUsers: number;
  activeUsers: number;
  topInstitution: string;
}

export function AdminPlaidBanking() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [environmentFilter, setEnvironmentFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [refreshingUserId, setRefreshingUserId] = useState<string | null>(null);

  const { data: bankingData, refetch, isLoading } = useQuery({
    queryKey: ["admin-plaid-banking"],
    queryFn: async () => {
      const response = await fetch('/api/plaid/admin/banking-data');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch banking data');
      }
      
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const users: BankingUser[] = bankingData?.data || [];

  // Calculate analytics
  const analytics = useMemo<BankingAnalytics>(() => {
    if (!bankingData) {
      return {
        totalUsers: 0,
        totalAccounts: 0,
        totalBalance: 0,
        verifiedUsers: 0,
        averageBalance: 0,
        sandboxUsers: 0,
        productionUsers: 0,
        activeUsers: 0,
        topInstitution: 'N/A'
      };
    }

    const totalUsers = bankingData.totalUsers || 0;
    const totalAccounts = bankingData.totalAccounts || 0;
    const totalBalance = bankingData.totalBalance || 0;
    const verifiedUsers = bankingData.verifiedUsers || 0;
    const averageBalance = totalUsers > 0 ? totalBalance / totalUsers : 0;
    
    const sandboxUsers = users.filter(user => user.environment === 'sandbox').length;
    const productionUsers = users.filter(user => user.environment === 'production').length;
    const activeUsers = users.filter(user => user.status === 'active').length;

    // Find most common institution
    const institutions = users.reduce((acc, user) => {
      acc[user.institution] = (acc[user.institution] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topInstitution = Object.entries(institutions).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalUsers,
      totalAccounts,
      totalBalance,
      verifiedUsers,
      averageBalance,
      sandboxUsers,
      productionUsers,
      activeUsers,
      topInstitution
    };
  }, [bankingData, users]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === "" || 
        user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userPhone?.includes(searchTerm) ||
        user.institution?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesEnvironment = environmentFilter === "all" || user.environment === environmentFilter;
      const matchesVerification = verificationFilter === "all" || 
        (verificationFilter === "verified" && user.identityVerified) ||
        (verificationFilter === "unverified" && !user.identityVerified);

      return matchesSearch && matchesStatus && matchesEnvironment && matchesVerification;
    });
  }, [users, searchTerm, statusFilter, environmentFilter, verificationFilter]);

  const refreshUserBalance = async (userId: string) => {
    setRefreshingUserId(userId);
    try {
      const response = await fetch(`/api/plaid/refresh-balances/${userId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Account balances refreshed successfully",
        });
        refetch();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to refresh balances: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setRefreshingUserId(null);
    }
  };

  const disconnectUserBanking = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to disconnect banking for ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/plaid/disconnect/${userId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Banking connection removed successfully",
        });
        refetch();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to disconnect banking: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csvData = filteredUsers.map(user => ({
      'User Name': user.userName,
      'User Email': user.userEmail,
      'User Phone': user.userPhone,
      'Accounts Count': user.accountsCount,
      'Total Balance': user.totalBalance,
      'Institution': user.institution,
      'Status': user.status,
      'Environment': user.environment,
      'Identity Verified': user.identityVerified ? 'Yes' : 'No',
      'Connected At': new Date(user.connectedAt).toLocaleDateString(),
      'Last Updated': new Date(user.lastUpdated).toLocaleDateString()
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plaid-banking-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      error: "bg-red-100 text-red-800 border-red-200"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getEnvironmentBadge = (environment: string) => {
    const variants = {
      production: "bg-blue-100 text-blue-800 border-blue-200",
      development: "bg-yellow-100 text-yellow-800 border-yellow-200",
      sandbox: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[environment as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {environment.charAt(0).toUpperCase() + environment.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Banking Management (Plaid)</h2>
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
        <div>
          <h2 className="text-2xl font-bold">Banking Management (Plaid)</h2>
          <p className="text-sm text-muted-foreground">
            Environment: {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
          </p>
        </div>
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
            disabled={filteredUsers.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
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
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <h3 className="text-2xl font-bold">${analytics.totalBalance.toLocaleString()}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Avg Balance</p>
                <h3 className="text-2xl font-bold">${analytics.averageBalance.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Connected Users</p>
                <h3 className="text-2xl font-bold">{analytics.totalUsers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Users</p>
                <h3 className="text-2xl font-bold">{analytics.verifiedUsers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Production Users</p>
                <h3 className="text-xl font-bold text-blue-600">{analytics.productionUsers}</h3>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Live Banking
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sandbox Users</p>
                <h3 className="text-xl font-bold text-gray-600">{analytics.sandboxUsers}</h3>
              </div>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Test Data
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <h3 className="text-xl font-bold text-green-600">{analytics.totalAccounts}</h3>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
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
                placeholder="Search by name, email, phone, or institution..."
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
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label>Identity Verification</Label>
                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Verification Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Verification Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banking Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Connected Banking Users ({filteredUsers.length})</span>
            {analytics.topInstitution !== 'N/A' && (
              <Badge variant="outline" className="text-sm">
                Top Institution: {analytics.topInstitution}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Accounts</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      No banking connections found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{user.userName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {user.userEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.userPhone ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{user.userPhone}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No phone</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {user.accountsCount}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${user.totalBalance.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.institution || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {user.identityVerified ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs">Unverified</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getEnvironmentBadge(user.environment)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(user.lastUpdated).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => refreshUserBalance(user.userId)}
                            disabled={refreshingUserId === user.userId}
                            title="Refresh balances"
                          >
                            <RefreshCw className={`h-4 w-4 ${refreshingUserId === user.userId ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => disconnectUserBanking(user.userId, user.userName)}
                            title="Disconnect banking"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
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