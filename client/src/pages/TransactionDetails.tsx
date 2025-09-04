import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  dealName: string;
  investmentDate: string;
  tokens: number;
  amount: number;
  status: 'successful' | 'incomplete' | 'pending';
  transactionHash: string;
}

export default function TransactionDetails() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const transactionsRef = collection(db, "transactions");
      let q = query(transactionsRef);

      if (filter !== "all") {
        q = query(transactionsRef, where("status", "==", filter));
      }

      const querySnapshot = await getDocs(q);
      const fetchedTransactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    }
  };

  // Add sample data on component mount if no transactions exist
  useEffect(() => {
    const initializeData = async () => {
      const transactionsRef = collection(db, "transactions");
      const snapshot = await getDocs(transactionsRef);

      if (snapshot.empty) {
        const dummyTransactions = [
          {
            dealName: "Luxury Condo Development",
            investmentDate: new Date("2024-12-15").toISOString(),
            tokens: 500,
            amount: 50000,
            status: "successful",
            transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
          },
          {
            dealName: "Commercial Plaza Project",
            investmentDate: new Date("2024-12-20").toISOString(),
            tokens: 300,
            amount: 30000,
            status: "pending",
            transactionHash: "0xabcdef1234567890abcdef1234567890abcdef12",
          },
          {
            dealName: "Residential Complex",
            investmentDate: new Date("2024-12-25").toISOString(),
            tokens: 200,
            amount: 20000,
            status: "incomplete",
            transactionHash: "0x567890abcdef1234567890abcdef1234567890ab",
          },
          {
            dealName: "Office Building Investment",
            investmentDate: new Date().toISOString(),
            tokens: 1000,
            amount: 100000,
            status: "successful",
            transactionHash: "0x890abcdef1234567890abcdef1234567890abcde",
          }
        ];

        try {
          for (const transaction of dummyTransactions) {
            await addDoc(transactionsRef, transaction);
          }
          console.log("Sample data added successfully");
        } catch (error) {
          console.error("Error adding sample data:", error);
        }
      }

      fetchTransactions();
    };

    initializeData();
  }, []); // Run once on mount

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const handleViewDetails = (transactionHash: string) => {
    window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank');
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transaction Details</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="successful">Successful</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Name</TableHead>
                <TableHead>Investment Date</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(transaction.transactionHash)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
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