
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

export const generateCustomerSalesPDF = (customer: CustomerData, sales: TransactionData[]) => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Customer Sales Report", 14, 22);
    
    // Add customer details
    doc.setFontSize(12);
    doc.text(`Customer: ${customer.custname} (${customer.custno})`, 14, 32);
    doc.text(`Address: ${customer.address || 'N/A'}`, 14, 38);
    doc.text(`Payment Terms: ${customer.payterm || 'N/A'}`, 14, 44);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 50);
    
    // Add sales summary table
    doc.setFontSize(14);
    doc.text("Sales Transactions", 14, 60);
    
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
      startY: 65,
      margin: { top: 10 },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Add detailed transactions
    let yPos = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text("Transaction Details", 14, yPos);
    yPos += 10;
    
    sales.forEach((sale, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`Transaction #${sale.transno} - ${sale.date}`, 14, yPos);
      yPos += 5;
      
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
        styles: { fontSize: 9 },
        headStyles: { fillColor: [52, 152, 219] }
      });
      
      yPos = doc.lastAutoTable.finalY + (index < sales.length - 1 ? 15 : 5);
    });
    
    // Save the PDF
    doc.save(`${customer.custno}_Sales_Report.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};
