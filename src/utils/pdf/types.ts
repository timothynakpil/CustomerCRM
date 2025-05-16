
// PDF Types for customer reports
export interface CustomerData {
  custno: string;
  custname: string;
  address?: string;
  payterm?: string;
}

export interface TransactionDetail {
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

export interface TransactionData {
  transno: string;
  date: string;
  employee: string;
  totalAmount: string;
  details: TransactionDetail[];
}

// PDF styling constants
export const BRAND_COLORS = {
  primary: [155, 135, 245], // #9b87f5
  secondary: [126, 105, 171], // #7E69AB
  accent: [110, 89, 165], // #6E59A5
  dark: [26, 31, 44], // #1A1F2C
  light: [214, 188, 250], // #D6BCFA
  gray: [142, 145, 150], // #8E9196
};
