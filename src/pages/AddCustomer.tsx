
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
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

// Define form schema
const formSchema = z.object({
  custno: z.string().min(1, "Customer ID is required"),
  custname: z.string().min(1, "Customer name is required"),
  address: z.string().optional(),
  payterm: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddCustomer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      custno: "",
      custname: "",
      address: "",
      payterm: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Check if customer ID already exists
      const { data: existingCustomer, error: checkError } = await supabase
        .from("customer")
        .select("custno")
        .eq("custno", data.custno)
        .single();

      if (existingCustomer) {
        toast({
          title: "Error",
          description: "Customer ID already exists",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Insert new customer
      const { error } = await supabase
        .from("customer")
        .insert({
          custno: data.custno,
          custname: data.custname,
          address: data.address || null,
          payterm: data.payterm || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      
      navigate("/customers");
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Add New Customer</h1>
        </div>
        
        <div className="bg-white p-6 rounded-md border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="custno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="custname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name" {...field} />
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
                        <Input placeholder="Enter address" {...field} />
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
                      <FormLabel>Payment Terms</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter payment terms" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => navigate("/customers")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Customer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddCustomer;
