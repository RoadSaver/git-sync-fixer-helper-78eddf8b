
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck } from 'lucide-react';
import EmployeeTableRow from './EmployeeTableRow';

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

interface EmployeeTableProps {
  employees: EmployeeAccount[];
  loading: boolean;
  showPasswords: {[key: string]: boolean};
  onEditEmployee: (employee: EmployeeAccount) => void;
  onTogglePassword: (employeeId: string) => void;
  onBanEmployee: (employee: EmployeeAccount) => void;
  onUnbanEmployee: (employee: EmployeeAccount) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  showPasswords,
  onEditEmployee,
  onTogglePassword,
  onBanEmployee,
  onUnbanEmployee
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No employees found</p>
      </div>
    );
  }

  return (
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
          {employees.map((employee) => (
            <EmployeeTableRow
              key={employee.id}
              employee={employee}
              showPassword={showPasswords[employee.id] || false}
              onEdit={onEditEmployee}
              onTogglePassword={onTogglePassword}
              onBan={onBanEmployee}
              onUnban={onUnbanEmployee}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeTable;
