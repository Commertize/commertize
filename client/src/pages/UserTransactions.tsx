import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";

interface Transaction {
  id: string;
  dealName: string;
  investmentDate: string;
  tokens: number;
  amount: number;
  status: "successful" | "pending" | "incomplete";
  transactionHash: string;
  userId: string;
}

interface TransactionFormData {
  dealName: string;
  investmentDate: string;
  tokens: number;
  amount: number;
  status: "successful" | "pending" | "incomplete";
  transactionHash: string;
}

export default function UserTransactions() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [, params] = useRoute<{ userId: string }>("/admin/users/:userId/transactions");
  const userId = params?.userId;

  const [formData, setFormData] = useState<TransactionFormData>({
    dealName: "",
    investmentDate: new Date().toISOString().split('T')[0],
    tokens: 0,
    amount: 0,
    status: "pending",
    transactionHash: "",
  });

  const { data: transactions = [], refetch } = useQuery({
    queryKey: ["user-transactions", userId],
    queryFn: async () => {
      if (!userId) return [];

      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    },
    enabled: !!userId
  });

  const addTransaction = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      if (!userId) throw new Error("No user ID provided");

      const transactionData = {
        ...data,
        userId,
      };
      await addDoc(collection(db, "transactions"), transactionData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
      setIsDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    }
  });

  const updateTransaction = useMutation({
    mutationFn: async (data: Transaction) => {
      const { id, ...updateData } = data;
      await updateDoc(doc(db, "transactions", id), updateData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
      setIsDialogOpen(false);
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    }
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "transactions", id));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      updateTransaction.mutate({
        ...formData,
        id: editingTransaction.id,
        userId: userId!,
      });
    } else {
      addTransaction.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      dealName: "",
      investmentDate: new Date().toISOString().split('T')[0],
      tokens: 0,
      amount: 0,
      status: "pending",
      transactionHash: "",
    });
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      dealName: transaction.dealName,
      investmentDate: new Date(transaction.investmentDate).toISOString().split('T')[0],
      tokens: transaction.tokens,
      amount: transaction.amount,
      status: transaction.status,
      transactionHash: transaction.transactionHash,
    });
    setIsDialogOpen(true);
  };

  if (!userId) {
    return <div>Invalid user ID</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => setLocation("/admin/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">User Transactions</h1>
      </div>

      <Card className="mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Transactions</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTransaction ? "Edit Transaction" : "Add Transaction"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dealName">Deal Name</Label>
                    <Input
                      id="dealName"
                      value={formData.dealName}
                      onChange={(e) => setFormData({
                        ...formData,
                        dealName: e.target.value
                      })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="investmentDate">Investment Date</Label>
                    <Input
                      id="investmentDate"
                      type="date"
                      value={formData.investmentDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        investmentDate: e.target.value
                      })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tokens">Tokens</Label>
                    <Input
                      id="tokens"
                      type="number"
                      value={formData.tokens}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokens: Number(e.target.value)
                      })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({
                        ...formData,
                        amount: Number(e.target.value)
                      })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={formData.status}
                      onChange={(e) => setFormData({
                        ...formData,
                        status: e.target.value as "successful" | "pending" | "incomplete"
                      })}
                      required
                    >
                      <option value="successful">Successful</option>
                      <option value="pending">Pending</option>
                      <option value="incomplete">Incomplete</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transactionHash">Transaction Hash</Label>
                    <Input
                      id="transactionHash"
                      value={formData.transactionHash}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionHash: e.target.value
                      })}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTransaction ? "Update" : "Add"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.dealName}</TableCell>
                    <TableCell>{new Date(transaction.investmentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.tokens}</TableCell>
                    <TableCell>${transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${transaction.status === 'successful' ? 'bg-green-100 text-green-800' : 
                          transaction.status === 'incomplete' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.transactionHash.slice(0, 8)}...{transaction.transactionHash.slice(-6)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this transaction?')) {
                              deleteTransaction.mutate(transaction.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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
    </div>
  );
}