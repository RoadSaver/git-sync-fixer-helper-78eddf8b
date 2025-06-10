import { useState, useEffect, useCallback } from 'react';
import { ServiceRequestManager, ServiceRequestState } from '@/services/serviceRequestManager';
import { ServiceType } from '@/components/service/types/serviceRequestState';

export const useServiceRequestManager = () => {
  const [currentRequest, setCurrentRequest] = useState<ServiceRequestState | null>(null);
  
  useEffect(() => {
    const manager = ServiceRequestManager.getInstance();
    
    // Subscribe to state changes
    const unsubscribe = manager.subscribe((request) => {
      setCurrentRequest(request);
    });
    
    // Get initial state
    setCurrentRequest(manager.getCurrentRequest());
    
    return unsubscribe;
  }, []);
  
  const createRequest = useCallback(async (
    type: ServiceType,
    userLocation: { lat: number; lng: number },
    message: string
  ): Promise<string> => {
    const manager = ServiceRequestManager.getInstance();
    return manager.createRequest(type, userLocation, message);
  }, []);
  
  const acceptQuote = useCallback(async (): Promise<void> => {
    const manager = ServiceRequestManager.getInstance();
    return manager.acceptQuote();
  }, []);
  
  const declineQuote = useCallback(async (): Promise<void> => {
    const manager = ServiceRequestManager.getInstance();
    return manager.declineQuote();
  }, []);
  
  const cancelRequest = useCallback(async (): Promise<void> => {
    const manager = ServiceRequestManager.getInstance();
    return manager.cancelRequest();
  }, []);
  
  return {
    currentRequest,
    createRequest,
    acceptQuote,
    declineQuote,
    cancelRequest
  };
};