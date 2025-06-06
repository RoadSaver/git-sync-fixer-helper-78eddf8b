
import { useState, useCallback } from 'react';

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
}

export const useEmployeeInteraction = (requestId: string) => {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [declineCount, setDeclineCount] = useState(0);
  const [isRequestActive, setIsRequestActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeEmployee = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    // Simulate employee assignment
    setTimeout(() => {
      const mockEmployee: Employee = {
        id: `emp-${Date.now()}`,
        name: 'John Smith',
        department: 'Field Services',
        role: 'Technician'
      };
      
      setCurrentEmployee(mockEmployee);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDecline = useCallback(() => {
    if (!currentEmployee || !isRequestActive) return;
    
    setDeclineCount(prev => {
      const newCount = prev + 1;
      
      if (newCount >= 2) {
        // After 2 declines, assign new employee
        setCurrentEmployee(null);
        setDeclineCount(0);
        initializeEmployee();
      }
      
      return newCount;
    });
  }, [currentEmployee, isRequestActive, initializeEmployee]);

  const handleAccept = useCallback(() => {
    setIsRequestActive(false);
    console.log('Request accepted by employee:', currentEmployee?.name);
  }, [currentEmployee]);

  return {
    currentEmployee,
    declineCount,
    isRequestActive,
    isLoading,
    error,
    handleDecline,
    handleAccept,
    initializeEmployee
  };
};
