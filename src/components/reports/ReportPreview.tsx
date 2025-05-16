
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProcessedTransaction } from "@/services/reportService";

interface ReportPreviewProps {
  reportData: ProcessedTransaction[];
}

const ReportPreview = ({ reportData }: ReportPreviewProps) => {
  return (
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
  );
};

export default ReportPreview;
