import { toast } from "@/components/ui/use-toast";
import { ServiceType } from '@/components/service/types/serviceRequestState';
import { SimulatedEmployeeBlacklistService } from '@/services/simulatedEmployeeBlacklistService';
import { UserHistoryService } from '@/services/userHistoryService';

export interface ServiceRequestState {
  id: string;
  type: ServiceType;
  userLocation: { lat: number; lng: number };
  status: 'request_accepted' | 'quote_received' | 'quote_declined' | 'quote_accepted' | 'in_progress' | 'completed' | 'cancelled';
  
  // Employee data
  assignedEmployee: {
    name: string;
    id: string;
    location?: { lat: number; lng: number };
  } | null;
  
  // Quote data
  currentQuote: {
    amount: number;
    employeeName: string;
    isRevised: boolean;
  } | null;
  
  // Tracking data
  declineCount: number;
  blacklistedEmployees: string[];
  hasReceivedRevision: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

interface EmployeeSimulationFunctions {
  loadEmployees: () => Promise<void>;
  getRandomEmployee: (blacklisted: string[]) => any;
}

export class ServiceRequestManager {
  private static instance: ServiceRequestManager;
  private currentRequest: ServiceRequestState | null = null;
  private listeners: Array<(request: ServiceRequestState | null) => void> = [];
  private employeeSimulation: EmployeeSimulationFunctions | null = null;
  
  private constructor() {}
  
  static getInstance(): ServiceRequestManager {
    if (!ServiceRequestManager.instance) {
      ServiceRequestManager.instance = new ServiceRequestManager();
    }
    return ServiceRequestManager.instance;
  }
  
  // Initialize with employee simulation functions
  initialize(employeeSimulation: EmployeeSimulationFunctions): void {
    this.employeeSimulation = employeeSimulation;
  }
  
  // Subscribe to state changes
  subscribe(listener: (request: ServiceRequestState | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners() {
    console.log('ServiceRequestManager: Notifying listeners with state:', this.currentRequest);
    this.listeners.forEach(listener => listener(this.currentRequest));
  }
  
  // Create new service request
  async createRequest(
    type: ServiceType,
    userLocation: { lat: number; lng: number },
    message: string
  ): Promise<string> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentRequest = {
      id: requestId,
      type,
      userLocation,
      status: 'request_accepted',
      assignedEmployee: null,
      currentQuote: null,
      declineCount: 0,
      blacklistedEmployees: [],
      hasReceivedRevision: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('ServiceRequestManager: Created new request:', this.currentRequest);
    this.notifyListeners();
    
    // Start finding employee
    await this.findAvailableEmployee();
    
    return requestId;
  }
  
  // Find available employee (not blacklisted)
  private async findAvailableEmployee(): Promise<void> {
    if (!this.currentRequest || !this.employeeSimulation) return;
    
    try {
      const { loadEmployees, getRandomEmployee } = this.employeeSimulation;
      await loadEmployees();
      
      // Get blacklisted employees from database
      const dbBlacklisted = await SimulatedEmployeeBlacklistService.getBlacklistedEmployees(this.currentRequest.id);
      const allBlacklisted = [...this.currentRequest.blacklistedEmployees, ...dbBlacklisted];
      
      console.log('Finding employee, blacklisted:', allBlacklisted);
      
      const employee = getRandomEmployee(allBlacklisted);
      
      if (!employee) {
        // No available employees
        this.updateRequestStatus('cancelled');
        toast({
          title: "No employees available",
          description: "All employees are currently busy. Please try again later.",
          variant: "destructive"
        });
        return;
      }
      
      // Assign employee
      this.currentRequest.assignedEmployee = {
        name: employee.full_name,
        id: employee.id.toString(),
        location: {
          lat: this.currentRequest.userLocation.lat + (Math.random() - 0.5) * 0.02,
          lng: this.currentRequest.userLocation.lng + (Math.random() - 0.5) * 0.02
        }
      };
      
      this.currentRequest.updatedAt = new Date().toISOString();
      this.notifyListeners();
      
      console.log('Employee assigned:', employee.full_name);
      
      // Simulate employee response time (2-5 seconds)
      setTimeout(() => {
        this.generateQuote();
      }, 2000 + Math.random() * 3000);
      
    } catch (error) {
      console.error('Error finding employee:', error);
      this.updateRequestStatus('cancelled');
    }
  }
  
  // Generate price quote from assigned employee
  private generateQuote(): void {
    if (!this.currentRequest || !this.currentRequest.assignedEmployee) return;
    
    const basePrices = {
      'flat-tyre': 40,
      'out-of-fuel': 30,
      'car-battery': 60,
      'tow-truck': 100,
      'emergency': 80,
      'other-car-problems': 50,
      'support': 50
    };
    
    const basePrice = basePrices[this.currentRequest.type] || 50;
    const randomPrice = basePrice + Math.floor(Math.random() * 20) - 10;
    const finalPrice = Math.max(20, randomPrice);
    
    this.currentRequest.currentQuote = {
      amount: finalPrice,
      employeeName: this.currentRequest.assignedEmployee.name,
      isRevised: false
    };
    
    this.currentRequest.status = 'quote_received';
    this.currentRequest.updatedAt = new Date().toISOString();
    
    console.log('Quote generated:', finalPrice, 'from', this.currentRequest.assignedEmployee.name);
    console.log('Updated request state:', this.currentRequest);
    
    this.notifyListeners();
  }
  
  // Accept quote
  async acceptQuote(): Promise<void> {
    if (!this.currentRequest || !this.currentRequest.currentQuote || !this.currentRequest.assignedEmployee) return;
    
    this.currentRequest.status = 'quote_accepted';
    this.currentRequest.updatedAt = new Date().toISOString();
    this.notifyListeners();
    
    toast({
      title: "Quote Accepted",
      description: `${this.currentRequest.assignedEmployee.name} is on the way to your location.`
    });
    
    // Start service simulation
    this.simulateServiceProgress();
  }
  
  // Decline quote
  async declineQuote(): Promise<void> {
    if (!this.currentRequest || !this.currentRequest.assignedEmployee) return;
    
    this.currentRequest.declineCount++;
    
    if (this.currentRequest.declineCount === 1 && !this.currentRequest.hasReceivedRevision) {
      // First decline - same employee sends revision
      this.currentRequest.hasReceivedRevision = true;
      this.currentRequest.status = 'quote_declined';
      this.currentRequest.updatedAt = new Date().toISOString();
      this.notifyListeners();
      
      toast({
        title: "Quote Declined",
        description: `${this.currentRequest.assignedEmployee.name} will send you a revised quote.`
      });
      
      // Generate revised quote after 2 seconds
      setTimeout(() => {
        this.generateRevisedQuote();
      }, 2000);
      
    } else {
      // Second decline - blacklist employee and find new one
      await this.blacklistCurrentEmployeeAndFindNew();
    }
  }
  
  // Generate revised quote from same employee
  private generateRevisedQuote(): void {
    if (!this.currentRequest || !this.currentRequest.currentQuote || !this.currentRequest.assignedEmployee) return;
    
    // Lower the price by 5-15 BGN
    const revisedAmount = Math.max(10, this.currentRequest.currentQuote.amount - Math.floor(Math.random() * 15) - 5);
    
    this.currentRequest.currentQuote = {
      amount: revisedAmount,
      employeeName: this.currentRequest.assignedEmployee.name,
      isRevised: true
    };
    
    this.currentRequest.status = 'quote_received';
    this.currentRequest.updatedAt = new Date().toISOString();
    
    console.log('Revised quote generated:', revisedAmount, 'from', this.currentRequest.assignedEmployee.name);
    console.log('Updated request state for revised quote:', this.currentRequest);
    
    this.notifyListeners();
    
    toast({
      title: "Revised Quote Received",
      description: `${this.currentRequest.assignedEmployee.name} sent a revised quote of ${revisedAmount} BGN.`
    });
  }
  
  // Blacklist current employee and find new one
  private async blacklistCurrentEmployeeAndFindNew(): Promise<void> {
    if (!this.currentRequest || !this.currentRequest.assignedEmployee) return;
    
    const employeeToBlacklist = this.currentRequest.assignedEmployee.name;
    
    try {
      // Add to database blacklist
      await SimulatedEmployeeBlacklistService.addToBlacklist(
        this.currentRequest.id,
        employeeToBlacklist,
        'current_user' // This should be actual user ID
      );
      
      // Add to local blacklist
      this.currentRequest.blacklistedEmployees.push(employeeToBlacklist);
      
      // Reset employee assignment
      this.currentRequest.assignedEmployee = null;
      this.currentRequest.currentQuote = null;
      this.currentRequest.declineCount = 0;
      this.currentRequest.hasReceivedRevision = false;
      this.currentRequest.status = 'request_accepted';
      this.currentRequest.updatedAt = new Date().toISOString();
      this.notifyListeners();
      
      console.log('Employee blacklisted:', employeeToBlacklist);
      
      toast({
        title: "Quote Declined",
        description: "Looking for another available employee..."
      });
      
      // Find new employee
      await this.findAvailableEmployee();
      
    } catch (error) {
      console.error('Error blacklisting employee:', error);
    }
  }
  
  // Simulate service progress
  private simulateServiceProgress(): void {
    if (!this.currentRequest) return;
    
    this.currentRequest.status = 'in_progress';
    this.currentRequest.updatedAt = new Date().toISOString();
    this.notifyListeners();
    
    // Complete service after 15 seconds
    setTimeout(() => {
      this.completeService();
    }, 15000);
  }
  
  // Complete service
  private async completeService(): Promise<void> {
    if (!this.currentRequest || !this.currentRequest.assignedEmployee || !this.currentRequest.currentQuote) return;
    
    this.currentRequest.status = 'completed';
    this.currentRequest.updatedAt = new Date().toISOString();
    this.notifyListeners();
    
    try {
      // Add to user history
      await UserHistoryService.addHistoryEntry({
        user_id: 'current_user', // This should be actual user ID
        username: 'current_user',
        service_type: this.currentRequest.type,
        status: 'completed',
        employee_name: this.currentRequest.assignedEmployee.name,
        price_paid: this.currentRequest.currentQuote.amount,
        service_fee: 5,
        total_price: this.currentRequest.currentQuote.amount + 5,
        request_date: this.currentRequest.createdAt,
        completion_date: new Date().toISOString(),
        address_street: 'Sofia Center, Bulgaria',
        latitude: this.currentRequest.userLocation.lat,
        longitude: this.currentRequest.userLocation.lng
      });
    } catch (error) {
      console.error('Error recording completion:', error);
    }
    
    toast({
      title: "Service Completed",
      description: `Your ${this.currentRequest.type} service has been completed successfully.`
    });
    
    // Clear request after a delay
    setTimeout(() => {
      this.clearRequest();
    }, 2000);
  }
  
  // Cancel request
  async cancelRequest(): Promise<void> {
    if (!this.currentRequest) return;
    
    // Clear blacklist for this request
    await SimulatedEmployeeBlacklistService.clearBlacklistForRequest(this.currentRequest.id);
    
    this.updateRequestStatus('cancelled');
    
    toast({
      title: "Request Cancelled",
      description: "Your service request has been cancelled."
    });
    
    this.clearRequest();
  }
  
  // Update request status
  private updateRequestStatus(status: ServiceRequestState['status']): void {
    if (!this.currentRequest) return;
    
    this.currentRequest.status = status;
    this.currentRequest.updatedAt = new Date().toISOString();
    this.notifyListeners();
  }
  
  // Clear current request
  private clearRequest(): void {
    this.currentRequest = null;
    this.notifyListeners();
  }
  
  // Get current request
  getCurrentRequest(): ServiceRequestState | null {
    return this.currentRequest;
  }
}