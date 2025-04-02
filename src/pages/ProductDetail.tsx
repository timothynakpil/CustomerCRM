
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct, getProductHistory, Product, ProductHistory } from "../utils/productStore";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Clock, 
  PackagePlus, 
  Info, 
  Package, 
  Tag, 
  AlertCircle 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<ProductHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const productData = getProduct(id);
      const historyData = getProductHistory(id);
      
      // Sort history by most recent first
      const sortedHistory = [...historyData].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setProduct(productData || null);
      setHistory(sortedHistory);
      setLoading(false);
    }
  }, [id]);

  const handleDelete = () => {
    // This would actually call the delete function in a real implementation
    toast({
      title: "Product deleted",
      description: "The product has been deleted successfully",
    });
    navigate("/products");
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Get color for stock status
  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return "text-red-500 bg-red-50";
    if (stock < 15) return "text-orange-500 bg-orange-50";
    return "text-green-500 bg-green-50";
  };

  // Get text for stock status
  const getStockStatusText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 15) return "Low Stock";
    return "In Stock";
  };

  // Get icon for history action
  const getHistoryIcon = (action: string) => {
    switch (action) {
      case "created":
        return <PackagePlus className="h-4 w-4" />;
      case "updated":
        return <Edit className="h-4 w-4" />;
      case "price_changed":
        return <Tag className="h-4 w-4" />;
      case "stock_changed":
        return <Package className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-center mb-2">Product Not Found</h1>
        <p className="text-muted-foreground text-center mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/products">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
      </div>
      
      <div className="flex justify-between">
        <div className="space-x-2">
          <Link to={`/products/edit/${product.id}`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Button>
          </Link>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Product
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product
                and all of its history from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Basic information about the product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p>{product.description}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">SKU</h3>
                  <p className="font-medium">{product.sku}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                  <p className="font-medium">{product.category}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Price</h3>
                  <p className="text-xl font-bold">{formatPrice(product.price)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Stock Status</h3>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full ${getStockStatusColor(product.stock)} text-xs font-semibold mr-2`}>
                      {getStockStatusText(product.stock)}
                    </span>
                    <span className="font-bold">{product.stock} units</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{formatDate(product.createdAt)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{formatDate(product.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Product History</CardTitle>
            <CardDescription>Timeline of changes and events</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`mr-2 rounded-full p-1 ${
                              item.action === "created" ? "bg-green-100 text-green-600" :
                              item.action === "price_changed" ? "bg-blue-100 text-blue-600" :
                              item.action === "stock_changed" ? "bg-orange-100 text-orange-600" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {getHistoryIcon(item.action)}
                            </div>
                            <span className="capitalize">
                              {item.action.replace("_", " ")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{item.details}</TableCell>
                        <TableCell>{formatDate(item.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium">No history available</h3>
                <p className="text-sm text-muted-foreground">
                  The product history will appear here after changes are made
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;
