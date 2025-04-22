
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Define form schema
const formSchema = z.object({
  custno: z.string(),
  custname: z.string().min(1, "Customer name is required"),
  address: z.string().optional(),
  payterm: z.enum(["30D", "45D", "COD"], {
    required_error: "Payment Terms is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const AddCustomer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [nextCustNo, setNextCustNo] = useState("");

  // Fetch and calculate next customer number
  useEffect(() => {
    const fetchNextCustNo = async () => {
      const { data, error } = await supabase
        .from("customer")
        .select("custno")
        .order("custno", { ascending: false })
        .limit(1);

      if (error) {
        setNextCustNo("C0001");
        return;
      }

      if (data && data.length > 0) {
        // Get numeric part
        const last = data[0].custno;
        const series = last.replace(/^[A-Za-z]+/, "");
        const nextNum = String(parseInt(series, 10) + 1).padStart(series.length, "0");
        setNextCustNo(`C${nextNum}`);
      } else {
        setNextCustNo("C0001");
      }
    };
    fetchNextCustNo();
  }, []);

  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      custno: "",
      custname: "",
      address: "",
      payterm: undefined,
    },
  });

  useEffect(() => {
    if (nextCustNo) {
      form.setValue("custno", nextCustNo);
    }
    // eslint-disable-next-line
  }, [nextCustNo]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Insert new customer
      const { error } = await supabase.from("customer").insert({
        custno: data.custno,
        custname: data.custname,
        address: data.address || null,
        payterm: data.payterm,
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
                        <Input
                          {...field}
                          disabled
                          value={nextCustNo || ""}
                          placeholder="Auto-generated"
                        />
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
                      <FormLabel>Payment Terms *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                  onClick={() => navigate("/customers")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !nextCustNo}>
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
