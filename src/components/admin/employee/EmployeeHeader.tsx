
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Download } from 'lucide-react';

interface EmployeeHeaderProps {
  onBack: () => void;
  onCreateEmployee: () => void;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ onBack, onCreateEmployee }) => {
  return (
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
        <Button onClick={onCreateEmployee} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Employee
        </Button>
      </div>
    </div>
  );
};

export default EmployeeHeader;
