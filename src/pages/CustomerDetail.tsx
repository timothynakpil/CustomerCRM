
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteCustomerDialog from "@/components/DeleteCustomerDialog";
import { Edit, ArrowLeft, MapPin, FileText, Wallet, CalendarDays } from "lucide-react";

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer")
        .select("*")
        .eq("custno", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ["customerSales", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select(`
          transno,
          salesdate,
          empno,
          employee:empno (firstname, lastname)
        `)
        .eq("custno", id)
        .order("salesdate", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["customerPayments", id],
    queryFn: async () => {
      // First get the sales transactions for this customer
      const { data: customerSales, error: salesError } = await supabase
        .from("sales")
        .select("transno")
        .eq("custno", id);
      
      if (salesError) throw salesError;
      
      if (!customerSales || customerSales.length === 0) {
        return [];
      }
      
      // Get transaction numbers
      const transactionNumbers = customerSales.map(sale => sale.transno);
      
      // Then get payments for those transactions
      const { data: paymentData, error: paymentError } = await supabase
        .from("payment")
        .select("*")
        .in("transno", transactionNumbers)
        .order("paydate", { ascending: false });
        
      if (paymentError) throw paymentError;
      return paymentData || [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading customer data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Customer not found</h2>
          <p className="text-gray-500 mb-6">The customer you are looking for does not exist or may have been deleted.</p>
          <Button onClick={() => navigate("/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Customers
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate("/customers")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{customer.custname || 'Unnamed Customer'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to={`/customers/edit/${id}`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <DeleteCustomerDialog customerId={customer.custno} customerName={customer.custname} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Customer ID</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{customer.custno}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Payment Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{customer.payterm || 'Not specified'}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Address</CardTitle>
            </CardHeader>
            <CardContent className="flex items-start gap-2">
              <MapPin className="h-5 w-5 mt-0.5 text-gray-400 flex-shrink-0" />
              <p className="text-lg">{customer.address || 'No address provided'}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales History</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileText className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Sales</p>
                      <p className="text-2xl font-bold">{sales?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Wallet className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Payments</p>
                      <p className="text-2xl font-bold">{payments?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <CalendarDays className="h-6 w-6 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Latest Transaction</p>
                      <p className="text-xl font-bold">
                        {sales && sales.length > 0
                          ? new Date(sales[0].salesdate).toLocaleDateString()
                          : 'No transactions'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>The most recent sales for this customer</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <div className="animate-pulse space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : sales && sales.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Employee</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.slice(0, 5).map((sale) => (
                          <TableRow key={sale.transno}>
                            <TableCell className="font-medium">{sale.transno}</TableCell>
                            <TableCell>
                              {sale.salesdate 
                                ? new Date(sale.salesdate).toLocaleDateString() 
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {sale.employee?.firstname 
                                ? `${sale.employee.firstname} ${sale.employee.lastname || ''}` 
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">No sales records found</p>
                )}
                {sales && sales.length > 5 && (
                  <div className="mt-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab("sales")}
                    >
                      View all sales
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Sales History</CardTitle>
                <CardDescription>All sales transactions for this customer</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <div className="animate-pulse space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : sales && sales.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Employee</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.map((sale) => (
                          <TableRow key={sale.transno}>
                            <TableCell className="font-medium">{sale.transno}</TableCell>
                            <TableCell>
                              {sale.salesdate 
                                ? new Date(sale.salesdate).toLocaleDateString() 
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {sale.employee?.firstname 
                                ? `${sale.employee.firstname} ${sale.employee.lastname || ''}` 
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">No sales records found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All payment records for this customer's transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPayments ? (
                  <div className="animate-pulse space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>OR #</TableHead>
                          <TableHead>Transaction #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.orno}>
                            <TableCell className="font-medium">{payment.orno}</TableCell>
                            <TableCell>{payment.transno}</TableCell>
                            <TableCell>
                              {payment.paydate 
                                ? new Date(payment.paydate).toLocaleDateString() 
                                : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              {payment.amount 
                                ? new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                  }).format(payment.amount)
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">No payment records found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetail;
