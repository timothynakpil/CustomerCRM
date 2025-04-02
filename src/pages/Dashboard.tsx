
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, BarChart3, AlertTriangle, PlusCircle } from "lucide-react";
import { getProducts, getProductHistory, Product, ProductHistory } from "../utils/productStore";

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<ProductHistory[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const fetchData = () => {
      const productData = getProducts();
      const historyData = getProductHistory();
      
      // Sort history by most recent
      const sortedHistory = [...historyData].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setProducts(productData);
      setHistory(sortedHistory.slice(0, 5)); // Just show 5 most recent events
      
      // Calculate total inventory value
      const total = productData.reduce((sum, product) => sum + (product.price * product.stock), 0);
      setTotalValue(total);
      
      // Count products with low stock (less than 15 units)
      const lowStock = productData.filter(product => product.stock < 15).length;
      setLowStockCount(lowStock);
    };
    
    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link to="/products/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Items in inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Total product value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(products.map(p => p.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Product categories
            </p>
          </CardContent>
        </Card>
        
        <Card className={`${lowStockCount > 0 ? "border-orange-300 bg-orange-50" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Products running low
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest product updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item) => {
                  const product = products.find(p => p.id === item.productId) || { name: "Unknown Product" };
                  
                  return (
                    <div key={item.id} className="flex items-start space-x-4">
                      <div className="rounded-full p-2 bg-primary/10">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
            <CardDescription>Products that need to be restocked soon</CardDescription>
          </CardHeader>
          <CardContent>
            {products.filter(p => p.stock < 15).length > 0 ? (
              <div className="space-y-4">
                {products
                  .filter(p => p.stock < 15)
                  .sort((a, b) => a.stock - b.stock)
                  .slice(0, 5)
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Link to={`/products/${product.id}`} className="text-sm font-medium hover:underline">
                          {product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        product.stock < 5 
                          ? "bg-red-100 text-red-800" 
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {product.stock} left
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No products with low stock</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
