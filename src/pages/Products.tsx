
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  PackagePlus, 
  Package 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Define Product interface based on Supabase product table
interface Product {
  id?: string;
  prodcode: string;
  description: string;
  unit: string;
  category?: string;
  stock?: number;
  price?: number;
  sku?: string;
  createdAt?: string;
  updatedAt?: string;
  name?: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('product')
          .select('*');
        
        if (error) {
          throw error;
        }

        // Transform the data to match our Product interface
        const transformedProducts = data.map(product => ({
          prodcode: product.prodcode,
          description: product.description || 'Unnamed Product',
          unit: product.unit || 'N/A',
          name: product.description || 'Unnamed Product', // Use description as name
          stock: 0, // Default stock value
          price: 0, // Default price value
          sku: product.prodcode, // Use prodcode as SKU
          category: 'Uncategorized' // Default category
        }));

        setProducts(transformedProducts);
        
        // Extract unique categories (in this case they're all 'Uncategorized')
        const uniqueCategories = ['Uncategorized'];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error fetching products",
          description: "Could not fetch products from the database",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = 
        (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (product.prodcode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      const matchesCategory = categoryFilter === "all" ? true : product.category === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === "low") {
        matchesStock = (product.stock || 0) < 15;
      } else if (stockFilter === "out") {
        matchesStock = (product.stock || 0) === 0;
      } else if (stockFilter === "in") {
        matchesStock = (product.stock || 0) > 0;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.name || '').localeCompare(b.name || '');
        case "name-desc":
          return (b.name || '').localeCompare(a.name || '');
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "stock-asc":
          return (a.stock || 0) - (b.stock || 0);
        case "stock-desc":
          return (b.stock || 0) - (a.stock || 0);
        default:
          return 0;
      }
    });

  const formatPrice = (price: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Link to="/products/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-1 flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <Select value={stockFilter} onValueChange={setStockFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Stock Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stock Levels</SelectItem>
                        <SelectItem value="in">In Stock</SelectItem>
                        <SelectItem value="low">Low Stock</SelectItem>
                        <SelectItem value="out">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                        <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                        <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                        <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
                        <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.prodcode}>
                          <TableCell className="font-medium">{product.prodcode}</TableCell>
                          <TableCell>{product.description}</TableCell>
                          <TableCell>{product.unit}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link to={`/products/${product.prodcode}`}>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                </Link>
                                <Link to={`/products/edit/${product.prodcode}`}>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem>
                                  <PackagePlus className="mr-2 h-4 w-4" />
                                  Update Stock
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || categoryFilter !== "all" || stockFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first product"}
                  </p>
                  {!searchTerm && categoryFilter === "all" && stockFilter === "all" && (
                    <Link to="/products/add">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
