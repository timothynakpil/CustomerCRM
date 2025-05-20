
import { jsPDF } from "jspdf";
// Import autoTable as a type and global extension
import "jspdf-autotable";
import { CustomerData, TransactionData } from "./types";
import { addCompanyBranding, addDocumentTitle, addPageFooters } from "./pdfUtils";
import { addCustomerDetails } from "./customerSection";
import { addSalesSummaryTable, addDetailedTransactions } from "./transactionTables";

/**
 * Generates a PDF report for customer sales
 */
export const generateCustomerSalesPDF = (customer: CustomerData, sales: TransactionData[]) => {
  try {
    // Create PDF document with proper initialization
    const doc = new jsPDF();
    
    // Validate that autoTable is available
    if (typeof (doc as any).autoTable !== 'function') {
      console.error("jsPDF-AutoTable not properly loaded");
      throw new Error("PDF generation failed - missing required plugin");
    }
    
    // Add company branding
    addCompanyBranding(doc);
    
    // Add document title
    addDocumentTitle(doc, "Customer Sales Report");
    
    // Add customer details section
    addCustomerDetails(doc, customer, sales);
    
    // Add sales summary table with error handling
    const nextYPosition = addSalesSummaryTable(doc, sales);
    
    // Add detailed transactions
    addDetailedTransactions(doc, sales, nextYPosition);
    
    // Add page footers
    addPageFooters(doc);
    
    // Save the PDF with a proper filename (sanitize customer number to avoid invalid characters)
    const safeCustNo = customer.custno.replace(/[^a-z0-9]/gi, '_');
    const fileName = `${safeCustNo}_Sales_Report_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(fileName);
    
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
    // Create PDF document with proper initialization
    const doc = new jsPDF();
    
    // Validate that autoTable is available
    if (typeof (doc as any).autoTable !== 'function') {
      console.error("jsPDF-AutoTable not properly loaded");
      throw new Error("PDF generation failed - missing required plugin");
    }
    
    // Add company branding
    addCompanyBranding(doc);
    
    // Add document title
    addDocumentTitle(doc, "Customer Sales Report");
    
    // Add customer details section
    addCustomerDetails(doc, customer, sales);
    
    // Add sales summary table with error handling
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
