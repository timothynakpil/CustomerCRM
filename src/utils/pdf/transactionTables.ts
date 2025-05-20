
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Ensure autotable is properly imported
import { TransactionData, BRAND_COLORS } from "./types";

/**
 * Adds sales summary table to the PDF
 */
export const addSalesSummaryTable = (doc: jsPDF, sales: TransactionData[]): number => {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Sales Transactions", 14, 75);
  
  const tableColumns = ["Transaction #", "Date", "Employee", "Total Amount"];
  const tableRows = sales.map((sale) => [
    sale.transno,
    sale.date,
    sale.employee,
    `$${sale.totalAmount}`
  ]);
  
  // Ensure the document has the autoTable method
  if (typeof doc.autoTable !== 'function') {
    console.error('jspdf-autotable not properly loaded');
    return 100; // Return a default Y position to avoid errors
  }
  
  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    startY: 80,
    margin: { top: 10 },
    styles: { 
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: { 
      fillColor: BRAND_COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });
  
  return doc.lastAutoTable.finalY + 15;
}

/**
 * Adds detailed transaction tables to the PDF
 */
export const addDetailedTransactions = (doc: jsPDF, sales: TransactionData[], startY: number): void => {
  let yPos = startY;
  
  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Transaction Details", 14, yPos);
  yPos += 10;
  
  // Ensure we don't process too many transactions that might cause performance issues
  const maxTransactionsToShow = Math.min(sales.length, 50); // Limit to 50 transactions
  
  for (let i = 0; i < maxTransactionsToShow; i++) {
    const sale = sales[i];
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    
    // Transaction header with colored background
    doc.setFillColor(BRAND_COLORS.light[0], BRAND_COLORS.light[1], BRAND_COLORS.light[2]);
    doc.rect(14, yPos - 5, 182, 8, "F");
    doc.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
    doc.text(`Transaction #${sale.transno} - ${sale.date}`, 16, yPos);
    yPos += 8;
    
    // Ensure we have transaction details before trying to render them
    if (!sale.details || sale.details.length === 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("No transaction details available", 14, yPos + 5);
      yPos += 15;
      continue;
    }
    
    const detailColumns = ["Product", "Description", "Quantity", "Unit Price", "Subtotal"];
    const detailRows = sale.details.map((detail) => {
      const price = detail.pricehist?.unitprice || 0;
      const quantity = detail.quantity || 0;
      const subtotal = detail.subtotal || 0;
      
      return [
        detail.prodcode || 'N/A',
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
      styles: { 
        fontSize: 9,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: BRAND_COLORS.secondary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        4: { fontStyle: 'bold' }
      }
    });
    
    yPos = doc.lastAutoTable.finalY + (i < maxTransactionsToShow - 1 ? 20 : 5);
  }
  
  // If there are more transactions than shown, add a note
  if (sales.length > maxTransactionsToShow) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Note: Only showing ${maxTransactionsToShow} of ${sales.length} transactions in this report.`, 14, yPos + 10);
  }
}
