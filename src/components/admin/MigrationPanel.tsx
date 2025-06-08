import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { UserAccountService } from '@/services/userAccountService';
import { EmployeeAccountService } from '@/services/employeeAccountService';
import { supabase } from '@/integrations/supabase/client';
import MaterialDashboard from './MaterialDashboard';
import MaterialSidebar from './MaterialSidebar';
import MaterialHeader from './MaterialHeader';

const MigrationPanel: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'employees' | 'simulation'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    pendingUsers: 0,
    existingUsers: 0,
    employees: 0,
    simulationEmployees: 0
  });

  const refreshStats = async () => {
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
      
      setStats({
        pendingUsers: pendingUsers.length,
        existingUsers: existingUsers?.length || 0,
        employees: employees.length,
        simulationEmployees: simulationEmployees?.length || 0
      });
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'users': return 'User Management';
      case 'employees': return 'Employee Management';
      case 'simulation': return 'Simulation Management';
      default: return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (currentView) {
      case 'users': return 'Manage user accounts and permissions';
      case 'employees': return 'Manage employee accounts and roles';
      case 'simulation': return 'Manage simulation employee data';
      default: return 'Overview of your platform metrics';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <MaterialSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        stats={stats}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <MaterialHeader
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <MaterialDashboard
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </main>
      </div>
    </div>
  );
};

export default MigrationPanel;