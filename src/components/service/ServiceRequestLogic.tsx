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
  const { simulateEmployeeResponse, handleAccept } = useRequestSimulation();
  const {
    handleCancelRequest: cancelRequest,
    handleContactSupport
  } = useRequestActions();
  const { storeSnapshot, loadSnapshot, storedSnapshot, moveToFinished } = usePriceQuoteSnapshot();

  // Initialize states
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
  const [showWaitingForRevision, setShowWaitingForRevision] = useState(false);

  // Reset blacklist when a new request is started or finished
  useEffect(() => {
    if (!ongoingRequest) {
      setSessionEmployeeBlacklist([]);
      setEmployeeDeclineCounts({});
      setHasDeclinedOnce(false);
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

  const handleSubmit = () => {
    if (!validateMessage(message, type)) {
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const requestId = Date.now().toString();
      const timestamp = new Date().toISOString();
      
      setHasDeclinedOnce(false);
      setEmployeeDeclineCounts({});
      setSessionEmployeeBlacklist([]);
      
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

      // Simulate finding an employee and getting a quote
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
          
          setShowRealTimeUpdate(false);
          setShowPriceQuote(true);
        },
        setShowPriceQuote,
        setShowRealTimeUpdate,
        setStatus,
        setDeclineReason,
        setEmployeeLocation,
        (employeeName: string) => {
          console.log('Employee assigned:', employeeName);
          if (employeeName && employeeName !== 'Unknown') {
            setCurrentEmployeeName(employeeName);
            setOngoingRequest(prev => prev ? {
              ...prev,
              employeeName: employeeName
            } : null);
            // Initialize decline count for new employee
            setEmployeeDeclineCounts(prev => ({ ...prev, [employeeName]: 0 }));
          } else {
            // No available employees
            setCurrentEmployeeName('');
            setOngoingRequest(prev => prev ? {
              ...prev,
              employeeName: ''
            } : null);
            setShowRealTimeUpdate(false);
            setShowPriceQuote(false);
            setStatus('declined');
            setDeclineReason('No available employees. Please try again later.');
            toast({
              title: "No employees available",
              description: "All employees are currently busy. Please try again later.",
              variant: "destructive"
            });
          }
        },
        sessionEmployeeBlacklist
      );
    }, 1500);
  };

  const handleAcceptQuote = async () => {
    if (!user || !ongoingRequest || !currentEmployeeName) return;
    
    console.log('Quote accepted, starting service simulation');
    
    // Generate employee starting location near user
    const employeeStartLocation = {
      lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
      lng: userLocation.lng + (Math.random() - 0.5) * 0.02
    };
    
    setEmployeeLocation(employeeStartLocation);
    setShowPriceQuote(false);
    setShowRealTimeUpdate(true);
    setStatus('accepted');
    
    setOngoingRequest(prev => prev ? { 
      ...prev, 
      status: 'accepted' as const 
    } : null);
    
    toast({
      title: "Quote Accepted",
      description: `${currentEmployeeName} is on the way to your location.`
    });

    // Start the simulation with movement and ETA
    await handleAccept(
      ongoingRequest.id,
      ongoingRequest.priceQuote || priceQuote,
      currentEmployeeName,
      user.username,
      userLocation,
      employeeStartLocation,
      60, // 60 seconds ETA
      (remaining) => {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        setEta(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      },
      (location) => {
        setEmployeeMovingLocation(location);
      },
      async () => {
        // Service completion
        toast({
          title: "Service Completed",
          description: `Your ${type} service has been completed successfully.`
        });
        
        // Add to user history
        try {
          await UserHistoryService.addHistoryEntry({
            user_id: user.username,
            username: user.username,
            service_type: type,
            status: 'completed',
            employee_name: currentEmployeeName,
            price_paid: priceQuote,
            service_fee: 5,
            total_price: priceQuote + 5,
            request_date: new Date().toISOString(),
            completion_date: new Date().toISOString(),
            address_street: 'Sofia Center, Bulgaria',
            latitude: userLocation.lat,
            longitude: userLocation.lng
          });
        } catch (error) {
          console.error('Error recording completion:', error);
        }
        
        // Clean up state
        setOngoingRequest(null);
        setShowRealTimeUpdate(false);
        setEmployeeMovingLocation(undefined);
        setEta(null);
        setSessionEmployeeBlacklist([]);
        setEmployeeDeclineCounts({});
        setHasDeclinedOnce(false);
      }
    );
  };

  const handleDeclineQuote = async (isSecondDecline: boolean = false) => {
    if (!user) return;
    
    const currentDeclines = employeeDeclineCounts[currentEmployeeName] || 0;
    const newDeclineCount = currentDeclines + 1;
    
    console.log(`Decline #${newDeclineCount} for employee ${currentEmployeeName}`);
    
    // Update decline count for current employee
    setEmployeeDeclineCounts(prev => ({
      ...prev,
      [currentEmployeeName]: newDeclineCount
    }));
    
    if (newDeclineCount === 1) {
      // First decline - show waiting for revision and then revised quote
      setHasDeclinedOnce(true);
      setShowPriceQuote(false);
      setShowWaitingForRevision(true);
      
      toast({
        title: "Quote Declined",
        description: `${currentEmployeeName} will send you a revised quote.`
      });
      
      // Show waiting screen for 2 seconds, then revised quote
      setTimeout(() => {
        setShowWaitingForRevision(false);
        
        // Generate revised quote (lower than original)
        const revisedQuote = Math.max(10, priceQuote - Math.floor(Math.random() * 15) - 5);
        setPriceQuote(revisedQuote);
        
        setOngoingRequest(prev => prev ? {
          ...prev,
          priceQuote: revisedQuote
        } : null);
        
        setShowPriceQuote(true);
        
        toast({
          title: "Revised Quote Received",
          description: `${currentEmployeeName} sent a revised quote of ${revisedQuote} BGN.`
        });
      }, 2000);
      
    } else {
      // Second decline - blacklist employee and find new one
      setSessionEmployeeBlacklist(prev => [...prev, currentEmployeeName]);
      setEmployeeDeclineCounts(prev => ({
        ...prev,
        [currentEmployeeName]: 0 // Reset for this employee
      }));
      setHasDeclinedOnce(false);
      
      // Record decline in history
      try {
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
      } catch (error) {
        console.error('Error recording decline:', error);
      }
      
      setShowPriceQuote(false);
      setShowRealTimeUpdate(true);
      setStatus('pending');
      
      toast({
        title: "Quote Declined",
        description: "Looking for another available employee..."
      });
      
      // Find new employee
      setTimeout(() => {
        const newRequestId = Date.now().toString();
        
        simulateEmployeeResponse(
          newRequestId,
          new Date().toISOString(),
          type,
          userLocation,
          (quote: number) => {
            console.log('New employee sent quote:', quote);
            setPriceQuote(quote);
            setOngoingRequest(prev => prev ? {
              ...prev,
              priceQuote: quote,
              employeeName: currentEmployeeName
            } : null);
            setShowRealTimeUpdate(false);
            setShowPriceQuote(true);
          },
          setShowPriceQuote,
          setShowRealTimeUpdate,
          setStatus,
          setDeclineReason,
          setEmployeeLocation,
          (employeeName: string) => {
            console.log('New employee assigned:', employeeName);
            if (employeeName && employeeName !== 'Unknown') {
              setCurrentEmployeeName(employeeName);
              setOngoingRequest(prev => prev ? {
                ...prev,
                employeeName: employeeName
              } : null);
              // Initialize decline count for new employee
              setEmployeeDeclineCounts(prev => ({ ...prev, [employeeName]: 0 }));
            } else {
              // No more available employees
              setCurrentEmployeeName('');
              setOngoingRequest(null);
              setShowRealTimeUpdate(false);
              setShowPriceQuote(false);
              setStatus('declined');
              setDeclineReason('No available employees. Please try again later.');
              toast({
                title: "No employees available",
                description: "All employees are currently busy. Please try again later.",
                variant: "destructive"
              });
            }
          },
          [...sessionEmployeeBlacklist, currentEmployeeName]
        );
      }, 2000);
    }
  };
  
  const handleCancelRequest = () => {
    setSessionEmployeeBlacklist([]);
    setEmployeeDeclineCounts({});
    setHasDeclinedOnce(false);
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
    priceQuote,
    employeeLocation: employeeMovingLocation || employeeLocation,
    status,
    declineReason,
    currentEmployeeName: ongoingRequest?.employeeName || currentEmployeeName,
    hasDeclinedOnce,
    eta,
    showWaitingForRevision,
    handleSubmit,
    handleAcceptQuote,
    handleDeclineQuote,
    handleCancelRequest,
    handleContactSupport,
    storedSnapshot,
    showStoredPriceQuote
  };
};
