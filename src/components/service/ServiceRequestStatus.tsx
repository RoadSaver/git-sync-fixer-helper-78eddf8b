import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/translations';
import { Clock, CheckCircle, XCircle, Phone, FileText, User, Navigation, DollarSign } from 'lucide-react';
import GoogleMap from '@/components/GoogleMap';

interface ServiceRequestStatusProps {
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  declineReason: string;
  userLocation: { lat: number; lng: number };
  employeeLocation?: { lat: number; lng: number };
  onContactSupport: () => void;
  onClose: () => void;
  onReviewPriceQuote?: () => void;
  hasPriceQuote?: boolean;
  hasStoredSnapshot?: boolean;
  onShowStoredPriceQuote?: () => void;
  eta?: string | null;
  employeeName?: string;
}

const ServiceRequestStatus: React.FC<ServiceRequestStatusProps> = ({
  message,
  status,
  declineReason,
  userLocation,
  employeeLocation,
  onContactSupport,
  onClose,
  onReviewPriceQuote,
  hasPriceQuote = false,
  hasStoredSnapshot = false,
  onShowStoredPriceQuote,
  eta,
  employeeName = ''
}) => {
  const { language, ongoingRequest } = useApp();
  const t = useTranslation(language);

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'declined':
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Clock className="h-8 w-8 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return hasPriceQuote ? t('quote-received') : t('finding-employee');
      case 'accepted':
        return t('employee-on-way');
      case 'declined':
        return t('request-declined');
      default:
        return status;
    }
  };

  const handleCallEmployee = () => {
    if (ongoingRequest?.employeePhone) {
      window.location.href = `tel:${ongoingRequest.employeePhone}`;
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Status Header */}
      <div className="text-center bg-gray-50 rounded-lg p-6">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        <Badge className={`${getStatusColor()} text-sm font-medium px-4 py-2`}>
          {getStatusText()}
        </Badge>
        
        {/* ETA Display for accepted requests */}
        {status === 'accepted' && eta && (
          <div className="mt-4 bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-800">ETA: {eta}</span>
            </div>
          </div>
        )}
      </div>

      {/* Employee Information */}
      {employeeName && status !== 'declined' && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">{employeeName}</p>
                <p className="text-sm text-blue-700">{t('assigned-employee')}</p>
              </div>
            </div>
            {ongoingRequest?.employeePhone && status === 'accepted' && (
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

      {/* Price Quote Section */}
      {ongoingRequest?.priceQuote !== undefined && ongoingRequest.priceQuote >= 0 && (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">{ongoingRequest.priceQuote.toFixed(2)} BGN</p>
                <p className="text-sm text-green-700">{t('quoted-price')}</p>
              </div>
            </div>
            {status === 'pending' && onReviewPriceQuote && (
              <Button
                onClick={onReviewPriceQuote}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {t('review-quote')}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Request Details */}
      <div className="bg-secondary rounded-lg p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t('request-details')}
        </h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      {/* Live Location Tracking */}
      <div className="bg-secondary rounded-lg p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          {t('live-tracking')}
        </h3>
        <div className="rounded-lg overflow-hidden">
          <GoogleMap
            userLocation={userLocation}
            employeeLocation={employeeLocation}
            height="200px"
          />
        </div>
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>{t('your-location')}</span>
          </div>
          {employeeLocation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>{employeeName ? `${employeeName}'s location` : t('employee-location')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status-specific content */}
      {status === 'declined' && declineReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">{t('service-unavailable')}</h3>
          <p className="text-sm text-red-700">{declineReason}</p>
        </div>
      )}

      {/* Stored Price Quote Button */}
      {hasStoredSnapshot && onShowStoredPriceQuote && (
        <Button 
          onClick={onShowStoredPriceQuote}
          variant="outline"
          className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          {t('view-stored-quote')}
        </Button>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4 border-t">
        <Button 
          onClick={onContactSupport}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          {t('contact-support')}
        </Button>
        
        <Button 
          onClick={onClose}
          variant="secondary"
          className="w-full"
        >
          {t('close')}
        </Button>
      </div>
    </div>
  );
};

export default ServiceRequestStatus;