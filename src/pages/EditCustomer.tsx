
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Lock } from "lucide-react";

// Form schema (now matches AddCustomer)
const formSchema = z.object({
  custname: z.string().min(1, "Customer name is required"),
  address: z.string().optional(),
  payterm: z.enum(["30D", "45D", "COD"], {
    required_error: "Payment Terms is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const EditCustomer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(true);
  const { user } = useAuth();
  const [isUserBlocked, setIsUserBlocked] = useState(false);

  // Check if user is blocked
  useEffect(() => {
    const checkUserRole = async () => {
      if (user?.user_metadata?.role === "blocked") {
        setIsUserBlocked(true);
        toast({
          title: "Access Restricted",
          description: "Your account is blocked from making changes to customer data.",
          variant: "destructive",
        });
      }
    };
    
    checkUserRole();
  }, [user, toast]);

  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      custname: "",
      address: "",
      payterm: undefined,
    },
  });

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("customer")
          .select("*")
          .eq("custno", id)
          .single();

        if (error) throw error;

        if (data) {
          form.reset({
            custname: data.custname || "",
            address: data.address || "",
            payterm: data.payterm as "30D" | "45D" | "COD" || undefined,
          });
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive",
        });
        navigate("/customers");
      } finally {
        setIsLoadingCustomer(false);
      }
    };

    fetchCustomer();
  }, [id, navigate, toast, form]);

  const onSubmit = async (data: FormValues) => {
    if (!id || isUserBlocked) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("customer")
        .update({
          custname: data.custname,
          address: data.address || null,
          payterm: data.payterm,
        })
        .eq("custno", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer updated successfully",
      });

      navigate(`/customers/${id}`);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCustomer) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading customer data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Customer</h1>
          
          {isUserBlocked && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center text-red-700">
              <Lock className="mr-2 h-4 w-4" />
              <span className="text-sm">Your account is blocked from making changes</span>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-md border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display only, not editable */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Customer ID</label>
                  <Input
                    value={id}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-sm text-gray-500">Customer ID cannot be changed</p>
                </div>

                <FormField
                  control={form.control}
                  name="custname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter customer name" 
                          {...field} 
                          disabled={isUserBlocked}
                          className={isUserBlocked ? "bg-gray-100" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter address" 
                          {...field} 
                          disabled={isUserBlocked}
                          className={isUserBlocked ? "bg-gray-100" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payterm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading || isUserBlocked}
                      >
                        <FormControl>
                          <SelectTrigger className={isUserBlocked ? "bg-gray-100" : ""}>
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="30D">30D</SelectItem>
                          <SelectItem value="45D">45D</SelectItem>
                          <SelectItem value="COD">COD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate(`/customers/${id}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || isUserBlocked}
                  className={isUserBlocked ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {isLoading ? "Updating..." : "Update Customer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditCustomer;
