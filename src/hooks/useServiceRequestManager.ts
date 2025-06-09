
import { useState, useEffect, useCallback } from 'react';
import { ServiceRequestManager, ServiceRequestState } from '@/services/serviceRequestManager';
import { ServiceType } from '@/components/service/types/serviceRequestState';

export const useServiceRequestManager = () => {
  const [currentRequest, setCurrentRequest] = useState<ServiceRequestState | null>(null);
  const manager = ServiceRequestManager.getInstance();
  
  useEffect(() => {
    const unsubscribe = manager.subscribe((request) => {
      setCurrentRequest(request);
    });
    
    // Get initial state
    setCurrentRequest(manager.getCurrentRequest());
    
    return unsubscribe;
  }, [manager]);
  
  const createRequest = useCallback(async (
    type: ServiceType,
    userLocation: { lat: number; lng: number },
    message: string
  ): Promise<string> => {
    return await manager.createRequest(type, userLocation, message);
  }, [manager]);
  
  const acceptQuote = useCallback(async (): Promise<void> => {
    await manager.acceptQuote();
  }, [manager]);
  
  const declineQuote = useCallback(async (): Promise<void> => {
    await manager.declineQuote();
  }, [manager]);
  
  const cancelRequest = useCallback(async (): Promise<void> => {
    await manager.cancelRequest();
  }, [manager]);
  
  return {
    currentRequest,
    createRequest,
    acceptQuote,
    declineQuote,
    cancelRequest
  };
};
