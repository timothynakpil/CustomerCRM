
import { jsPDF } from "jspdf";
// We need to import jspdf-autotable properly and extend the jsPDF type
import autoTable from "jspdf-autotable";
import { CustomerData } from "./types";
import { TransactionData } from "./types";
import { addCompanyBranding, addDocumentTitle, addPageFooters } from "./pdfUtils";
import { addCustomerDetails } from "./customerSection";
import { addSalesSummaryTable, addDetailedTransactions } from "./transactionTables";

// Add autoTable to jsPDF prototype
// This is necessary because jspdf-autotable works by extending jsPDF's prototype
// @ts-ignore - we know this exists at runtime even though TypeScript doesn't recognize it
jsPDF.API.autoTable = autoTable;

/**
 * Generates a PDF report for customer sales data and triggers download
 */
export function generateCustomerSalesPdf(customerData: CustomerData, salesData: TransactionData[]): boolean {
  try {
    // Initialize PDF document
    const doc = new jsPDF();
    
    // Add branding and title
    addCompanyBranding(doc);
    addDocumentTitle(doc, "Customer Sales Report");
    
    // Add customer information section
    addCustomerDetails(doc, customerData, salesData);
    
    // Add sales summary table and get the Y position after the table
    const startYPosition = addSalesSummaryTable(doc, salesData);
    
    // Add detailed transaction information
    addDetailedTransactions(doc, salesData, startYPosition);
    
    // Add page numbers and footer to all pages
    addPageFooters(doc);
    
    // Save the PDF with a filename based on customer information
    const filename = `sales_report_${customerData.custno}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}

/**
 * Opens the PDF in a new browser tab for preview instead of downloading
 */
export function previewCustomerSalesPdf(customerData: CustomerData, salesData: TransactionData[]): boolean {
  try {
    // Initialize PDF document
    const doc = new jsPDF();
    
    // Add branding and title
    addCompanyBranding(doc);
    addDocumentTitle(doc, "Customer Sales Report");
    
    // Add customer information section
    addCustomerDetails(doc, customerData, salesData);
    
    // Add sales summary table and get the Y position after the table
    const startYPosition = addSalesSummaryTable(doc, salesData);
    
    // Add detailed transaction information
    addDetailedTransactions(doc, salesData, startYPosition);
    
    // Add page numbers and footer to all pages
    addPageFooters(doc);
    
    // Open PDF in new tab
    window.open(URL.createObjectURL(doc.output('blob')), '_blank');
    
    return true;
  } catch (error) {
    console.error("Error previewing PDF:", error);
    return false;
  }
}
