
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerBasic } from "@/services/reportService";

const formSchema = z.object({
  custno: z.string().min(1, "Please select a customer"),
});

type FormData = z.infer<typeof formSchema>;

interface CustomerSalesFormProps {
  customers: CustomerBasic[];
  isLoading: boolean;
  isGenerating: boolean;
  onSubmit: (data: FormData) => void;
}

const CustomerSalesForm = ({ 
  customers, 
  isLoading, 
  isGenerating, 
  onSubmit 
}: CustomerSalesFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      custno: "",
    },
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Customer Sales Report</CardTitle>
        <CardDescription>
          Select a customer to generate a sales report in PDF format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="custno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Customer</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.custno} value={customer.custno}>
                          {customer.custname} ({customer.custno})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>Generating Report...</>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF Report
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CustomerSalesForm;
