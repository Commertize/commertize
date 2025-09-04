import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SmoothAnalyticsMarquee } from "@/components/SmoothAnalyticsMarquee";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import {
  Activity,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Zap,
  Globe,
  Shield,
  Clock,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#be8d00', '#d4a017', '#ffd700', '#ffed4e', '#fff9c4'];

interface DashboardStats {
  overview: {
    totalProperties: number;
    totalUsers: number;
    totalInvestments: number;
    totalInvestmentValue: number;
    averageInvestment: number;
    activeProperties: number;
    pendingProperties: number;
    completedDeals: number;
  };
  userMetrics: {
    newUsersThisMonth: number;
    activeInvestors: number;
    usersByCountry: Record<string, number>;
    userGrowthTrend: Array<{ month: string; users: number }>;
  };
  propertyMetrics: {
    propertiesByType: Record<string, number>;
    propertiesByStatus: Record<string, number>;
    averagePropertyValue: number;
    totalTokensIssued: number;
    fundingProgress: Array<{
      id: string;
      name: string;
      targetEquity: number;
      raisedAmount: number;
      progress: number;
    }>;
  };
  investmentMetrics: {
    monthlyInvestmentTrend: Array<{ month: string; amount: number; count: number }>;
    investmentsByProperty: Record<string, number>;
    topInvestors: Array<{
      userId: string;
      user: any;
      totalInvestment: number;
      investmentCount: number;
    }>;
    recentActivity: Array<{
      id: string;
      type: string;
      amount: number;
      property: any;
      user: any;
      date: string;
    }>;
  };
}

interface SystemHealth {
  status: string;
  timestamp: string;
  checks: {
    database: { status: string; responseTime: number };
    firebase: { status: string; responseTime: number };
    api: { status: string; responseTime: number };
  };
  uptime: number;
  memory: any;
  nodeVersion: string;
}

export function EnhancedAdminDashboard() {
  const { toast } = useToast();
  const [realTimeData, setRealTimeData] = useState<any>(null);

  // Fetch comprehensive dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics/dashboard-stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      const result = await response.json();
      return result.data as DashboardStats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch system health
  const { data: systemHealth } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: async () => {
      const response = await fetch("/api/admin/realtime/system-health");
      if (!response.ok) throw new Error("Failed to fetch system health");
      const result = await response.json();
      return result.data as SystemHealth;
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Set up real-time data streaming
  useEffect(() => {
    const eventSource = new EventSource('/api/admin/realtime/stream');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setRealTimeData(data);
      } catch (error) {
        console.error('Error parsing real-time data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Real-time connection error:', error);
      toast({
        title: "Connection Issue",
        description: "Real-time updates temporarily unavailable",
        variant: "destructive",
      });
    };

    return () => {
      eventSource.close();
    };
  }, [toast]);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Transform data for charts
  const propertyTypeData = dashboardStats ? Object.entries(dashboardStats.propertyMetrics.propertiesByType).map(([name, value]) => ({
    name,
    value,
    fill: COLORS[Object.keys(dashboardStats.propertyMetrics.propertiesByType).indexOf(name) % COLORS.length]
  })) : [];

  const userGrowthData = dashboardStats?.userMetrics.userGrowthTrend || [];
  const investmentTrendData = dashboardStats?.investmentMetrics.monthlyInvestmentTrend || [];

  return (
    <div className="space-y-8 p-6">
      {/* Header with System Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Enhanced Admin Dashboard</h1>
          <p className="text-gray-600">Real-time platform analytics and management</p>
        </div>
        
        {systemHealth && (
          <div className="flex items-center gap-4">
            <Badge 
              variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
            >
              <Shield className="w-4 h-4 mr-2" />
              System {systemHealth.status}
            </Badge>
            <div className="text-sm text-gray-600">
              Uptime: {Math.floor(systemHealth.uptime / 3600)}h {Math.floor((systemHealth.uptime % 3600) / 60)}m
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Analytics Marquee */}
      <SmoothAnalyticsMarquee />

      {/* Real-time Activity Indicator */}
      {realTimeData && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Updates Active</span>
              <span className="text-xs text-gray-600">
                Last update: {new Date(realTimeData.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats Grid */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {formatNumber(dashboardStats.overview.totalProperties)}
              </div>
              <p className="text-xs text-gray-600">
                {dashboardStats.overview.activeProperties} active
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {formatCurrency(dashboardStats.overview.totalInvestmentValue)}
              </div>
              <p className="text-xs text-gray-600">
                Avg: {formatCurrency(dashboardStats.overview.averageInvestment)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
              <Users className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {formatNumber(dashboardStats.userMetrics.activeInvestors)}
              </div>
              <p className="text-xs text-gray-600">
                +{dashboardStats.userMetrics.newUsersThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Issued</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {formatNumber(dashboardStats.propertyMetrics.totalTokensIssued)}
              </div>
              <p className="text-xs text-gray-600">
                {dashboardStats.overview.totalInvestments} investments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-yellow-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="properties" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
            Properties
          </TabsTrigger>
          <TabsTrigger value="investments" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
            Investments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {dashboardStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                    User Growth Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #be8d00',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#be8d00" 
                        fill="url(#colorUsers)" 
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#be8d00" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#be8d00" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Property Types Distribution */}
              <Card className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-yellow-600" />
                    Property Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={propertyTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {propertyTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          {dashboardStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Investment Trend */}
              <Card className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                    Investment Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={investmentTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Investment']}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #be8d00',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#be8d00" 
                        strokeWidth={3}
                        dot={{ r: 6, fill: '#be8d00' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Investors */}
              <Card className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-yellow-600" />
                    Top Investors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardStats.investmentMetrics.topInvestors.slice(0, 5).map((investor, index) => (
                      <div key={investor.userId} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-black">
                              {investor.user?.firstName} {investor.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {investor.investmentCount} investments
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-black">
                            {formatCurrency(investor.totalInvestment)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* System Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {systemHealth && Object.entries(systemHealth.checks).map(([service, check]) => (
              <Card key={service} className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{service}</span>
                    <Badge 
                      variant={check.status === 'healthy' ? 'default' : 'destructive'}
                      className={check.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}
                    >
                      {check.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">
                    {check.responseTime}ms
                  </div>
                  <p className="text-xs text-gray-600">Response time</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          {dashboardStats && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-yellow-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats.investmentMetrics.recentActivity.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                        <div>
                          <p className="font-medium text-black">
                            {activity.user?.firstName} {activity.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Invested in {activity.property?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-black">
                          {formatCurrency(activity.amount)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}