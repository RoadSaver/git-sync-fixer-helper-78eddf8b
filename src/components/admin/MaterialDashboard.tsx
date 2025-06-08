import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserCog, 
  Database, 
  RefreshCw, 
  Plus,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { UserAccountService } from '@/services/userAccountService';
import { EmployeeAccountService } from '@/services/employeeAccountService';
import { supabase } from '@/integrations/supabase/client';
import UserManagement from './UserManagement';
import EmployeeManagement from './EmployeeManagement';
import SimulationManagement from './SimulationManagement';

interface DashboardStats {
  pendingUsers: number;
  existingUsers: number;
  employees: number;
  simulationEmployees: number;
  totalRequests: number;
  activeRequests: number;
  completedToday: number;
  revenue: number;
}

interface MaterialDashboardProps {
  onViewChange: (view: 'dashboard' | 'users' | 'employees' | 'simulation') => void;
  currentView: 'dashboard' | 'users' | 'employees' | 'simulation';
}

const MaterialDashboard: React.FC<MaterialDashboardProps> = ({ onViewChange, currentView }) => {
  const [stats, setStats] = useState<DashboardStats>({
    pendingUsers: 0,
    existingUsers: 0,
    employees: 0,
    simulationEmployees: 0,
    totalRequests: 0,
    activeRequests: 0,
    completedToday: 0,
    revenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshStats = async () => {
    setIsLoading(true);
    try {
      const [pendingUsers, employees, existingUsers] = await Promise.all([
        UserAccountService.getPendingNewUsers(), 
        EmployeeAccountService.getAllEmployees(),
        UserAccountService.getExistingUsers()
      ]);
      
      // Get simulation employees count
      const { data: simulationEmployees } = await supabase
        .from('employee_simulation')
        .select('*');

      // Get request statistics (mock data for demo)
      const totalRequests = 1247;
      const activeRequests = 23;
      const completedToday = 45;
      const revenue = 12450.75;
      
      setStats({
        pendingUsers: pendingUsers.length,
        existingUsers: existingUsers?.length || 0,
        employees: employees.length,
        simulationEmployees: simulationEmployees?.length || 0,
        totalRequests,
        activeRequests,
        completedToday,
        revenue
      });
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  if (currentView !== 'dashboard') {
    switch (currentView) {
      case 'users':
        return <UserManagement onBack={() => onViewChange('dashboard')} />;
      case 'employees':
        return <EmployeeManagement onBack={() => onViewChange('dashboard')} />;
      case 'simulation':
        return <SimulationManagement onBack={() => onViewChange('dashboard')} />;
      default:
        return null;
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = "blue",
    onClick 
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: React.ComponentType<any>;
    color?: string;
    onClick?: () => void;
  }) => (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${
          color === 'blue' ? 'from-blue-500 to-blue-600' :
          color === 'green' ? 'from-green-500 to-green-600' :
          color === 'purple' ? 'from-purple-500 to-purple-600' :
          color === 'orange' ? 'from-orange-500 to-orange-600' :
          'from-gray-500 to-gray-600'
        }`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <p className="text-xs text-green-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    color, 
    onClick 
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    onClick: () => void;
  }) => (
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );

  const RecentActivityItem = ({ 
    action, 
    user, 
    time, 
    type 
  }: {
    action: string;
    user: string;
    time: string;
    type: 'user' | 'employee' | 'request';
  }) => (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        type === 'user' ? 'bg-green-100' :
        type === 'employee' ? 'bg-blue-100' :
        'bg-purple-100'
      }`}>
        {type === 'user' ? <Users className="h-5 w-5 text-green-600" /> :
         type === 'employee' ? <UserCheck className="h-5 w-5 text-blue-600" /> :
         <Activity className="h-5 w-5 text-purple-600" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{action}</p>
        <p className="text-xs text-gray-500">{user}</p>
      </div>
      <div className="text-xs text-gray-400">{time}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={refreshStats} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.existingUsers}
            change="+12% from last month"
            icon={Users}
            color="green"
            onClick={() => onViewChange('users')}
          />
          <StatCard
            title="Active Employees"
            value={stats.employees}
            change="+5% from last month"
            icon={UserCheck}
            color="blue"
            onClick={() => onViewChange('employees')}
          />
          <StatCard
            title="Total Requests"
            value={stats.totalRequests.toLocaleString()}
            change="+23% from last month"
            icon={Activity}
            color="purple"
          />
          <StatCard
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            change="+18% from last month"
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Active Requests"
            value={stats.activeRequests}
            icon={Clock}
            color="blue"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon={Calendar}
            color="green"
          />
          <StatCard
            title="Simulation Employees"
            value={stats.simulationEmployees}
            icon={UserCog}
            color="purple"
            onClick={() => onViewChange('simulation')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Manage your platform efficiently</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <QuickActionCard
                  title="Create User"
                  description="Add a new user account"
                  icon={Users}
                  color="from-green-500 to-green-600"
                  onClick={() => onViewChange('users')}
                />
                <QuickActionCard
                  title="Add Employee"
                  description="Register new employee"
                  icon={UserCheck}
                  color="from-blue-500 to-blue-600"
                  onClick={() => onViewChange('employees')}
                />
                <QuickActionCard
                  title="View Analytics"
                  description="Check platform metrics"
                  icon={BarChart3}
                  color="from-purple-500 to-purple-600"
                  onClick={() => {}}
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest platform activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <RecentActivityItem
                    action="New user registered"
                    user="john.doe@example.com"
                    time="2 min ago"
                    type="user"
                  />
                  <RecentActivityItem
                    action="Employee account created"
                    user="Jane Smith - Technician"
                    time="15 min ago"
                    type="employee"
                  />
                  <RecentActivityItem
                    action="Service request completed"
                    user="Request #1247 - Flat Tire"
                    time="32 min ago"
                    type="request"
                  />
                  <RecentActivityItem
                    action="New user registered"
                    user="alice.johnson@example.com"
                    time="1 hour ago"
                    type="user"
                  />
                  <RecentActivityItem
                    action="Employee status updated"
                    user="Mike Wilson - Active"
                    time="2 hours ago"
                    type="employee"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Request Volume
              </CardTitle>
              <CardDescription>Service requests over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600">Chart visualization would go here</p>
                  <p className="text-sm text-gray-500">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Service Distribution
              </CardTitle>
              <CardDescription>Breakdown of service types requested</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">Service type distribution chart</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        Flat Tire
                      </span>
                      <span>35%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        Out of Fuel
                      </span>
                      <span>28%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        Battery Issues
                      </span>
                      <span>22%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                        Other
                      </span>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaterialDashboard;