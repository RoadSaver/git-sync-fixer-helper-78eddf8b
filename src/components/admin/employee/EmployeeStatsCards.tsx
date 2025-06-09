
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, Ban } from 'lucide-react';

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

interface EmployeeStatsCardsProps {
  employees: EmployeeAccount[];
}

const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({ employees }) => {
  return (
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
  );
};

export default EmployeeStatsCards;
