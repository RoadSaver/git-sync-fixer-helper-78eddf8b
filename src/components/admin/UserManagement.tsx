import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Eye, EyeOff, Ban, UserCheck, Search, Filter, Download, MoreVertical } from 'lucide-react';
import { UserAccountService } from '@/services/userAccountService';
import { toast } from '@/components/ui/use-toast';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import BanConfirmDialog from './BanConfirmDialog';
import UnbanConfirmDialog from './UnbanConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserAccount {
  id: string;
  username: string;
  email: string;
  phone_number?: string;
  gender?: string;
  full_name?: string;
  created_at: string;
  created_by_admin?: boolean;
  status?: 'active' | 'banned';
}

interface UserManagementProps {
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  const loadUsers = async () => {
    try {
      const userData = await UserAccountService.getExistingUsers();
      setUsers(userData || []);
      setFilteredUsers(userData || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleUserCreated = () => {
    loadUsers();
  };

  const handleUserUpdated = () => {
    loadUsers();
    setSelectedUser(null);
  };

  const handleEditUser = (user: UserAccount) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleBanUser = (user: UserAccount) => {
    setSelectedUser(user);
    setShowBanDialog(true);
  };

  const handleUnbanUser = (user: UserAccount) => {
    setSelectedUser(user);
    setShowUnbanDialog(true);
  };

  const confirmBanUser = async () => {
    if (!selectedUser) return;

    try {
      await UserAccountService.updateUserStatus(selectedUser.id, 'banned');
      toast({
        title: "User Banned",
        description: `${selectedUser.username} has been restricted from using the app`
      });
      loadUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive"
      });
    } finally {
      setShowBanDialog(false);
      setSelectedUser(null);
    }
  };

  const confirmUnbanUser = async () => {
    if (!selectedUser) return;

    try {
      await UserAccountService.updateUserStatus(selectedUser.id, 'active');
      toast({
        title: "User Access Reinstated",
        description: `${selectedUser.username}'s access has been restored`
      });
      loadUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Error",
        description: "Failed to reinstate user access",
        variant: "destructive"
      });
    } finally {
      setShowUnbanDialog(false);
      setSelectedUser(null);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
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
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create New User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status !== 'banned').length}</p>
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
                <p className="text-sm font-medium text-gray-600">Admin Created</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.created_by_admin).length}</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Banned Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'banned').length}</p>
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
              <CardTitle className="text-xl">Users ({filteredUsers.length})</CardTitle>
              <CardDescription>
                View and manage all user accounts from the Existing User Accounts database
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
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
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone_number || 'N/A'}</TableCell>
                      <TableCell>{user.gender || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.status === 'banned' ? 'destructive' : 'default'}
                          className={user.status === 'banned' ? '' : 'bg-green-100 text-green-800 hover:bg-green-200'}
                        >
                          {user.status === 'banned' ? 'Banned' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={user.created_by_admin ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-green-200 text-green-700 bg-green-50'}
                        >
                          {user.created_by_admin ? 'Admin Created' : 'Self Registered'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => togglePasswordVisibility(user.id)}>
                              {showPasswords[user.id] ? (
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
                            {user.status === 'banned' ? (
                              <DropdownMenuItem onClick={() => handleUnbanUser(user)} className="text-green-600">
                                <UserCheck className="h-4 w-4 mr-2" />
                                Unban
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleBanUser(user)} className="text-red-600">
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
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={handleUserCreated}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onUserUpdated={handleUserUpdated}
          user={selectedUser}
        />
      )}

      <BanConfirmDialog
        isOpen={showBanDialog}
        onClose={() => {
          setShowBanDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmBanUser}
        userName={selectedUser?.username || ''}
        type="user"
      />

      <UnbanConfirmDialog
        isOpen={showUnbanDialog}
        onClose={() => {
          setShowUnbanDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmUnbanUser}
        userName={selectedUser?.username || ''}
        type="user"
      />
    </div>
  );
};

export default UserManagement;