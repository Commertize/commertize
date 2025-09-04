import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, ChevronRight, Ban, UserCheck } from "lucide-react";

interface FirebaseUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
  userWallet?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  registrationTime?: string;
  lastOnline?: string;
  status?: string;
}

export function AdminUsers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseUser[];
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, currentStatus }: { userId: string; currentStatus: string }) => {
      const userRef = doc(db, "users", userId);
      const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
      await updateDoc(userRef, {
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });
      return { userId, newStatus };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User status updated",
        description: `User has been ${data.newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUserClick = (userId: string) => {
    setLocation(`/admin/users/${userId}/transactions`);
  };

  const handleBlockUser = (userId: string, currentStatus: string) => {
    blockUserMutation.mutate({ userId, currentStatus });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>User Wallet</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Registration Time</TableHead>
              <TableHead>Last Online</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.email || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {user.userWallet ? (
                        <span className="truncate max-w-[120px] block">
                          {user.userWallet}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.firstName || "N/A"}</TableCell>
                  <TableCell>{user.lastName || "N/A"}</TableCell>
                  <TableCell>{user.country || "N/A"}</TableCell>
                  <TableCell>
                    {user.registrationTime ? 
                      new Date(user.registrationTime).toLocaleString() :
                      user.createdAt ? 
                        new Date(user.createdAt).toLocaleString() :
                        "N/A"
                    }
                  </TableCell>
                  <TableCell>
                    {user.lastOnline ? 
                      new Date(user.lastOnline).toLocaleDateString() :
                      user.lastLogin ? 
                        new Date(user.lastLogin).toLocaleDateString() :
                        "N/A"
                    }
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      user.status === 'blocked' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status || 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant={user.status === 'blocked' ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => handleBlockUser(user.id, user.status || 'active')}
                        disabled={blockUserMutation.isPending}
                      >
                        {user.status === 'blocked' ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 mr-1" />
                            Block
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUserClick(user.id)}
                      >
                        <ChevronRight className="h-4 w-4" />
                        Manage Transactions
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
