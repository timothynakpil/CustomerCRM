
import { jsPDF } from "jspdf";
import { BRAND_COLORS } from "./types";

// Update the declaration to make TypeScript happy
declare global {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * Adds company branding elements to the PDF document
 */
export const addCompanyBranding = (doc: jsPDF): void => {
  // Add company logo placeholder
  doc.setFillColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
  doc.rect(14, 10, 30, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("COMPANY", 17, 16.5);
  
  // Reset text color for rest of the document
  doc.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
}

/**
 * Adds a title with decorative elements to the PDF
 */
export const addDocumentTitle = (doc: jsPDF, title: string): void => {
  // Add title with primary brand color
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(title, 50, 20);
  
  // Add a decorative line
  doc.setDrawColor(BRAND_COLORS.primary[0], BRAND_COLORS.primary[1], BRAND_COLORS.primary[2]);
  doc.setLineWidth(0.5);
  doc.line(14, 24, 196, 24);
}

/**
 * Adds page numbers and footer to all pages of the document
 */
export const addPageFooters = (doc: jsPDF): void => {
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
}
