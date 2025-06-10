import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WaitingForRevisionDialog from './price-quote/WaitingForRevisionDialog';
import PriceQuoteContent from './price-quote/PriceQuoteContent';
import DeclineConfirmDialog from './price-quote/DeclineConfirmDialog';
import CancelConfirmDialog from './price-quote/CancelConfirmDialog';

interface PriceQuoteDialogProps {
  open: boolean;
  onClose: () => void;
  serviceType: string;
  priceQuote: number;
  onAccept: () => void;
  onDecline: (isSecondDecline?: boolean) => void;
  onCancelRequest: () => void;
  hasDeclinedOnce?: boolean;
  employeeName?: string;
  showWaitingForRevision?: boolean;
}

const PriceQuoteDialog: React.FC<PriceQuoteDialogProps> = ({
  open,
  onClose,
  serviceType,
  priceQuote,
  onAccept,
  onDecline,
  onCancelRequest,
  hasDeclinedOnce = false,
  employeeName = '',
  showWaitingForRevision = false
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

  console.log('PriceQuoteDialog render:', { 
    open, 
    serviceType, 
    priceQuote, 
    employeeName, 
    hasDeclinedOnce,
    showWaitingForRevision 
  });

  const handleCancelRequest = () => {
    console.log('handleCancelRequest called');
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    console.log('confirmCancel called');
    onCancelRequest();
    setShowCancelConfirm(false);
    onClose();
  };

  const handleDecline = () => {
    if (!hasDeclinedOnce) {
      // First decline - show confirmation
      setShowDeclineConfirm(true);
    } else {
      // Second decline (Final Decline) - direct decline (blacklist employee and find new one)
      onDecline(true);
    }
  };

  const confirmDecline = () => {
    console.log('confirmDecline called - first decline');
    setShowDeclineConfirm(false);
    onDecline(false); // First decline
  };

  const handleAccept = () => {
    console.log('handleAccept called');
    onAccept();
  };

  // Prevent dialog from closing when clicking outside - only allow programmatic closing
  const handleOpenChange = (open: boolean) => {
    // Only allow closing if it's being closed programmatically (open = false)
    // Don't allow backdrop clicks to close the dialog
    if (!open) {
      console.log('Dialog close attempted - preventing backdrop close');
      return; // Prevent closing via backdrop click
    }
  };

  // Show waiting for revision dialog
  if (showWaitingForRevision) {
    return (
      <WaitingForRevisionDialog
        open={open}
        onOpenChange={() => {}} // Prevent closing via backdrop
        employeeName={employeeName}
        onCancelRequest={handleCancelRequest}
      />
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent 
          className="max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()} // Prevent backdrop clicks
          onEscapeKeyDown={(e) => e.preventDefault()} // Prevent ESC key closing
        >
          <DialogHeader>
            <DialogTitle>
              {hasDeclinedOnce ? 'Revised Price Quote' : 'Price Quote Received'}
            </DialogTitle>
          </DialogHeader>
          <PriceQuoteContent
            serviceType={serviceType}
            priceQuote={priceQuote}
            employeeName={employeeName}
            hasDeclinedOnce={hasDeclinedOnce}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onCancelRequest={handleCancelRequest}
          />
        </DialogContent>
      </Dialog>
      
      <DeclineConfirmDialog
        open={showDeclineConfirm}
        onOpenChange={setShowDeclineConfirm}
        employeeName={employeeName}
        onConfirm={confirmDecline}
        onCancel={() => setShowDeclineConfirm(false)}
      />
      
      <CancelConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </>
  );
};

export default PriceQuoteDialog;