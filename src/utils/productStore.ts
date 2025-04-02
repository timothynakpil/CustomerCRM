
export interface ProductHistory {
  id: string;
  productId: string;
  timestamp: string;
  action: "created" | "updated" | "price_changed" | "stock_changed";
  details: string;
  userId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

// Initial mock data
const initialProducts: Product[] = [
  {
    id: "prod_1",
    name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones with 20-hour battery life",
    price: 199.99,
    stock: 45,
    category: "Electronics",
    sku: "WH-1000XM4",
    createdAt: "2023-06-15T10:00:00Z",
    updatedAt: "2023-06-15T10:00:00Z",
  },
  {
    id: "prod_2",
    name: "Smart Watch",
    description: "Fitness tracker with heart rate monitoring and sleep analysis",
    price: 249.99,
    stock: 28,
    category: "Wearables",
    sku: "SW-GT2-PRO",
    createdAt: "2023-07-22T14:30:00Z",
    updatedAt: "2023-10-05T09:15:00Z",
  },
  {
    id: "prod_3",
    name: "Ergonomic Office Chair",
    description: "Adjustable office chair with lumbar support and breathable mesh",
    price: 179.99,
    stock: 15,
    category: "Furniture",
    sku: "EOC-X5",
    createdAt: "2023-08-03T11:20:00Z",
    updatedAt: "2023-08-03T11:20:00Z",
  },
  {
    id: "prod_4",
    name: "Professional Camera",
    description: "24.2MP mirrorless camera with 4K video recording",
    price: 1299.99,
    stock: 10,
    category: "Photography",
    sku: "PC-A7III",
    createdAt: "2023-05-12T16:45:00Z",
    updatedAt: "2023-09-18T13:10:00Z",
  },
  {
    id: "prod_5",
    name: "Coffee Maker",
    description: "Programmable coffee maker with thermal carafe",
    price: 89.99,
    stock: 32,
    category: "Kitchen Appliances",
    sku: "CM-5000",
    createdAt: "2023-09-01T08:30:00Z",
    updatedAt: "2023-09-01T08:30:00Z",
  },
];

const initialHistory: ProductHistory[] = [
  {
    id: "hist_1",
    productId: "prod_1",
    timestamp: "2023-06-15T10:00:00Z",
    action: "created",
    details: "Product created with initial stock of 50",
    userId: "usr_admin",
  },
  {
    id: "hist_2",
    productId: "prod_1",
    timestamp: "2023-09-20T14:25:00Z",
    action: "stock_changed",
    details: "Stock reduced from 50 to 45",
    userId: "usr_admin",
  },
  {
    id: "hist_3",
    productId: "prod_2",
    timestamp: "2023-07-22T14:30:00Z",
    action: "created",
    details: "Product created with initial stock of 30",
    userId: "usr_admin",
  },
  {
    id: "hist_4",
    productId: "prod_2",
    timestamp: "2023-10-05T09:15:00Z",
    action: "stock_changed",
    details: "Stock reduced from 30 to 28",
    userId: "usr_admin",
  },
  {
    id: "hist_5",
    productId: "prod_3",
    timestamp: "2023-08-03T11:20:00Z",
    action: "created",
    details: "Product created with initial stock of 15",
    userId: "usr_admin",
  },
  {
    id: "hist_6",
    productId: "prod_4",
    timestamp: "2023-05-12T16:45:00Z",
    action: "created",
    details: "Product created with initial stock of 12",
    userId: "usr_admin",
  },
  {
    id: "hist_7",
    productId: "prod_4",
    timestamp: "2023-09-18T13:10:00Z",
    action: "stock_changed",
    details: "Stock reduced from 12 to 10",
    userId: "usr_admin",
  },
  {
    id: "hist_8",
    productId: "prod_5",
    timestamp: "2023-09-01T08:30:00Z",
    action: "created",
    details: "Product created with initial stock of 32",
    userId: "usr_admin",
  },
];

// Check and initialize data in localStorage
const initializeStore = () => {
  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem("productHistory")) {
    localStorage.setItem("productHistory", JSON.stringify(initialHistory));
  }
};

// Initialize data on module load
initializeStore();

// Product CRUD operations
export const getProducts = (): Product[] => {
  const products = localStorage.getItem("products");
  return products ? JSON.parse(products) : [];
};

export const getProduct = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(product => product.id === id);
};

export const addProduct = (product: Omit<Product, "id" | "createdAt" | "updatedAt">): Product => {
  const products = getProducts();
  const now = new Date().toISOString();
  
  const newProduct: Product = {
    ...product,
    id: "prod_" + Math.random().toString(36).substring(2, 11),
    createdAt: now,
    updatedAt: now,
  };
  
  products.push(newProduct);
  localStorage.setItem("products", JSON.stringify(products));
  
  // Add creation history
  addProductHistory({
    productId: newProduct.id,
    action: "created",
    details: `Product created with initial stock of ${newProduct.stock}`,
    userId: "usr_current", // In a real app, this would be the current user's ID
  });
  
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>): Product | undefined => {
  const products = getProducts();
  const index = products.findIndex(product => product.id === id);
  
  if (index === -1) return undefined;
  
  const oldProduct = products[index];
  const updatedProduct = {
    ...oldProduct,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  products[index] = updatedProduct;
  localStorage.setItem("products", JSON.stringify(products));
  
  // Add update history
  if (updates.price !== undefined && updates.price !== oldProduct.price) {
    addProductHistory({
      productId: id,
      action: "price_changed",
      details: `Price changed from $${oldProduct.price} to $${updates.price}`,
      userId: "usr_current",
    });
  }
  
  if (updates.stock !== undefined && updates.stock !== oldProduct.stock) {
    addProductHistory({
      productId: id,
      action: "stock_changed",
      details: `Stock changed from ${oldProduct.stock} to ${updates.stock}`,
      userId: "usr_current",
    });
  }
  
  // General update history
  addProductHistory({
    productId: id,
    action: "updated",
    details: "Product details updated",
    userId: "usr_current",
  });
  
  return updatedProduct;
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const newProducts = products.filter(product => product.id !== id);
  
  if (newProducts.length === products.length) return false;
  
  localStorage.setItem("products", JSON.stringify(newProducts));
  return true;
};

// Product History operations
export const getProductHistory = (productId?: string): ProductHistory[] => {
  const history = localStorage.getItem("productHistory");
  const allHistory = history ? JSON.parse(history) : [];
  
  if (productId) {
    return allHistory.filter((item: ProductHistory) => item.productId === productId);
  }
  
  return allHistory;
};

export const addProductHistory = (
  history: Omit<ProductHistory, "id" | "timestamp">
): ProductHistory => {
  const allHistory = getProductHistory();
  
  const newHistory: ProductHistory = {
    ...history,
    id: "hist_" + Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
  };
  
  allHistory.push(newHistory);
  localStorage.setItem("productHistory", JSON.stringify(allHistory));
  
  return newHistory;
};
