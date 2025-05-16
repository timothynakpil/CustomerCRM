
import { jsPDF } from "jspdf";
import { CustomerData, TransactionData } from "./types";

/**
 * Adds customer details section to the PDF
 */
export const addCustomerDetails = (doc: jsPDF, customer: CustomerData, sales: TransactionData[]): void => {
  // Add customer details section with improved styling
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Details", 14, 34);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${customer.custname} (${customer.custno})`, 14, 42);
  doc.text(`Address: ${customer.address || 'N/A'}`, 14, 50);
  doc.text(`Payment Terms: ${customer.payterm || 'N/A'}`, 14, 58);
  
  // Add report meta information
  doc.setFont("helvetica", "bold");
  doc.text("Report Information", 120, 34);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 120, 42);
  doc.text(`Total Transactions: ${sales.length}`, 120, 50);
  
  const totalSalesAmount = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0).toFixed(2);
  doc.text(`Total Amount: $${totalSalesAmount}`, 120, 58);
  
  // Add horizontal line as a separator
  doc.setDrawColor(142, 145, 150); // gray
  doc.setLineWidth(0.2);
  doc.line(14, 65, 196, 65);
}
