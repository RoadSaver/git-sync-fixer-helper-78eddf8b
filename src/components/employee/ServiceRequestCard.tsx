import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceRequest } from '@/types/serviceRequest';
import { useTranslation } from '@/utils/translations';
import { useApp } from '@/contexts/AppContext';
import { getServiceIconAndTitle, ServiceType } from '@/components/service/serviceIcons';
import { Clock, MapPin, User } from 'lucide-react';

interface ServiceRequestCardProps {
  request: ServiceRequest;
  onClick: (request: ServiceRequest) => void;
}

const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({ request, onClick }) => {
  const { language } = useApp();
  const t = useTranslation(language);
  
  const getRequestTitle = (type: string) => {
    // First try to use translation key based on the type
    const translatedType = t(type);
    if (translatedType !== type) {
      return translatedType;
    }
    
    // Fallback to hardcoded translations
    switch (type) {
      case 'flat-tyre':
        return t('flat-tyre-assistance');
      case 'out-of-fuel':
        return t('out-of-fuel');
      case 'small-issue':
        return t('small-issue');
      case 'tow-truck':
        return t('tow-truck-request');
      default:
        return t('service-request');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return t('accepted-status');
      case 'declined':
        return t('declined-status');
      default:
        return t('new');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse';
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'border-l-green-500';
      case 'declined':
        return 'border-l-red-500';
      default:
        return 'border-l-yellow-500';
    }
  };

  // Get the service icon using the same logic as user version
  const iconSizeClass = "h-6 w-6";
  const { icon } = getServiceIconAndTitle(request.type as ServiceType, t, null, iconSizeClass);

  return (
    <Card 
      className={`cursor-pointer border-l-4 ${getBorderColor(request.status)} hover:shadow-md transition-all duration-200 active:scale-[0.98]`}
      onClick={() => onClick(request)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">{getRequestTitle(request.type)}</CardTitle>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(request.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <User className="h-3 w-3" />
                  <span className="truncate">{request.username}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge className={`${getStatusColor(request.status)} font-medium flex-shrink-0 ml-2`}>
            {getStatusLabel(request.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{request.message}</p>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          <span>Sofia Center, Bulgaria</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestCard;