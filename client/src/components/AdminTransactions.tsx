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
  CreditCard, 
  Clock,
  Filter,
  Phone,
  ExternalLink,
  Copy,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  userId: string;
  propertyId: string;
  propertyName?: string;
  tokens: number;
  totalInvestment: number;
  paymentMethod: string;
  status: string;
  timestamp: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  value?: number;
  userWallet?: string;
  paymentTransactionHash?: string;
  tokenTransactionHash?: string;
}

interface TransactionAnalytics {
  totalTransactions: number;
  totalVolume: number;
  averageTransaction: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalTokensIssued: number;
  usdTransactions: number;
  cryptoTransactions: number;
  topPaymentMethod: string;
  successRate: number;
}

export function AdminTransactions() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["admin-transactions"],
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
            phone: userData.phoneNumber || userData.phone || ''
          }
        };
      }, {} as Record<string, { name: string; email: string; phone: string }>);

      return investmentsSnapshot.docs.map(doc => {
        const data = doc.data();
        const user = users[data.userId];
        return {
          id: doc.id,
          ...data,
          propertyName: properties[data.propertyId] || 'Unknown Property',
          userName: user?.name || 'Unknown User',
          userEmail: user?.email || 'Unknown Email',
          userPhone: user?.phone || ''
        };
      }) as Transaction[];
    }
  });

  // Calculate analytics
  const analytics = useMemo<TransactionAnalytics>(() => {
    const totalTransactions = transactions.length;
    const totalVolume = transactions.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0);
    const averageTransaction = totalVolume / totalTransactions || 0;
    
    const completedTransactions = transactions.filter(tx => 
      tx.status?.toLowerCase() === 'completed' || tx.status?.toLowerCase() === 'active'
    ).length;
    const pendingTransactions = transactions.filter(tx => 
      tx.status?.toLowerCase() === 'pending'
    ).length;
    const failedTransactions = transactions.filter(tx => 
      tx.status?.toLowerCase() === 'failed'
    ).length;
    
    const totalTokensIssued = transactions.reduce((sum, tx) => sum + (tx.tokens || 0), 0);
    
    const usdTransactions = transactions.filter(tx => 
      tx.paymentMethod?.toLowerCase() === 'usd'
    ).length;
    const cryptoTransactions = transactions.filter(tx => 
      tx.paymentMethod?.toLowerCase() === 'stablecoin' || tx.paymentMethod?.toLowerCase() === 'usdc'
    ).length;
    
    // Find top payment method
    const paymentMethods = transactions.reduce((acc, tx) => {
      const method = tx.paymentMethod || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPaymentMethod = Object.entries(paymentMethods)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

    return {
      totalTransactions,
      totalVolume,
      averageTransaction,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      totalTokensIssued,
      usdTransactions,
      cryptoTransactions,
      topPaymentMethod,
      successRate
    };
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = searchTerm === "" || 
        transaction.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.userPhone?.includes(searchTerm) ||
        transaction.paymentTransactionHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tokenTransactionHash?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || 
        transaction.status?.toLowerCase() === statusFilter.toLowerCase();
      
      const matchesProperty = propertyFilter === "all" || 
        transaction.propertyName === propertyFilter;
      
      const matchesPaymentMethod = paymentMethodFilter === "all" || 
        transaction.paymentMethod?.toLowerCase() === paymentMethodFilter.toLowerCase();
      
      const matchesDateRange = !dateRange.start || !dateRange.end || 
        (new Date(transaction.timestamp) >= new Date(dateRange.start) && 
         new Date(transaction.timestamp) <= new Date(dateRange.end));

      const matchesAmountRange = (!amountRange.min || transaction.totalInvestment >= Number(amountRange.min)) &&
        (!amountRange.max || transaction.totalInvestment <= Number(amountRange.max));

      return matchesSearch && matchesStatus && matchesProperty && matchesPaymentMethod && 
             matchesDateRange && matchesAmountRange;
    });
  }, [transactions, searchTerm, statusFilter, propertyFilter, paymentMethodFilter, dateRange, amountRange]);

  // Get unique values for filters
  const uniqueProperties = useMemo(() => {
    return Array.from(new Set(transactions.map(tx => tx.propertyName).filter(Boolean)));
  }, [transactions]);

  const uniquePaymentMethods = useMemo(() => {
    return Array.from(new Set(transactions.map(tx => tx.paymentMethod).filter(Boolean)));
  }, [transactions]);

  const exportToCSV = () => {
    const csvData = filteredTransactions.map(tx => ({
      'Property Name': tx.propertyName,
      'Investor Name': tx.userName,
      'Investor Email': tx.userEmail,
      'Investor Phone': tx.userPhone,
      'Amount': tx.totalInvestment,
      'Value': tx.value || tx.totalInvestment,
      'Tokens': tx.tokens,
      'Payment Method': tx.paymentMethod,
      'Status': tx.status,
      'User Wallet': tx.userWallet,
      'Payment Hash': tx.paymentTransactionHash,
      'Token Hash': tx.tokenTransactionHash,
      'Timestamp': new Date(tx.timestamp).toLocaleString()
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodLower = method?.toLowerCase() || '';
    switch (methodLower) {
      case 'usd':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">USD</Badge>;
      case 'stablecoin':
      case 'usdc':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">USDC</Badge>;
      default:
        return <Badge variant="outline">{method || 'Unknown'}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      active: "bg-blue-100 text-blue-800 border-blue-200",
      failed: "bg-red-100 text-red-800 border-red-200"
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
      description: "Hash copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Transactions Management</h2>
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
        <h2 className="text-2xl font-bold">Transactions Management</h2>
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
            disabled={filteredTransactions.length === 0}
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
                <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
                <h3 className="text-2xl font-bold">${analytics.totalVolume.toLocaleString()}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
                <h3 className="text-2xl font-bold">${analytics.averageTransaction.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <h3 className="text-2xl font-bold">{analytics.successRate.toFixed(1)}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <h3 className="text-2xl font-bold">{analytics.totalTransactions}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status and Payment Method Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{analytics.completedTransactions}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {analytics.totalTransactions > 0 ? Math.round((analytics.completedTransactions / analytics.totalTransactions) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{analytics.pendingTransactions}</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {analytics.totalTransactions > 0 ? Math.round((analytics.pendingTransactions / analytics.totalTransactions) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Failed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{analytics.failedTransactions}</span>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {analytics.totalTransactions > 0 ? Math.round((analytics.failedTransactions / analytics.totalTransactions) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm">USD Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{analytics.usdTransactions}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {analytics.totalTransactions > 0 ? Math.round((analytics.usdTransactions / analytics.totalTransactions) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Crypto Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{analytics.cryptoTransactions}</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {analytics.totalTransactions > 0 ? Math.round((analytics.cryptoTransactions / analytics.totalTransactions) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Top Payment Method</span>
                <Badge variant="outline">{analytics.topPaymentMethod}</Badge>
              </div>
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
                placeholder="Search by investor, property, hashes, or phone..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {uniquePaymentMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-3 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label>Property</Label>
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {uniqueProperties.map(property => (
                      <SelectItem key={property} value={property}>{property}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    placeholder="End date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amount Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={amountRange.min}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                    placeholder="Min amount"
                  />
                  <Input
                    type="number"
                    value={amountRange.max}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                    placeholder="Max amount"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transactions ({filteredTransactions.length})</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {analytics.totalTokensIssued.toLocaleString()} tokens issued
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Payment Hash</TableHead>
                  <TableHead>Token Hash</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                      No transactions found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.propertyName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{transaction.userName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {transaction.userEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.userPhone ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{transaction.userPhone}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No phone</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${(transaction.totalInvestment || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>{(transaction.tokens || 0).toLocaleString()}</TableCell>
                      <TableCell>{getPaymentMethodBadge(transaction.paymentMethod)}</TableCell>
                      <TableCell>
                        {transaction.userWallet ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono truncate max-w-[80px]" 
                                  title={transaction.userWallet}>
                              {transaction.userWallet.slice(0, 6)}...{transaction.userWallet.slice(-4)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(transaction.userWallet || '')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.paymentTransactionHash ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono truncate max-w-[80px]" 
                                  title={transaction.paymentTransactionHash}>
                              {transaction.paymentTransactionHash.slice(0, 6)}...{transaction.paymentTransactionHash.slice(-4)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(transaction.paymentTransactionHash || '')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.tokenTransactionHash ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono truncate max-w-[80px]" 
                                  title={transaction.tokenTransactionHash}>
                              {transaction.tokenTransactionHash.slice(0, 6)}...{transaction.tokenTransactionHash.slice(-4)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(transaction.tokenTransactionHash || '')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p>{new Date(transaction.timestamp).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
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