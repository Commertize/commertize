import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  PhoneCall,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Bot,
  Target,
  AlertCircle,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CallRecord {
  id: string;
  leadId: string;
  phoneNumber: string;
  outcome: 'connected' | 'voicemail' | 'no_answer' | 'busy' | 'disconnected' | 'interested' | 'not_interested' | 'callback_requested';
  duration?: number;
  notes?: string;
  followUpDate?: string;
  calledAt: string;
}

interface Lead {
  id: string;
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  status: string;
  priority?: string;
  source: string;
  score: number;
  lastCalled?: string;
}

interface RuneStatus {
  agentActive: boolean;
  currentTask: string;
  queuedTasks: number;
  voiceCallingEnabled: boolean;
  callStats: {
    totalCalls: number;
    successfulCalls: number;
    averageDuration: number;
    conversionRate: number;
  };
}

export default function AdminVoiceCalling() {
  const { toast } = useToast();
  const [selectedCampaign, setSelectedCampaign] = useState<'investment' | 'partnership' | 'demo'>('investment');
  const [maxCalls, setMaxCalls] = useState(5);

  // Fetch RUNE.CTZ status
  const { data: runeStatus, refetch: refetchStatus } = useQuery<{ success: boolean; data: RuneStatus }>({
    queryKey: ['/api/rune/status'],
    queryFn: async () => {
      const response = await fetch('/api/rune/status');
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch leads
  const { data: leadsData, refetch: refetchLeads } = useQuery<{ success: boolean; data: Lead[] }>({
    queryKey: ['/api/support/leads'],
    queryFn: async () => {
      const response = await fetch('/api/support/leads');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch call history
  const { data: callHistoryData } = useQuery<{ success: boolean; data: CallRecord[] }>({
    queryKey: ['/api/support/calls'],
    queryFn: async () => {
      const response = await fetch('/api/support/calls');
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Trigger calling campaign
  const triggerCampaign = useMutation({
    mutationFn: async ({ campaignType, maxCalls }: { campaignType: string; maxCalls: number }) => {
      const response = await fetch('/api/rune/trigger-calling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignType, maxCalls }),
      });
      
      if (!response.ok) throw new Error('Failed to trigger campaign');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign Started",
        description: `RUNE.CTZ ${selectedCampaign} campaign launched successfully`,
      });
      refetchStatus();
      refetchLeads();
    },
    onError: (error) => {
      toast({
        title: "Campaign Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTriggerCampaign = () => {
    triggerCampaign.mutate({ campaignType: selectedCampaign, maxCalls });
  };

  const leads = leadsData?.data || [];
  const callHistory = callHistoryData?.data || [];
  const status = runeStatus?.data;

  // Filter high-priority leads with phone numbers
  const callableLeads = leads.filter(lead => 
    lead.phone && 
    (lead.priority === 'High' || lead.score >= 80) &&
    lead.status !== 'not_interested'
  );

  const recentCalls = callHistory.slice(0, 10);

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'connected':
      case 'interested':
      case 'callback_requested':
        return 'bg-green-100 text-green-800';
      case 'voicemail':
        return 'bg-yellow-100 text-yellow-800';
      case 'no_answer':
      case 'busy':
        return 'bg-blue-100 text-blue-800';
      case 'not_interested':
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'connected':
      case 'interested':
        return CheckCircle;
      case 'callback_requested':
        return Clock;
      case 'voicemail':
        return Phone;
      case 'not_interested':
      case 'disconnected':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RUNE.CTZ Voice AI</h1>
            <p className="text-gray-600">Autonomous calling campaigns powered by Vapi</p>
          </div>
        </div>
        <div className="ml-auto">
          <Badge 
            variant={status?.agentActive ? "default" : "secondary"}
            className={status?.agentActive ? "bg-green-500 text-white" : ""}
          >
            {status?.agentActive ? "🟢 Active" : "⚪ Inactive"}
          </Badge>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voice AI Status</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status?.voiceCallingEnabled ? "🟢 Ready" : "🔴 Offline"}
            </div>
            <p className="text-xs text-muted-foreground">
              Phone: +1 (949) 868-8863
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.callStats?.totalCalls || 0}</div>
            <p className="text-xs text-muted-foreground">
              {status?.callStats?.successfulCalls || 0} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status?.callStats?.conversionRate ? `${(status.callStats.conversionRate * 100).toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              From {status?.callStats?.totalCalls || 0} calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Callable Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callableLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              High-priority with phone numbers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-yellow-600" />
            <span>Launch Voice Campaign</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-type">Campaign Type</Label>
              <Select value={selectedCampaign} onValueChange={(value: any) => setSelectedCampaign(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investment">💰 Investment Opportunities</SelectItem>
                  <SelectItem value="partnership">🤝 Partnership Outreach</SelectItem>
                  <SelectItem value="demo">📋 Platform Demos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-calls">Maximum Calls</Label>
              <Select value={maxCalls.toString()} onValueChange={(value) => setMaxCalls(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select max calls" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 calls</SelectItem>
                  <SelectItem value="5">5 calls</SelectItem>
                  <SelectItem value="10">10 calls</SelectItem>
                  <SelectItem value="15">15 calls</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleTriggerCampaign}
                disabled={triggerCampaign.isPending || !status?.voiceCallingEnabled}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              >
                {triggerCampaign.isPending ? (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Start Campaign
                  </>
                )}
              </Button>
            </div>
          </div>

          {status?.currentTask !== 'idle' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-yellow-600 animate-pulse" />
                <span className="text-sm font-medium text-yellow-800">
                  RUNE.CTZ is currently: {status.currentTask}
                </span>
              </div>
              {status.queuedTasks > 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  {status.queuedTasks} tasks queued
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Configuration Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span>Voice AI Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-2">To enable successful calling campaigns:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Update secret <code className="bg-yellow-100 px-2 py-1 rounded">VAPI_PHONE_NUMBER_ID</code></li>
              <li>Set value to: <code className="bg-yellow-100 px-2 py-1 rounded font-mono">6eea56f7-ea01-40cc-9620-c9bbf636f5a9</code></li>
              <li>Restart application to apply changes</li>
            </ol>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-700">Commertize Phone: <strong>+1 (949) 868-8863</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Leads for Calling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-yellow-600" />
              <span>Callable Leads</span>
              <Badge variant="secondary">{callableLeads.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {callableLeads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No callable leads found</p>
                  <p className="text-sm">Leads need phone numbers and High priority</p>
                </div>
              ) : (
                callableLeads.map((lead) => (
                  <div key={lead.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{lead.name || 'Unknown Name'}</h4>
                        <p className="text-sm text-gray-600">{lead.company}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">{lead.phone}</span>
                          <Badge variant="outline" className="text-xs">
                            Score: {lead.score}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={lead.priority === 'High' ? 'default' : 'secondary'}
                          className={lead.priority === 'High' ? 'bg-green-500 text-white' : ''}
                        >
                          {lead.priority || 'Normal'}
                        </Badge>
                        {lead.lastCalled && (
                          <Clock className="w-4 h-4 text-gray-400" title="Previously called" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Call History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-yellow-600" />
              <span>Recent Calls</span>
              <Badge variant="secondary">{recentCalls.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentCalls.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <PhoneCall className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent calls</p>
                  <p className="text-sm">Campaign results will appear here</p>
                </div>
              ) : (
                recentCalls.map((call) => {
                  const OutcomeIcon = getOutcomeIcon(call.outcome);
                  return (
                    <div key={call.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{call.phoneNumber}</span>
                        <Badge className={getOutcomeColor(call.outcome)}>
                          <OutcomeIcon className="w-3 h-3 mr-1" />
                          {call.outcome.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Duration: {call.duration ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}` : 'N/A'}</span>
                          <span>{new Date(call.calledAt).toLocaleTimeString()}</span>
                        </div>
                        {call.notes && (
                          <p className="mt-2 text-xs">{call.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <span>Campaign Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Call Outcomes</h4>
              <div className="space-y-2">
                {callHistory.length > 0 ? (
                  Object.entries(
                    callHistory.reduce((acc, call) => {
                      acc[call.outcome] = (acc[call.outcome] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([outcome, count]) => (
                    <div key={outcome} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{outcome.replace('_', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No call data available</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Duration</span>
                  <Badge variant="outline">
                    {status?.callStats?.averageDuration ? `${Math.floor(status.callStats.averageDuration / 60)}:${(status.callStats.averageDuration % 60).toString().padStart(2, '0')}` : '0:00'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <Badge variant="outline">
                    {status?.callStats?.totalCalls > 0 
                      ? `${((status.callStats.successfulCalls / status.callStats.totalCalls) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Queued Tasks</span>
                  <Badge variant={status?.queuedTasks > 0 ? "default" : "secondary"}>
                    {status?.queuedTasks || 0}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Lead Quality</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Priority</span>
                  <Badge variant="outline">
                    {leads.filter(l => l.priority === 'High').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">With Phone #</span>
                  <Badge variant="outline">
                    {leads.filter(l => l.phone).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Score</span>
                  <Badge variant="outline">
                    {leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RUNE.CTZ Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-yellow-600" />
            <span>RUNE.CTZ Agent Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${status?.agentActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-sm font-medium">
                  Agent Status: {status?.agentActive ? 'Active & Autonomous' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  Current Task: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{status?.currentTask || 'idle'}</code>
                </span>
              </div>
              {status?.queuedTasks > 0 && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-700">
                    {status.queuedTasks} campaign{status.queuedTasks > 1 ? 's' : ''} in queue
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Autonomous Schedule</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>📞 Daily calls: 2:00 PM PT</p>
                <p>🔍 LinkedIn collection: 10:00 AM PT</p>
                <p>📧 Email campaigns: As needed</p>
                <p>📊 Performance analysis: Continuous</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}