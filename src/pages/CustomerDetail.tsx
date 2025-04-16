
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch customer details
  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer")
        .select("*")
        .eq("custno", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Fetch customer's sales transactions
  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ["customer-sales", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, employee(firstname, lastname)")
        .eq("custno", id);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch sales details
  const { data: salesDetails, isLoading: isLoadingSalesDetails } = useQuery({
    queryKey: ["customer-sales-details", id],
    enabled: !!sales && sales.length > 0,
    queryFn: async () => {
      if (!sales || sales.length === 0) return [];

      const transactionIds = sales.map(sale => sale.transno);
      const { data, error } = await supabase
        .from("salesdetail")
        .select("*, product(*)")
        .in("transno", transactionIds);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch payments
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["customer-payments", id],
    enabled: !!sales && sales.length > 0,
    queryFn: async () => {
      if (!sales || sales.length === 0) return [];

      const transactionIds = sales.map(sale => sale.transno);
      const { data, error } = await supabase
        .from("payment")
        .select("*")
        .in("transno", transactionIds);

      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = isLoadingCustomer || isLoadingSales || isLoadingSalesDetails || isLoadingPayments;

  // Calculate totals
  const totalTransactions = sales?.length || 0;
  const totalSpent = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
  
  // Get products purchased
  const productsPurchased = salesDetails?.reduce((products, detail) => {
    if (detail.product?.description && !products.includes(detail.product.description)) {
      products.push(detail.product.description);
    }
    return products;
  }, [] as string[]) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {isLoadingCustomer ? "Loading customer..." : customer?.custname || "Customer Details"}
          </h1>
        </div>

        {/* Customer information */}
        {isLoadingCustomer ? (
          <div className="h-32 bg-gray-200 animate-pulse rounded-md"></div>
        ) : customer ? (
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Basic details about the customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer ID</h3>
                  <p className="text-lg">{customer.custno}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="text-lg">{customer.custname || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Terms</h3>
                  <p className="text-lg">{customer.payterm || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="text-lg">{customer.address || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="p-4 border rounded-md bg-red-50 text-red-700">
            Customer not found
          </div>
        )}

        {/* Dashboard metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold">{totalTransactions}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Spent</p>
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Products Purchased</p>
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold">{productsPurchased.length}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>All sales and payments for this customer</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sales">
              <TabsList className="mb-4">
                <TabsTrigger value="sales">Sales Transactions</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>

              <TabsContent value="sales">
                {isLoadingSales ? (
                  <div className="space-y-2">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
                    ))}
                  </div>
                ) : sales && sales.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Sales Person</TableHead>
                          <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.map((sale) => (
                          <TableRow key={sale.transno}>
                            <TableCell className="font-medium">{sale.transno}</TableCell>
                            <TableCell>
                              {sale.salesdate ? format(new Date(sale.salesdate), 'MMM d, yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {sale.employee ? 
                                `${sale.employee.firstname || ''} ${sale.employee.lastname || ''}`.trim() || 'N/A' 
                                : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No sales transactions found for this customer.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payments">
                {isLoadingPayments ? (
                  <div className="space-y-2">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
                    ))}
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>OR Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Transaction #</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.orno}>
                            <TableCell className="font-medium">{payment.orno}</TableCell>
                            <TableCell>
                              {payment.paydate ? format(new Date(payment.paydate), 'MMM d, yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell>{payment.transno || 'N/A'}</TableCell>
                            <TableCell className="text-right font-medium">
                              ${payment.amount?.toFixed(2) || '0.00'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No payment records found for this customer.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetail;
