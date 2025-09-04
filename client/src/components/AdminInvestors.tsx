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
import { Loader2, Search, Mail, Phone, MapPin, DollarSign, Calendar, User, MessageSquare, Trash2 } from "lucide-react";

interface Investor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  investmentAmount: string;
  investmentTimeframe: string;
  propertyTypes: string;
  experience: string;
  message?: string;
  createdAt: string;
  status: "new" | "contacted" | "qualified" | "closed";
}

export function AdminInvestors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investors = [], isLoading, error } = useQuery({
    queryKey: ["investors"],
    queryFn: async () => {
      const q = query(collection(db, "investors"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Investor[];
    },
  });

  const deleteInvestorMutation = useMutation({
    mutationFn: async (investorId: string) => {
      await deleteDoc(doc(db, "investors", investorId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      toast({
        title: "Success",
        description: "Investor deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete investor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredInvestors = investors.filter(investor =>
    `${investor.firstName} ${investor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "qualified":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
      <div className="text-center py-8">
        <p className="text-red-600">Error loading investors data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investor Management</h2>
          <p className="text-muted-foreground">
            Total Investors: <span className="font-semibold">{investors.length}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search investors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredInvestors.map((investor) => (
          <Card key={investor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">
                        {investor.firstName} {investor.lastName}
                      </h3>
                    </div>
                    <Badge className={getStatusColor(investor.status)}>
                      {investor.status.charAt(0).toUpperCase() + investor.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{investor.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{investor.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{investor.city}, {investor.country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{investor.investmentAmount}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-muted-foreground">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Submitted: {formatDate(investor.createdAt)}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setSelectedInvestor(investor)}>
                        View Details
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        Investor Details - {investor.firstName} {investor.lastName}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Personal Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{investor.firstName} {investor.lastName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{investor.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{investor.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{investor.city}, {investor.country}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Investment Profile</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Investment Amount:</span>
                              <br />
                              <span className="text-muted-foreground">{investor.investmentAmount}</span>
                            </div>
                            <div>
                              <span className="font-medium">Timeframe:</span>
                              <br />
                              <span className="text-muted-foreground">{investor.investmentTimeframe}</span>
                            </div>
                            <div>
                              <span className="font-medium">Property Types:</span>
                              <br />
                              <span className="text-muted-foreground">{investor.propertyTypes}</span>
                            </div>
                            <div>
                              <span className="font-medium">Experience:</span>
                              <br />
                              <span className="text-muted-foreground">{investor.experience}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {investor.message && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>Additional Information</span>
                          </h4>
                          <div className="bg-muted p-3 rounded-md text-sm">
                            {investor.message}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          Submitted: {formatDate(investor.createdAt)}
                        </div>
                        <Badge className={getStatusColor(investor.status)}>
                          {investor.status.charAt(0).toUpperCase() + investor.status.slice(1)}
                        </Badge>
                      </div>
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
                      <AlertDialogTitle>Delete Investor</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {investor.firstName} {investor.lastName}? 
                        This action cannot be undone and will permanently remove all investor data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteInvestorMutation.mutate(investor.id)}
                        disabled={deleteInvestorMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteInvestorMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvestors.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? "No investors found matching your search." : "No investors have submitted their information yet."}
          </p>
        </div>
      )}
    </div>
  );
}