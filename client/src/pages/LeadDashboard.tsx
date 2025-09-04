import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, Users, Target, TrendingUp, Calendar, MapPin, Building2, Edit, Trash2, PhoneCall } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  location?: string;
  propertyType?: string;
  investmentRange?: string;
  leadSource: string;
  status: string;
  notes?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  nextFollowUp?: string;
}

const LeadDashboard = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, sourceFilter]);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const result = await response.json();
        setLeads(result.data || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leads.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead => 
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter(lead => lead.leadSource === sourceFilter);
    }

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        ));
        toast({
          title: "Status Updated",
          description: "Lead status has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead status.",
        variant: "destructive"
      });
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setLeads(prev => prev.filter(lead => lead.id !== leadId));
        toast({
          title: "Lead Deleted",
          description: "Lead has been removed from the database.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lead.",
        variant: "destructive"
      });
    }
  };

  const initiateCall = async (lead: Lead) => {
    if (!lead.phone) {
      toast({
        title: "No Phone Number",
        description: "This lead doesn't have a phone number on file.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/voip/initiate-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: lead.phone,
          leadId: lead.id,
          leadName: `${lead.firstName} ${lead.lastName}`,
          company: lead.company
        })
      });

      if (response.ok) {
        toast({
          title: "Call Initiated",
          description: `Starting call to ${lead.firstName} ${lead.lastName}`,
        });
        
        // Update lead with last contact date
        updateLeadStatus(lead.id, 'contacted');
      }
    } catch (error) {
      toast({
        title: "Call Failed",
        description: "Unable to initiate call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'qualified': return 'default';
      case 'interested': return 'default';
      case 'converted': return 'default';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'linkedin_automation': return 'bg-blue-100 text-blue-800';
      case 'manual_capture': return 'bg-green-100 text-green-800';
      case 'bulk_import': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="container max-w-7xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-foreground/70">Loading leads...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    linkedinSources: leads.filter(l => l.leadSource === 'linkedin_automation').length,
    withPhone: leads.filter(l => l.phone).length,
    withEmail: leads.filter(l => l.email).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-logo font-light text-foreground">
              Lead Management Dashboard
            </h1>
          </div>
          <p className="text-xl text-foreground/70 mb-4">
            Manage and track your CRE contact database for RUNE.CTZ campaigns
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/lead-capture">
              <Button variant="outline" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Add Lead
              </Button>
            </Link>
            <Link href="/linkedin-collector">
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                LinkedIn Collector
              </Button>
            </Link>
            <Link href="/lead-import">
              <Button variant="outline" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Bulk Import
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Total Leads</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Callable Leads</p>
                  <p className="text-3xl font-bold text-green-600">{stats.withPhone}</p>
                </div>
                <Phone className="h-8 w-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">LinkedIn Sources</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.linkedinSources}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Qualified</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.qualified}</p>
                </div>
                <Target className="h-8 w-8 text-purple-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Search by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <select 
                  className="w-full h-10 px-3 py-2 border border-input bg-background text-sm ring-offset-background rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="interested">Interested</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <select 
                  className="w-full h-10 px-3 py-2 border border-input bg-background text-sm ring-offset-background rounded-md"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option value="all">All Sources</option>
                  <option value="linkedin_automation">LinkedIn</option>
                  <option value="manual_capture">Manual Entry</option>
                  <option value="bulk_import">Bulk Import</option>
                  <option value="networking">Networking</option>
                  <option value="referral">Referral</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Database ({filteredLeads.length} leads)</CardTitle>
            <CardDescription>
              CRE professionals ready for RUNE.CTZ outreach campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Property Interest</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                          <div className="text-sm text-foreground/60">{lead.title}</div>
                          {lead.location && (
                            <div className="flex items-center gap-1 text-xs text-foreground/50">
                              <MapPin className="h-3 w-3" />
                              {lead.location}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{lead.company}</div>
                        {lead.investmentRange && (
                          <div className="text-sm text-foreground/60">{lead.investmentRange}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.propertyType && (
                          <Badge variant="outline">{lead.propertyType}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getSourceBadgeColor(lead.leadSource)}>
                          {lead.leadSource.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="interested">Interested</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span className="text-xs">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span className="text-xs">{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {lead.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => initiateCall(lead)}
                              className="flex items-center gap-1"
                            >
                              <PhoneCall className="h-3 w-3" />
                              Call
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteLead(lead.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12 text-foreground/50">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No leads found matching your criteria.</p>
                <Link href="/linkedin-collector">
                  <Button className="mt-4">
                    Start Collecting Contacts
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadDashboard;