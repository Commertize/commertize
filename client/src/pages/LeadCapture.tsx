import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail, MapPin, DollarSign, Users, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LeadCapture = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    propertyType: "",
    investmentRange: "",
    location: "",
    experience: "",
    leadSource: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capturedAt: new Date().toISOString(),
          status: 'new'
        })
      });

      if (response.ok) {
        toast({
          title: "Lead Captured Successfully!",
          description: "Contact information has been added to RUNE.CTZ database.",
        });
        
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          title: "",
          propertyType: "",
          investmentRange: "",
          location: "",
          experience: "",
          leadSource: "",
          notes: ""
        });
      } else {
        throw new Error('Failed to capture lead');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to capture lead. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-logo font-light text-foreground">
              CRE Lead Capture
            </h1>
          </div>
          <p className="text-xl text-foreground/70 mb-4">
            Add Commercial Real Estate Contacts to RUNE.CTZ Database
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-foreground/60">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Voice Calling</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Email Campaigns</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Lead Management</span>
            </div>
          </div>
        </div>

        {/* Lead Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader className="text-center pb-4">
              <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-blue-800">Investors</CardTitle>
              <CardDescription className="text-blue-600">
                Accredited investors, family offices, institutions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader className="text-center pb-4">
              <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-green-800">Property Owners</CardTitle>
              <CardDescription className="text-green-600">
                Commercial property owners, developers, sponsors
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50/50">
            <CardHeader className="text-center pb-4">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-purple-800">Brokers & Agents</CardTitle>
              <CardDescription className="text-purple-600">
                Commercial real estate brokers, agents, advisors
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Lead Capture Form */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-logo font-light flex items-center gap-3">
              <Phone className="h-6 w-6 text-primary" />
              Add New Contact
            </CardTitle>
            <CardDescription>
              Enter contact information for RUNE.CTZ outreach campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    placeholder="(555) 123-4567"
                    className="h-12"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {/* CRE Specific Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type Interest</Label>
                  <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">🏢 Office</SelectItem>
                      <SelectItem value="datacenters">💾 Datacenters</SelectItem>
                      <SelectItem value="multifamily">🏠 Multifamily</SelectItem>
                      <SelectItem value="retail">🛍️ Retail</SelectItem>
                      <SelectItem value="industrial">🏭 Industrial</SelectItem>
                      <SelectItem value="mixed-use">🏘️ Mixed-Use</SelectItem>
                      <SelectItem value="hospitality">🏨 Hospitality</SelectItem>
                      <SelectItem value="all">🌟 All Types</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investmentRange">Investment Range</Label>
                  <Select value={formData.investmentRange} onValueChange={(value) => handleInputChange('investmentRange', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select investment range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-100k">Under $100K</SelectItem>
                      <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                      <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                      <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                      <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                      <SelectItem value="10m-plus">$10M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location/Market</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadSource">Lead Source</Label>
                  <Select value={formData.leadSource} onValueChange={(value) => handleInputChange('leadSource', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="How did you find this contact?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="networking">Networking Event</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="website">Company Website</SelectItem>
                      <SelectItem value="cold-research">Cold Research</SelectItem>
                      <SelectItem value="industry-database">Industry Database</SelectItem>
                      <SelectItem value="business-card">Business Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional information about this contact..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-yellow-600 hover:from-primary/90 hover:to-yellow-600/90 text-white px-8 py-3 rounded-xl font-medium"
                >
                  {isSubmitting ? 'Adding Contact...' : 'Add to RUNE.CTZ Database'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Free Lead Sources */}
        <Card className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-xl font-logo font-light text-green-800">
              Free Lead Sources
            </CardTitle>
            <CardDescription className="text-green-700">
              Cost-effective ways to find CRE contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-green-800">Online Sources</h4>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• LinkedIn (Commercial Real Estate groups)</li>
                  <li>• Company websites (About Us pages)</li>
                  <li>• Industry association directories</li>
                  <li>• Real estate conference attendee lists</li>
                  <li>• Commercial property listings (broker info)</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-green-800">Networking</h4>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Local real estate meetups</li>
                  <li>• Chamber of Commerce events</li>
                  <li>• Industry conferences & trade shows</li>
                  <li>• Real estate investment clubs</li>
                  <li>• Professional referrals</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeadCapture;