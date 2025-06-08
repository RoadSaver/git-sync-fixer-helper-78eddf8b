import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/translations';
import { Clock, X } from 'lucide-react';
import OngoingRequestCard from './OngoingRequestCard';
import EmployeeLocationDialog from './EmployeeLocationDialog';

interface OngoingRequestsDialogProps {
  open: boolean;
  onClose: () => void;
  onViewRequest: () => void;
  onReviewPriceQuote: () => void;
}

const OngoingRequestsDialog: React.FC<OngoingRequestsDialogProps> = ({ 
  open, 
  onClose, 
  onViewRequest,
  onReviewPriceQuote
}) => {
  const { language, ongoingRequest } = useApp();
  const t = useTranslation(language);
  const [showEmployeeLocation, setShowEmployeeLocation] = useState(false);

  const handleCallEmployee = () => {
    if (ongoingRequest?.employeePhone) {
      window.location.href = `tel:${ongoingRequest.employeePhone}`;
    }
  };

  const handleTrackLocation = () => {
    setShowEmployeeLocation(true);
  };

  const handleViewDetails = () => {
    onViewRequest();
    onClose();
  };

  const handleReviewQuote = () => {
    onReviewPriceQuote();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                {t('active-request')}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            {!ongoingRequest ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('no-active-requests')}
                </h3>
                <p className="text-gray-500 text-sm">
                  {t('no-active-requests-desc')}
                </p>
              </div>
            ) : (
              <OngoingRequestCard
                onViewDetails={handleViewDetails}
                onCallEmployee={handleCallEmployee}
                onTrackLocation={handleTrackLocation}
                onReviewQuote={handleReviewQuote}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Location Tracking Dialog */}
      <EmployeeLocationDialog
        open={showEmployeeLocation}
        onClose={() => setShowEmployeeLocation(false)}
      />
    </>
  );
};

export default OngoingRequestsDialog;