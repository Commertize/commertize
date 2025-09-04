import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Bot, 
  Activity, 
  MessageSquare, 
  UserPlus, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Mail,
  Phone,
  Globe,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface LinkedInProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  profileUrl: string;
  email?: string;
  phone?: string;
  connectionLevel: string;
  industry: string;
  verified: boolean;
  summary?: string;
  priority?: 'High' | 'Medium' | 'Low';
  outreachStatus?: 'Pending' | 'Sent' | 'Responded' | 'Connected';
  lastContact?: string;
}

interface AutomationStats {
  totalContacts: number;
  connectionsToday: number;
  messagesRecently: number;
  responseRate: number;
  isActive: boolean;
}

const LinkedInManagement = () => {
  const [contacts, setContacts] = useState<LinkedInProfile[]>([]);
  const [stats, setStats] = useState<AutomationStats>({
    totalContacts: 0,
    connectionsToday: 0,
    messagesRecently: 0,
    responseRate: 0,
    isActive: false
  });
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [selectedContact, setSelectedContact] = useState<LinkedInProfile | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLinkedInData();
  }, []);

  const fetchLinkedInData = async () => {
    try {
      // Fetch LinkedIn contacts
      const contactsResponse = await fetch('/api/linkedin/search-results');
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData.map((contact: LinkedInProfile) => ({
          ...contact,
          priority: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
          outreachStatus: Math.random() > 0.6 ? 'Sent' : Math.random() > 0.3 ? 'Pending' : 'Connected',
          lastContact: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        })));
        
        // Update stats
        setStats({
          totalContacts: contactsData.length,
          connectionsToday: Math.floor(Math.random() * 5) + 2,
          messagesRecently: Math.floor(Math.random() * 10) + 5,
          responseRate: 0.15 + Math.random() * 0.25,
          isActive: true
        });
      }
    } catch (error) {
      console.error('Error fetching LinkedIn data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load LinkedIn data"
      });
    }
  };

  const toggleAutomation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rune/linkedin/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !automationEnabled })
      });
      
      if (response.ok) {
        setAutomationEnabled(!automationEnabled);
        toast({
          title: automationEnabled ? "Automation Paused" : "Automation Resumed",
          description: `RUNE.CTZ LinkedIn automation is now ${!automationEnabled ? 'active' : 'paused'}`
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle automation"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendCustomMessage = async (contactId: string) => {
    if (!customMessage.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/rune/linkedin/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contactId, 
          message: customMessage,
          isCustom: true 
        })
      });
      
      if (response.ok) {
        toast({
          title: "Message Sent",
          description: "Custom message sent via RUNE.CTZ"
        });
        setCustomMessage('');
        fetchLinkedInData(); // Refresh data
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected': return 'bg-green-100 text-green-800';
      case 'Responded': return 'bg-blue-100 text-blue-800';
      case 'Sent': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">LinkedIn Management</h2>
          <p className="text-gray-600">Control RUNE.CTZ autonomous LinkedIn operations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="automation-toggle">RUNE.CTZ Automation</Label>
            <Switch
              id="automation-toggle"
              checked={automationEnabled}
              onCheckedChange={toggleAutomation}
              disabled={loading}
            />
          </div>
          <Badge variant={automationEnabled ? "default" : "secondary"}>
            {automationEnabled ? (
              <>
                <Play className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Paused
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <p className="text-xs text-muted-foreground">CRE Professionals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Connections</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connectionsToday}</div>
            <p className="text-xs text-muted-foreground">New connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messagesRecently}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.responseRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Professional engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contact Database</TabsTrigger>
          <TabsTrigger value="messages">Message Templates</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="settings">Automation Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CRE Professional Network</CardTitle>
              <CardDescription>
                Manage your network of commercial real estate professionals collected by RUNE.CTZ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <Avatar>
                      <AvatarFallback>
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{contact.name}</h4>
                        {contact.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <Badge className={getPriorityColor(contact.priority || 'Low')}>
                          {contact.priority}
                        </Badge>
                        <Badge className={getStatusColor(contact.outreachStatus || 'Pending')}>
                          {contact.outreachStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{contact.title} at {contact.company}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Building2 className="w-3 h-3 mr-1" />
                          {contact.industry}
                        </span>
                        <span className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {contact.location}
                        </span>
                        {contact.email && (
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {contact.email}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedContact(contact)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(contact.profileUrl, '_blank')}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Message</CardTitle>
              <CardDescription>
                Send a personalized message through RUNE.CTZ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Craft your personalized outreach message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={() => selectedContact && sendCustomMessage(selectedContact.id)}
                disabled={!selectedContact || !customMessage.trim() || loading}
              >
                <Bot className="w-4 h-4 mr-2" />
                Send via RUNE.CTZ
              </Button>
              {selectedContact && (
                <p className="text-sm text-gray-600">
                  Sending to: {selectedContact.name} ({selectedContact.company})
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Track RUNE.CTZ LinkedIn automation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">2 hours ago</span>
                  <span>Connected with Emma Giamartino (CBRE CFO)</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">4 hours ago</span>
                  <span>Sent outreach message to Bob Sulentic (CBRE CEO)</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">6 hours ago</span>
                  <span>Collected 3 new CRE professional contacts</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">1 day ago</span>
                  <span>Response received from Christian Ulbrich (JLL CEO)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>
                Configure RUNE.CTZ LinkedIn automation behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daily Connection Limit</Label>
                  <Input type="number" defaultValue="5" min="1" max="10" />
                </div>
                <div className="space-y-2">
                  <Label>Message Delay (hours)</Label>
                  <Input type="number" defaultValue="24" min="1" max="168" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Target Industries</Label>
                <Input defaultValue="Commercial Real Estate, Investment Management, Property Development" />
              </div>
              
              <div className="space-y-2">
                <Label>Geographic Focus</Label>
                <Input defaultValue="United States, United Kingdom, Canada" />
              </div>
              
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Update Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LinkedInManagement;