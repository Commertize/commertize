import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, startOfWeek, endOfWeek, addDays, isWithinInterval } from "date-fns";
import { Loader2, Users, DollarSign, TrendingUp, ShoppingCart, UserPlus, Calendar, PieChart as PieChartIcon } from "lucide-react";

interface User {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  createdAt: string;
  lastLogin?: string;
  isActive?: boolean;
}

interface Transaction {
  id: string;
  totalInvestment?: number;
  timestamp: string;
  tokens?: number;
  propertyName?: string;
  userId?: string;
}

interface Property {
  id: string;
  tokenSupply?: number;
  name?: string;
  images?: string[];
  image?: string;
  imageUrls?: string[];
}

export function AdminDashboardStats() {
  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "users"));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date().toISOString()
      })) as User[];
    }
  });

  // Fetch all transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["admin-transactions-stats"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "investments"));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp || new Date().toISOString()
      })) as Transaction[];
    }
  });

  // Fetch all properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["admin-properties-stats"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "properties"));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
    }
  });

  // Calculate stats
  const totalUsers = users.length;
  const totalTransactions = transactions.length;
  const totalTransactionAmount = transactions.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0);

  // Calculate monthly user growth
  const getUserGrowthData = () => {
    const monthlyData: { [key: string]: number } = {};
    
    users.forEach(user => {
      const date = new Date(user.createdAt);
      const monthYear = format(date, 'MMM yyyy');
      
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
    });
    
    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, users: count }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-12); // Last 12 months
  };

  // Calculate weekly user growth for detailed view
  const getWeeklyUserGrowth = () => {
    const weeklyData: { [key: string]: number } = {};
    const now = new Date();
    
    // Get last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(addDays(now, -i * 7));
      const weekEnd = endOfWeek(weekStart);
      const weekLabel = format(weekStart, 'MMM dd');
      
      const usersInWeek = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return isWithinInterval(userDate, { start: weekStart, end: weekEnd });
      }).length;
      
      weeklyData[weekLabel] = usersInWeek;
    }
    
    return Object.entries(weeklyData).map(([week, count]) => ({ week, users: count }));
  };

  // Calculate cumulative user growth
  const getCumulativeUserGrowth = () => {
    const sortedUsers = [...users].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const monthlyData: { [key: string]: number } = {};
    let cumulativeCount = 0;
    
    sortedUsers.forEach(user => {
      const date = new Date(user.createdAt);
      const monthYear = format(date, 'MMM yyyy');
      cumulativeCount++;
      monthlyData[monthYear] = cumulativeCount;
    });
    
    return Object.entries(monthlyData)
      .map(([month, total]) => ({ month, totalUsers: total }))
      .slice(-12); // Last 12 months
  };

  // Calculate user role distribution
  const getUserRoleDistribution = () => {
    const roleData: { [key: string]: number } = {};
    
    users.forEach(user => {
      const role = user.role || 'User';
      roleData[role] = (roleData[role] || 0) + 1;
    });
    
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    
    return Object.entries(roleData).map(([role, count], index) => ({
      name: role,
      value: count,
      fill: colors[index % colors.length]
    }));
  };

  // Calculate dashboard metrics according to specification document
  const getDashboardMetrics = () => {
    const now = new Date();
    const oneMonthAgo = addDays(now, -30);
    const twoMonthsAgo = addDays(now, -60);
    
    // Generate daily data for the last 7 days for charts
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDays(now, -i);
      last7Days.push(date);
    }
    
    // Column 1: New users - Count distinct users created in current period
    const newUsersCurrentPeriod = users.filter(user => 
      new Date(user.createdAt) >= oneMonthAgo
    ).length;
    
    const newUsersPreviousPeriod = users.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate >= twoMonthsAgo && userDate < oneMonthAgo;
    }).length;
    
    // Percentage change: ((current - previous) / previous) * 100
    const newUsersGrowth = newUsersPreviousPeriod > 0 
      ? ((newUsersCurrentPeriod - newUsersPreviousPeriod) / newUsersPreviousPeriod * 100)
      : newUsersCurrentPeriod > 0 ? 100 : 0;
    
    const newUsersChartData = last7Days.map(date => {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const count = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate >= dayStart && userDate <= dayEnd;
      }).length;
      return { day: format(date, 'dd'), value: count };
    });
    
    // Column 2: Number of transactions - Count transactions in current period
    const transactionsCurrentPeriod = transactions.filter(tx => 
      new Date(tx.timestamp) >= oneMonthAgo
    );
    
    const transactionsPreviousPeriod = transactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      return txDate >= twoMonthsAgo && txDate < oneMonthAgo;
    });
    
    // Percentage change for transactions
    const transactionGrowth = transactionsPreviousPeriod.length > 0 
      ? ((transactionsCurrentPeriod.length - transactionsPreviousPeriod.length) / transactionsPreviousPeriod.length * 100)
      : transactionsCurrentPeriod.length > 0 ? 100 : 0;
    
    const transactionsChartData = last7Days.map(date => {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const count = transactions.filter(tx => {
        const txDate = new Date(tx.timestamp);
        return txDate >= dayStart && txDate <= dayEnd;
      }).length;
      return { day: format(date, 'dd'), value: count };
    });
    
    // Column 3: Transaction amount - SUM of all transaction amounts in current period
    const transactionAmountCurrentPeriod = transactionsCurrentPeriod.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0);
    const transactionAmountPreviousPeriod = transactionsPreviousPeriod.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0);
    
    // Percentage change for transaction amounts
    const amountGrowth = transactionAmountPreviousPeriod > 0 
      ? ((transactionAmountCurrentPeriod - transactionAmountPreviousPeriod) / transactionAmountPreviousPeriod * 100)
      : transactionAmountCurrentPeriod > 0 ? 100 : 0;
    
    const amountChartData = last7Days.map(date => {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const amount = transactions.filter(tx => {
        const txDate = new Date(tx.timestamp);
        return txDate >= dayStart && txDate <= dayEnd;
      }).reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0);
      return { day: format(date, 'dd'), value: amount };
    });
    
    // Column 4: Tokens Left Value calculations
    // Total tokens available from all properties
    const totalTokensAvailable = properties.reduce((sum, property) => sum + (property.tokenSupply || 0), 0);
    
    // Tokens sold to date from all transactions
    const tokensSoldToDate = transactions.reduce((sum, tx) => sum + (tx.tokens || 0), 0);
    
    // Tokens left = total_tokens_available - tokens_sold_to_date
    const tokensLeft = totalTokensAvailable - tokensSoldToDate;
    
    // Calculate price per token from existing transactions
    const totalInvestmentValue = transactions.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0);
    const pricePerToken = tokensSoldToDate > 0 ? totalInvestmentValue / tokensSoldToDate : 1;
    
    // Total value of tokens left = tokens_left * price_per_token
    const tokensLeftValue = tokensLeft * pricePerToken;
    
    // Percentage sold = (tokens_sold_to_date / total_tokens_available) * 100
    const percentageSold = totalTokensAvailable > 0 ? (tokensSoldToDate / totalTokensAvailable * 100) : 0;
    
    const tokensChartData = last7Days.map(date => {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const tokens = transactions.filter(tx => {
        const txDate = new Date(tx.timestamp);
        return txDate >= dayStart && txDate <= dayEnd;
      }).reduce((sum, tx) => sum + (tx.tokens || 0), 0);
      return { day: format(date, 'dd'), value: tokens };
    });
    
    return {
      newUsers: newUsersCurrentPeriod,
      newUsersGrowth: parseFloat(newUsersGrowth.toFixed(1)),
      newUsersChartData,
      transactions: transactionsCurrentPeriod.length,
      transactionGrowth: parseFloat(transactionGrowth.toFixed(1)),
      transactionsChartData,
      transactionAmount: transactionAmountCurrentPeriod,
      amountGrowth: parseFloat(amountGrowth.toFixed(1)),
      amountChartData,
      totalTokens: tokensLeft, // Tokens left as specified
      totalTokenValue: tokensLeftValue, // Total value of tokens left
      percentageSold: parseFloat(percentageSold.toFixed(1)),
      tokensChartData
    };
  };

  // Calculate user activity metrics
  const getUserActivityMetrics = () => {
    const now = new Date();
    const oneWeekAgo = addDays(now, -7);
    const oneMonthAgo = addDays(now, -30);
    
    const activeThisWeek = users.filter(user => 
      user.lastLogin && new Date(user.lastLogin) >= oneWeekAgo
    ).length;
    
    const activeThisMonth = users.filter(user => 
      user.lastLogin && new Date(user.lastLogin) >= oneMonthAgo
    ).length;
    
    const newThisWeek = users.filter(user => 
      new Date(user.createdAt) >= oneWeekAgo
    ).length;
    
    const newThisMonth = users.filter(user => 
      new Date(user.createdAt) >= oneMonthAgo
    ).length;
    
    // Calculate new users percentage (last 30 days vs total users)
    const newUsersPercentage = totalUsers > 0 ? (newThisMonth / totalUsers) * 100 : 0;
    
    return {
      activeThisWeek,
      activeThisMonth,
      newThisWeek,
      newThisMonth,
      newUsersPercentage: parseFloat(newUsersPercentage.toFixed(1)),
      totalActive: users.filter(user => user.isActive !== false).length
    };
  };

  // Calculate monthly transaction data
  const getTransactionData = () => {
    const monthlyData: { [key: string]: { count: number; amount: number } } = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      const monthYear = format(date, 'MMM yyyy');
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { count: 0, amount: 0 };
      }
      
      monthlyData[monthYear].count += 1;
      monthlyData[monthYear].amount += tx.totalInvestment || 0;
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        transactions: data.count,
        amount: data.amount
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-12); // Last 12 months
  };

  // Calculate weekly transaction data
  const getWeeklyTransactionData = () => {
    const weeklyData: { [key: string]: { count: number; amount: number } } = {};
    const now = new Date();
    
    // Get last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(addDays(now, -i * 7));
      const weekEnd = endOfWeek(weekStart);
      const weekLabel = format(weekStart, 'MMM dd');
      
      const weekTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.timestamp);
        return isWithinInterval(txDate, { start: weekStart, end: weekEnd });
      });
      
      weeklyData[weekLabel] = {
        count: weekTransactions.length,
        amount: weekTransactions.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0)
      };
    }
    
    return Object.entries(weeklyData).map(([week, data]) => ({ 
      week, 
      transactions: data.count,
      amount: data.amount 
    }));
  };

  // Calculate cumulative transaction data
  const getCumulativeTransactionData = () => {
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const monthlyData: { [key: string]: { count: number; amount: number } } = {};
    let cumulativeCount = 0;
    let cumulativeAmount = 0;
    
    sortedTransactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      const monthYear = format(date, 'MMM yyyy');
      cumulativeCount++;
      cumulativeAmount += tx.totalInvestment || 0;
      monthlyData[monthYear] = { count: cumulativeCount, amount: cumulativeAmount };
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({ 
        month, 
        totalTransactions: data.count,
        totalAmount: data.amount 
      }))
      .slice(-12); // Last 12 months
  };

  // Calculate transaction volume by property type
  const getTransactionVolumeByProperty = () => {
    const propertyData: { [key: string]: { count: number; amount: number } } = {};
    
    transactions.forEach(tx => {
      const propertyName = tx.propertyName || 'Unknown Property';
      if (!propertyData[propertyName]) {
        propertyData[propertyName] = { count: 0, amount: 0 };
      }
      propertyData[propertyName].count += 1;
      propertyData[propertyName].amount += tx.totalInvestment || 0;
    });
    
    return Object.entries(propertyData)
      .map(([property, data]) => ({
        property: property.length > 15 ? property.substring(0, 15) + '...' : property,
        transactions: data.count,
        amount: data.amount
      }))
      .sort((a, b) => b.transactions - a.transactions)
      .slice(0, 10); // Top 10 properties
  };

  // Calculate transaction activity metrics
  const getTransactionActivityMetrics = () => {
    const now = new Date();
    const oneWeekAgo = addDays(now, -7);
    const oneMonthAgo = addDays(now, -30);
    
    const transactionsThisWeek = transactions.filter(tx => 
      new Date(tx.timestamp) >= oneWeekAgo
    );
    
    const transactionsThisMonth = transactions.filter(tx => 
      new Date(tx.timestamp) >= oneMonthAgo
    );
    
    return {
      transactionsThisWeek: transactionsThisWeek.length,
      amountThisWeek: transactionsThisWeek.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0),
      transactionsThisMonth: transactionsThisMonth.length,
      amountThisMonth: transactionsThisMonth.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0),
      averageTransactionAmount: transactions.length > 0 ? totalTransactionAmount / transactions.length : 0
    };
  };

  // Calculate transaction amount distribution
  const getTransactionAmountDistribution = () => {
    const amounts = transactions.map(tx => tx.totalInvestment || 0);
    
    // Define amount ranges
    const ranges = [
      { label: '$0-$1K', min: 0, max: 1000 },
      { label: '$1K-$5K', min: 1000, max: 5000 },
      { label: '$5K-$10K', min: 5000, max: 10000 },
      { label: '$10K-$25K', min: 10000, max: 25000 },
      { label: '$25K-$50K', min: 25000, max: 50000 },
      { label: '$50K+', min: 50000, max: Infinity }
    ];
    
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
    
    return ranges.map((range, index) => ({
      range: range.label,
      count: amounts.filter(amount => amount >= range.min && amount < range.max).length,
      fill: colors[index]
    })).filter(item => item.count > 0);
  };

  // Calculate monthly amount trends
  const getMonthlyAmountTrends = () => {
    const monthlyData: { [key: string]: number[] } = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      const monthYear = format(date, 'MMM yyyy');
      const amount = tx.totalInvestment || 0;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = [];
      }
      monthlyData[monthYear].push(amount);
    });
    
    return Object.entries(monthlyData)
      .map(([month, amounts]) => ({
        month,
        averageAmount: amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length,
        totalAmount: amounts.reduce((sum, amt) => sum + amt, 0),
        minAmount: Math.min(...amounts),
        maxAmount: Math.max(...amounts),
        medianAmount: amounts.sort((a, b) => a - b)[Math.floor(amounts.length / 2)] || 0
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-12); // Last 12 months
  };

  // Calculate transaction amount by property
  const getTransactionAmountByProperty = () => {
    const propertyData: { [key: string]: { amounts: number[]; count: number } } = {};
    
    transactions.forEach(tx => {
      const propertyName = tx.propertyName || 'Unknown Property';
      const amount = tx.totalInvestment || 0;
      
      if (!propertyData[propertyName]) {
        propertyData[propertyName] = { amounts: [], count: 0 };
      }
      propertyData[propertyName].amounts.push(amount);
      propertyData[propertyName].count += 1;
    });
    
    return Object.entries(propertyData)
      .map(([property, data]) => ({
        property: property.length > 15 ? property.substring(0, 15) + '...' : property,
        averageAmount: data.amounts.reduce((sum, amt) => sum + amt, 0) / data.amounts.length,
        totalAmount: data.amounts.reduce((sum, amt) => sum + amt, 0),
        transactionCount: data.count
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10); // Top 10 properties by amount
  };

  // Calculate active rate metrics
  const getActiveRateMetrics = () => {
    const totalUsers = users.length;
    const usersWithTransactions = new Set(transactions.map(tx => tx.userId).filter(Boolean)).size;
    const overallActiveRate = totalUsers > 0 ? (usersWithTransactions / totalUsers) * 100 : 0;
    
    // Calculate monthly active rates
    const monthlyActiveRates = [];
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);
      const monthYear = format(targetDate, 'MMM yyyy');
      
      const usersUpToMonth = users.filter(user => 
        new Date(user.createdAt) <= targetDate
      ).length;
      
      const activeUsersInMonth = new Set(
        transactions.filter(tx => {
          const txDate = new Date(tx.timestamp);
          return txDate.getMonth() === targetDate.getMonth() && 
                 txDate.getFullYear() === targetDate.getFullYear();
        }).map(tx => tx.userId).filter(Boolean)
      ).size;
      
      const monthlyRate = usersUpToMonth > 0 ? (activeUsersInMonth / usersUpToMonth) * 100 : 0;
      
      monthlyActiveRates.push({
        month: monthYear,
        activeRate: monthlyRate,
        activeUsers: activeUsersInMonth,
        totalUsers: usersUpToMonth
      });
    }
    
    return {
      overallActiveRate,
      usersWithTransactions,
      totalUsers,
      monthlyActiveRates: monthlyActiveRates.filter(item => item.totalUsers > 0)
    };
  };

  // Calculate active rate by user segments
  const getActiveRateBySegments = () => {
    const segments = [
      { label: 'New Users (0-30 days)', days: 30 },
      { label: 'Regular Users (31-90 days)', days: 90 },
      { label: 'Established Users (91-365 days)', days: 365 },
      { label: 'Veteran Users (365+ days)', days: Infinity }
    ];
    
    const now = new Date();
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    
    return segments.map((segment, index) => {
      const minDate = segment.days === Infinity ? new Date(0) : addDays(now, -segment.days);
      const maxDate = index === 0 ? now : addDays(now, -segments[index - 1].days);
      
      const segmentUsers = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return segment.days === Infinity 
          ? userDate < maxDate
          : userDate >= minDate && userDate < maxDate;
      });
      
      const activeUsers = segmentUsers.filter(user => 
        transactions.some(tx => tx.userId === user.id)
      ).length;
      
      const activeRate = segmentUsers.length > 0 ? (activeUsers / segmentUsers.length) * 100 : 0;
      
      return {
        segment: segment.label,
        activeRate: parseFloat(activeRate.toFixed(1)),
        activeUsers,
        totalUsers: segmentUsers.length,
        fill: colors[index]
      };
    }).filter(item => item.totalUsers > 0);
  };

  // Calculate weekly active rate trends
  const getWeeklyActiveRates = () => {
    const weeklyData = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(addDays(now, -i * 7));
      const weekEnd = endOfWeek(weekStart);
      const weekLabel = format(weekStart, 'MMM dd');
      
      const activeUsersInWeek = new Set(
        transactions.filter(tx => {
          const txDate = new Date(tx.timestamp);
          return isWithinInterval(txDate, { start: weekStart, end: weekEnd });
        }).map(tx => tx.userId).filter(Boolean)
      ).size;
      
      const totalUsersAtWeekEnd = users.filter(user => 
        new Date(user.createdAt) <= weekEnd
      ).length;
      
      const weeklyActiveRate = totalUsersAtWeekEnd > 0 ? (activeUsersInWeek / totalUsersAtWeekEnd) * 100 : 0;
      
      weeklyData.push({
        week: weekLabel,
        activeRate: parseFloat(weeklyActiveRate.toFixed(1)),
        activeUsers: activeUsersInWeek,
        totalUsers: totalUsersAtWeekEnd
      });
    }
    
    return weeklyData.filter(item => item.totalUsers > 0);
  };

  // Calculate sales activity (recent transactions)
  const getRecentSales = () => {
    return [...transactions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(tx => ({
        id: tx.id,
        amount: tx.totalInvestment || 0,
        date: format(new Date(tx.timestamp), 'MMM dd, yyyy'),
        time: format(new Date(tx.timestamp), 'HH:mm'),
        tokens: tx.tokens || 0,
        propertyName: tx.propertyName || 'Unknown Property',
        timestamp: tx.timestamp
      }));
  };

  // Calculate daily sales activity for charts
  const getDailySalesActivity = () => {
    const dailyData: { [key: string]: { count: number; amount: number; transactions: any[] } } = {};
    const last30Days = [];
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = addDays(new Date(), -i);
      const dateKey = format(date, 'MMM dd');
      dailyData[dateKey] = { count: 0, amount: 0, transactions: [] };
      last30Days.push(dateKey);
    }
    
    // Populate with actual transaction data
    transactions.forEach(tx => {
      const txDate = new Date(tx.timestamp);
      const dateKey = format(txDate, 'MMM dd');
      
      if (dailyData[dateKey]) {
        dailyData[dateKey].count += 1;
        dailyData[dateKey].amount += tx.totalInvestment || 0;
        dailyData[dateKey].transactions.push(tx);
      }
    });
    
    return last30Days.map(date => ({
      date,
      salesCount: dailyData[date].count,
      salesAmount: dailyData[date].amount,
      transactions: dailyData[date].transactions
    }));
  };

  // Calculate sales by property for recent activity
  const getRecentSalesByProperty = () => {
    const last7Days = addDays(new Date(), -7);
    const recentTransactions = transactions.filter(tx => 
      new Date(tx.timestamp) >= last7Days
    );
    
    const propertyData: { [key: string]: { count: number; amount: number } } = {};
    
    recentTransactions.forEach(tx => {
      const propertyName = tx.propertyName || 'Unknown Property';
      if (!propertyData[propertyName]) {
        propertyData[propertyName] = { count: 0, amount: 0 };
      }
      propertyData[propertyName].count += 1;
      propertyData[propertyName].amount += tx.totalInvestment || 0;
    });
    
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
    
    return Object.entries(propertyData)
      .map(([property, data], index) => ({
        property: property.length > 20 ? property.substring(0, 20) + '...' : property,
        salesCount: data.count,
        salesAmount: data.amount,
        fill: colors[index % colors.length]
      }))
      .sort((a, b) => b.salesAmount - a.salesAmount)
      .slice(0, 8); // Top 8 properties
  };

  // Calculate hourly sales patterns
  const getHourlySalesPattern = () => {
    const hourlyData: { [key: number]: { count: number; amount: number } } = {};
    
    // Initialize all hours
    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = { count: 0, amount: 0 };
    }
    
    // Only look at last 30 days for pattern analysis
    const last30Days = addDays(new Date(), -30);
    const recentTransactions = transactions.filter(tx => 
      new Date(tx.timestamp) >= last30Days
    );
    
    recentTransactions.forEach(tx => {
      const hour = new Date(tx.timestamp).getHours();
      hourlyData[hour].count += 1;
      hourlyData[hour].amount += tx.totalInvestment || 0;
    });
    
    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      salesCount: hourlyData[hour].count,
      salesAmount: hourlyData[hour].amount
    }));
  };

  // Calculate sales velocity metrics
  const getSalesVelocityMetrics = () => {
    const now = new Date();
    const last24Hours = addDays(now, -1);
    const last7Days = addDays(now, -7);
    const last30Days = addDays(now, -30);
    
    const sales24h = transactions.filter(tx => new Date(tx.timestamp) >= last24Hours);
    const sales7d = transactions.filter(tx => new Date(tx.timestamp) >= last7Days);
    const sales30d = transactions.filter(tx => new Date(tx.timestamp) >= last30Days);
    
    const amount24h = sales24h.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0);
    const amount7d = sales7d.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0);
    const amount30d = sales30d.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0);
    
    return {
      sales24h: sales24h.length,
      amount24h,
      sales7d: sales7d.length,
      amount7d,
      sales30d: sales30d.length,
      amount30d,
      avgDailyAmount: amount30d / 30,
      avgDailySales: sales30d.length / 30
    };
  };

  // Get property investment distribution for donut chart
  const getPropertyInvestmentDistribution = () => {
    const propertyInvestments: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      const propertyName = transaction.propertyName || 'Others';
      const amount = transaction.totalInvestment || 0;
      propertyInvestments[propertyName] = (propertyInvestments[propertyName] || 0) + amount;
    });

    return Object.entries(propertyInvestments)
      .map(([name, amount]) => ({
        name: name === 'Others' ? 'Others' : name,
        value: amount,
        amount: amount
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4); // Top 4 properties
  };

  // Get gold color shades for the chart
  const getGoldColorShade = (index: number) => {
    const goldShades = ['#FFD700', '#FFC947', '#FFB627', '#FF9500'];
    return goldShades[index % goldShades.length];
  };

  // Get total tokens sold
  const getTotalTokensSold = () => {
    return transactions.reduce((sum, tx) => sum + (tx.tokens || 0), 0);
  };

  // Get property performance metrics
  const getPropertyPerformanceMetrics = () => {
    const propertyMetrics: { [key: string]: { totalInvestment: number, tokens: number } } = {};
    
    transactions.forEach(transaction => {
      const propertyName = transaction.propertyName || 'Others';
      const amount = transaction.totalInvestment || 0;
      const tokens = transaction.tokens || 0;
      
      if (!propertyMetrics[propertyName]) {
        propertyMetrics[propertyName] = { totalInvestment: 0, tokens: 0 };
      }
      
      propertyMetrics[propertyName].totalInvestment += amount;
      propertyMetrics[propertyName].tokens += tokens;
    });

    return Object.entries(propertyMetrics)
      .map(([name, metrics]) => ({
        name,
        totalInvestment: metrics.totalInvestment,
        tokens: metrics.tokens
      }))
      .sort((a, b) => b.totalInvestment - a.totalInvestment)
      .slice(0, 4);
  };

  // Get published units data for the table
  const getPublishedUnitsData = () => {
    return properties.map(property => {
      // Calculate owners for this property
      const propertyTransactions = transactions.filter(tx => tx.propertyName === property.name);
      const uniqueOwners = new Set(propertyTransactions.map(tx => tx.userId)).size;
      
      // Calculate total sales for this property
      const totalSales = propertyTransactions.reduce((sum, tx) => sum + (tx.totalInvestment || 0), 0);
      
      // Calculate tokens left
      const tokensSold = propertyTransactions.reduce((sum, tx) => sum + (tx.tokens || 0), 0);
      const tokensLeft = (property.tokenSupply || 0) - tokensSold;
      
      // Get the first available image from different possible fields
      const getPropertyImage = () => {
        if (property.images && property.images.length > 0) return property.images[0];
        if (property.imageUrls && property.imageUrls.length > 0) return property.imageUrls[0];
        if (property.image) return property.image;
        return null;
      };

      return {
        id: property.id,
        name: property.name || 'Unnamed Property',
        image: getPropertyImage(),
        owners: uniqueOwners,
        sales: totalSales,
        tokensLeft: Math.max(0, tokensLeft)
      };
    }).filter(unit => unit.name !== 'Unnamed Property'); // Filter out properties without names
  };

  const dashboardMetrics = getDashboardMetrics();
  const userGrowthData = getUserGrowthData();
  const weeklyUserGrowth = getWeeklyUserGrowth();
  const cumulativeUserGrowth = getCumulativeUserGrowth();
  const userRoleDistribution = getUserRoleDistribution();
  const userActivityMetrics = getUserActivityMetrics();
  const transactionData = getTransactionData();
  const weeklyTransactionData = getWeeklyTransactionData();
  const cumulativeTransactionData = getCumulativeTransactionData();
  const transactionVolumeByProperty = getTransactionVolumeByProperty();
  const transactionActivityMetrics = getTransactionActivityMetrics();
  const transactionAmountDistribution = getTransactionAmountDistribution();
  const monthlyAmountTrends = getMonthlyAmountTrends();
  const transactionAmountByProperty = getTransactionAmountByProperty();
  const activeRateMetrics = getActiveRateMetrics();
  const activeRateBySegments = getActiveRateBySegments();
  const weeklyActiveRates = getWeeklyActiveRates();
  const recentSales = getRecentSales();
  const dailySalesActivity = getDailySalesActivity();
  const recentSalesByProperty = getRecentSalesByProperty();
  const hourlySalesPattern = getHourlySalesPattern();
  const salesVelocityMetrics = getSalesVelocityMetrics();

  if (usersLoading || transactionsLoading || propertiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      {/* Top Metrics Cards - Matching Screenshot */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{dashboardMetrics.newUsers}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <span className={`mr-1 ${dashboardMetrics.newUsersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardMetrics.newUsersGrowth >= 0 ? '+' : ''}{dashboardMetrics.newUsersGrowth}%
                  </span>
                  from last month
                </p>
              </div>
              <div className="h-12 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardMetrics.newUsersChartData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#22c55e" 
                      strokeWidth={2} 
                      dot={false}
                      strokeLinecap="round"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">No of transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{dashboardMetrics.transactions}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <span className={`mr-1 ${dashboardMetrics.transactionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardMetrics.transactionGrowth >= 0 ? '+' : ''}{dashboardMetrics.transactionGrowth}%
                  </span>
                  from last month
                </p>
              </div>
              <div className="h-12 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardMetrics.transactionsChartData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#22c55e" 
                      strokeWidth={2} 
                      dot={false}
                      strokeLinecap="round"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transaction amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">${dashboardMetrics.transactionAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <span className={`mr-1 ${dashboardMetrics.amountGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardMetrics.amountGrowth >= 0 ? '+' : ''}{dashboardMetrics.amountGrowth}%
                  </span>
                  from last month
                </p>
              </div>
              <div className="h-12 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardMetrics.amountChartData}>
                    <defs>
                      <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#22c55e" 
                      strokeWidth={2} 
                      fill="url(#amountGradient)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tokens left value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{dashboardMetrics.totalTokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ${dashboardMetrics.totalTokenValue.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'sold', value: dashboardMetrics.percentageSold },
                        { name: 'remaining', value: 100 - dashboardMetrics.percentageSold }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={16}
                      outerRadius={22}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-[8px] font-bold text-green-600">{dashboardMetrics.percentageSold.toFixed(1)}%</span>
                  <span className="text-[6px] text-muted-foreground">sold</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Detailed Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{userActivityMetrics.newThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userActivityMetrics.totalActive}</div>
            <p className="text-xs text-muted-foreground">
              {userActivityMetrics.activeThisWeek} active this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              +{transactionActivityMetrics.transactionsThisMonth} this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeRateMetrics.overallActiveRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {activeRateMetrics.usersWithTransactions} of {activeRateMetrics.totalUsers} users invested
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Distribution Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Investment distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getPropertyInvestmentDistribution()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={64}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {getPropertyInvestmentDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getGoldColorShade(index)} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 ml-6">
                <div className="space-y-2">
                  {getPropertyInvestmentDistribution().map((property, index) => (
                    <div key={property.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: getGoldColorShade(index) }}
                        />
                        <span className="text-sm text-muted-foreground">{property.name}</span>
                      </div>
                      <span className="text-sm font-medium">${property.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total investment amount</p>
                  <p className="text-lg font-bold">${dashboardMetrics.transactionAmount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total tokens</p>
                  <p className="text-lg font-bold">{getTotalTokensSold()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Property Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">No. of units:</span>
                <span className="font-medium">{properties.length}</span>
              </div>
              {getPropertyPerformanceMetrics().map((property, index) => (
                <div key={property.name} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{property.name}</span>
                  <span className="font-medium">${property.totalInvestment.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Published Units Overview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="text-lg font-medium">Published units overview</CardTitle>
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search unit" 
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Owners</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sales</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tokens left</th>
                </tr>
              </thead>
              <tbody>
                {getPublishedUnitsData().map((unit, index) => (
                  <tr key={unit.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {unit.image && typeof unit.image === 'string' && unit.image.trim() !== '' ? (
                            <img 
                              src={unit.image} 
                              alt={unit.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span 
                            className="text-xs text-gray-500 w-full h-full flex items-center justify-center"
                            style={{ display: unit.image && typeof unit.image === 'string' && unit.image.trim() !== '' ? 'none' : 'flex' }}
                          >
                            {unit.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-sm">{unit.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{unit.owners}</td>
                    <td className="py-3 px-4 text-sm">${unit.sales.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm">{unit.tokensLeft.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced User Analytics Charts */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">User Analytics</h2>
        
        {/* User Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Monthly User Growth */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>User Registration Trend</CardTitle>
              <CardDescription>Monthly and cumulative user growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>Distribution by user type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userRoleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userRoleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly User Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Registrations</CardTitle>
              <CardDescription>New users per week (last 8 weeks)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyUserGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cumulative User Growth */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Total User Growth</CardTitle>
              <CardDescription>Cumulative user count over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cumulativeUserGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="totalUsers" 
                    stroke="#FFBB28" 
                    strokeWidth={3}
                    dot={{ fill: '#FFBB28', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Transaction Analytics */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Transaction Analytics</h2>
        
        {/* Transaction Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Monthly Transaction Volume */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Transaction Volume Trend</CardTitle>
              <CardDescription>Monthly transaction count and total value over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: number, name: string) => 
                    name === 'amount' ? `$${value.toLocaleString()}` : value
                  } />
                  <Legend />
                  <Bar yAxisId="left" dataKey="transactions" fill="#FF8042" name="Count" />
                  <Bar yAxisId="right" dataKey="amount" fill="#0088FE" name="Amount ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Transaction Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
              <CardDescription>Key transaction metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Amount</span>
                <span className="font-bold">${transactionActivityMetrics.averageTransactionAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="font-bold text-yellow-600">+{transactionActivityMetrics.transactionsThisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Week Volume</span>
                <span className="font-bold">${transactionActivityMetrics.amountThisWeek.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly Volume</span>
                <span className="font-bold">${transactionActivityMetrics.amountThisMonth.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Transaction Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Transaction count per week (last 8 weeks)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyTransactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="transactions" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cumulative Transaction Growth */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Total Transaction Growth</CardTitle>
              <CardDescription>Cumulative transaction count and value over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cumulativeTransactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: number, name: string) => 
                    name === 'totalAmount' ? `$${value.toLocaleString()}` : value
                  } />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="totalTransactions" 
                    stroke="#FFBB28" 
                    strokeWidth={3}
                    dot={{ fill: '#FFBB28', strokeWidth: 2, r: 4 }}
                    name="Total Count"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="totalAmount" 
                    stroke="#FF8042" 
                    strokeWidth={3}
                    dot={{ fill: '#FF8042', strokeWidth: 2, r: 4 }}
                    name="Total Amount ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Transaction Volume by Property */}
          <Card>
            <CardHeader>
              <CardTitle>Top Properties</CardTitle>
              <CardDescription>Transaction volume by property (top 10)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transactionVolumeByProperty} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="property" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="transactions" fill="#8884D8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Amount Analytics */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Transaction Amount Analytics</h2>
        
        {/* Amount Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Monthly Amount Trends */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Amount Trends</CardTitle>
              <CardDescription>Average, total, and range of transaction amounts per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyAmountTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="totalAmount" 
                    stackId="1"
                    stroke="#0088FE" 
                    fill="#0088FE" 
                    fillOpacity={0.6}
                    name="Total Amount"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="averageAmount" 
                    stackId="2"
                    stroke="#00C49F" 
                    fill="#00C49F" 
                    fillOpacity={0.4}
                    name="Average Amount"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Transaction Amount Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Amount Distribution</CardTitle>
              <CardDescription>Distribution of transactions by amount ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={transactionAmountDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, count, percent }) => 
                      `${range}: ${count} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {transactionAmountDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Amount Performance */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Property Amount Performance</CardTitle>
              <CardDescription>Average and total transaction amounts by property</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={transactionAmountByProperty}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="property" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: number, name: string) => 
                    [`$${value.toLocaleString()}`, name === 'averageAmount' ? 'Average Amount' : 'Total Amount']
                  } />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="averageAmount" 
                    fill="#FFBB28" 
                    name="Average Amount" 
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="totalAmount" 
                    fill="#FF8042" 
                    name="Total Amount" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Amount Statistics Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Amount Statistics</CardTitle>
              <CardDescription>Key transaction amount metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Volume</span>
                <span className="font-bold text-yellow-600">${totalTransactionAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Per Transaction</span>
                <span className="font-bold">${transactionActivityMetrics.averageTransactionAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Week Total</span>
                <span className="font-bold text-blue-600">${transactionActivityMetrics.amountThisWeek.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Month Total</span>
                <span className="font-bold text-purple-600">${transactionActivityMetrics.amountThisMonth.toLocaleString()}</span>
              </div>
              {monthlyAmountTrends.length > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Highest Monthly</span>
                    <span className="font-bold">${Math.max(...monthlyAmountTrends.map(m => m.totalAmount)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Average</span>
                    <span className="font-bold">${(monthlyAmountTrends.reduce((sum, m) => sum + m.averageAmount, 0) / monthlyAmountTrends.length).toLocaleString()}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Rate Analytics */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Active Rate Analytics</h2>
        
        {/* Active Rate Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Monthly Active Rate Trends */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Active Rate Trends</CardTitle>
              <CardDescription>Percentage of users making transactions each month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={activeRateMetrics.monthlyActiveRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    domain={[0, 'dataMax + 5']}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'activeRate' ? `${value}%` : value,
                      name === 'activeRate' ? 'Active Rate' : 
                      name === 'activeUsers' ? 'Active Users' : 'Total Users'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="activeRate" 
                    stroke="#0088FE" 
                    strokeWidth={3}
                    dot={{ fill: '#0088FE', strokeWidth: 2, r: 5 }}
                    name="Active Rate (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#00C49F" 
                    strokeWidth={2}
                    dot={{ fill: '#00C49F', strokeWidth: 2, r: 4 }}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Active Rate by User Segments */}
          <Card>
            <CardHeader>
              <CardTitle>Rate by User Segments</CardTitle>
              <CardDescription>Active rates across different user tenure groups</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={activeRateBySegments} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis dataKey="segment" type="category" width={120} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Active Rate']}
                  />
                  <Bar dataKey="activeRate" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Active Rate Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Active Rates</CardTitle>
              <CardDescription>Active rate trends over the last 8 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={weeklyActiveRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis 
                    domain={[0, 'dataMax + 5']}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'activeRate' ? `${value}%` : value,
                      name === 'activeRate' ? 'Active Rate' : 'Active Users'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activeRate" 
                    stroke="#FF8042" 
                    fill="#FF8042" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Active Rate Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Segment Distribution</CardTitle>
              <CardDescription>User distribution across activity segments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={activeRateBySegments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ segment, activeRate }) => 
                      `${segment.split(' ')[0]} ${segment.split(' ')[1]}: ${activeRate}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="totalUsers"
                  >
                    {activeRateBySegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      `${value} users (${props.payload.activeRate}% active)`,
                      'Total Users'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Active Rate Statistics Summary */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Active Rate Statistics</CardTitle>
              <CardDescription>Comprehensive active rate metrics and insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Overall Active Rate</span>
                  <span className="font-bold text-blue-600">{activeRateMetrics.overallActiveRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-bold text-yellow-600">{activeRateMetrics.usersWithTransactions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Inactive Users</span>
                  <span className="font-bold text-red-600">{activeRateMetrics.totalUsers - activeRateMetrics.usersWithTransactions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Users</span>
                  <span className="font-bold">{activeRateMetrics.totalUsers}</span>
                </div>
              </div>
              
              {activeRateBySegments.length > 0 && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Best Performing Segment</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {activeRateBySegments.reduce((best, current) => 
                          current.activeRate > best.activeRate ? current : best
                        ).segment}
                      </span>
                      <span className="font-bold text-yellow-600">
                        {Math.max(...activeRateBySegments.map(s => s.activeRate))}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Improvement Opportunity</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {activeRateBySegments.reduce((worst, current) => 
                          current.activeRate < worst.activeRate ? current : worst
                        ).segment}
                      </span>
                      <span className="font-bold text-orange-600">
                        {Math.min(...activeRateBySegments.map(s => s.activeRate))}%
                      </span>
                    </div>
                  </div>
                </>
              )}

              {activeRateMetrics.monthlyActiveRates.length > 1 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Monthly Trend</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {activeRateMetrics.monthlyActiveRates[activeRateMetrics.monthlyActiveRates.length - 1].activeRate > 
                       activeRateMetrics.monthlyActiveRates[activeRateMetrics.monthlyActiveRates.length - 2].activeRate 
                       ? 'Improving' : 'Declining'} trend
                    </span>
                    <span className={`font-bold ${
                      activeRateMetrics.monthlyActiveRates[activeRateMetrics.monthlyActiveRates.length - 1].activeRate > 
                      activeRateMetrics.monthlyActiveRates[activeRateMetrics.monthlyActiveRates.length - 2].activeRate 
                      ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(activeRateMetrics.monthlyActiveRates[activeRateMetrics.monthlyActiveRates.length - 1].activeRate - 
                        activeRateMetrics.monthlyActiveRates[activeRateMetrics.monthlyActiveRates.length - 2].activeRate).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Recent Sales Activity Analytics */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Recent Sales Activity Analytics</h2>
        
        {/* Sales Velocity Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Last 24h</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesVelocityMetrics.sales24h}</div>
              <p className="text-xs text-muted-foreground">
                ${salesVelocityMetrics.amount24h.toLocaleString()} volume
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Last 7d</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesVelocityMetrics.sales7d}</div>
              <p className="text-xs text-muted-foreground">
                ${salesVelocityMetrics.amount7d.toLocaleString()} volume
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesVelocityMetrics.avgDailySales.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                ${salesVelocityMetrics.avgDailyAmount.toLocaleString()} avg amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Last 30d</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesVelocityMetrics.sales30d}</div>
              <p className="text-xs text-muted-foreground">
                ${salesVelocityMetrics.amount30d.toLocaleString()} total volume
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Daily Sales Activity (Last 30 Days) */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Daily Sales Activity</CardTitle>
              <CardDescription>Sales count and volume over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={dailySalesActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'salesAmount' ? `$${value.toLocaleString()}` : value,
                      name === 'salesAmount' ? 'Sales Amount' : 'Sales Count'
                    ]}
                  />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="salesCount" 
                    stackId="1"
                    stroke="#0088FE" 
                    fill="#0088FE" 
                    fillOpacity={0.6}
                    name="Sales Count"
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="salesAmount" 
                    stackId="2"
                    stroke="#00C49F" 
                    fill="#00C49F" 
                    fillOpacity={0.4}
                    name="Sales Amount ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Sales by Property */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Property</CardTitle>
              <CardDescription>Last 7 days property performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={recentSalesByProperty}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ property, salesCount }) => 
                      `${property}: ${salesCount}`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="salesAmount"
                  >
                    {recentSalesByProperty.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hourly Sales Pattern */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Hourly Sales Pattern</CardTitle>
              <CardDescription>Sales activity distribution by hour (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={hourlySalesPattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'salesAmount' ? `$${value.toLocaleString()}` : value,
                      name === 'salesAmount' ? 'Sales Amount' : 'Sales Count'
                    ]}
                  />
                  <Bar dataKey="salesCount" fill="#FFBB28" name="Sales Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Sales List */}
          <Card>
            <CardHeader>
              <CardTitle>Latest Transactions</CardTitle>
              <CardDescription>Most recent investment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentSales.map(sale => (
                  <div key={sale.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{sale.propertyName}</p>
                      <p className="text-xs text-muted-foreground">{sale.date} at {sale.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${sale.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{sale.tokens} tokens</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}