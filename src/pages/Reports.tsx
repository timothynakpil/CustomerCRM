
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Need to extend jsPDF types for autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const formSchema = z.object({
  custno: z.string().min(1, "Please select a customer"),
});

type FormData = z.infer<typeof formSchema>;

const Reports = () => {
  const [customers, setCustomers] = useState<{ custno: string; custname: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      custno: "",
    },
  });
  
  // Load customers on component mount
  useState(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("customer")
          .select("custno, custname")
          .order("custname");
          
        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, [toast]);
  
  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    setReportData([]);
    
    try {
      // Fetch customer information
      const { data: customerData, error: customerError } = await supabase
        .from("customer")
        .select("*")
        .eq("custno", data.custno)
        .single();
        
      if (customerError) throw customerError;
      
      // Fetch all sales transactions for this customer
      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select(`
          transno,
          salesdate,
          employee (empno, firstname, lastname),
          salesdetail (
            prodcode,
            quantity,
            product (description, unit),
            pricehist (unitprice)
          )
        `)
        .eq("custno", data.custno)
        .order("salesdate", { ascending: false });
        
      if (salesError) throw salesError;
      
      if (!salesData || salesData.length === 0) {
        toast({
          title: "No Data",
          description: "No sales transactions found for this customer",
        });
        setIsGenerating(false);
        return;
      }
      
      // Process sales data
      const processedData = salesData.map((sale: any) => {
        const empName = sale.employee 
          ? `${sale.employee.firstname || ''} ${sale.employee.lastname || ''}`.trim() || 'N/A' 
          : 'N/A';
          
        // Calculate total for each transaction
        let total = 0;
        
        if (sale.salesdetail && Array.isArray(sale.salesdetail)) {
          sale.salesdetail.forEach((detail: any) => {
            const price = detail.pricehist?.unitprice || 0;
            const quantity = detail.quantity || 0;
            total += price * quantity;
          });
        }
        
        return {
          transno: sale.transno,
          date: new Date(sale.salesdate).toLocaleDateString(),
          employee: empName,
          totalAmount: total.toFixed(2),
          details: sale.salesdetail || [],
          rawDate: sale.salesdate // For sorting
        };
      });
      
      // Sort by date (newest first)
      processedData.sort((a: any, b: any) => 
        new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
      );
      
      setReportData(processedData);
      generatePDF(customerData, processedData);
      
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generatePDF = (customer: any, sales: any[]) => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text("Customer Sales Report", 14, 22);
      
      // Add customer details
      doc.setFontSize(12);
      doc.text(`Customer: ${customer.custname} (${customer.custno})`, 14, 32);
      doc.text(`Address: ${customer.address || 'N/A'}`, 14, 38);
      doc.text(`Payment Terms: ${customer.payterm || 'N/A'}`, 14, 44);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 50);
      
      // Add sales summary table
      doc.setFontSize(14);
      doc.text("Sales Transactions", 14, 60);
      
      const tableColumns = ["Transaction #", "Date", "Employee", "Total Amount"];
      const tableRows = sales.map((sale) => [
        sale.transno,
        sale.date,
        sale.employee,
        `$${sale.totalAmount}`
      ]);
      
      doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: 65,
        margin: { top: 10 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      
      // Add detailed transactions
      let yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text("Transaction Details", 14, yPos);
      yPos += 10;
      
      sales.forEach((sale, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`Transaction #${sale.transno} - ${sale.date}`, 14, yPos);
        yPos += 5;
        
        const detailColumns = ["Product", "Description", "Quantity", "Unit Price", "Subtotal"];
        const detailRows = sale.details.map((detail: any) => {
          const price = detail.pricehist?.unitprice || 0;
          const quantity = detail.quantity || 0;
          const subtotal = price * quantity;
          
          return [
            detail.prodcode,
            detail.product?.description || 'N/A',
            quantity.toString(),
            `$${price.toFixed(2)}`,
            `$${subtotal.toFixed(2)}`
          ];
        });
        
        doc.autoTable({
          head: [detailColumns],
          body: detailRows,
          startY: yPos,
          margin: { top: 5 },
          styles: { fontSize: 9 },
          headStyles: { fillColor: [52, 152, 219] }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + (index < sales.length - 1 ? 15 : 5);
      });
      
      // Save the PDF
      doc.save(`${customer.custno}_Sales_Report.pdf`);
      
      toast({
        title: "Success",
        description: "Sales report PDF generated successfully",
      });
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>

      <Tabs defaultValue="customer-sales">
        <TabsList>
          <TabsTrigger value="customer-sales">Customer Sales Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customer-sales" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate Customer Sales Report</CardTitle>
                <CardDescription>
                  Select a customer to generate a sales report in PDF format.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="custno"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Customer</FormLabel>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem key={customer.custno} value={customer.custno}>
                                  {customer.custname} ({customer.custno})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isGenerating}>
                      {isGenerating ? (
                        <>Generating Report...</>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate PDF Report
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>
                  Preview of the sales data that will be included in the PDF.
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {reportData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Select a customer and generate a report to see a preview.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportData.map((transaction) => (
                      <div key={transaction.transno} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Transaction #{transaction.transno}</h3>
                          <span className="text-sm text-gray-500">{transaction.date}</span>
                        </div>
                        <div className="text-sm mb-2">Employee: {transaction.employee}</div>
                        <div className="font-semibold">Total: ${transaction.totalAmount}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="text-sm text-gray-500">
                  The PDF report will include detailed product information for each transaction.
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
