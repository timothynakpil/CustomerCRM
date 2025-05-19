
import { jsPDF } from "jspdf";
import "jspdf-autotable";
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
  
  sales.forEach((sale, index) => {
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
    
    const detailColumns = ["Product", "Description", "Quantity", "Unit Price", "Subtotal"];
    const detailRows = sale.details.map((detail) => {
      const price = detail.pricehist?.unitprice || 0;
      const quantity = detail.quantity || 0;
      const subtotal = detail.subtotal;
      
      return [
        detail.prodcode,
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
    
    yPos = doc.lastAutoTable.finalY + (index < sales.length - 1 ? 20 : 5);
  });
}
