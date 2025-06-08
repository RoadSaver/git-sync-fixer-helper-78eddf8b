import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Eye, EyeOff, Ban, UserCheck, Search, Filter, Download, MoreVertical } from 'lucide-react';
import { EmployeeAccountService } from '@/services/employeeAccountService';
import { toast } from '@/components/ui/use-toast';
import CreateEmployeeModal from './CreateEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import BanConfirmDialog from './BanConfirmDialog';
import UnbanConfirmDialog from './UnbanConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600">Manage employee accounts and roles</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create New Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.status === 'active').length}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Technicians</p>
                <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.employee_role === 'technician').length}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{employees.filter(e => e.status === 'suspended').length}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <Ban className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Employees ({filteredEmployees.length})</CardTitle>
              <CardDescription>
                View and manage all employee accounts from the Employee Accounts database
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No employees found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{employee.real_name || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{employee.username}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone_number || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(employee.employee_role)}>
                          {employee.employee_role || 'technician'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={employee.status === 'suspended' ? 'destructive' : 'default'}
                          className={
                            employee.status === 'suspended' ? '' :
                            employee.status === 'inactive' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                            'bg-green-100 text-green-800 hover:bg-green-200'
                          }
                        >
                          {employee.status === 'suspended' ? 'Restricted' : 
                           employee.status === 'inactive' ? 'Inactive' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(employee.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => togglePasswordVisibility(employee.id)}>
                              {showPasswords[employee.id] ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Hide Password
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Show Password
                                </>
                              )}
                            </DropdownMenuItem>
                            {employee.status === 'suspended' ? (
                              <DropdownMenuItem onClick={() => handleUnbanEmployee(employee)} className="text-green-600">
                                <UserCheck className="h-4 w-4 mr-2" />
                                Unban
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleBanEmployee(employee)} className="text-red-600">
                                <Ban className="h-4 w-4 mr-2" />
                                Ban
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
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
        open={showUnbanDialog}
        onOpenChange={() => {
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