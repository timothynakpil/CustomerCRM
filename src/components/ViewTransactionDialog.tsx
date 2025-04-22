
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface ViewTransactionDialogProps {
  transno: string;
  children: React.ReactNode;
}

type TransactionDetail = {
  transno: string;
  salesdate: string;
  employee_name: string;
  total_amount: number;
  details: {
    prodcode: string;
    product_description: string;
    unit: string | null;
    quantity: number;
    unitprice: number;
    subtotal: number;
  }[];
};

const ViewTransactionDialog = ({ transno, children }: ViewTransactionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const fetchTransaction = async () => {
      // Fetch transaction details including employee and items
      // 1. Fetch sales transaction + employee name
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .select(
          `
          transno,
          salesdate,
          empno,
          employee:empno (
            firstname,
            lastname
          )
        `
        )
        .eq("transno", transno)
        .maybeSingle();

      if (saleError || !sale) {
        setIsLoading(false);
        setTransaction(null);
        return;
      }
      const employee_name = sale.employee
        ? [sale.employee.firstname, sale.employee.lastname].filter(Boolean).join(" ")
        : "N/A";

      // 2. Fetch salesdetails (products, quantity) for the transaction
      const { data: details, error: detailsError } = await supabase
        .from("salesdetail")
        .select("prodcode, quantity")
        .eq("transno", transno);

      if (detailsError || !details) {
        setIsLoading(false);
        setTransaction(null);
        return;
      }

      // For each salesdetail, fetch product description, unit, and latest price in pricehist
      const items = await Promise.all(
        details.map(async (item) => {
          // get product info
          const { data: product } = await supabase
            .from("product")
            .select("description, unit")
            .eq("prodcode", item.prodcode)
            .maybeSingle();

          // get unit price: fetch pricehist for prodcode with max effdate <= salesdate
          let unitprice = 0;
          if (sale.salesdate) {
            const { data: price } = await supabase
              .from("pricehist")
              .select("unitprice")
              .eq("prodcode", item.prodcode)
              .lte("effdate", sale.salesdate)
              .order("effdate", { ascending: false })
              .limit(1)
              .maybeSingle();

            unitprice = price?.unitprice ?? 0;
          }

          const subtotal = (item.quantity || 0) * (unitprice || 0);

          return {
            prodcode: item.prodcode,
            product_description: product?.description || "",
            unit: product?.unit || null,
            quantity: item.quantity || 0,
            unitprice: unitprice || 0,
            subtotal,
          };
        })
      );

      const total_amount = items.reduce((sum, x) => sum + x.subtotal, 0);

      setTransaction({
        transno: sale.transno,
        salesdate: sale.salesdate,
        employee_name,
        total_amount,
        details: items,
      });
      setIsLoading(false);
    };
    fetchTransaction();
  }, [isOpen, transno]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? `Transaction #: ${transaction.transno}, Date: ${transaction.salesdate ? new Date(transaction.salesdate).toLocaleDateString() : "N/A"}, Employee: ${transaction.employee_name}`
              : isLoading
                ? "Loading..."
                : "Transaction not found"}
          </DialogDescription>
        </DialogHeader>
        {transaction && (
          <>
            <div className="py-2 text-right font-bold">
              Total Amount:{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
              }).format(transaction.total_amount)}
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.details.map((item) => (
                    <TableRow key={item.prodcode}>
                      <TableCell>{item.prodcode}</TableCell>
                      <TableCell>{item.product_description}</TableCell>
                      <TableCell>{item.unit || ""}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD"
                        }).format(item.unitprice)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD"
                        }).format(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTransactionDialog;
