import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Mail, Phone, MapPin, DollarSign, Calendar, User, MessageSquare, Trash2, Building, Briefcase } from "lucide-react";

interface Sponsor {
  id: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  propertyName: string;
  propertyLocation: string;
  assetType: string;
  estimatedValue: string;
  capitalNeeded: string;
  financingStatus: string[];
  timeline: string;
  hearAboutUs: string;
  additionalInfo?: string;
  createdAt: string;
  status: "new" | "contacted" | "qualified" | "approved" | "rejected";
}

export function AdminSponsors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sponsors = [], isLoading, error } = useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const q = query(collection(db, "sponsors"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sponsor[];
    },
  });

  const deleteSponsorMutation = useMutation({
    mutationFn: async (sponsorId: string) => {
      await deleteDoc(doc(db, "sponsors", sponsorId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      toast({
        title: "Success",
        description: "Sponsor deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete sponsor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredSponsors = sponsors.filter(sponsor =>
    sponsor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sponsor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sponsor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sponsor.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "qualified": return "bg-purple-100 text-purple-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        Error loading sponsor data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sponsor Waitlist</h2>
          <p className="text-muted-foreground">Manage property owner and sponsor applications</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {sponsors.length} Total Sponsors
        </Badge>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sponsors by name, company, email, or property..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sponsors.filter(s => s.status === "new").length}
              </div>
              <div className="text-sm text-muted-foreground">New</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {sponsors.filter(s => s.status === "contacted").length}
              </div>
              <div className="text-sm text-muted-foreground">Contacted</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {sponsors.filter(s => s.status === "qualified").length}
              </div>
              <div className="text-sm text-muted-foreground">Qualified</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sponsors.filter(s => s.status === "approved").length}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {sponsors.filter(s => s.status === "rejected").length}
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSponsors.map((sponsor) => (
          <Card key={sponsor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{sponsor.fullName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{sponsor.company}</p>
                </div>
                <Badge className={getStatusColor(sponsor.status)}>
                  {sponsor.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{sponsor.propertyName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{sponsor.propertyLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{sponsor.assetType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Value: {sponsor.estimatedValue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Capital: {sponsor.capitalNeeded}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{sponsor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{sponsor.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(sponsor.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedSponsor(sponsor)}
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Sponsor Details - {sponsor.fullName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Contact Information</h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Name:</strong> {sponsor.fullName}</p>
                            <p><strong>Company:</strong> {sponsor.company}</p>
                            <p><strong>Email:</strong> {sponsor.email}</p>
                            <p><strong>Phone:</strong> {sponsor.phone}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Property Information</h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Property:</strong> {sponsor.propertyName}</p>
                            <p><strong>Location:</strong> {sponsor.propertyLocation}</p>
                            <p><strong>Asset Type:</strong> {sponsor.assetType}</p>
                            <p><strong>Timeline:</strong> {sponsor.timeline}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Financial Details</h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Estimated Value:</strong> {sponsor.estimatedValue}</p>
                            <p><strong>Capital Needed:</strong> {sponsor.capitalNeeded}</p>
                            <p><strong>Financing Status:</strong></p>
                            <ul className="list-disc list-inside ml-4">
                              {sponsor.financingStatus?.map((status, index) => (
                                <li key={index}>{status}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Additional Information</h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>How they heard about us:</strong> {sponsor.hearAboutUs}</p>
                            <p><strong>Submitted:</strong> {new Date(sponsor.createdAt).toLocaleString()}</p>
                            <p><strong>Status:</strong> 
                              <Badge className={`ml-2 ${getStatusColor(sponsor.status)}`}>
                                {sponsor.status}
                              </Badge>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {sponsor.additionalInfo && (
                        <div>
                          <h4 className="font-semibold mb-2">Additional Notes</h4>
                          <p className="text-sm bg-muted p-3 rounded">{sponsor.additionalInfo}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Sponsor</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {sponsor.fullName}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteSponsorMutation.mutate(sponsor.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSponsors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sponsors found matching your search.</p>
        </div>
      )}
    </div>
  );
}