import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  Search, 
  Download, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  Phone
} from "lucide-react";

interface Investment {
  id: string;
  propertyId: string;
  userId: string;
  amount: number;
  tokens: number;
  status: 'pending' | 'active' | 'completed';
  investmentDate: string;
  propertyName?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

interface InvestmentAnalytics {
  totalInvestments: number;
  totalAmount: number;
  averageInvestment: number;
  activeInvestments: number;
  pendingInvestments: number;
  completedInvestments: number;
  totalTokens: number;
  topProperty: string;
  topInvestor: string;
}

export function AdminInvestments() {
  const { toast } = useToast();
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: investments = [], refetch, isLoading } = useQuery({
    queryKey: ["admin-investments"],
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
          propertyId: data.propertyId ?? '',
          userId: data.userId ?? '',
          amount: Number(data.totalInvestment) || 0,
          tokens: Number(data.tokens) || 0,
          status: data.status || 'pending',
          investmentDate: data.investmentDate || data.timestamp || new Date().toISOString(),
          propertyName: properties[data.propertyId] || 'Unknown Property',
          userName: user?.name || 'Unknown User',
          userEmail: user?.email || 'Unknown Email',
          userPhone: user?.phone || ''
        } as Investment;
      });
    }
  });

  // Calculate analytics
  const analytics = useMemo<InvestmentAnalytics>(() => {
    const totalInvestments = investments.length;
    const totalAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const averageInvestment = totalAmount / totalInvestments || 0;
    const activeInvestments = investments.filter(inv => inv.status === 'active').length;
    const pendingInvestments = investments.filter(inv => inv.status === 'pending').length;
    const completedInvestments = investments.filter(inv => inv.status === 'completed').length;
    const totalTokens = investments.reduce((sum, inv) => sum + inv.tokens, 0);

    // Find top property and investor
    const propertyAmounts = investments.reduce((acc, inv) => {
      acc[inv.propertyName || ''] = (acc[inv.propertyName || ''] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const investorAmounts = investments.reduce((acc, inv) => {
      acc[inv.userName || ''] = (acc[inv.userName || ''] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);

    const topProperty = Object.entries(propertyAmounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    const topInvestor = Object.entries(investorAmounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalInvestments,
      totalAmount,
      averageInvestment,
      activeInvestments,
      pendingInvestments,
      completedInvestments,
      totalTokens,
      topProperty,
      topInvestor
    };
  }, [investments]);

  // Filter investments
  const filteredInvestments = useMemo(() => {
    return investments.filter(investment => {
      const matchesSearch = searchTerm === "" || 
        investment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.userPhone?.includes(searchTerm);

      const matchesStatus = statusFilter === "all" || investment.status === statusFilter;
      const matchesProperty = propertyFilter === "all" || investment.propertyName === propertyFilter;
      
      const matchesDateRange = !dateRange.start || !dateRange.end || 
        (new Date(investment.investmentDate) >= new Date(dateRange.start) && 
         new Date(investment.investmentDate) <= new Date(dateRange.end));

      const matchesAmountRange = (!amountRange.min || investment.amount >= Number(amountRange.min)) &&
        (!amountRange.max || investment.amount <= Number(amountRange.max));

      return matchesSearch && matchesStatus && matchesProperty && matchesDateRange && matchesAmountRange;
    });
  }, [investments, searchTerm, statusFilter, propertyFilter, dateRange, amountRange]);

  // Get unique properties for filter
  const uniqueProperties = useMemo(() => {
    return Array.from(new Set(investments.map(inv => inv.propertyName).filter(Boolean)));
  }, [investments]);

  const updateInvestment = useMutation({
    mutationFn: async (investment: Investment) => {
      const { propertyName, userName, userEmail, userPhone, amount, ...investmentData } = investment;
      const investmentRef = doc(db, "investments", investment.id);
      await updateDoc(investmentRef, {
        ...investmentData,
        totalInvestment: amount
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Investment updated successfully",
      });
      setEditingInvestment(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update investment",
        variant: "destructive",
      });
    }
  });

  const deleteInvestment = useMutation({
    mutationFn: async (investmentId: string) => {
      await deleteDoc(doc(db, "investments", investmentId));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Investment deleted successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete investment",
        variant: "destructive",
      });
    }
  });

  const exportToCSV = () => {
    const csvData = filteredInvestments.map(inv => ({
      'Property Name': inv.propertyName,
      'Investor Name': inv.userName,
      'Investor Email': inv.userEmail,
      'Investor Phone': inv.userPhone,
      'Amount': inv.amount,
      'Tokens': inv.tokens,
      'Status': inv.status,
      'Investment Date': new Date(inv.investmentDate).toLocaleDateString()
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-blue-100 text-blue-800", 
      completed: "bg-green-100 text-green-800"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Investments Management</h2>
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
        <h2 className="text-2xl font-bold">Investments Management</h2>
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
            disabled={filteredInvestments.length === 0}
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
                <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                <h3 className="text-2xl font-bold">${analytics.totalAmount.toLocaleString()}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Avg Investment</p>
                <h3 className="text-2xl font-bold">${analytics.averageInvestment.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Total Investors</p>
                <h3 className="text-2xl font-bold">{analytics.totalInvestments}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Investments</p>
                <h3 className="text-2xl font-bold">{analytics.activeInvestments}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h3 className="text-xl font-bold text-yellow-600">{analytics.pendingInvestments}</h3>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {analytics.totalInvestments > 0 ? Math.round((analytics.pendingInvestments / analytics.totalInvestments) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <h3 className="text-xl font-bold text-blue-600">{analytics.activeInvestments}</h3>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {analytics.totalInvestments > 0 ? Math.round((analytics.activeInvestments / analytics.totalInvestments) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <h3 className="text-xl font-bold text-green-600">{analytics.completedInvestments}</h3>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {analytics.totalInvestments > 0 ? Math.round((analytics.completedInvestments / analytics.totalInvestments) * 100) : 0}%
              </Badge>
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
                placeholder="Search by investor name, email, phone, or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
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

      {/* Investments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Investments ({filteredInvestments.length})</span>
            {analytics.topInvestor !== 'N/A' && (
              <Badge variant="outline" className="text-sm">
                Top Investor: {analytics.topInvestor}
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
                  <TableHead>Investor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No investments found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvestments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell className="font-medium">{investment.propertyName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{investment.userName}</p>
                          <p className="text-xs text-muted-foreground">{investment.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {investment.userPhone ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {investment.userPhone}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No phone</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">${investment.amount.toLocaleString()}</TableCell>
                      <TableCell>{investment.tokens.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(investment.status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(investment.investmentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {editingInvestment?.id === investment.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateInvestment.mutate(editingInvestment)}
                                disabled={updateInvestment.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingInvestment(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingInvestment(investment)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this investment?')) {
                                    deleteInvestment.mutate(investment.id);
                                  }
                                }}
                                disabled={deleteInvestment.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
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

      {/* Edit Investment Modal */}
      {editingInvestment && (
        <Card className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Investment</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    value={editingInvestment.amount}
                    onChange={(e) => setEditingInvestment({
                      ...editingInvestment,
                      amount: Number(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tokens</Label>
                  <Input
                    type="number"
                    value={editingInvestment.tokens}
                    onChange={(e) => setEditingInvestment({
                      ...editingInvestment,
                      tokens: Number(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingInvestment.status}
                  onValueChange={(value: 'pending' | 'active' | 'completed') => 
                    setEditingInvestment({
                      ...editingInvestment,
                      status: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingInvestment(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateInvestment.mutate(editingInvestment)}
                  disabled={updateInvestment.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}