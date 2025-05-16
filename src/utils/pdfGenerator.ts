
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Need to extend jsPDF types for autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface CustomerData {
  custno: string;
  custname: string;
  address?: string;
  payterm?: string;
}

interface TransactionDetail {
  prodcode: string;
  quantity: number;
  product?: {
    description?: string;
    unit?: string;
  };
  pricehist?: {
    unitprice: number;
  };
  subtotal: number;
}

interface TransactionData {
  transno: string;
  date: string;
  employee: string;
  totalAmount: string;
  details: TransactionDetail[];
}

// Company brand colors
const BRAND_COLORS = {
  primary: [155, 135, 245], // #9b87f5
  secondary: [126, 105, 171], // #7E69AB
  accent: [110, 89, 165], // #6E59A5
  dark: [26, 31, 44], // #1A1F2C
  light: [214, 188, 250], // #D6BCFA
  gray: [142, 145, 150], // #8E9196
};

export const generateCustomerSalesPDF = (customer: CustomerData, sales: TransactionData[]) => {
  try {
    // Create PDF document with company branding
    const doc = new jsPDF();
    
    // Add company logo placeholder (you would replace this with actual logo)
    doc.setFillColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
    doc.rect(14, 10, 30, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("COMPANY", 17, 16.5);
    
    // Reset text color for rest of the document
    doc.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
    
    // Add title with primary brand color
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Sales Report", 50, 20);
    
    // Add a decorative line
    doc.setDrawColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 24, 196, 24);
    
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
    doc.setDrawColor(BRAND_COLORS.gray[0], BRAND_COLORS.gray[1], BRAND_COLORS.gray[2]);
    doc.setLineWidth(0.2);
    doc.line(14, 65, 196, 65);
    
    // Add sales summary table with improved styling
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
    
    // Add detailed transactions
    let yPos = doc.lastAutoTable.finalY + 15;
    
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
    
    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const pageText = `Page ${i} of ${pageCount}`;
      doc.text(pageText, 196 - (doc.getTextWidth(pageText)), 285);
      
      // Add footer line
      doc.setDrawColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
      doc.setLineWidth(0.1);
      doc.line(14, 280, 196, 280);
      
      // Add footer text
      doc.setFontSize(8);
      doc.setTextColor(BRAND_COLORS.gray[0], BRAND_COLORS.gray[1], BRAND_COLORS.gray[2]);
      doc.text("Company Name, Inc. | 123 Business St, City, State 12345 | (555) 123-4567", 14, 285);
    }
    
    // Save the PDF
    doc.save(`${customer.custno}_Sales_Report.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};
