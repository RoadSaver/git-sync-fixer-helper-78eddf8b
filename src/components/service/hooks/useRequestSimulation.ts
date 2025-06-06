
import { useEmployeeSimulation } from '@/hooks/useEmployeeSimulation';
import { ServiceType } from '../types/serviceRequestState';
import { toast } from "@/components/ui/use-toast";
import { UserHistoryService } from '@/services/userHistoryService';
import { useApp } from '@/contexts/AppContext';

export const useRequestSimulation = () => {
  const { loadEmployees, getRandomEmployee } = useEmployeeSimulation();
  const { user } = useApp();

  const simulateEmployeeResponse = async (
    requestId: string,
    timestamp: string,
    type: ServiceType,
    userLocation: { lat: number; lng: number },
    onQuoteReceived: (quote: number) => void,
    setShowPriceQuote: (show: boolean) => void,
    setShowRealTimeUpdate: (show: boolean) => void,
    setStatus: (status: 'pending' | 'accepted' | 'declined') => void,
    setDeclineReason: (reason: string) => void,
    setEmployeeLocation: (location: { lat: number; lng: number } | undefined) => void,
    setCurrentEmployeeName: (name: string) => void,
    blacklistedEmployees: string[] = []
  ) => {
    console.log('Starting employee simulation with blacklisted employees:', blacklistedEmployees);
    
    try {
      await loadEmployees();
      const employee = getRandomEmployee(blacklistedEmployees);
      
      if (!employee) {
        console.log('No available employees after filtering blacklist');
        setStatus('declined');
        setDeclineReason('No available employees. Please try again later.');
        setShowRealTimeUpdate(false);
        setCurrentEmployeeName('');
        return;
      }

      console.log('Employee assigned:', employee.full_name);
      setCurrentEmployeeName(employee.full_name);

      // Simulate employee response delay (2-5 seconds)
      setTimeout(() => {
        // Generate base price based on service type
        let basePrice = 50;
        switch (type) {
          case 'flat-tyre':
            basePrice = 40;
            break;
          case 'out-of-fuel':
            basePrice = 30;
            break;
          case 'car-battery':
            basePrice = 60;
            break;
          case 'tow-truck':
            basePrice = 100;
            break;
          case 'emergency':
            basePrice = 80;
            break;
          default:
            basePrice = 50;
        }
        
        // Add small random variation
        const randomPrice = basePrice + Math.floor(Math.random() * 20) - 10;
        const finalPrice = Math.max(20, randomPrice); // Minimum 20 BGN
        
        console.log('Employee sent quote:', finalPrice);
        onQuoteReceived(finalPrice);
        
        // Set employee location near user
        const employeeLocation = {
          lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
          lng: userLocation.lng + (Math.random() - 0.5) * 0.02
        };
        setEmployeeLocation(employeeLocation);
      }, 2000 + Math.random() * 3000); // 2-5 seconds delay
      
    } catch (error) {
      console.error('Error in employee simulation:', error);
      setStatus('declined');
      setDeclineReason('Error finding available employees. Please try again.');
      setShowRealTimeUpdate(false);
      setCurrentEmployeeName('');
    }
  };

  const handleAccept = async (
    requestId: string,
    priceQuote: number,
    employeeName: string,
    userId: string,
    userLocation: { lat: number; lng: number },
    employeeStartLocation: { lat: number; lng: number },
    etaSeconds: number,
    onEtaUpdate: (remaining: number) => void,
    onLocationUpdate: (location: { lat: number; lng: number }) => void,
    onCompletion: () => void
  ) => {
    if (!user) return;
    
    console.log('Request accepted, starting employee movement simulation');
    
    // Start ETA countdown
    let remainingTime = etaSeconds;
    const etaInterval = setInterval(() => {
      remainingTime--;
      onEtaUpdate(remainingTime);
      
      if (remainingTime <= 0) {
        clearInterval(etaInterval);
      }
    }, 1000);

    // Simulate employee movement towards user
    let currentLocation = { ...employeeStartLocation };
    const totalSteps = etaSeconds / 2; // Update every 2 seconds
    let step = 0;
    
    const movementInterval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      
      // Move employee closer to user location
      currentLocation = {
        lat: employeeStartLocation.lat + (userLocation.lat - employeeStartLocation.lat) * progress,
        lng: employeeStartLocation.lng + (userLocation.lng - employeeStartLocation.lng) * progress
      };
      
      onLocationUpdate(currentLocation);
      
      if (step >= totalSteps) {
        clearInterval(movementInterval);
        
        // Employee has arrived - wait 5 seconds then complete service
        setTimeout(async () => {
          console.log('Service completed');
          onCompletion();
        }, 5000); // 5 second delay after arrival
      }
    }, 2000); // Update every 2 seconds
    
    // Cleanup intervals after maximum time
    setTimeout(() => {
      clearInterval(etaInterval);
      clearInterval(movementInterval);
    }, (etaSeconds + 10) * 1000);
  };

  return {
    simulateEmployeeResponse,
    handleAccept
  };
};
