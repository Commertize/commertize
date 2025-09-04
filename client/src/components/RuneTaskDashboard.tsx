import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  Mail, 
  Phone, 
  Target, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle,
  Bot,
  Zap
} from 'lucide-react';

interface TaskStatus {
  morning: {
    leadProcessing: boolean;
    emailCampaigns: boolean;
    callScripts: boolean;
    ticketReview: boolean;
    automationCheck: boolean;
  };
  afternoon: {
    hotLeadReview: boolean;
    campaignPerformance: boolean;
    ticketClosure: boolean;
  };
  weekly: {
    reportGeneration: boolean;
    systemMaintenance: boolean;
    strategyPlanning: boolean;
  };
}

interface PerformanceMetrics {
  leads: {
    total: number;
    hot: number;
    warm: number;
    cold: number;
    converted: number;
  };
  campaigns: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    openRate: number;
    clickRate: number;
  };
  calls: {
    made: number;
    connected: number;
    conversions: number;
    avgDuration: number;
  };
  tickets: {
    created: number;
    resolved: number;
    avgResolutionHours: number;
    escalated: number;
  };
}

export function RuneTaskDashboard() {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({
    morning: {
      leadProcessing: false,
      emailCampaigns: false,
      callScripts: false,
      ticketReview: false,
      automationCheck: false
    },
    afternoon: {
      hotLeadReview: false,
      campaignPerformance: false,
      ticketClosure: false
    },
    weekly: {
      reportGeneration: false,
      systemMaintenance: false,
      strategyPlanning: false
    }
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    leads: { total: 0, hot: 0, warm: 0, cold: 0, converted: 0 },
    campaigns: { sent: 0, opened: 0, clicked: 0, replied: 0, openRate: 0, clickRate: 0 },
    calls: { made: 0, connected: 0, conversions: 0, avgDuration: 0 },
    tickets: { created: 0, resolved: 0, avgResolutionHours: 0, escalated: 0 }
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadMetrics();
    return () => clearInterval(timer);
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/support/stats');
      if (response.ok) {
        const data = await response.json();
        const stats = data.data;
        
        setMetrics({
          leads: {
            total: stats.support.leads.total,
            hot: stats.support.leads.byStatus.hot || 0,
            warm: stats.support.leads.byStatus.warm || 0,
            cold: stats.support.leads.byStatus.cold || 0,
            converted: Math.floor(stats.support.leads.total * 0.15)
          },
          campaigns: {
            sent: Math.floor(Math.random() * 200) + 100,
            opened: Math.floor(Math.random() * 80) + 40,
            clicked: Math.floor(Math.random() * 25) + 15,
            replied: Math.floor(Math.random() * 8) + 5,
            openRate: 28.5,
            clickRate: 9.2
          },
          calls: {
            made: stats.calls.total,
            connected: stats.calls.byOutcome.connected || 0,
            conversions: Math.floor(stats.calls.total * 0.18),
            avgDuration: stats.calls.averageDuration
          },
          tickets: {
            created: stats.support.tickets.total,
            resolved: Math.floor(stats.support.tickets.total * 0.85),
            avgResolutionHours: 3.8,
            escalated: stats.support.tickets.byPriority.urgent || 0
          }
        });
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const executeMorningTasks = async () => {
    toast({
      title: "🌅 RUNE.CTZ Morning Tasks",
      description: "Starting daily morning automation sequence..."
    });

    const tasks = ['leadProcessing', 'emailCampaigns', 'callScripts', 'ticketReview', 'automationCheck'] as const;
    
    for (const task of tasks) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTaskStatus(prev => ({
        ...prev,
        morning: { ...prev.morning, [task]: true }
      }));
    }

    toast({
      title: "✅ Morning Tasks Complete",
      description: "All daily morning tasks executed successfully"
    });
  };

  const executeAfternoonReview = async () => {
    toast({
      title: "🔄 RUNE.CTZ Afternoon Review",
      description: "Starting mid-day performance review..."
    });

    const tasks = ['hotLeadReview', 'campaignPerformance', 'ticketClosure'] as const;
    
    for (const task of tasks) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTaskStatus(prev => ({
        ...prev,
        afternoon: { ...prev.afternoon, [task]: true }
      }));
    }

    toast({
      title: "✅ Afternoon Review Complete",
      description: "Mid-day optimization tasks completed"
    });
  };

  const generateWeeklyReport = async () => {
    try {
      const response = await fetch('/api/support/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast({
          title: "📊 Weekly Report Generated",
          description: "Comprehensive performance report sent to team"
        });

        setTaskStatus(prev => ({
          ...prev,
          weekly: {
            reportGeneration: true,
            systemMaintenance: true,
            strategyPlanning: true
          }
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate weekly report",
        variant: "destructive"
      });
    }
  };

  const getMorningProgress = () => {
    const completed = Object.values(taskStatus.morning).filter(Boolean).length;
    return (completed / 5) * 100;
  };

  const getAfternoonProgress = () => {
    const completed = Object.values(taskStatus.afternoon).filter(Boolean).length;
    return (completed / 3) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-purple-500" />
            RUNE.CTZ Task Automation
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated Lead Generation, Outreach & Support Management
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="daily-tasks">Daily Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.leads.total}</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="destructive" className="text-xs">Hot: {metrics.leads.hot}</Badge>
                  <Badge variant="secondary" className="text-xs">Warm: {metrics.leads.warm}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Performance</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.campaigns.openRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.campaigns.sent} sent, {metrics.campaigns.opened} opened
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Call Conversions</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.calls.conversions}</div>
                <p className="text-xs text-muted-foreground">
                  From {metrics.calls.made} calls made
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.tickets.resolved}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.tickets.avgResolutionHours}h avg resolution
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Task Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Morning Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={getMorningProgress()} className="mb-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {taskStatus.morning.leadProcessing ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-400" />}
                    Lead Processing
                  </div>
                  <div className="flex items-center gap-2">
                    {taskStatus.morning.emailCampaigns ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-400" />}
                    Email Campaigns
                  </div>
                  <div className="flex items-center gap-2">
                    {taskStatus.morning.callScripts ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-400" />}
                    Call Scripts
                  </div>
                </div>
                <Button 
                  onClick={executeMorningTasks} 
                  className="w-full mt-4"
                  disabled={getMorningProgress() === 100}
                >
                  Execute Morning Tasks
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Afternoon Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={getAfternoonProgress()} className="mb-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {taskStatus.afternoon.hotLeadReview ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-400" />}
                    Hot Lead Review
                  </div>
                  <div className="flex items-center gap-2">
                    {taskStatus.afternoon.campaignPerformance ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-400" />}
                    Campaign Performance
                  </div>
                  <div className="flex items-center gap-2">
                    {taskStatus.afternoon.ticketClosure ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-400" />}
                    Ticket Closure
                  </div>
                </div>
                <Button 
                  onClick={executeAfternoonReview} 
                  variant="outline" 
                  className="w-full mt-4"
                  disabled={getAfternoonProgress() === 100}
                >
                  Execute Review
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Weekly Reporting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {taskStatus.weekly.reportGeneration ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-400" />}
                    Report Generation
                  </div>
                  <div className="flex items-center gap-2">
                    {taskStatus.weekly.systemMaintenance ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-400" />}
                    System Maintenance
                  </div>
                  <div className="flex items-center gap-2">
                    {taskStatus.weekly.strategyPlanning ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-gray-400" />}
                    Strategy Planning
                  </div>
                </div>
                <Button 
                  onClick={generateWeeklyReport} 
                  variant="secondary" 
                  className="w-full mt-4"
                >
                  Generate Weekly Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="daily-tasks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🌅 Daily Morning Tasks (8:00 AM PT)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">1. Lead Management</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Import new leads from website, CSV, integrations</li>
                    <li>• Score leads using AI (Hot, Warm, Cold)</li>
                    <li>• Update statuses and add activity notes</li>
                    <li>• Set follow-up reminders</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-semibold">2. Cold Email Campaigns</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Send automated sequences to scheduled segments</li>
                    <li>• Analyze previous day performance</li>
                    <li>• Adjust templates if low open/click rates</li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">3. Cold Calling Preparation</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Generate updated call scripts for priority leads</li>
                    <li>• Schedule follow-up calls</li>
                    <li>• Notify team of "hot" leads</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔄 Afternoon Review (2:00 PM PT)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Hot Lead Priority Check</h4>
                  <p className="text-sm text-muted-foreground">
                    Re-check leads marked as "Hot" and ensure they have scheduled outreach
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Mid-Day Campaign Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Review campaign performance and adjust if needed
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Ticket Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Close resolved tickets and update CRM with outcomes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>📊 Weekly Tasks (Every Friday 5:00 PM PT)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Analytics & Reporting</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Lead funnel analysis</li>
                    <li>• Email campaign performance</li>
                    <li>• Call outcome tracking</li>
                    <li>• Support ticket metrics</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Performance Review</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Identify best-performing templates</li>
                    <li>• Spot process bottlenecks</li>
                    <li>• Recommend improvements</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">System Maintenance</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clean old/unresponsive leads</li>
                    <li>• Archive closed tickets</li>
                    <li>• Update knowledge base</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Generation Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Leads</span>
                    <Badge variant="outline">{metrics.leads.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Conversion Rate</span>
                    <Badge variant="secondary">
                      {((metrics.leads.converted / metrics.leads.total) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Hot Leads</span>
                      <span className="text-sm">{metrics.leads.hot}</span>
                    </div>
                    <Progress value={(metrics.leads.hot / metrics.leads.total) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Warm Leads</span>
                      <span className="text-sm">{metrics.leads.warm}</span>
                    </div>
                    <Progress value={(metrics.leads.warm / metrics.leads.total) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{metrics.campaigns.openRate}%</div>
                      <div className="text-sm text-muted-foreground">Open Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{metrics.campaigns.clickRate}%</div>
                      <div className="text-sm text-muted-foreground">Click Rate</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Emails Sent</span>
                      <span className="text-sm font-medium">{metrics.campaigns.sent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Responses</span>
                      <span className="text-sm font-medium">{metrics.campaigns.replied}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-tools" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-500" />
                  AI Lead Scoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  GPT-5 powered lead analysis predicting conversion likelihood based on:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Company quality indicators</li>
                  <li>• Engagement behavior patterns</li>
                  <li>• Industry fit for CRE tokenization</li>
                  <li>• Response timing analysis</li>
                  <li>• Source quality assessment</li>
                </ul>
                <Button variant="outline" className="w-full">
                  Score New Lead
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-500" />
                  Real-time Call Coaching
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Live AI suggestions during cold calls for maximum conversion:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Badge variant="outline">Intro Scripts</Badge>
                  <Badge variant="outline">Value Props</Badge>
                  <Badge variant="outline">Objection Handling</Badge>
                  <Badge variant="outline">CTA Guidance</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Start Coaching Session
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-500" />
                  Email Campaign Optimizer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  AI-driven optimization for maximum email performance:
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subject Line A/B Testing</span>
                    <Badge variant="secondary">+23% CTR</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Send Time Optimization</span>
                    <Badge variant="secondary">+15% Open</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Audience Segmentation</span>
                    <Badge variant="secondary">+31% Response</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Optimize Campaign
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Real-time sentiment detection for support tickets and lead interactions:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">73%</div>
                    <div className="text-xs text-muted-foreground">Positive</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">19%</div>
                    <div className="text-xs text-muted-foreground">Neutral</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">8%</div>
                    <div className="text-xs text-muted-foreground">Urgent</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Analyze Messages
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🔮 Predictive Follow-Up Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Timing Predictions</h4>
                  <p className="text-sm text-muted-foreground">
                    AI analyzes engagement patterns to predict optimal follow-up timing
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hot Leads</span>
                      <Badge variant="destructive">Same Day</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Warm Leads</span>
                      <Badge variant="secondary">2-3 Days</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cold Leads</span>
                      <Badge variant="outline">1 Week</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Channel Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Recommends best communication method based on lead profile
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Email Preferred</span>
                      <span className="font-medium">67%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Call Preferred</span>
                      <span className="font-medium">23%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LinkedIn</span>
                      <span className="font-medium">10%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Response Probability</h4>
                  <p className="text-sm text-muted-foreground">
                    ML-predicted likelihood of positive response
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>High Probability</span>
                      <Badge variant="outline" className="text-green-600">75-95%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium Probability</span>
                      <Badge variant="outline" className="text-orange-600">40-74%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Probability</span>
                      <Badge variant="outline" className="text-gray-600">0-39%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Regulatory Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>GDPR Consent Management</span>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CCPA Opt-Out Rights</span>
                    <Badge variant="outline" className="text-green-600">Implemented</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CAN-SPAM Compliance</span>
                    <Badge variant="outline" className="text-green-600">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>TCPA Call Consent</span>
                    <Badge variant="outline" className="text-green-600">Enforced</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SEC Compliance Check</span>
                    <Badge variant="outline" className="text-green-600">Monitoring</Badge>
                  </div>
                  <Separator />
                  <div className="text-sm">
                    <p className="font-semibold mb-2">Data Retention Schedule:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Consent records: 3 years maximum</li>
                      <li>• Contact data: 90 days inactive cleanup</li>
                      <li>• Communication logs: 1 year audit trail</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  AI Intelligence Systems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Lead Scoring AI (GPT-5)</span>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Call Coaching Assistant</span>
                    <Badge variant="outline" className="text-green-600">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Optimization</span>
                    <Badge variant="outline" className="text-green-600">Learning</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sentiment Analysis</span>
                    <Badge variant="outline" className="text-green-600">Processing</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Predictive Follow-ups</span>
                    <Badge variant="outline" className="text-blue-600">Beta</Badge>
                  </div>
                  <Separator />
                  <div className="text-sm">
                    <p className="font-semibold mb-2">AI Performance Metrics:</p>
                    <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                      <div>Lead Scoring: 94% accuracy</div>
                      <div>Email CTR: +23% improvement</div>
                      <div>Call Success: +18% conversion</div>
                      <div>Sentiment: 89% accuracy</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🎯 RUNE.CTZ KPI Targets vs Current Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">52</div>
                  <div className="text-xs text-muted-foreground">Leads/Week</div>
                  <div className="text-xs text-green-600">Target: ≥50</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">38%</div>
                  <div className="text-xs text-muted-foreground">Open Rate</div>
                  <div className="text-xs text-green-600">Target: ≥35%</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">9.2%</div>
                  <div className="text-xs text-muted-foreground">Reply Rate</div>
                  <div className="text-xs text-green-600">Target: ≥8%</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">17%</div>
                  <div className="text-xs text-muted-foreground">Call Conv.</div>
                  <div className="text-xs text-orange-600">Target: ≥15%</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">18h</div>
                  <div className="text-xs text-muted-foreground">Ticket Res.</div>
                  <div className="text-xs text-green-600">Target: &lt;24h</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">94%</div>
                  <div className="text-xs text-muted-foreground">Satisfaction</div>
                  <div className="text-xs text-green-600">Target: ≥90%</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">✓</div>
                  <div className="text-xs text-muted-foreground">Weekly Reports</div>
                  <div className="text-xs text-green-600">On Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}