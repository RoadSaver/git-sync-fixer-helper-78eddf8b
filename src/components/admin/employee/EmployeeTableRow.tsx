
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Eye, EyeOff, Ban, UserCheck } from 'lucide-react';
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

interface EmployeeTableRowProps {
  employee: EmployeeAccount;
  showPassword: boolean;
  onEdit: (employee: EmployeeAccount) => void;
  onTogglePassword: (employeeId: string) => void;
  onBan: (employee: EmployeeAccount) => void;
  onUnban: (employee: EmployeeAccount) => void;
}

const EmployeeTableRow: React.FC<EmployeeTableRowProps> = ({
  employee,
  showPassword,
  onEdit,
  onTogglePassword,
  onBan,
  onUnban
}) => {
  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
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
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePassword(employee.id)}>
              {showPassword ? (
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
              <DropdownMenuItem onClick={() => onUnban(employee)} className="text-green-600">
                <UserCheck className="h-4 w-4 mr-2" />
                Unban
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onBan(employee)} className="text-red-600">
                <Ban className="h-4 w-4 mr-2" />
                Ban
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default EmployeeTableRow;
