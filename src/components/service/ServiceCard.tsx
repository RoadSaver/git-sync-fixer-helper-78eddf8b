
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/translations';
import ContactDialog from './ContactDialog';
import { ServiceType, getServiceIconAndTitle, processBackgroundRemoval } from './serviceIcons';

interface ServiceCardProps {
  type: ServiceType;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  type,
  onClick
}) => {
  const {
    language,
    editMode
  } = useApp();
  const t = useTranslation(language);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [processedTowTruckIconUrl, setProcessedTowTruckIconUrl] = useState<string | null>(null);
  
  useEffect(() => {
    let objectUrlToRevoke: string | null = null;
    if (type === 'tow-truck') {
      objectUrlToRevoke = processBackgroundRemoval(type, setProcessedTowTruckIconUrl) as unknown as string;
    }
    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [type]);
  
  const handleClick = () => {
    console.log('ServiceCard clicked:', type);
    if (type === 'support') {
      setShowContactDialog(true);
    } else {
      console.log('Calling onClick for service:', type);
      onClick();
    }
  };
  
  const handleEmailContact = () => {
    window.location.href = 'mailto:roadsaverapp@gmail.com';
    setShowContactDialog(false);
  };
  
  const handlePhoneContact = () => {
    window.location.href = 'tel:+359888123456';
    setShowContactDialog(false);
  };
  
  const iconSizeClass = "h-8 w-8 sm:h-10 sm:w-10";
  const {
    icon,
    title,
    description
  } = getServiceIconAndTitle(type, t, processedTowTruckIconUrl, iconSizeClass);
  
  return <>
      <Card className="group p-3 sm:p-4 hover:bg-secondary/70 transition-colors cursor-pointer flex flex-col min-h-[120px] sm:min-h-[140px]" onClick={handleClick}>
        {/* Icon container with fixed height and circular background */}
        <div className="flex justify-center items-center h-12 sm:h-16 mb-2 sm:mb-3">
          <div className="bg-roadsaver-primary/10 p-3 sm:p-4 text-roadsaver-primary transition-transform duration-200 group-hover:scale-110 rounded-full flex items-center justify-center circle-icon-bg">
            {icon}
          </div>
        </div>
        
        {/* Text content with consistent spacing */}
        <div className="flex-1 flex flex-col justify-center text-center">
          <h3 className="text-sm sm:text-lg font-semibold mb-1 leading-tight min-h-[1.5rem] sm:min-h-[2rem] flex items-center justify-center">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">
            {description}
          </p>
        </div>
      </Card>

      <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} onEmailContact={handleEmailContact} onPhoneContact={handlePhoneContact} contactOptionsText={t('contact-options')} supportDescText={t('support-desc')} writeEmailText={t('write-email')} giveCallText={t('give-call')} />
    </>;
};

export default ServiceCard;
