import { Router } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

const router = Router();

// Enhanced Analytics API for Admin Dashboard
router.get('/dashboard-stats', async (req, res) => {
  try {
    const db = getFirestore();
    
    // Get real-time data from multiple collections
    const [
      propertiesSnapshot,
      usersSnapshot,
      investmentsSnapshot,
      transactionsSnapshot
    ] = await Promise.all([
      db.collection('properties').get(),
      db.collection('users').get(),
      db.collection('investments').get(),
      db.collection('transactions').get()
    ]);

    const properties = propertiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const investments = investmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate comprehensive statistics
    const stats = {
      overview: {
        totalProperties: properties.length,
        totalUsers: users.length,
        totalInvestments: investments.length,
        totalInvestmentValue: investments.reduce((sum, inv) => sum + (inv.totalInvestment || 0), 0),
        averageInvestment: investments.length > 0 ? 
          investments.reduce((sum, inv) => sum + (inv.totalInvestment || 0), 0) / investments.length : 0,
        activeProperties: properties.filter(p => p.status === 'active').length,
        pendingProperties: properties.filter(p => p.status === 'pending').length,
        completedDeals: properties.filter(p => p.status === 'completed').length
      },
      
      userMetrics: {
        newUsersThisMonth: users.filter(u => {
          const created = new Date(u.createdAt);
          const now = new Date();
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length,
        activeInvestors: [...new Set(investments.map(inv => inv.userId))].length,
        usersByCountry: users.reduce((acc, user) => {
          const country = user.country || 'Unknown';
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        userGrowthTrend: calculateUserGrowthTrend(users)
      },

      propertyMetrics: {
        propertiesByType: properties.reduce((acc, prop) => {
          const type = prop.type || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        propertiesByStatus: properties.reduce((acc, prop) => {
          const status = prop.status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        averagePropertyValue: properties.length > 0 ?
          properties.reduce((sum, prop) => sum + (prop.propertyValue || 0), 0) / properties.length : 0,
        totalTokensIssued: properties.reduce((sum, prop) => sum + (prop.totalTokens || 0), 0),
        fundingProgress: properties.map(prop => ({
          id: prop.id,
          name: prop.name,
          targetEquity: prop.targetEquity || 0,
          raisedAmount: investments
            .filter(inv => inv.propertyId === prop.id)
            .reduce((sum, inv) => sum + (inv.totalInvestment || 0), 0),
          progress: prop.targetEquity > 0 ? 
            (investments.filter(inv => inv.propertyId === prop.id)
              .reduce((sum, inv) => sum + (inv.totalInvestment || 0), 0) / prop.targetEquity) * 100 : 0
        }))
      },

      investmentMetrics: {
        monthlyInvestmentTrend: calculateMonthlyTrend(investments),
        investmentsByProperty: investments.reduce((acc, inv) => {
          const propertyId = inv.propertyId || 'Unknown';
          acc[propertyId] = (acc[propertyId] || 0) + (inv.totalInvestment || 0);
          return acc;
        }, {} as Record<string, number>),
        topInvestors: calculateTopInvestors(investments, users),
        recentActivity: getRecentActivity(investments, properties, users)
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// Real-time property performance analytics
router.get('/property-performance/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const db = getFirestore();

    const [propertyDoc, investmentsSnapshot] = await Promise.all([
      db.collection('properties').doc(propertyId).get(),
      db.collection('investments').where('propertyId', '==', propertyId).get()
    ]);

    if (!propertyDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    const property = { id: propertyDoc.id, ...propertyDoc.data() };
    const investments = investmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const performance = {
      property: property,
      totalInvestors: investments.length,
      totalRaised: investments.reduce((sum, inv) => sum + (inv.totalInvestment || 0), 0),
      fundingProgress: property.targetEquity > 0 ? 
        (investments.reduce((sum, inv) => sum + (inv.totalInvestment || 0), 0) / property.targetEquity) * 100 : 0,
      averageInvestment: investments.length > 0 ?
        investments.reduce((sum, inv) => sum + (inv.totalInvestment || 0), 0) / investments.length : 0,
      investmentTimeline: investments.map(inv => ({
        date: inv.investmentDate || inv.timestamp,
        amount: inv.totalInvestment || 0,
        investor: inv.userId
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      projectedReturns: calculateProjectedReturns(property, investments)
    };

    res.json({
      success: true,
      data: performance
    });

  } catch (error) {
    console.error('Error fetching property performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property performance'
    });
  }
});

// Helper functions
function calculateUserGrowthTrend(users: any[]) {
  const monthlyGrowth = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const usersInMonth = users.filter(user => {
      const created = new Date(user.createdAt);
      return created >= month && created < nextMonth;
    }).length;
    
    monthlyGrowth.push({
      month: month.toISOString().substring(0, 7),
      users: usersInMonth
    });
  }
  
  return monthlyGrowth;
}

function calculateMonthlyTrend(investments: any[]) {
  const monthlyTrend = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const monthlyInvestments = investments.filter(inv => {
      const date = new Date(inv.investmentDate || inv.timestamp);
      return date >= month && date < nextMonth;
    });
    
    monthlyTrend.push({
      month: month.toISOString().substring(0, 7),
      amount: monthlyInvestments.reduce((sum, inv) => sum + (inv.totalInvestment || 0), 0),
      count: monthlyInvestments.length
    });
  }
  
  return monthlyTrend;
}

function calculateTopInvestors(investments: any[], users: any[]) {
  const investorTotals = investments.reduce((acc, inv) => {
    const userId = inv.userId;
    acc[userId] = (acc[userId] || 0) + (inv.totalInvestment || 0);
    return acc;
  }, {} as Record<string, number>);
  
  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, any>);
  
  return Object.entries(investorTotals)
    .map(([userId, total]) => ({
      userId,
      user: userMap[userId],
      totalInvestment: total,
      investmentCount: investments.filter(inv => inv.userId === userId).length
    }))
    .sort((a, b) => b.totalInvestment - a.totalInvestment)
    .slice(0, 10);
}

function getRecentActivity(investments: any[], properties: any[], users: any[]) {
  const propertyMap = properties.reduce((acc, prop) => {
    acc[prop.id] = prop;
    return acc;
  }, {} as Record<string, any>);
  
  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, any>);
  
  return investments
    .sort((a, b) => new Date(b.investmentDate || b.timestamp).getTime() - new Date(a.investmentDate || a.timestamp).getTime())
    .slice(0, 20)
    .map(inv => ({
      id: inv.id,
      type: 'investment',
      amount: inv.totalInvestment || 0,
      property: propertyMap[inv.propertyId],
      user: userMap[inv.userId],
      date: inv.investmentDate || inv.timestamp
    }));
}

function calculateProjectedReturns(property: any, investments: any[]) {
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.totalInvestment || 0), 0);
  const targetIRR = property.targetedIRR || 0;
  const holdPeriod = property.holdPeriod || 5;
  
  if (totalInvested === 0) return null;
  
  return {
    totalInvested,
    projectedValue: totalInvested * Math.pow(1 + (targetIRR / 100), holdPeriod),
    annualCashFlow: totalInvested * ((property.targetedYield || 0) / 100),
    totalReturn: (totalInvested * Math.pow(1 + (targetIRR / 100), holdPeriod)) - totalInvested
  };
}

export default router;