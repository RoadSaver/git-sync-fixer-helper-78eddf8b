
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
        toast({
          title: "No employees available",
          description: "All employees are currently busy. Please try again later.",
          variant: "destructive"
        });
        return;
      }

      console.log('Employee assigned:', employee.full_name);
      setCurrentEmployeeName(employee.full_name);

      // Simulate employee response delay
      setTimeout(() => {
        const basePrice = 50;
        const randomPrice = Math.floor(Math.random() * 100) + basePrice;
        
        console.log('Employee sent quote:', randomPrice);
        onQuoteReceived(randomPrice);
        
        // Set employee location near user
        const employeeLocation = {
          lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
          lng: userLocation.lng + (Math.random() - 0.5) * 0.02
        };
        setEmployeeLocation(employeeLocation);
        
        setShowRealTimeUpdate(false);
        setShowPriceQuote(true);
      }, 2000 + Math.random() * 3000); // 2-5 seconds delay
      
    } catch (error) {
      console.error('Error in employee simulation:', error);
      setStatus('declined');
      setDeclineReason('Error finding available employees. Please try again.');
      setShowRealTimeUpdate(false);
    }
  };

  const handleDecline = async (
    requestId: string,
    employeeName: string,
    userId: string,
    userLocation: { lat: number; lng: number },
    reason: string = 'User declined quote twice'
  ) => {
    if (!user) return;
    
    try {
      await UserHistoryService.addHistoryEntry({
        user_id: userId,
        username: userId,
        service_type: 'towing', // This should be passed as parameter
        status: 'declined',
        employee_name: employeeName,
        request_date: new Date().toISOString(),
        completion_date: new Date().toISOString(),
        address_street: 'Sofia Center, Bulgaria',
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        decline_reason: reason
      });
      
      console.log('Decline recorded for employee:', employeeName);
    } catch (error) {
      console.error('Error recording decline:', error);
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
    onCompletion: () => void,
    onClose?: () => void
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

    // Simulate employee movement
    let currentLocation = { ...employeeStartLocation };
    const totalSteps = etaSeconds / 2; // Update every 2 seconds
    let step = 0;
    
    const movementInterval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      
      // Move employee closer to user
      currentLocation = {
        lat: employeeStartLocation.lat + (userLocation.lat - employeeStartLocation.lat) * progress,
        lng: employeeStartLocation.lng + (userLocation.lng - employeeStartLocation.lng) * progress
      };
      
      onLocationUpdate(currentLocation);
      
      if (step >= totalSteps) {
        clearInterval(movementInterval);
        
        // Service completion
        setTimeout(async () => {
          const serviceFee = 5;
          const totalPrice = priceQuote + serviceFee;
          
          try {
            // Add to user history
            await UserHistoryService.addHistoryEntry({
              user_id: userId,
              username: userId,
              service_type: 'towing', // This should be passed as parameter
              status: 'completed',
              employee_name: employeeName,
              price_paid: priceQuote,
              service_fee: serviceFee,
              total_price: totalPrice,
              request_date: new Date().toISOString(),
              completion_date: new Date().toISOString(),
              address_street: 'Sofia Center, Bulgaria',
              latitude: userLocation.lat,
              longitude: userLocation.lng
            });
            
            console.log('Service completed and recorded');
            onCompletion();
            
          } catch (error) {
            console.error('Error recording completion:', error);
            onCompletion(); // Still complete the UI flow
          }
        }, 3000); // 3 seconds after arrival
      }
    }, 2000); // Update every 2 seconds
    
    // Cleanup after maximum time
    setTimeout(() => {
      clearInterval(etaInterval);
      clearInterval(movementInterval);
    }, (etaSeconds + 10) * 1000);
  };

  return {
    simulateEmployeeResponse,
    handleDecline,
    handleAccept
  };
};
