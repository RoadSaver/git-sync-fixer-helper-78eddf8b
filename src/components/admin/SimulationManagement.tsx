import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Search, Filter, Download, MoreVertical, UserCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SimulationEmployee {
  id: number;
  employee_number: number;
  full_name: string;
  created_at: string;
}

interface SimulationManagementProps {
  onBack: () => void;
}

const SimulationManagement: React.FC<SimulationManagementProps> = ({ onBack }) => {
  const [simulationEmployees, setSimulationEmployees] = useState<SimulationEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<SimulationEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSimulationEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_simulation')
        .select('*')
        .order('employee_number');

      if (error) throw error;
      setSimulationEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (error) {
      console.error('Error loading simulation employees:', error);
      toast({
        title: "Error",
        description: "Failed to load simulation employees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSimulationEmployees();
  }, []);

  useEffect(() => {
    const filtered = simulationEmployees.filter(employee =>
      employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_number.toString().includes(searchTerm)
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, simulationEmployees]);

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
            <h1 className="text-2xl font-bold text-gray-900">Simulation Management</h1>
            <p className="text-gray-600">Manage simulation employee accounts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Create New Simulation Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Simulation Employees</p>
                <p className="text-2xl font-bold text-gray-900">{simulationEmployees.length}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                <UserCog className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available for Assignment</p>
                <p className="text-2xl font-bold text-gray-900">{simulationEmployees.length}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <UserCog className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <UserCog className="h-5 w-5 text-white" />
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
              <CardTitle className="text-xl">Simulation Employees ({filteredEmployees.length})</CardTitle>
              <CardDescription>
                View and manage all simulation employee accounts from the Employee Simulation database
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search simulation employees..."
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading simulation employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No simulation employees found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Number</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">#{employee.employee_number}</TableCell>
                      <TableCell className="font-medium">{employee.full_name}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Available
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
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
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
    </div>
  );
};

export default SimulationManagement;