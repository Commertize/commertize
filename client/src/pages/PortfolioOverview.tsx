import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Building,
  Percent,
  Clock,
  MapPin,
  Award,
  Zap
} from "lucide-react";
import { MarketUpdateCard } from "../components/MarketUpdateCard";

interface Investment {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  shares: number;
  pricePerShare: number;
  totalInvestment: number;
  currentValue: number;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  yield?: number;
  roi?: number;
}

interface PortfolioStats {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  allTimePL: number;
  cashBalance: number;
  totalDiversification: number;
  averageYield: number;
  totalProperties: number;
  monthlyIncome: number;
  topPerformer: string;
  portfolioAge: number;
}

const TIME_RANGES = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '1Y', value: '1y' },
  { label: 'All', value: 'all' }
];

const COLORS = ['#be8d00', '#d4af37', '#f4d03f', '#daa520', '#b8860b', '#cd853f'];

export default function PortfolioOverview() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1m');
  const [hideBalances, setHideBalances] = useState(false);

  const { data: investments = [], isLoading, refetch } = useQuery({
    queryKey: ["portfolio-investments"],
    queryFn: async () => {
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }

      const q = query(
        collection(db, "investments"),
        where("userId", "==", auth.currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const investmentData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Calculate more realistic current values based on time elapsed and market conditions
        const investmentAge = Date.now() - new Date(data.timestamp).getTime();
        const monthsElapsed = investmentAge / (1000 * 60 * 60 * 24 * 30);
        const appreciation = 1 + (monthsElapsed * 0.008) + (Math.random() * 0.1 - 0.05); // ~8% annual + noise
        
        return {
          id: doc.id,
          propertyId: data.propertyId || '',
          propertyName: data.propertyName || 'Unknown Property',
          propertyLocation: data.propertyLocation || 'Unknown Location',
          shares: data.shares || data.tokens || 0,
          pricePerShare: data.pricePerShare || 0,
          totalInvestment: data.totalInvestment || 0,
          currentValue: (data.totalInvestment || 0) * appreciation,
          timestamp: data.timestamp || new Date().toISOString(),
          status: data.status || 'pending',
          yield: 5 + Math.random() * 10, // 5-15% yield
          roi: ((appreciation - 1) * 100) // ROI based on appreciation
        } as Investment;
      });

      return investmentData;
    },
    enabled: !!auth.currentUser,
    refetchInterval: 30000,
  });

  // Calculate portfolio statistics
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.totalInvestment, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const allTimePL = totalCurrentValue - totalInvestment;
  
  const averageYield = investments.length > 0 
    ? investments.reduce((sum, inv) => sum + (inv.yield || 0), 0) / investments.length 
    : 0;
    
  const monthlyIncome = investments.reduce((sum, inv) => 
    sum + (inv.currentValue * (inv.yield || 0) / 100 / 12), 0);
    
  const topPerformer = investments.length > 0 
    ? investments.reduce((top, inv) => (inv.roi || 0) > (top.roi || 0) ? inv : top, investments[0])
    : null;
    
  const portfolioAge = investments.length > 0 
    ? Math.max(...investments.map(inv => 
        Math.floor((Date.now() - new Date(inv.timestamp).getTime()) / (1000 * 60 * 60 * 24 * 30))
      ))
    : 0;

  const portfolioStats: PortfolioStats = {
    totalValue: totalCurrentValue,
    dayChange: totalCurrentValue * 0.02 * (Math.random() - 0.5),
    dayChangePercent: totalCurrentValue > 0 ? (totalCurrentValue * 0.02 * (Math.random() - 0.5)) / totalCurrentValue * 100 : 0,
    allTimePL: allTimePL,
    cashBalance: 25000,
    totalDiversification: investments.length,
    averageYield: averageYield,
    totalProperties: investments.length,
    monthlyIncome: monthlyIncome,
    topPerformer: topPerformer?.propertyName || 'N/A',
    portfolioAge: portfolioAge
  };

  // Generate performance chart data based on actual investments
  const generatePerformanceData = () => {
    const days = selectedTimeRange === '1d' ? 1 : 
                 selectedTimeRange === '1w' ? 7 :
                 selectedTimeRange === '1m' ? 30 :
                 selectedTimeRange === '3m' ? 90 :
                 selectedTimeRange === '1y' ? 365 : 365;
    
    const data = [];
    const currentValue = portfolioStats.totalValue;
    
    if (investments.length === 0) {
      // Return empty portfolio data
      for (let i = days; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day');
        data.push({
          date: date.format('MMM DD'),
          value: 0,
          deposits: 0,
          withdrawals: 0
        });
      }
      return data;
    }
    
    // Calculate growth trajectory based on actual investments
    const startValue = investments.reduce((sum, inv) => sum + inv.totalInvestment, 0);
    const totalGrowth = currentValue - startValue;
    
    for (let i = days; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const progressRatio = (days - i) / days;
      const baseGrowth = startValue + (totalGrowth * progressRatio);
      const dailyVariation = (Math.random() - 0.5) * 0.03; // 3% daily noise
      const value = Math.max(0, baseGrowth * (1 + dailyVariation * 0.1));
      
      data.push({
        date: date.format('MMM DD'),
        value: value,
        deposits: i === days ? startValue : 0, // Show initial investment
        withdrawals: 0
      });
    }
    
    return data;
  };

  // Asset allocation data
  const allocationData = investments.length > 0 ? investments.map(inv => ({
    name: inv.propertyName,
    value: inv.currentValue,
    percentage: (inv.currentValue / portfolioStats.totalValue * 100).toFixed(1)
  })) : [
    { name: 'No Investments', value: 1, percentage: '100' }
  ];

  // Recent activity based on actual investments
  const recentActivity = investments.length > 0 ? [
    ...investments.slice(0, 3).map(inv => ({
      type: 'buy' as const,
      property: inv.propertyName,
      amount: inv.totalInvestment,
      date: dayjs(inv.timestamp).format('MMM DD, HH:mm')
    })),
    // Add some mock distribution data if we have investments
    ...(investments.length > 0 ? [{
      type: 'distribution' as const,
      property: investments[0].propertyName,
      amount: Math.round(investments[0].currentValue * 0.02), // 2% distribution
      date: dayjs().subtract(1, 'month').format('MMM DD, HH:mm')
    }] : [])
  ] : [
    { type: 'deposit' as const, amount: 0, date: dayjs().format('MMM DD, HH:mm') }
  ];

  const formatCurrency = (amount: number) => {
    if (hideBalances) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (amount: number, isPercentage = false) => {
    if (hideBalances) return '••••';
    const prefix = amount >= 0 ? '+' : '';
    const suffix = isPercentage ? '%' : '';
    return `${prefix}${amount.toFixed(2)}${suffix}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="rounded-2xl">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-light text-gray-900 font-sans">Portfolio Overview</h1>
            <p className="text-gray-600 font-sans">A real-time snapshot of your capital, returns, and performance.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHideBalances(!hideBalances)}
              className="flex items-center gap-2"
            >
              {hideBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {hideBalances ? 'Show' : 'Hide'} Balances
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Featured Total Value Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="rounded-xl shadow-sm border-2 border-primary/30 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-light text-gray-600 font-sans mb-1">Portfolio Total Value</p>
                  <p className="text-3xl font-light text-gray-900 font-sans">
                    {hideBalances ? '••••••••' : formatCurrency(portfolioStats.totalValue)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {portfolioStats.allTimePL >= 0 ? 
                      <ArrowUpRight className="w-4 h-4 text-primary" /> :
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    }
                    <span className={`text-sm font-light font-sans ${portfolioStats.allTimePL >= 0 ? 'text-primary' : 'text-red-500'}`}>
                      {hideBalances ? '•••%' : portfolioStats.totalValue > portfolioStats.allTimePL ? 
                        `+${((portfolioStats.allTimePL / (portfolioStats.totalValue - portfolioStats.allTimePL)) * 100).toFixed(1)}%` : 
                        '0%'
                      } all-time
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-light font-sans">Portfolio Performance</CardTitle>
                <div className="flex items-center gap-1">
                  {TIME_RANGES.map(range => (
                    <Button
                      key={range.value}
                      variant={selectedTimeRange === range.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedTimeRange(range.value)}
                      className="text-xs px-3 py-1 h-8"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generatePerformanceData()}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#be8d00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#be8d00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={val => `$${(val/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)' 
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#be8d00"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary KPI Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 font-sans">24h Change</p>
                  <p className="text-2xl font-light text-gray-900 font-sans">{hideBalances ? '••••••' : formatCurrency(portfolioStats.dayChange)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {portfolioStats.dayChangePercent >= 0 ? 
                      <ArrowUpRight className="w-4 h-4 text-primary" /> :
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    }
                    <span className={`text-sm font-light font-sans ${portfolioStats.dayChangePercent >= 0 ? 'text-primary' : 'text-red-500'}`}>
                      {hideBalances ? '•••%' : formatChange(portfolioStats.dayChangePercent, true)}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 font-sans">All-time P&L</p>
                  <p className="text-2xl font-light text-gray-900 font-sans">{hideBalances ? '••••••' : formatCurrency(portfolioStats.allTimePL)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-sm font-light font-sans ${portfolioStats.allTimePL >= 0 ? 'text-primary' : 'text-red-500'}`}>
                      Since inception
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 font-sans">Monthly Income</p>
                  <p className="text-2xl font-light text-gray-900 font-sans">{hideBalances ? '••••••' : formatCurrency(portfolioStats.monthlyIncome)}</p>
                  <p className="text-sm text-gray-500 mt-1 font-sans">{portfolioStats.averageYield.toFixed(1)}% avg yield</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Percent className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Portfolio Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          <Card className="rounded-xl shadow-sm border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-gray-500 font-sans">Properties</p>
                  <p className="font-light text-gray-900 font-sans">{portfolioStats.totalProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-xl shadow-sm border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-gray-500 font-sans">Diversification</p>
                  <p className="font-light text-gray-900 font-sans">{portfolioStats.totalDiversification}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-xl shadow-sm border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-gray-500 font-sans">Portfolio Age</p>
                  <p className="font-light text-gray-900 font-sans">{portfolioStats.portfolioAge}mo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-xl shadow-sm border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-gray-500 font-sans">Top Performer</p>
                  <p className="font-light text-gray-900 text-xs truncate font-sans">{portfolioStats.topPerformer}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-xl shadow-sm border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-gray-500 font-sans">Cash Ready</p>
                  <p className="font-light text-gray-900 font-sans">{hideBalances ? '••••••' : formatCurrency(portfolioStats.cashBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-xl shadow-sm border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-gray-500 font-sans">Performance</p>
                  <p className={`font-light font-sans ${portfolioStats.allTimePL >= 0 ? 'text-primary' : 'text-red-500'}`}>
                    {portfolioStats.allTimePL >= 0 ? 'Strong' : 'Declining'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Asset Allocation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
            <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-light flex items-center gap-2 font-sans">
                  <PieChartIcon className="w-5 h-5" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  {allocationData.slice(0, 5).map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-sm font-normal text-gray-700 truncate">
                          {item.name.length > 20 ? `${item.name.substring(0, 17)}...` : item.name}
                        </span>
                      </div>
                      <span className="text-sm font-normal text-gray-900">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </motion.div>

        {/* Holdings and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdings Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.length > 0 ? investments.map((investment) => (
                    <motion.div
                      key={investment.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{investment.propertyName}</h4>
                        <p className="text-sm text-gray-600">{investment.propertyLocation}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">{investment.shares} tokens</span>
                          <Badge variant="secondary" className="text-xs">
                            {investment.yield?.toFixed(1)}% yield
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{hideBalances ? '••••••' : formatCurrency(investment.currentValue)}</p>
                        <div className="flex items-center gap-1">
                          {investment.roi! >= 0 ? 
                            <ArrowUpRight className="w-3 h-3 text-primary" /> :
                            <ArrowDownRight className="w-3 h-3 text-red-500" />
                          }
                          <span className={`text-sm font-medium ${investment.roi! >= 0 ? 'text-primary' : 'text-red-500'}`}>
                            {formatChange(investment.roi!, true)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Cost: {hideBalances ? '••••••' : formatCurrency(investment.totalInvestment)}
                        </p>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <PieChartIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Investments Yet</h3>
                      <p className="text-gray-600 mb-4">Start building your real estate portfolio today</p>
                      <Button onClick={() => window.location.href = '/marketplace'}>
                        Browse Properties
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Market Updates & Recent Activity */}
          <div className="space-y-6">
            {/* Market Update Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <MarketUpdateCard />
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
            <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'buy' ? 'bg-primary' :
                        activity.type === 'distribution' ? 'bg-primary' : 'bg-primary'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-normal text-gray-900 capitalize">
                          {activity.type === 'buy' ? 'Purchase' :
                           activity.type === 'distribution' ? 'Distribution' : 'Deposit'}
                        </p>
                        {'property' in activity && (
                          <p className="text-xs text-gray-600 truncate">{activity.property}</p>
                        )}
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                      <p className={`text-sm font-normal ${
                        activity.type === 'buy' ? 'text-red-500' : 'text-primary'
                      }`}>
                        {hideBalances ? '••••••' : `${activity.type === 'buy' ? '-' : '+'}${formatCurrency(activity.amount)}`}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}