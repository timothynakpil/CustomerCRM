
import { jsPDF } from "jspdf";
import { CustomerData, TransactionData } from "./types";
import { addCompanyBranding, addDocumentTitle, addPageFooters } from "./pdfUtils";
import { addCustomerDetails } from "./customerSection";
import { addSalesSummaryTable, addDetailedTransactions } from "./transactionTables";

/**
 * Generates a PDF report for customer sales
 */
export const generateCustomerSalesPDF = (customer: CustomerData, sales: TransactionData[]) => {
  try {
    // Create PDF document
    const doc = new jsPDF();
    
    // Add company branding
    addCompanyBranding(doc);
    
    // Add document title
    addDocumentTitle(doc, "Customer Sales Report");
    
    // Add customer details section
    addCustomerDetails(doc, customer, sales);
    
    // Add sales summary table
    const nextYPosition = addSalesSummaryTable(doc, sales);
    
    // Add detailed transactions
    addDetailedTransactions(doc, sales, nextYPosition);
    
    // Add page footers
    addPageFooters(doc);
    
    // Save the PDF
    doc.save(`${customer.custno}_Sales_Report.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};
