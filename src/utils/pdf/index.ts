
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { CustomerData } from "./types";
import { generateCustomerSalesPdf, previewCustomerSalesPdf } from "../pdfGenerator";

// Export the functions that are referenced in Reports.tsx
export {
  generateCustomerSalesPdf,
  previewCustomerSalesPdf
};
