import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard,
  Users, 
  UserCheck, 
  UserCog, 
  Database,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MaterialSidebarProps {
  currentView: 'dashboard' | 'users' | 'employees' | 'simulation';
  onViewChange: (view: 'dashboard' | 'users' | 'employees' | 'simulation') => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  stats: {
    existingUsers: number;
    employees: number;
    simulationEmployees: number;
  };
}

const MaterialSidebar: React.FC<MaterialSidebarProps> = ({
  currentView,
  onViewChange,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  stats
}) => {
  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'users' as const,
      label: 'User Management',
      icon: Users,
      badge: stats.existingUsers
    },
    {
      id: 'employees' as const,
      label: 'Employee Management',
      icon: UserCheck,
      badge: stats.employees
    },
    {
      id: 'simulation' as const,
      label: 'Simulation Management',
      icon: UserCog,
      badge: stats.simulationEmployees
    }
  ];

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = currentView === item.id;
    const Icon = item.icon;

    return (
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start mb-1 transition-all duration-200 ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
            : 'hover:bg-gray-100 text-gray-700'
        } ${isCollapsed ? 'px-2' : 'px-4'}`}
        onClick={() => onViewChange(item.id)}
      >
        <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge !== null && (
              <Badge 
                variant={isActive ? "secondary" : "default"} 
                className={`ml-2 ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Button>
    );
  };

  return (
    <div className={`bg-white shadow-lg border-r transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RoadSaver
              </h2>
              <p className="text-sm text-gray-500">Account Manager</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Secondary Menu */}
        <div className="mt-8 pt-4 border-t">
          <Button
            variant="ghost"
            className={`w-full justify-start mb-1 text-gray-700 hover:bg-gray-100 ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
          >
            <BarChart3 className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
            {!isCollapsed && <span>Analytics</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-1 text-gray-700 hover:bg-gray-100 ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
          >
            <Settings className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
            {!isCollapsed && <span>Settings</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start mb-1 text-gray-700 hover:bg-gray-100 ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
          >
            <HelpCircle className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
            {!isCollapsed && <span>Help</span>}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          onClick={onLogout}
          className={`w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 ${
            isCollapsed ? 'px-2' : 'px-4'
          }`}
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default MaterialSidebar;