import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import { Users, UserX, UserCheck, Shield, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import AdminDataTable from '../../components/ui/AdminDataTable';
import { useToast } from '../../context/ToastContext';

export default function AdminUserManager() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => (await api.get('/admin/users')).data
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => api.put(`/admin/users/${id}/status`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      addToast({
        title: 'Status Updated',
        message: `User marked as ${variables.status}.`,
        type: 'success'
      });
    }
  });

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-black text-primary-navy">{row.profile?.name}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">{row.email}</span>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (role) => <Badge variant="role">{role}</Badge>
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <Badge variant={status === 'active' ? 'verified' : 'cancelled'}>
          {status}
        </Badge>
      )
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      render: (date) => (
        <span className="text-xs text-slate-400 font-medium">
          {date ? new Date(date).toLocaleDateString() : 'Never'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="px-1 space-y-1">
        <Link to="/admin" className="text-xs font-black text-slate-400 hover:text-primary-navy transition-colors flex items-center gap-1 uppercase tracking-widest mb-2">
          <ChevronLeft size={14} /> Back to Hub
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight leading-none">User Accounts</h1>
        </div>
        <p className="text-slate-500 font-medium italic mt-2">Manage access permissions and account statuses.</p>
      </header>

      <AdminDataTable
        columns={columns}
        data={users}
        loading={isLoading}
        actions={[
          {
            icon: (row) => row.status === 'active' ? UserX : UserCheck,
            label: (row) => row.status === 'active' ? 'Suspend' : 'Activate',
            variant: (row) => row.status === 'active' ? 'danger' : 'success',
            onClick: (row) => toggleStatusMutation.mutate({ 
              id: row._id, 
              status: row.status === 'active' ? 'suspended' : 'active' 
            })
          }
        ]}
      />
    </div>
  );
}
