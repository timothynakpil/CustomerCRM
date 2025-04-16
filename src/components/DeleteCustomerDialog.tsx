import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeleteCustomerDialogProps {
  customerId: string;
  customerName?: string;
  triggerAsButton?: boolean;
}

const DeleteCustomerDialog = ({ 
  customerId, 
  customerName, 
  triggerAsButton = false 
}: DeleteCustomerDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Check for related sales records
      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select("transno")
        .eq("custno", customerId);
      
      if (salesError) throw salesError;
      
      if (salesData && salesData.length > 0) {
        toast({
          title: "Cannot delete customer",
          description: "This customer has sales records and cannot be deleted.",
          variant: "destructive",
        });
        setIsOpen(false);
        setIsDeleting(false);
        return;
      }
      
      // Delete the customer
      const { error } = await supabase
        .from("customer")
        .delete()
        .eq("custno", customerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      
      setIsOpen(false);
      navigate("/customers");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderTrigger = () => {
    if (triggerAsButton) {
      return (
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Delete</span>
        </Button>
      );
    }
    return (
      <Button variant="destructive" size="sm">
        <Trash2 className="h-4 w-4 mr-1" /> Delete
      </Button>
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {renderTrigger()}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the customer 
            {customerName ? `: ${customerName}` : ''}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCustomerDialog;
