import React, { useState, useEffect } from 'react';
import ServiceRequestDialog from './ServiceRequestDialog';
import ServiceRequestForm from './ServiceRequestForm';
import ServiceRequestStatus from './ServiceRequestStatus';
import PriceQuoteDialog from './PriceQuoteDialog';
import { useServiceRequestManager } from '@/hooks/useServiceRequestManager';
import { useServiceValidation } from './hooks/useServiceValidation';
import { serviceMessages } from './constants/serviceMessages';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/translations';
import { toast } from "@/components/ui/use-toast";

interface ServiceRequestProps {
  type: 'flat-tyre' | 'out-of-fuel' | 'other-car-problems' | 'tow-truck' | 'emergency' | 'support' | 'car-battery';
  open: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number };
  shouldShowPriceQuote?: boolean;
}

const ServiceRequest: React.FC<ServiceRequestProps> = ({ 
  type, 
  open, 
  onClose, 
  userLocation, 
  shouldShowPriceQuote = false 
}) => {
  const { language } = useApp();
  const t = useTranslation(language);
  const { validateMessage } = useServiceValidation();
  const { currentRequest, createRequest, acceptQuote, declineQuote, cancelRequest } = useServiceRequestManager();
  
  const [message, setMessage] = useState(() => serviceMessages[type] || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);
  
  // Enhanced price quote dialog visibility logic with automatic opening
  const showPriceQuote = React.useMemo(() => {
    const shouldShow = (currentRequest?.status === 'quote_received' && 
                      currentRequest?.currentQuote && 
                      currentRequest.currentQuote.amount > 0) || shouldShowPriceQuote;
    
    console.log('ServiceRequest - showPriceQuote calculation:', {
      status: currentRequest?.status,
      hasQuote: !!currentRequest?.currentQuote,
      quoteAmount: currentRequest?.currentQuote?.amount,
      shouldShowPriceQuote,
      result: shouldShow
    });
    
    return shouldShow;
  }, [currentRequest?.status, currentRequest?.currentQuote, shouldShowPriceQuote]);
  
  const showRealTimeUpdate = React.useMemo(() => {
    const shouldShow = currentRequest?.status === 'request_accepted' || 
                     currentRequest?.status === 'in_progress';
    
    console.log('ServiceRequest - showRealTimeUpdate calculation:', {
      status: currentRequest?.status,
      result: shouldShow
    });
    
    return shouldShow;
  }, [currentRequest?.status]);
  
  // Auto-show price quote when it becomes available
  useEffect(() => {
    if (showPriceQuote) {
      console.log('ServiceRequest - Price quote should be visible now');
    }
  }, [showPriceQuote]);
  
  // Close dialog when service is completed
  useEffect(() => {
    if (currentRequest?.status === 'completed') {
      console.log('ServiceRequest - Service completed, closing dialog');
      onClose();
    }
  }, [currentRequest?.status, onClose]);
  
  // Debug logging for state changes
  useEffect(() => {
    console.log('ServiceRequest state changed:', {
      currentRequest: currentRequest ? {
        id: currentRequest.id,
        status: currentRequest.status,
        hasQuote: !!currentRequest.currentQuote,
        quoteAmount: currentRequest.currentQuote?.amount,
        employeeName: currentRequest.currentQuote?.employeeName,
        declineCount: currentRequest.declineCount,
        hasReceivedRevision: currentRequest.hasReceivedRevision
      } : null,
      showPriceQuote,
      showRealTimeUpdate
    });
  }, [currentRequest, showPriceQuote, showRealTimeUpdate]);
  
  const handleSubmit = async () => {
    if (!validateMessage(message, type)) {
      return;
    }
    
    if (currentRequest) {
      toast({
        title: "Request in Progress",
        description: "Please wait for your current request to be completed before making a new one.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createRequest(type, userLocation, message);
      
      toast({
        title: "Request Sent",
        description: "Your request has been sent to our team."
      });
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAttemptClose = () => {
    // If price quote is showing, don't allow closing via backdrop
    if (showPriceQuote) {
      console.log('ServiceRequest - Preventing close while price quote is showing');
      return;
    }
    
    if (currentRequest && currentRequest.status !== 'completed' && currentRequest.status !== 'cancelled') {
      setShowCancelConfirmDialog(true);
    } else {
      onClose();
    }
  };
  
  const confirmCancelRequest = async () => {
    await cancelRequest();
    setShowCancelConfirmDialog(false);
    onClose();
  };
  
  const handleAcceptQuote = async () => {
    console.log('ServiceRequest - Accepting quote...');
    await acceptQuote();
  };
  
  const handleDeclineQuote = async () => {
    console.log('ServiceRequest - Declining quote...');
    await declineQuote();
  };
  
  const handleContactSupport = () => {
    toast({
      title: "Contacting Support",
      description: "Our support team will contact you shortly."
    });
  };
  
  const getStatusForDisplay = () => {
    if (!currentRequest) return 'pending';
    
    switch (currentRequest.status) {
      case 'request_accepted':
        return 'pending';
      case 'quote_received':
        return 'pending';
      case 'quote_declined':
        return 'pending';
      case 'quote_accepted':
      case 'in_progress':
        return 'accepted';
      case 'completed':
        return 'accepted';
      case 'cancelled':
        return 'declined';
      default:
        return 'pending';
    }
  };
  
  const getDeclineReason = () => {
    if (currentRequest?.status === 'cancelled') {
      return 'Request was cancelled or no employees available.';
    }
    return '';
  };
  
  return (
    <>
      <ServiceRequestDialog
        type={type}
        open={open && !showPriceQuote}
        onClose={handleAttemptClose}
        showRealTimeUpdate={showRealTimeUpdate}
      >
        {!showRealTimeUpdate ? (
          <ServiceRequestForm
            type={type}
            message={message}
            onMessageChange={setMessage}
            userLocation={userLocation}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={handleAttemptClose}
          />
        ) : (
          <ServiceRequestStatus
            message={message}
            status={getStatusForDisplay()}
            declineReason={getDeclineReason()}
            userLocation={userLocation}
            employeeLocation={currentRequest?.assignedEmployee?.location}
            eta={currentRequest?.status === 'in_progress' ? '05:00' : null}
            employeeName={currentRequest?.assignedEmployee?.name || ''}
            onContactSupport={handleContactSupport}
            onClose={handleAttemptClose}
            onReviewPriceQuote={() => {}} // Not needed with new system
            hasPriceQuote={!!currentRequest?.currentQuote}
            hasStoredSnapshot={false}
            onShowStoredPriceQuote={() => {}}
          />
        )}
      </ServiceRequestDialog>

      {showPriceQuote && currentRequest?.currentQuote && (
        <PriceQuoteDialog
          open={showPriceQuote}
          onClose={() => {}} // Prevent manual closing
          serviceType={type}
          priceQuote={currentRequest.currentQuote.amount}
          onAccept={handleAcceptQuote}
          onDecline={handleDeclineQuote}
          onCancelRequest={cancelRequest}
          hasDeclinedOnce={currentRequest.declineCount > 0 || currentRequest.hasReceivedRevision}
          employeeName={currentRequest.currentQuote.employeeName}
          showWaitingForRevision={false}
        />
      )}

      {showCancelConfirmDialog && (
        <AlertDialog open={showCancelConfirmDialog} onOpenChange={setShowCancelConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirm-cancellation-title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("confirm-cancellation-desc")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowCancelConfirmDialog(false)}>{t("no")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmCancelRequest} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {t("yes-cancel")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default ServiceRequest;