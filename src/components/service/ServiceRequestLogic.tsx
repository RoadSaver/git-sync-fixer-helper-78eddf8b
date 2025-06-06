
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useApp } from '@/contexts/AppContext';
import { serviceMessages } from './constants/serviceMessages';
import { ServiceType } from './types/serviceRequestState';
import { useServiceValidation } from './hooks/useServiceValidation';
import { useRequestSimulation } from './hooks/useRequestSimulation';
import { useRequestActions } from './hooks/useRequestActions';
import { usePriceQuoteSnapshot } from '@/hooks/usePriceQuoteSnapshot';
import { UserHistoryService } from '@/services/userHistoryService';

export const useServiceRequest = (
  type: ServiceType,
  userLocation: { lat: number; lng: number }
) => {
  const { setOngoingRequest, ongoingRequest, user } = useApp();
  const { validateMessage } = useServiceValidation();
  const { simulateEmployeeResponse, handleDecline, handleAccept } = useRequestSimulation();
  const {
    handleCancelRequest: cancelRequest,
    handleContactSupport
  } = useRequestActions();
  const { storeSnapshot, loadSnapshot, storedSnapshot, moveToFinished } = usePriceQuoteSnapshot();

  // Initialize states with values from ongoing request if it exists
  const [message, setMessage] = useState(serviceMessages[type] || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRealTimeUpdate, setShowRealTimeUpdate] = useState(false);
  const [showPriceQuote, setShowPriceQuote] = useState(false);
  const [priceQuote, setPriceQuote] = useState<number>(0);
  const [originalPriceQuote, setOriginalPriceQuote] = useState<number>(0);
  const [employeeLocation, setEmployeeLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [declineReason, setDeclineReason] = useState('');
  const [currentEmployeeName, setCurrentEmployeeName] = useState<string>('');
  const [hasDeclinedOnce, setHasDeclinedOnce] = useState(false);
  const [employeeDeclineCounts, setEmployeeDeclineCounts] = useState<{ [employee: string]: number }>({});
  const [employeeMovingLocation, setEmployeeMovingLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [eta, setEta] = useState<string | null>(null);
  const [sessionEmployeeBlacklist, setSessionEmployeeBlacklist] = useState<string[]>([]);

  // Reset blacklist when a new request is started or finished
  useEffect(() => {
    if (!ongoingRequest) {
      setSessionEmployeeBlacklist([]);
    }
  }, [ongoingRequest]);

  // Update local states when ongoing request changes
  useEffect(() => {
    if (ongoingRequest) {
      if (ongoingRequest.priceQuote !== undefined) {
        setPriceQuote(ongoingRequest.priceQuote);
        if (originalPriceQuote === 0) {
          setOriginalPriceQuote(ongoingRequest.priceQuote);
        }
      }
      if (ongoingRequest.employeeName) {
        setCurrentEmployeeName(ongoingRequest.employeeName);
      }
      if (ongoingRequest.id) {
        loadSnapshot(ongoingRequest.id);
      }
    }
  }, [ongoingRequest, originalPriceQuote, loadSnapshot]);

  // Helper to calculate ETA in HH:MM:SS
  const calculateEta = (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    const R = 6371; // km
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // in km
    const speed = 40; // km/h, assumed
    const hours = distance / speed;
    const totalSeconds = Math.max(1, Math.round(hours * 3600));
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleSubmit = () => {
    if (!validateMessage(message, type)) {
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const requestId = Date.now().toString();
      const timestamp = new Date().toISOString();
      
      setHasDeclinedOnce(false);
      const newOngoingRequest = {
        id: requestId,
        type,
        status: 'pending' as const,
        timestamp: new Date().toLocaleString(),
        location: 'Sofia Center, Bulgaria',
        declinedEmployees: []
      };
      
      setOngoingRequest(newOngoingRequest);
      setStatus('pending');
      setIsSubmitting(false);
      setShowRealTimeUpdate(false);
      toast({
        title: "Request Sent",
        description: "Your request has been sent to our team."
      });
      simulateEmployeeResponse(
        requestId,
        timestamp,
        type,
        userLocation,
        async (quote: number) => {
          setPriceQuote(quote);
          setOriginalPriceQuote(quote);
          const employeeName = currentEmployeeName;
          await storeSnapshot(requestId, type, quote, employeeName, false);
          setOngoingRequest(prev => {
            if (!prev) return null;
            return {
              ...prev,
              priceQuote: quote,
              employeeName: employeeName
            };
          });
          setShowPriceQuote(true);
        },
        setShowPriceQuote,
        setShowRealTimeUpdate,
        setStatus,
        setDeclineReason,
        setEmployeeLocation,
        (employeeName: string) => {
          if (employeeName && employeeName !== 'Unknown') {
            setCurrentEmployeeName(employeeName);
            setOngoingRequest(prev => prev ? {
              ...prev,
              employeeName: employeeName
            } : null);
          } else {
            setCurrentEmployeeName('');
            setOngoingRequest(prev => prev ? {
              ...prev,
              employeeName: ''
            } : null);
            setShowPriceQuote(false);
            setShowRealTimeUpdate(false);
            setStatus('declined');
            setDeclineReason('No available employees. Please try again later.');
            toast({
              title: "No employees available",
              description: "All employees are currently busy. Please try again later.",
              variant: "destructive"
            });
          }
          setHasDeclinedOnce(false);
        },
        []
      );
    }, 1500);
  };

  const handleAcceptQuote = async () => {
    if (!user || !ongoingRequest) return;
    
    handleAccept(
      ongoingRequest.id,
      ongoingRequest.priceQuote || priceQuote,
      currentEmployeeName,
      user.username,
      userLocation,
      {
        lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.02
      },
      15,
      (remaining) => {
        setEta(remaining > 0 ? `00:00:${remaining.toString().padStart(2, '0')}` : '00:00:00');
      },
      (loc) => {
        setEmployeeMovingLocation(loc);
      },
      () => {
        toast({
          title: "Service Completed",
          description: `Your ${type} service has been completed successfully.`
        });
        setOngoingRequest(null);
        setShowRealTimeUpdate(false);
        setEmployeeMovingLocation(undefined);
        setEta(null);
      }
    );
    
    setShowPriceQuote(false);
    setShowRealTimeUpdate(true);
    setStatus('accepted');
    setOngoingRequest(prev => prev ? { ...prev, status: 'accepted' as const } : null);
    toast({
      title: "Quote Accepted",
      description: `${currentEmployeeName} is on the way to your location.`
    });
  };

  const handleDeclineQuote = async (isSecondDecline: boolean = false) => {
    if (!user) return;
    
    const declines = (employeeDeclineCounts[currentEmployeeName] || 0) + 1;
    setEmployeeDeclineCounts(prev => ({
      ...prev,
      [currentEmployeeName]: declines
    }));
    
    if (declines >= 2 || isSecondDecline || hasDeclinedOnce) {
      setSessionEmployeeBlacklist(prev => Array.from(new Set([...prev, currentEmployeeName])));
      await UserHistoryService.addHistoryEntry({
        user_id: user.username,
        username: user.username,
        service_type: type,
        status: 'declined',
        employee_name: currentEmployeeName,
        request_date: new Date().toISOString(),
        completion_date: new Date().toISOString(),
        address_street: 'Sofia Center, Bulgaria',
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        decline_reason: 'User declined quote twice'
      });
      setHasDeclinedOnce(false);
      setEmployeeDeclineCounts(prev => ({
        ...prev,
        [currentEmployeeName]: 0
      }));
      setShowPriceQuote(false);
      setShowRealTimeUpdate(true);
      setStatus('pending');
      const updatedRequest = {
        ...ongoingRequest,
        status: 'pending' as const,
        employeeName: undefined
      };
      setOngoingRequest(updatedRequest);
      toast({
        title: "Quote Declined",
        description: "Looking for another available employee..."
      });
      setTimeout(() => {
        const requestId = Date.now().toString();
        const timestamp = new Date().toISOString();
        simulateEmployeeResponse(
          requestId,
          timestamp,
          type,
          userLocation,
          () => {},
          (show) => setShowPriceQuote(show),
          setShowRealTimeUpdate,
          setStatus,
          setDeclineReason,
          setEmployeeLocation,
          (employeeName: string) => {
            setCurrentEmployeeName(employeeName);
            setOngoingRequest(prev => prev ? {
              ...prev,
              employeeName: employeeName
            } : null);
            setTimeout(() => {
              setShowPriceQuote(true);
            }, 100);
          },
          [...sessionEmployeeBlacklist, currentEmployeeName]
        );
      }, 2000);
    } else {
      setHasDeclinedOnce(true);
      toast({
        title: "Quote Declined",
        description: `${currentEmployeeName} will send you a revised quote.`
      });
      setTimeout(() => {
        const revisedQuote = Math.max(10, priceQuote - Math.floor(Math.random() * 15) - 5);
        setPriceQuote(revisedQuote);
        setOngoingRequest(prev => prev ? {
          ...prev,
          priceQuote: revisedQuote
        } : null);
        toast({
          title: "Revised Quote Received",
          description: `${currentEmployeeName} sent a revised quote of ${revisedQuote} BGN.`
        });
      }, 3000);
    }
  };
  
  const handleCancelRequest = () => {
    setSessionEmployeeBlacklist([]);
    cancelRequest(setShowPriceQuote);
  };

  const showStoredPriceQuote = () => {
    if (storedSnapshot) {
      setShowPriceQuote(true);
    }
  };

  return {
    message,
    setMessage,
    isSubmitting,
    showRealTimeUpdate,
    showPriceQuote,
    setShowPriceQuote,
    priceQuote: originalPriceQuote > 0 ? originalPriceQuote : (ongoingRequest?.priceQuote ?? priceQuote),
    employeeLocation,
    status,
    declineReason,
    currentEmployeeName: ongoingRequest?.employeeName || currentEmployeeName,
    hasDeclinedOnce,
    eta,
    handleSubmit,
    handleAcceptQuote,
    handleDeclineQuote,
    handleCancelRequest,
    handleContactSupport,
    storedSnapshot,
    showStoredPriceQuote
  };
};
