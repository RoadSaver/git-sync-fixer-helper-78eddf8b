import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WaitingForRevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  onCancelRequest: () => void;
}

const WaitingForRevisionDialog: React.FC<WaitingForRevisionDialogProps> = ({
  open,
  onOpenChange,
  employeeName,
  onCancelRequest
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()} // Prevent backdrop clicks
        onEscapeKeyDown={(e) => e.preventDefault()} // Prevent ESC key closing
      >
        <DialogHeader>
          <DialogTitle>Waiting for Response</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600">
            {employeeName ? `${employeeName} is sending a revised price quote` : 'Employee is preparing a revised quote for you...'}
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={onCancelRequest}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            Cancel Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitingForRevisionDialog;