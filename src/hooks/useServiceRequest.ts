import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useApp } from '@/contexts/AppContext';
import { serviceMessages } from '@/components/service/constants/serviceMessages';
import { ServiceType } from '@/components/service/types/serviceRequestState';
import { useServiceValidation } from '@/components/service/hooks/useServiceValidation';
import { useRequestSimulation } from '@/components/service/hooks/useRequestSimulation';
import { useRequestActions } from '@/components/service/hooks/useRequestActions';
import { usePriceQuoteSnapshot } from '@/hooks/usePriceQuoteSnapshot';
import { UserHistoryService } from '@/services/userHistoryService';

export const useServiceRequest = (
  type: ServiceType,
  userLocation: { lat: number; lng: number }
) => {
  const { setOngoingRequest, ongoingRequest, user } = useApp();
  const { validateMessage } = useServiceValidation();
  const { simulateEmployeeResponse } = useRequestSimulation();
  const {
    handleAcceptQuote: acceptQuote,
    handleDeclineQuote: declineQuote,
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
  const [declinedEmployees, setDeclinedEmployees] = useState<string[]>([]);
  
  // Track employee-specific decline counts - key is employee name, value is decline count
  const [employeeDeclineCounts, setEmployeeDeclineCounts] = useState<{[employeeName: string]: number}>({});
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState<string>('');
  const [movementInterval, setMovementInterval] = useState<NodeJS.Timeout | null>(null);

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
      if (ongoingRequest.declinedEmployees) {
        setDeclinedEmployees(ongoingRequest.declinedEmployees);
      }
      
      if (ongoingRequest.id) {
        loadSnapshot(ongoingRequest.id);
      }
    }
  }, [ongoingRequest, originalPriceQuote, loadSnapshot]);

  // Clean up movement interval on unmount
  useEffect(() => {
    return () => {
      if (movementInterval) {
        clearInterval(movementInterval);
      }
    };
  }, [movementInterval]);

  const calculateETA = (employeeLat: number, employeeLng: number) => {
    const distance = Math.sqrt(
      Math.pow(userLocation.lat - employeeLat, 2) + 
      Math.pow(userLocation.lng - employeeLng, 2)
    );
    
    // Rough estimate: 1 degree ≈ 111km, average speed 30km/h in city
    const distanceKm = distance * 111;
    const timeHours = distanceKm / 30;
    const timeMinutes = Math.max(5, Math.round(timeHours * 60)); // Minimum 5 minutes
    
    const now = new Date();
    const arrival = new Date(now.getTime() + timeMinutes * 60000);
    
    // Format as HH:MM:SS
    const hours = arrival.getHours().toString().padStart(2, '0');
    const minutes = arrival.getMinutes().toString().padStart(2, '0');
    const seconds = arrival.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = () => {
    if (!validateMessage(message, type)) {
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const requestId = Date.now().toString();
      const timestamp = new Date().toISOString();
      
      // Reset tracking for new request
      setDeclinedEmployees([]);
      setEmployeeDeclineCounts({});
      setCurrentEmployeeName('');
      
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
      setShowRealTimeUpdate(true);
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
          console.log('Employee sent quote:', quote);
          setPriceQuote(quote);
          setOriginalPriceQuote(quote);
          
          await storeSnapshot(requestId, type, quote, currentEmployeeName, false);
          
          setOngoingRequest(prev => {
            if (!prev) return null;
            return { 
              ...prev, 
              priceQuote: quote,
              employeeName: currentEmployeeName
            };
          });
        },
        setShowPriceQuote,
        setShowRealTimeUpdate,
        setStatus,
        setDeclineReason,
        setEmployeeLocation,
        (employeeName: string) => {
          console.log('Employee assigned:', employeeName);
          setCurrentEmployeeName(employeeName);
          setOngoingRequest(prev => prev ? { 
            ...prev, 
            employeeName: employeeName 
          } : null);
          
          // Initialize decline count for new employee
          setEmployeeDeclineCounts(prev => ({ ...prev, [employeeName]: 0 }));
        },
        []
      );
    }, 1500);
  };

  return {
    message,
    setMessage,
    isSubmitting,
    showRealTimeUpdate,
    showPriceQuote,
    setShowPriceQuote,
    priceQuote: ongoingRequest?.priceQuote ?? priceQuote,
    employeeLocation,
    status,
    declineReason,
    currentEmployeeName: ongoingRequest?.employeeName || currentEmployeeName,
    declinedEmployees,
    hasDeclinedOnce: (employeeDeclineCounts[currentEmployeeName] || 0) >= 1,
    estimatedArrivalTime,
    handleSubmit,
    handleAcceptQuote: () => {}, // Simplified for now
    handleDeclineQuote: () => {}, // Simplified for now
    handleCancelRequest,
    handleContactSupport,
    storedSnapshot,
    showStoredPriceQuote: () => {
      if (storedSnapshot) {
        setShowPriceQuote(true);
      }
    }
  };
};
