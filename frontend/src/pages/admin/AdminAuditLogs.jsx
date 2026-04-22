import { useQuery } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import { History, ChevronLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import AdminDataTable from '../../components/ui/AdminDataTable';
import { useToast } from '../../context/ToastContext';

export default function AdminAuditLogs() {
  const { addToast } = useToast();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['adminAudit'],
    queryFn: async () => (await api.get('/admin/audit')).data
  });

  const columns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (date) => (
        <span className="text-xs text-slate-500 font-medium">
          {new Date(date).toLocaleString()}
        </span>
      )
    },
    {
      key: 'actorType',
      label: 'Actor',
      render: (type, row) => (
        <div className="flex flex-col">
          <span className="font-black text-primary-navy uppercase text-[10px]">{type}</span>
          <code className="text-[9px] text-slate-400 font-bold tracking-tighter">{row.actorId}</code>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (action, row) => (
        <Badge variant="stale">
          {row.category}:{action}
        </Badge>
      )
    },
    {
      key: 'referenceId',
      label: 'Details',
      render: (ref) => (
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">
          REF: {ref}
        </div>
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
          <div className="p-3 bg-slate-50 rounded-2xl">
            <History size={24} className="text-slate-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight leading-none">System Audit Trail</h1>
        </div>
        <p className="text-slate-500 font-medium italic mt-2">Comprehensive history of all administrative actions and system updates.</p>
      </header>

      <AdminDataTable
        columns={columns}
        data={logs}
        loading={isLoading}
      />
    </div>
  );
}
