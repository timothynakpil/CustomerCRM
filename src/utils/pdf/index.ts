
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Ensure autotable is properly imported
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
    addCustomerDetails(doc, customer);
    
    // Add sales summary table
    const nextYPosition = addSalesSummaryTable(doc, sales);
    
    // Add detailed transactions
    addDetailedTransactions(doc, sales, nextYPosition);
    
    // Add page footers
    addPageFooters(doc);
    
    // Save the PDF with a proper filename (sanitize customer number to avoid invalid characters)
    const safeCustNo = customer.custno.replace(/[^a-z0-9]/gi, '_');
    doc.save(`${safeCustNo}_Sales_Report.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};

/**
 * Generates a PDF report and opens it in a new window (alternative to direct download)
 */
export const previewCustomerSalesPDF = (customer: CustomerData, sales: TransactionData[]) => {
  try {
    // Create PDF document
    const doc = new jsPDF();
    
    // Add company branding
    addCompanyBranding(doc);
    
    // Add document title
    addDocumentTitle(doc, "Customer Sales Report");
    
    // Add customer details section
    addCustomerDetails(doc, customer);
    
    // Add sales summary table
    const nextYPosition = addSalesSummaryTable(doc, sales);
    
    // Add detailed transactions
    addDetailedTransactions(doc, sales, nextYPosition);
    
    // Add page footers
    addPageFooters(doc);
    
    // Open the PDF in a new browser tab
    window.open(URL.createObjectURL(doc.output('blob')));
    
    return true;
  } catch (error) {
    console.error("Error previewing PDF:", error);
    return false;
  }
};
