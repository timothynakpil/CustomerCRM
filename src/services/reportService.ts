
import { supabase } from "@/integrations/supabase/client";

export interface CustomerBasic {
  custno: string;
  custname: string;
}

export interface SalesTransaction {
  transno: string;
  salesdate: string;
  employee: {
    empno: string;
    firstname?: string;
    lastname?: string;
  } | null;
  salesdetail: SalesDetail[];
  [key: string]: any;
}

export interface SalesDetail {
  prodcode: string;
  quantity: number;
  product: {
    description?: string;
    unit?: string;
  };
  [key: string]: any;
}

export interface ProcessedTransaction {
  transno: string;
  date: string;
  employee: string;
  totalAmount: string;
  details: ProcessedDetail[];
  rawDate: string;
}

export interface ProcessedDetail {
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
  [key: string]: any;
}

export const getCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from("customer")
      .select("custno, custname")
      .order("custname");
      
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { data: [], error };
  }
};

export const getCustomerData = async (custno: string) => {
  try {
    const { data, error } = await supabase
      .from("customer")
      .select("*")
      .eq("custno", custno)
      .single();
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return { data: null, error };
  }
};

export const getCustomerSales = async (custno: string) => {
  try {
    const { data, error } = await supabase
      .from("sales")
      .select(`
        transno,
        salesdate,
        employee (empno, firstname, lastname),
        salesdetail (
          prodcode,
          quantity,
          product (description, unit)
        )
      `)
      .eq("custno", custno)
      .order("salesdate", { ascending: false });
      
    if (error) throw error;
    return { data: data as SalesTransaction[] || [], error: null };
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return { data: [], error };
  }
};

export const getLatestProductPrices = async (productCodes: string[]) => {
  const priceMap = new Map();
  
  for (const prodcode of productCodes) {
    try {
      const { data } = await supabase
        .from("pricehist")
        .select("unitprice, effdate")
        .eq("prodcode", prodcode)
        .order("effdate", { ascending: false })
        .limit(1);
        
      if (data && data.length > 0) {
        priceMap.set(prodcode, data[0].unitprice);
      }
    } catch (error) {
      console.error(`Error fetching price for ${prodcode}:`, error);
    }
  }
  
  return priceMap;
};

export const processSalesData = (salesData: SalesTransaction[], priceMap: Map<string, number>) => {
  return salesData.map((sale) => {
    const empName = sale.employee 
      ? `${sale.employee.firstname || ''} ${sale.employee.lastname || ''}`.trim() || 'N/A' 
      : 'N/A';
      
    // Calculate total for each transaction
    let total = 0;
    
    const enrichedDetails = [];
    if (sale.salesdetail && Array.isArray(sale.salesdetail)) {
      for (const detail of sale.salesdetail) {
        const price = priceMap.get(detail.prodcode) || 0;
        const quantity = detail.quantity || 0;
        const subtotal = price * quantity;
        total += subtotal;
        
        enrichedDetails.push({
          ...detail,
          pricehist: { unitprice: price },
          subtotal
        });
      }
    }
    
    return {
      transno: sale.transno,
      date: new Date(sale.salesdate).toLocaleDateString(),
      employee: empName,
      totalAmount: total.toFixed(2),
      details: enrichedDetails,
      rawDate: sale.salesdate
    };
  });
};

export const extractProductCodes = (salesData: SalesTransaction[]) => {
  const productCodes: string[] = [];
  
  salesData.forEach((sale) => {
    if (sale.salesdetail && Array.isArray(sale.salesdetail)) {
      sale.salesdetail.forEach((detail) => {
        if (detail.prodcode && !productCodes.includes(detail.prodcode)) {
          productCodes.push(detail.prodcode);
        }
      });
    }
  });
  
  return productCodes;
};
