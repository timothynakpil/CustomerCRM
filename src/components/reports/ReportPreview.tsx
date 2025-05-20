
import { Download, FileText, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProcessedTransaction } from "@/services/reportService";
import { CustomerData } from "@/utils/pdf/types";

interface ReportPreviewProps {
  reportData: ProcessedTransaction[];
  customerData: CustomerData | null;
  onDownload: () => void;
  onPreview?: () => void;
  disableDownload: boolean;
}

const ReportPreview = ({ 
  reportData, 
  customerData, 
  onDownload,
  onPreview,
  disableDownload 
}: ReportPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Preview
        </CardTitle>
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
            {customerData && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <h3 className="font-medium text-sm text-gray-700">Customer Information</h3>
                <p className="text-sm">{customerData.custname} ({customerData.custno})</p>
                {customerData.address && <p className="text-xs text-gray-500">{customerData.address}</p>}
              </div>
            )}
            {reportData.map((transaction) => (
              <div key={transaction.transno} className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
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
      <CardFooter className="flex flex-wrap justify-between items-center gap-2">
        <div className="text-sm text-gray-500">
          The PDF report will include detailed product information for each transaction.
        </div>
        {reportData.length > 0 && (
          <div className="flex gap-2">
            {onPreview && (
              <Button 
                onClick={onPreview}
                variant="outline"
                disabled={disableDownload}
                className="flex items-center"
              >
                <Eye className="mr-2" size={16} />
                Preview
              </Button>
            )}
            <Button 
              onClick={onDownload} 
              disabled={disableDownload}
              className="bg-primary hover:bg-primary/80"
            >
              <Download className="mr-2" size={16} />
              Download PDF
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReportPreview;
