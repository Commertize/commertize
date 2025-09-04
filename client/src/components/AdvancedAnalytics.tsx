import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Calculator, AlertTriangle, Target, PieChart, Zap, Brain, Map, DollarSign, BarChart3, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const colors = {
  gold: '#be8d00', // Original gold color from website
  white: '#FFFFFF',
  bg: '#0A0A0A',
  card: '#1A1A1A',
  border: '#2A2A2A'
};

// Mock data for advanced analytics
const capRateHeatmapData = [
  { region: 'Manhattan', sector: 'Office', capRate: 4.2, risk: 'high' as const, volume: '$2.1B' },
  { region: 'Manhattan', sector: 'Retail', capRate: 5.8, risk: 'med' as const, volume: '$890M' },
  { region: 'Manhattan', sector: 'Multifamily', capRate: 3.9, risk: 'low' as const, volume: '$1.4B' },
  { region: 'Brooklyn', sector: 'Office', capRate: 5.1, risk: 'med' as const, volume: '$650M' },
  { region: 'Brooklyn', sector: 'Retail', capRate: 6.2, risk: 'med' as const, volume: '$420M' },
  { region: 'Brooklyn', sector: 'Multifamily', capRate: 4.5, risk: 'low' as const, volume: '$980M' },
  { region: 'Queens', sector: 'Office', capRate: 5.8, risk: 'med' as const, volume: '$380M' },
  { region: 'Queens', sector: 'Industrial', capRate: 4.9, risk: 'low' as const, volume: '$720M' },
];

const comparablesData = [
  { property: 'Target Property', sqft: 125000, price: 45000000, capRate: 5.2, match: 100 },
  { property: '432 Park Ave', sqft: 120000, price: 42500000, capRate: 5.0, match: 94 },
  { property: 'One57 Commercial', sqft: 130000, price: 48000000, capRate: 5.4, match: 89 },
  { property: 'Hudson Yards Tower', sqft: 118000, price: 41200000, capRate: 4.9, match: 87 },
  { property: 'Midtown Plaza', sqft: 135000, price: 49500000, capRate: 5.6, match: 85 },
];

const tokenizationScenarios = [
  { tokenPercent: 25, capitalRaised: 11250000, minInvestment: 10000, investors: 450 },
  { tokenPercent: 50, capitalRaised: 22500000, minInvestment: 10000, investors: 900 },
  { tokenPercent: 75, capitalRaised: 33750000, minInvestment: 10000, investors: 1350 },
  { tokenPercent: 100, capitalRaised: 45000000, minInvestment: 10000, investors: 1800 },
];

const stressTestData = [
  { scenario: 'Current', noi: 3500000, capRate: 5.2, value: 67300000 },
  { scenario: '+0.5% Rate', noi: 3500000, capRate: 5.7, value: 61400000 },
  { scenario: '+1.0% Rate', noi: 3500000, capRate: 6.2, value: 56500000 },
  { scenario: '-10% NOI', noi: 3150000, capRate: 5.2, value: 60600000 },
  { scenario: '+1% Rate, -10% NOI', noi: 3150000, capRate: 6.2, value: 50800000 },
];

const refinancingWallData = [
  { year: '2024', maturities: 850, funded: 340, distressed: 85 },
  { year: '2025', maturities: 1200, funded: 480, distressed: 180 },
  { year: '2026', maturities: 980, funded: 390, distressed: 147 },
  { year: '2027', maturities: 760, funded: 300, distressed: 114 },
];

const liquidityData = [
  { date: 'Jan', volume: 45, avgPrice: 98.5, spread: 2.1 },
  { date: 'Feb', volume: 52, avgPrice: 97.8, spread: 2.3 },
  { date: 'Mar', volume: 38, avgPrice: 99.2, spread: 1.8 },
  { date: 'Apr', volume: 61, avgPrice: 98.9, spread: 2.0 },
  { date: 'May', volume: 74, avgPrice: 99.5, spread: 1.6 },
];

const portfolioExposureData = [
  { sector: 'Multifamily', value: 12500000, percent: 35, risk: 'low' as const },
  { sector: 'Industrial', value: 8900000, percent: 25, risk: 'low' as const },
  { sector: 'Office', value: 7100000, percent: 20, risk: 'high' as const },
  { sector: 'Retail', value: 5300000, percent: 15, risk: 'med' as const },
  { sector: 'Hospitality', value: 1800000, percent: 5, risk: 'high' as const },
];

const distressSignals = [
  { property: 'Manhattan Office Tower', risk: 'high' as const, score: 85, reason: 'Vacancy > 40%, Debt Service Coverage < 1.0' },
  { property: 'SoHo Retail Complex', risk: 'high' as const, score: 78, reason: 'Rent rolls declining 15% YoY' },
  { property: 'Midtown Plaza', risk: 'med' as const, score: 65, reason: 'Major tenant lease expiring 2024' },
  { property: 'Brooklyn Warehouse', risk: 'low' as const, score: 25, reason: 'Strong fundamentals, low leverage' },
];

const capitalFlowsData = [
  { sector: 'Industrial', q1: 2100, q2: 2450, q3: 2800, q4: 3100 },
  { sector: 'Multifamily', q1: 1800, q2: 1950, q3: 2200, q4: 2400 },
  { sector: 'Office', q1: 950, q2: 850, q3: 720, q4: 650 },
  { sector: 'Retail', q1: 680, q2: 620, q3: 590, q4: 550 },
];

export default function AdvancedAnalytics() {
  const [selectedPhase, setSelectedPhase] = useState('phase1');
  const [tokenizationInputs, setTokenizationInputs] = useState({
    propertyValue: 45000000,
    tokenPercent: 50,
    minInvestment: 10000
  });

  const RiskBadge = ({ level }: { level: 'low' | 'med' | 'high' }) => {
    const map = {
      low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      med: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      high: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    };
    return (
      <Badge className={`${map[level]}`}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const calculateTokenization = () => {
    const capitalRaised = tokenizationInputs.propertyValue * (tokenizationInputs.tokenPercent / 100);
    const maxInvestors = Math.floor(capitalRaised / tokenizationInputs.minInvestment);
    return { capitalRaised, maxInvestors };
  };

  return (
    <div className="space-y-6 text-black">
      {/* Phase Navigation */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button
          onClick={() => setSelectedPhase('phase1')}
          variant={selectedPhase === 'phase1' ? "default" : "outline"}
          className={selectedPhase === 'phase1' 
            ? "bg-black text-white hover:bg-black/90" 
            : "border-black/20 text-black/60 hover:bg-gray-50"
          }
        >
          <Calculator className="w-4 h-4 mr-2" />
          Phase 1 - Core Analysis
        </Button>
        <Button
          onClick={() => setSelectedPhase('phase2')}
          variant={selectedPhase === 'phase2' ? "default" : "outline"}
          className={selectedPhase === 'phase2' 
            ? "bg-black text-white hover:bg-black/90" 
            : "border-black/20 text-black/60 hover:bg-gray-50"
          }
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Phase 2 - Market Intelligence
        </Button>
        <Button
          onClick={() => setSelectedPhase('phase3')}
          variant={selectedPhase === 'phase3' ? "default" : "outline"}
          className={selectedPhase === 'phase3' 
            ? "bg-black text-white hover:bg-black/90" 
            : "border-black/20 text-black/60 hover:bg-gray-50"
          }
        >
          <Brain className="w-4 h-4 mr-2" />
          Phase 3 - Advanced AI Tools
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {selectedPhase === 'phase1' && (
          <motion.div
            key="phase1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Cap Rate Heatmaps */}
            <Card className="lg:col-span-2 value-tile">
              <CardHeader>
                <CardTitle className="text-black font-light flex items-center gap-2">
                  <Map className="w-5 h-5 text-black" />
                  Cap Rate Heatmaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {['Manhattan', 'Brooklyn', 'Queens'].map(region => (
                    <div key={region} className="text-center">
                      <div className="font-light text-black mb-2">{region}</div>
                      <div className="space-y-2">
                        {capRateHeatmapData
                          .filter(item => item.region === region)
                          .map((item, idx) => (
                            <motion.div
                              key={idx}
                              whileHover={{ scale: 1.05 }}
                              className="p-3 rounded-lg border cursor-pointer transition-colors bg-white hover:border-black/20"
                            >
                              <div className="text-sm text-black/60">{item.sector}</div>
                              <div className="font-light text-black text-lg">
                                {item.capRate}%
                              </div>
                              <div className="text-xs text-black/60">{item.volume}</div>
                              <RiskBadge level={item.risk} />
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comparables Engine */}
            <Card className="value-tile">
              <CardHeader>
                <CardTitle className="text-black font-light flex items-center gap-2">
                  <Target className="w-5 h-5 text-black" />
                  AI Comparables Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparablesData.map((comp, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-3 rounded-lg border bg-white ${
                        idx === 0 ? 'border-black border-2' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-light text-black">{comp.property}</div>
                          <div className="text-sm text-black/60">
                            {comp.sqft.toLocaleString()} SF • {comp.capRate}% Cap Rate
                          </div>
                          <div className="text-sm text-black font-light">
                            ${comp.price.toLocaleString()}
                          </div>
                        </div>
                        <Badge className="bg-black text-white">
                          {comp.match}% Match
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tokenization Calculator */}
            <Card className="value-tile">
              <CardHeader>
                <CardTitle className="text-black font-light flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-black" />
                  Tokenization Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-black/60 font-light">Property Value</Label>
                    <Input
                      type="number"
                      value={tokenizationInputs.propertyValue}
                      onChange={(e) => setTokenizationInputs({
                        ...tokenizationInputs,
                        propertyValue: Number(e.target.value)
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-black/60 font-light">Token Percentage</Label>
                    <Input
                      type="number"
                      value={tokenizationInputs.tokenPercent}
                      onChange={(e) => setTokenizationInputs({
                        ...tokenizationInputs,
                        tokenPercent: Number(e.target.value)
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-black/60 font-light">Min Investment</Label>
                    <Input
                      type="number"
                      value={tokenizationInputs.minInvestment}
                      onChange={(e) => setTokenizationInputs({
                        ...tokenizationInputs,
                        minInvestment: Number(e.target.value)
                      })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg border bg-white">
                    <div className="text-lg font-light mb-2 text-black">
                      Capital Raised: ${calculateTokenization().capitalRaised.toLocaleString()}
                    </div>
                    <div className="text-black/60 font-light">
                      Max Investors: {calculateTokenization().maxInvestors.toLocaleString()}
                    </div>
                    <div className="text-black/60 font-light">
                      Token Supply: {(calculateTokenization().capitalRaised / tokenizationInputs.minInvestment).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedPhase === 'phase2' && (
          <motion.div
            key="phase2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Stress Test Simulator */}
            <Card className="value-tile">
              <CardHeader>
                <CardTitle className="text-black font-light flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-black" />
                  Stress Test Simulator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stressTestData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="scenario" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)' 
                      }}
                    />
                    <Bar dataKey="value" fill="#be8d00" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Refinancing Wall Tracker */}
            <Card className="value-tile">
              <CardHeader>
                <CardTitle className="text-black font-light flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-black" />
                  Refinancing Wall Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={refinancingWallData}>
                    <defs>
                      <linearGradient id="colorMaturities" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#be8d00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#be8d00" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFunded" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDistressed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)' 
                      }}
                    />
                    <Area type="monotone" dataKey="maturities" stackId="1" stroke="#be8d00" strokeWidth={2} fillOpacity={1} fill="url(#colorMaturities)" />
                    <Area type="monotone" dataKey="funded" stackId="2" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorFunded)" />
                    <Area type="monotone" dataKey="distressed" stackId="3" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDistressed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Liquidity Monitor */}
            <Card className="value-tile lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-black font-light flex items-center gap-2">
                  <Activity className="w-5 h-5 text-black" />
                  Secondary Market Liquidity Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-light text-black">
                        ${liquidityData[liquidityData.length - 1].volume}M
                      </div>
                      <div className="text-black/60 text-sm font-light">Monthly Volume</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-black">
                        {liquidityData[liquidityData.length - 1].avgPrice}%
                      </div>
                      <div className="text-black/60 text-sm font-light">Avg Price (% of NAV)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-black">
                        {liquidityData[liquidityData.length - 1].spread}%
                      </div>
                      <div className="text-black/60 text-sm font-light">Bid-Ask Spread</div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={liquidityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px', 
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)' 
                          }}
                        />
                        <Line type="monotone" dataKey="volume" stroke="#be8d00" strokeWidth={2} />
                        <Line type="monotone" dataKey="avgPrice" stroke="#10B981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedPhase === 'phase3' && (
          <motion.div
            key="phase3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Portfolio Exposure */}
            <Card className="value-tile">
              <CardHeader>
                <CardTitle className="text-black font-light flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-black" />
                  Portfolio Exposure Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioExposureData.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-black/60 font-light">{item.sector}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-light text-black">
                            ${(item.value / 1000000).toFixed(1)}M
                          </span>
                          <RiskBadge level={item.risk} />
                        </div>
                      </div>
                      <Progress value={item.percent} className="h-2" />
                      <div className="text-xs text-black/60 font-light">
                        {item.percent}% of total portfolio
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deal Pitch Generator */}
            <Card className="value-tile">
              <CardHeader>
                <CardTitle className="text-black font-light flex items-center gap-2">
                  <Zap className="w-5 h-5 text-black" />
                  AI Deal Pitch Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border bg-white">
                    <h4 className="font-light mb-2 text-black">
                      The Axis - Premium Investment Opportunity
                    </h4>
                    <p className="text-black text-sm leading-relaxed font-light">
                      Prime Chardonna Blvd multifamily complex offering 12% target IRR with 85% occupancy. 
                      Strong rent growth fundamentals in high-demand CA market. Tokenized structure enables 
                      fractional ownership starting at $10K. Conservative 65% LTV with experienced operator. 
                      Limited-time opportunity with $1.5M remaining of $10M raise.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Badge className="bg-black text-white">
                        12% IRR
                      </Badge>
                      <Badge className="bg-black text-white">
                        85% Funded
                      </Badge>
                      <Badge className="bg-black text-white">
                        Prime Location
                      </Badge>
                    </div>
                  </div>
                  <Button className="w-full bg-black text-white hover:bg-black/90">
                    Generate New Pitch
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Distress Radar */}
            <Card className="value-tile">
              <CardHeader>
                <CardTitle className="text-black font-light flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-black" />
                  Distress Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {distressSignals.map((signal, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 rounded-lg border bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-light text-black">{signal.property}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-light text-black">
                            {signal.score}
                          </span>
                          <RiskBadge level={signal.risk} />
                        </div>
                      </div>
                      <div className="text-xs text-black/60 font-light">
                        {signal.reason}
                      </div>
                      <Progress value={signal.score} className="h-1 mt-2" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Capital Flows Dashboard */}
            <Card className="value-tile">
              <CardHeader>
                <CardTitle className="text-black font-light flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-black" />
                  Capital Flows Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={capitalFlowsData.map((item, idx) => ({
                    quarter: `Q${idx + 1}`,
                    ...item
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)' 
                      }}
                    />
                    <Line type="monotone" dataKey="Industrial" stroke="#be8d00" strokeWidth={2} />
                    <Line type="monotone" dataKey="Multifamily" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="Office" stroke="#EF4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="Retail" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}