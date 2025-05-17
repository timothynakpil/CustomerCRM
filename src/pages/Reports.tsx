
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerSalesForm from "@/components/reports/CustomerSalesForm";
import ReportPreview from "@/components/reports/ReportPreview";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  getCustomers, 
  getCustomerData, 
  getCustomerSales, 
  extractProductCodes,
  getLatestProductPrices,
  processSalesData,
  CustomerBasic,
  ProcessedTransaction
} from "@/services/reportService";
import { generateCustomerSalesPDF } from "@/utils/pdf";
import { CustomerData } from "@/utils/pdf/types";

const Reports = () => {
  const [customers, setCustomers] = useState<CustomerBasic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ProcessedTransaction[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isReportReady, setIsReportReady] = useState(false);
  const { toast } = useToast();
  
  // Load customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getCustomers();
        
        if (error) throw error;
        setCustomers(data);
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
  
  const onSubmit = async (data: { custno: string }) => {
    setIsGenerating(true);
    setReportData([]);
    setIsReportReady(false);
    
    try {
      // Fetch customer information
      const { data: customerData, error: customerError } = await getCustomerData(data.custno);
      
      if (customerError) throw customerError;
      setCustomerData(customerData);
      
      // Fetch all sales transactions for this customer
      const { data: salesData, error: salesError } = await getCustomerSales(data.custno);
      
      if (salesError) throw salesError;
      
      if (!salesData || salesData.length === 0) {
        toast({
          title: "No Data",
          description: "No sales transactions found for this customer",
        });
        setIsGenerating(false);
        return;
      }
      
      // Extract all unique product codes
      const productCodes = extractProductCodes(salesData);
      
      // Get latest price for each product
      const priceMap = await getLatestProductPrices(productCodes);
      
      // Process sales data
      const processedData = processSalesData(salesData, priceMap);
      
      // Sort by date (newest first)
      processedData.sort((a, b) => 
        new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
      );
      
      setReportData(processedData);
      setIsReportReady(true);
      
      toast({
        title: "Success",
        description: "Report data loaded successfully. Click 'Download PDF' to generate the report.",
      });
      
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

  const handleDownloadPDF = () => {
    if (!customerData || reportData.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      // Generate PDF
      const success = generateCustomerSalesPDF(customerData, reportData);
      
      if (success) {
        toast({
          title: "Success",
          description: "Sales report PDF generated successfully",
        });
      } else {
        throw new Error("PDF generation failed");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
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
              <CustomerSalesForm 
                customers={customers}
                isLoading={isLoading}
                isGenerating={isGenerating}
                onSubmit={onSubmit}
              />
              
              <ReportPreview 
                reportData={reportData}
                customerData={customerData}
                onDownload={handleDownloadPDF}
                disableDownload={isGenerating || !isReportReady}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
