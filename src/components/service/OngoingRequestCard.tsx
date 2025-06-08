import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Phone, User, DollarSign, Navigation } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/translations';
import { getServiceIconAndTitle, ServiceType } from './serviceIcons';

interface OngoingRequestCardProps {
  onViewDetails: () => void;
  onCallEmployee?: () => void;
  onTrackLocation?: () => void;
  onReviewQuote?: () => void;
}

const OngoingRequestCard: React.FC<OngoingRequestCardProps> = ({
  onViewDetails,
  onCallEmployee,
  onTrackLocation,
  onReviewQuote
}) => {
  const { language, ongoingRequest } = useApp();
  const t = useTranslation(language);

  if (!ongoingRequest) return null;

  const { icon } = getServiceIconAndTitle(ongoingRequest.type as ServiceType, t, null, "h-6 w-6");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('finding-employee');
      case 'accepted': return t('employee-on-way');
      case 'declined': return t('request-declined');
      default: return status;
    }
  };

  return (
    <Card className="w-full border-l-4 border-l-green-500 shadow-md">
      <CardContent className="p-4">
        {/* Header with service type and status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t(ongoingRequest.type)}</h3>
              <p className="text-sm text-gray-600">{ongoingRequest.timestamp}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(ongoingRequest.status)} font-medium`}>
            {getStatusText(ongoingRequest.status)}
          </Badge>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{ongoingRequest.location}</span>
        </div>

        {/* Employee info (if assigned) */}
        {ongoingRequest.status === 'accepted' && ongoingRequest.employeeName && (
          <div className="bg-green-50 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">{ongoingRequest.employeeName}</span>
              </div>
              {ongoingRequest.employeePhone && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCallEmployee}
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  {t('call')}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Price quote (if available) */}
        {ongoingRequest.priceQuote !== undefined && ongoingRequest.priceQuote >= 0 && (
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{ongoingRequest.priceQuote.toFixed(2)} BGN</span>
            </div>
            {ongoingRequest.status === 'pending' && (
              <Button
                size="sm"
                onClick={onReviewQuote}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('review-quote')}
              </Button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={onViewDetails}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Clock className="h-4 w-4 mr-2" />
            {t('view-details')}
          </Button>
          
          {ongoingRequest.status === 'accepted' && (
            <Button
              onClick={onTrackLocation}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {t('track')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OngoingRequestCard;