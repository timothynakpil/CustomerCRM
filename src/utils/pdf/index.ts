import { CustomerData, JsPDFWithPlugin, ProductData, Transaction } from './types';
import { createCustomerSection } from './customerSection';
import { createTransactionTables } from './transactionTables';

export function createBaseDocument(): JsPDFWithPlugin {
  const jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add header with logo and company name
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("CustomerCRM", 14, 10);
  doc.text("Generated on: " + new Date().toLocaleDateString(), 195, 10, { align: "right" });
  
  // Add footer with page number
  const totalPages = 1;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Page ${1} of ${totalPages}`, 195, 287, { align: "right" });
  
  return doc;
}

export function generateCustomerSalesPdf(
  customer: CustomerData,
  transactions: Transaction[],
  startDate: string,
  endDate: string
) {
  const doc = createBaseDocument();
  
  // Add title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Customer Sales Report", 105, 20, { align: "center" });
  
  // Add report period
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Report Period: ${startDate} to ${endDate}`, 105, 28, { align: "center" });
  
  // Add customer information
  createCustomerSection(doc, customer, 14);
  
  // Add transaction table
  if (transactions.length > 0) {
    doc.text("Transaction History", 14, 70);
    createTransactionTables(doc, transactions, 75);
  } else {
    doc.text("No transactions found for this customer in the selected date range.", 14, 70);
  }
  
  return doc;
}

export function generateProductSalesPdf(
  product: ProductData,
  transactions: Transaction[],
  startDate: string,
  endDate: string
) {
  const doc = createBaseDocument();
  
  // Add title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Product Sales Report", 105, 20, { align: "center" });
  
  // Add report period
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Report Period: ${startDate} to ${endDate}`, 105, 28, { align: "center" });
  
  // Add product information
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Product Information", 14, 40);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Product ID: ${product.id}`, 14, 50);
  doc.text(`Name: ${product.name}`, 14, 55);
  doc.text(`Category: ${product.category}`, 14, 60);
  doc.text(`Price: $${product.price}`, 14, 65);
  
  // Add transaction table
  if (transactions.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Transaction History", 14, 80);
    createTransactionTables(doc, transactions, 85);
  } else {
    doc.text("No transactions found for this product in the selected date range.", 14, 80);
  }
  
  return doc;
}

export function generateSalesReportPdf(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
  totalSales: number,
  topProducts: { name: string; sales: number }[],
  topCustomers: { name: string; sales: number }[]
) {
  const doc = createBaseDocument();
  
  // Add title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Sales Report", 105, 20, { align: "center" });
  
  // Add report period
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Report Period: ${startDate} to ${endDate}`, 105, 28, { align: "center" });
  
  // Add summary information
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Sales Summary", 14, 40);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Total Sales: $${totalSales.toFixed(2)}`, 14, 50);
  doc.text(`Number of Transactions: ${transactions.length}`, 14, 55);
  
  // Add top products
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Top Products", 14, 70);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  topProducts.forEach((product, index) => {
    doc.text(`${index + 1}. ${product.name}: $${product.sales.toFixed(2)}`, 14, 80 + (index * 5));
  });
  
  // Add top customers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Top Customers", 120, 70);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  topCustomers.forEach((customer, index) => {
    doc.text(`${index + 1}. ${customer.name}: $${customer.sales.toFixed(2)}`, 120, 80 + (index * 5));
  });
  
  // Add transaction table
  if (transactions.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Recent Transactions", 14, 120);
    createTransactionTables(doc, transactions.slice(0, 10), 125);
  }
  
  return doc;
}
