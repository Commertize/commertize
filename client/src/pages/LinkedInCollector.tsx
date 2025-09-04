import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Search, Download, Users, Target, Zap, CheckCircle, XCircle, Clock, LinkedinIcon, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LinkedInInstructions from "@/components/LinkedInInstructions";

const LinkedInCollector = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState({
    keywords: "commercial real estate",
    location: "United States",
    industry: "commercial-real-estate",
    companySize: "large",
    jobTitle: "VP, Director, Managing Director",
    connectionLevel: "2nd",
    includeEmail: true,
    includePhone: true,
    maxResults: 50
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  // Fetch saved search results from database
  const { data: searchResults = [], refetch: refetchResults } = useQuery({
    queryKey: ['linkedin-search-results'],
    queryFn: async () => {
      const response = await fetch('/api/linkedin/search-results');
      if (!response.ok) throw new Error('Failed to fetch search results');
      return response.json();
    },
    staleTime: 0 // Always fetch fresh data
  });

  // Mutation to save search results
  const saveResultsMutation = useMutation({
    mutationFn: async (results: any[]) => {
      const response = await fetch('/api/linkedin/save-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results })
      });
      if (!response.ok) throw new Error('Failed to save results');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedin-search-results'] });
    }
  });
  const [credentials, setCredentials] = useState({
    email: "cameronrazaghi1@gmail.com",
    password: "Bananapony50",
    sessionCookie: ""
  });

  const handleSearch = async () => {
    setIsSearching(true);
    
    try {
      const response = await fetch('/api/linkedin/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials,
          searchParams
        })
      });

      if (response.ok) {
        const result = await response.json();
        const newResults = result.data || [];
        
        // Save results to database immediately
        await saveResultsMutation.mutateAsync(newResults);
        
        toast({
          title: "Real LinkedIn Search Complete!",
          description: `Found ${newResults.length} authentic LinkedIn contacts with emails and phone numbers. Results saved permanently.`,
        });
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search LinkedIn. Please check your credentials.",
        variant: "destructive"
      });
      
      // Real LinkedIn data collection failed - require valid credentials
      console.error('LinkedIn authentication failed:', error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === searchResults.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(searchResults.map((r: any) => r.id)));
    }
  };

  const handleImportSelected = async () => {
    const contactsToImport = searchResults.filter((r: any) => selectedContacts.has(r.id));
    
    try {
      const response = await fetch('/api/leads/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts: contactsToImport.map((contact: any) => ({
            firstName: contact.name.split(' ')[0],
            lastName: contact.name.split(' ').slice(1).join(' '),
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            title: contact.title,
            location: contact.location,
            linkedinUrl: contact.profileUrl,
            leadSource: 'linkedin_automation',
            notes: `Found via LinkedIn search - ${contact.connectionLevel} connection`
          }))
        })
      });

      if (response.ok) {
        toast({
          title: "Import Successful!",
          description: `${selectedContacts.size} contacts added to RUNE.CTZ database.`,
        });
        setSelectedContacts(new Set());
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import contacts to database.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <LinkedinIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-logo font-light text-foreground">
              LinkedIn Contact Collector
            </h1>
          </div>
          <p className="text-xl text-foreground/70 mb-4">
            Automatically find and collect CRE professionals from LinkedIn
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-foreground/60">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Targeted Search</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Bulk Collection</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Auto Import</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="instructions" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="instructions">Getting Started</TabsTrigger>
            <TabsTrigger value="search">Search & Collect</TabsTrigger>
            <TabsTrigger value="results">Results ({searchResults.length})</TabsTrigger>
            <TabsTrigger value="setup">Account Setup</TabsTrigger>
          </TabsList>

          {/* Instructions Tab */}
          <TabsContent value="instructions">
            <LinkedInInstructions />
          </TabsContent>

          {/* Account Setup Tab */}
          <TabsContent value="setup">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <LinkedinIcon className="h-6 w-6 text-blue-600" />
                  LinkedIn Account Setup
                </CardTitle>
                <CardDescription>
                  Configure your LinkedIn credentials for automated contact collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Authentication Methods</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-blue-700">Option 1: Email/Password</strong>
                      <p className="text-blue-600">Direct login credentials (most reliable)</p>
                    </div>
                    <div>
                      <strong className="text-blue-700">Option 2: Session Cookie</strong>
                      <p className="text-blue-600">Use browser session (safer for 2FA accounts)</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Email/Password Method</h4>
                    <div className="space-y-2">
                      <Label htmlFor="email">LinkedIn Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={credentials.email}
                        onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">LinkedIn Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Your LinkedIn password"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Session Cookie Method</h4>
                    <div className="space-y-2">
                      <Label htmlFor="sessionCookie">Session Cookie</Label>
                      <Textarea
                        id="sessionCookie"
                        value={credentials.sessionCookie}
                        onChange={(e) => setCredentials(prev => ({ ...prev, sessionCookie: e.target.value }))}
                        placeholder="li_at=AQEDAQEDAQECAAAAAXh..."
                        className="min-h-[100px]"
                      />
                      <p className="text-sm text-foreground/60">
                        Get this from LinkedIn → F12 → Application → Cookies → li_at value
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Your credentials are used only for contact collection and are not stored permanently. 
                    We recommend using the session cookie method if you have 2FA enabled.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Search Parameters */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Search className="h-6 w-6 text-primary" />
                    Search Parameters
                  </CardTitle>
                  <CardDescription>
                    Define your target CRE professional criteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      value={searchParams.keywords}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, keywords: e.target.value }))}
                      placeholder="commercial real estate, CRE, investment"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={searchParams.location}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="New York, NY"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select value={searchParams.industry} onValueChange={(value) => setSearchParams(prev => ({ ...prev, industry: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="commercial-real-estate">Commercial Real Estate</SelectItem>
                          <SelectItem value="real-estate-investment">Real Estate Investment</SelectItem>
                          <SelectItem value="real-estate-development">Real Estate Development</SelectItem>
                          <SelectItem value="investment-management">Investment Management</SelectItem>
                          <SelectItem value="financial-services">Financial Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={searchParams.jobTitle}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, jobTitle: e.target.value }))}
                        placeholder="VP, Director, Managing Director"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select value={searchParams.companySize} onValueChange={(value) => setSearchParams(prev => ({ ...prev, companySize: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup (1-10)</SelectItem>
                          <SelectItem value="small">Small (11-50)</SelectItem>
                          <SelectItem value="medium">Medium (51-200)</SelectItem>
                          <SelectItem value="large">Large (201-1000)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="connectionLevel">Connection Level</Label>
                      <Select value={searchParams.connectionLevel} onValueChange={(value) => setSearchParams(prev => ({ ...prev, connectionLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st">1st Connections</SelectItem>
                          <SelectItem value="2nd">2nd Connections</SelectItem>
                          <SelectItem value="3rd">3rd+ Connections</SelectItem>
                          <SelectItem value="all">All Levels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxResults">Max Results</Label>
                      <Select value={searchParams.maxResults.toString()} onValueChange={(value) => setSearchParams(prev => ({ ...prev, maxResults: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25 contacts</SelectItem>
                          <SelectItem value="50">50 contacts</SelectItem>
                          <SelectItem value="100">100 contacts</SelectItem>
                          <SelectItem value="250">250 contacts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeEmail"
                      checked={searchParams.includeEmail}
                      onCheckedChange={(checked) => setSearchParams(prev => ({ ...prev, includeEmail: checked }))}
                    />
                    <Label htmlFor="includeEmail">Attempt to find email addresses</Label>
                  </div>

                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSearching ? 'Searching LinkedIn...' : 'Start Collection'}
                  </Button>
                </CardContent>
              </Card>

              {/* Search Tips */}
              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Filter className="h-6 w-6 text-green-600" />
                    Search Tips
                  </CardTitle>
                  <CardDescription>
                    Optimize your searches for better results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-800">Effective Keywords</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="outline" className="justify-center">commercial real estate</Badge>
                      <Badge variant="outline" className="justify-center">CRE investment</Badge>
                      <Badge variant="outline" className="justify-center">property development</Badge>
                      <Badge variant="outline" className="justify-center">real estate broker</Badge>
                      <Badge variant="outline" className="justify-center">multifamily</Badge>
                      <Badge variant="outline" className="justify-center">office properties</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-green-800">Target Job Titles</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Vice President - Real Estate</li>
                      <li>• Managing Director - CRE</li>
                      <li>• Principal - Real Estate Investment</li>
                      <li>• Senior Broker - Commercial</li>
                      <li>• Investment Manager - Properties</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-green-800">Target Companies</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• CBRE Group, JLL, Cushman & Wakefield</li>
                      <li>• Blackstone, Brookfield, KKR Real Estate</li>
                      <li>• Prologis, Boston Properties, Equity Residential</li>
                      <li>• Regional development firms</li>
                      <li>• Commercial property management</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Pro Tip:</strong> Start with 2nd connections for higher response rates, 
                      then expand to 3rd+ connections for broader reach.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-primary" />
                      Search Results ({searchResults.length})
                    </CardTitle>
                    <CardDescription>
                      Select contacts to import into RUNE.CTZ database
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSelectAll}
                      disabled={searchResults.length === 0}
                    >
                      {selectedContacts.size === searchResults.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button
                      onClick={handleImportSelected}
                      disabled={selectedContacts.size === 0}
                      className="bg-gradient-to-r from-primary to-yellow-600"
                    >
                      Import Selected ({selectedContacts.size})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {searchResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Select</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Segment</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>LinkedIn Profile</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((contact: any) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedContacts.has(contact.id)}
                                onChange={() => handleSelectContact(contact.id)}
                                className="rounded"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell>{contact.title}</TableCell>
                            <TableCell>{contact.company}</TableCell>
                            <TableCell>{contact.location}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {contact.segment || 'General CRE'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                contact.priority === 'High' ? 'default' : 
                                contact.priority === 'Medium' ? 'secondary' : 'outline'
                              }>
                                {contact.priority || 'Medium'}
                              </Badge>
                            </TableCell>
                            <TableCell>{contact.email || 'N/A'}</TableCell>
                            <TableCell>
                              {contact.phone ? (
                                <a
                                  href={`tel:${contact.phone}`}
                                  className="text-green-600 hover:text-green-800 transition-colors font-mono text-sm"
                                >
                                  {contact.phone}
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {contact.profileUrl && contact.profileUrl.trim() ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => {
                                        // Smart LinkedIn search with improved targeting
                                        const companyKeyword = contact.company.split(' ')[0]; // Use first word of company for better results
                                        const searchQuery = `${contact.name} ${companyKeyword}`;
                                        const linkedinSearch = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}&origin=SUGGESTION_SEARCH_HEADER`;
                                        window.open(linkedinSearch, '_blank', 'noopener,noreferrer');
                                        
                                        toast({
                                          title: "LinkedIn Search Opened",
                                          description: `Search opened for ${contact.name} at ${contact.company} - look for exact match`,
                                        });
                                      }}
                                      className="flex items-center gap-1 text-xs px-2"
                                    >
                                      <LinkedinIcon className="h-3 w-3" />
                                      <span>LinkedIn</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        // Google search for LinkedIn profile - backup method  
                                        const companyName = contact.company.split(' ')[0];
                                        const googleSearch = `https://www.google.com/search?q=site:linkedin.com/in+"${contact.name}"+${companyName}`;
                                        window.open(googleSearch, '_blank', 'noopener,noreferrer');
                                        
                                        toast({
                                          title: "Google LinkedIn Search",
                                          description: `Searching Google for ${contact.name}'s LinkedIn profile`,
                                        });
                                      }}
                                      className="flex items-center gap-1 text-xs px-2"
                                    >
                                      <Search className="h-3 w-3" />
                                      <span>Google</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        navigator.clipboard.writeText(`${contact.name} ${contact.company}`);
                                        toast({
                                          title: "Copied!",
                                          description: "Contact info copied to clipboard",
                                        });
                                      }}
                                      className="flex items-center gap-1 text-xs px-1"
                                    >
                                      <span>📋</span>
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // Smart LinkedIn search even without profile URL
                                      const companyKeyword = contact.company.split(' ')[0];
                                      const searchQuery = `${contact.name} ${companyKeyword}`;
                                      const linkedinSearch = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}&origin=SUGGESTION_SEARCH_HEADER`;
                                      window.open(linkedinSearch, '_blank', 'noopener,noreferrer');
                                      
                                      toast({
                                        title: "LinkedIn Search",
                                        description: `Searching for ${contact.name}`,
                                      });
                                    }}
                                    className="flex items-center gap-1 text-xs px-2"
                                  >
                                    <LinkedinIcon className="h-3 w-3" />
                                    <span>Find</span>
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {contact.verified ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-foreground/50">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No search results yet. Configure your search parameters and click "Start Collection".</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LinkedInCollector;