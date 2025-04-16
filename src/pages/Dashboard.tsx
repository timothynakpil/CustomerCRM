
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Users, MapPin, Calendar, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = isLoadingCustomers || isLoadingSales;

  // Get unique payment terms
  const paymentTermsCounts = customers?.reduce((acc, customer) => {
    const term = customer.payterm || 'Not specified';
    acc[term] = (acc[term] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Count sales by customer
  const salesByCustomer = sales?.reduce((acc, sale) => {
    if (sale.custno) {
      acc[sale.custno] = (acc[sale.custno] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const topCustomers = Object.entries(salesByCustomer)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([custno, count]) => {
      const customerDetails = customers?.find(c => c.custno === custno) || { custname: 'Unknown' };
      return {
        name: customerDetails.custname || 'Unknown',
        sales: count
      };
    });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Customer Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Customers</p>
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold">{customers?.length || 0}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Sales</p>
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold">{sales?.length || 0}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Terms</p>
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold">{Object.keys(paymentTermsCounts).length || 0}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-100 rounded-full">
                  <MapPin className="h-6 w-6 text-orange-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">With Address</p>
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold">
                      {customers?.filter(c => c.address && c.address.trim() !== '').length || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Sales</CardTitle>
              <CardDescription>Customers with the most sales transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : topCustomers.length > 0 ? (
                <ul className="space-y-2">
                  {topCustomers.map((customer, index) => (
                    <li key={index} className="flex items-center justify-between p-2 border-b last:border-0">
                      <span className="font-medium">{customer.name}</span>
                      <span className="text-sm font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {customer.sales} {customer.sales === 1 ? 'sale' : 'sales'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">No sales data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Terms Distribution</CardTitle>
              <CardDescription>Number of customers by payment terms</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
              ) : Object.keys(paymentTermsCounts).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(paymentTermsCounts).map(([term, count], index) => (
                    <li key={index} className="flex items-center justify-between p-2 border-b last:border-0">
                      <span className="font-medium">{term}</span>
                      <span className="text-sm font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {count} {count === 1 ? 'customer' : 'customers'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">No payment terms data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
