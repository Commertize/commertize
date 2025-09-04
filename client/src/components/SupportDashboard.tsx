import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, Users, MessageSquare, TrendingUp, Clock } from 'lucide-react';

interface Lead {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  company?: string;
  industry?: string;
  source: string;
  status: string;
  lastContact?: string;
  notes?: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface Stats {
  support: {
    leads: { total: number; byStatus: Record<string, number> };
    tickets: { total: number; byStatus: Record<string, number>; byPriority: Record<string, number> };
  };
  calls: {
    total: number;
    byOutcome: Record<string, number>;
    averageDuration: number;
    conversionRate: number;
  };
  followUpsNeeded: number;
}

import { RuneTaskDashboard } from './RuneTaskDashboard';

export function SupportDashboard() {
  return <RuneTaskDashboard />;
}

export function SupportDashboardLegacy() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [newLead, setNewLead] = useState({
    email: '',
    phone: '',
    name: '',
    company: '',
    industry: '',
    source: 'manual',
    notes: ''
  });
  const [initialized, setInitialized] = useState(false);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (initialized) {
      loadData();
    }
  }, [initialized]);

  const loadData = async () => {
    try {
      const [leadsRes, ticketsRes, statsRes] = await Promise.all([
        fetch('/api/support/leads'),
        fetch('/api/support/tickets'),
        fetch('/api/support/stats')
      ]);

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData.data);
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData.data);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const initializeSupport = async () => {
    if (!contactInfo.email || !contactInfo.phone) {
      toast({
        title: "Error",
        description: "Please provide both email and phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/support/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactInfo)
      });

      if (response.ok) {
        setInitialized(true);
        toast({
          title: "Success",
          description: "Support automation initialized successfully"
        });
      } else {
        throw new Error('Failed to initialize');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize support system",
        variant: "destructive"
      });
    }
  };

  const addLead = async () => {
    if (!newLead.email) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/support/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });

      if (response.ok) {
        setNewLead({
          email: '',
          phone: '',
          name: '',
          company: '',
          industry: '',
          source: 'manual',
          notes: ''
        });
        await loadData();
        toast({
          title: "Success",
          description: "Lead added successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add lead",
        variant: "destructive"
      });
    }
  };

  const startColdEmailCampaign = async (leadIds: string[], campaign: 'investment' | 'partnership' | 'demo') => {
    try {
      const response = await fetch('/api/support/cold-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds, campaign })
      });

      if (response.ok) {
        toast({
          title: "Campaign Started",
          description: `Cold email campaign (${campaign}) started for ${leadIds.length} leads`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start email campaign",
        variant: "destructive"
      });
    }
  };

  const generateCallScript = async (leadId: string, campaign: 'investment' | 'partnership' | 'demo') => {
    try {
      const response = await fetch('/api/support/call-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, campaign })
      });

      if (response.ok) {
        const data = await response.json();
        // Display script in a modal or new tab
        window.open('data:text/html,<pre>' + encodeURIComponent(JSON.stringify(data.data, null, 2)) + '</pre>');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate call script",
        variant: "destructive"
      });
    }
  };

  if (!initialized) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Initialize Support Automation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Support Email</Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="support@commertize.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Support Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <Button onClick={initializeSupport} className="w-full">
              Initialize Support System
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Support Automation Dashboard</h1>
        <Badge variant="outline" className="text-green-600">
          System Active
        </Badge>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{stats.support.leads.total}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{stats.support.tickets.total}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Call Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{stats.calls.conversionRate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Follow-ups Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{stats.followUpsNeeded}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="leads" className="w-full">
        <TabsList>
          <TabsTrigger value="leads">Lead Management</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
          <TabsTrigger value="calls">Cold Calling</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="space-y-4">
          {/* Add New Lead Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lead-email">Email *</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="lead-phone">Phone</Label>
                  <Input
                    id="lead-phone"
                    value={newLead.phone}
                    onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="lead-name">Name</Label>
                  <Input
                    id="lead-name"
                    value={newLead.name}
                    onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="lead-company">Company</Label>
                  <Input
                    id="lead-company"
                    value={newLead.company}
                    onChange={(e) => setNewLead(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <Label htmlFor="lead-industry">Industry</Label>
                  <Input
                    id="lead-industry"
                    value={newLead.industry}
                    onChange={(e) => setNewLead(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="Real Estate"
                  />
                </div>
                <div>
                  <Label htmlFor="lead-source">Source</Label>
                  <Select value={newLead.source} onValueChange={(value) => setNewLead(prev => ({ ...prev, source: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="lead-notes">Notes</Label>
                  <Textarea
                    id="lead-notes"
                    value={newLead.notes}
                    onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this lead"
                  />
                </div>
              </div>
              <Button onClick={addLead} className="mt-4">
                Add Lead
              </Button>
            </CardContent>
          </Card>

          {/* Leads List */}
          <Card>
            <CardHeader>
              <CardTitle>All Leads ({leads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map(lead => (
                  <div key={lead.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{lead.name || 'Unknown'}</h3>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                        <p className="text-sm">{lead.company} • {lead.industry}</p>
                      </div>
                      <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                        {lead.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => startColdEmailCampaign([lead.id], 'investment')}>
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => generateCallScript(lead.id, 'investment')}>
                        <Phone className="h-4 w-4 mr-1" />
                        Call Script
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets ({tickets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground">{ticket.email}</p>
                        <p className="text-sm mt-1">{ticket.message.substring(0, 100)}...</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={ticket.priority === 'high' ? 'destructive' : 'default'}>
                          {ticket.priority}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaign Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => {
                  const allLeadIds = leads.map(l => l.id);
                  startColdEmailCampaign(allLeadIds, 'investment');
                }} className="w-full">
                  Send Investment Campaign to All Leads
                </Button>
                <Button onClick={() => {
                  const allLeadIds = leads.map(l => l.id);
                  startColdEmailCampaign(allLeadIds, 'demo');
                }} className="w-full" variant="outline">
                  Send Demo Campaign to All Leads
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls">
          <Card>
            <CardHeader>
              <CardTitle>Cold Calling Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Call Statistics</h4>
                    <p>Total Calls: {stats.calls.total}</p>
                    <p>Conversion Rate: {stats.calls.conversionRate.toFixed(1)}%</p>
                    <p>Avg Duration: {(stats.calls.averageDuration / 60).toFixed(1)} min</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Outcomes</h4>
                    {Object.entries(stats.calls.byOutcome).map(([outcome, count]) => (
                      <p key={outcome}>{outcome}: {count}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}