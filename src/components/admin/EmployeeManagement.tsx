
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeAccountService } from '@/services/employeeAccountService';
import { toast } from '@/components/ui/use-toast';
import CreateEmployeeModal from './CreateEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import BanConfirmDialog from './BanConfirmDialog';
import UnbanConfirmDialog from './UnbanConfirmDialog';
import EmployeeHeader from './employee/EmployeeHeader';
import EmployeeStatsCards from './employee/EmployeeStatsCards';
import EmployeeFilters from './employee/EmployeeFilters';
import EmployeeTable from './employee/EmployeeTable';

interface EmployeeAccount {
  id: string;
  username: string;
  email: string;
  phone_number?: string;
  employee_role?: string;
  status?: string;
  real_name?: string;
  created_at: string;
}

interface EmployeeManagementProps {
  onBack: () => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ onBack }) => {
  const [employees, setEmployees] = useState<EmployeeAccount[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAccount | null>(null);

  const loadEmployees = async () => {
    try {
      const employeeData = await EmployeeAccountService.getAllEmployees();
      setEmployees(employeeData || []);
      setFilteredEmployees(employeeData || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.real_name && employee.real_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleEmployeeCreated = () => {
    loadEmployees();
  };

  const handleEmployeeUpdated = () => {
    loadEmployees();
    setSelectedEmployee(null);
  };

  const handleEditEmployee = (employee: EmployeeAccount) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleBanEmployee = (employee: EmployeeAccount) => {
    setSelectedEmployee(employee);
    setShowBanDialog(true);
  };

  const handleUnbanEmployee = (employee: EmployeeAccount) => {
    setSelectedEmployee(employee);
    setShowUnbanDialog(true);
  };

  const confirmBanEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      await EmployeeAccountService.updateEmployeeStatus(selectedEmployee.id, 'suspended');
      toast({
        title: "Employee Restricted",
        description: `${selectedEmployee.username} has been restricted from using the app`
      });
      loadEmployees();
    } catch (error) {
      console.error('Error banning employee:', error);
      toast({
        title: "Error",
        description: "Failed to restrict employee",
        variant: "destructive"
      });
    } finally {
      setShowBanDialog(false);
      setSelectedEmployee(null);
    }
  };

  const confirmUnbanEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      await EmployeeAccountService.updateEmployeeStatus(selectedEmployee.id, 'active');
      toast({
        title: "Employee Access Reinstated",
        description: `${selectedEmployee.username}'s access has been restored`
      });
      loadEmployees();
    } catch (error) {
      console.error('Error unbanning employee:', error);
      toast({
        title: "Error",
        description: "Failed to reinstate employee access",
        variant: "destructive"
      });
    } finally {
      setShowUnbanDialog(false);
      setSelectedEmployee(null);
    }
  };

  const togglePasswordVisibility = (employeeId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <EmployeeHeader onBack={onBack} onCreateEmployee={() => setShowCreateModal(true)} />
      
      <EmployeeStatsCards employees={employees} />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Employees ({filteredEmployees.length})</CardTitle>
              <CardDescription>
                View and manage all employee accounts from the Employee Accounts database
              </CardDescription>
            </div>
            <EmployeeFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
        </CardHeader>
        <CardContent>
          <EmployeeTable
            employees={filteredEmployees}
            loading={loading}
            showPasswords={showPasswords}
            onEditEmployee={handleEditEmployee}
            onTogglePassword={togglePasswordVisibility}
            onBanEmployee={handleBanEmployee}
            onUnbanEmployee={handleUnbanEmployee}
          />
        </CardContent>
      </Card>

      <CreateEmployeeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEmployeeCreated={handleEmployeeCreated}
      />

      {selectedEmployee && (
        <EditEmployeeModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          onEmployeeUpdated={handleEmployeeUpdated}
          employee={selectedEmployee}
        />
      )}

      <BanConfirmDialog
        isOpen={showBanDialog}
        onClose={() => {
          setShowBanDialog(false);
          setSelectedEmployee(null);
        }}
        onConfirm={confirmBanEmployee}
        userName={selectedEmployee?.username || ''}
        type="employee"
      />

      <UnbanConfirmDialog
        isOpen={showUnbanDialog}
        onClose={() => {
          setShowUnbanDialog(false);
          setSelectedEmployee(null);
        }}
        onConfirm={confirmUnbanEmployee}
        userName={selectedEmployee?.username || ''}
        type="employee"
      />
    </div>
  );
};

export default EmployeeManagement;
