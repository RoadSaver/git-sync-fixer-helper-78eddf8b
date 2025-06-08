import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/translations';
import { Phone, Navigation, Clock, MapPin, User } from 'lucide-react';
import GoogleMap from '@/components/GoogleMap';

interface EmployeeLocationDialogProps {
  open: boolean;
  onClose: () => void;
}

const EmployeeLocationDialog: React.FC<EmployeeLocationDialogProps> = ({ open, onClose }) => {
  const { language, ongoingRequest, userLocation } = useApp();
  const t = useTranslation(language);

  const handleCallEmployee = () => {
    if (ongoingRequest?.employeePhone) {
      window.location.href = `tel:${ongoingRequest.employeePhone}`;
    }
  };

  if (!ongoingRequest) return null;

  const getStatusColor = () => {
    switch (ongoingRequest.status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            {t('live-tracking')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Service Status Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{t(ongoingRequest.type)}</h3>
              <Badge className={`${getStatusColor()} font-medium`}>
                {t(ongoingRequest.status)}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{t('started')}: {ongoingRequest.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{ongoingRequest.location}</span>
              </div>
            </div>
          </div>

          {/* Employee Info */}
          {ongoingRequest.status === 'accepted' && ongoingRequest.employeeName && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">{ongoingRequest.employeeName}</p>
                    <p className="text-sm text-blue-700">{t('your-technician')}</p>
                  </div>
                </div>
                {ongoingRequest.employeePhone && (
                  <Button 
                    onClick={handleCallEmployee}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    {t('call')}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Live Map */}
          <div className="rounded-lg overflow-hidden border">
            <GoogleMap
              userLocation={userLocation}
              employeeLocation={ongoingRequest.employeeLocation}
              height="300px"
            />
          </div>

          {/* Map Legend */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium mb-2 text-sm">{t('map-legend')}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>{t('your-location')}</span>
              </div>
              {ongoingRequest.employeeLocation && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>{ongoingRequest.employeeName ? `${ongoingRequest.employeeName}'s location` : t('employee-location')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            {t('close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeLocationDialog;