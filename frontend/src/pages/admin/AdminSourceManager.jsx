import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Globe, 
  ChevronLeft, 
  Plus, 
  ToggleRight as ToggleIcon,
  Search,
  MoreVertical,
  Shield,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// UI Components
import AdminDataTable from '../../components/ui/AdminDataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';
import { useToast } from '../../context/ToastContext';

export default function AdminSourceManager() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ['adminSources'],
    queryFn: async () => {
      const { data } = await api.get('/admin/sources');
      return data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, level }) => api.put(`/admin/sources/${id}/verify`, { verificationLevel: level }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['adminSources'] });
      addToast({
        title: 'Level Updated',
        body: `Source level set to ${vars.level}.`,
        type: 'success'
      });
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: ({ id, active }) => api.put(`/admin/sources/${id}`, { isActive: active }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['adminSources'] });
      addToast({
        title: vars.active ? 'Source Activated' : 'Source Deactivated',
        body: 'Student submissions will be adjusted accordingly.',
        type: 'info'
      });
    }
  });

  const tableColumns = [
    { 
      key: 'name', 
      label: 'Organisation', 
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-primary-navy">
            {row.sourceType === 'scraper' ? <Globe size={18} /> : <Shield size={18} />}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-primary-navy">{name}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.sourceType}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'verificationLevel', 
      label: 'Verification', 
      render: (level) => <Badge variant={level === 'unverified' ? 'unverified' : level}>{level}</Badge>
    },
    { 
      key: 'listingCount', 
      label: 'Listings', 
      render: (count) => <span className="text-xs font-black text-slate-500">{count || 0}</span>
    },
    { 
      key: 'isActive', 
      label: 'Status', 
      render: (active, row) => (
        <div className="flex items-center gap-2">
           <Toggle 
              checked={active} 
              onChange={() => deactivateMutation.mutate({ id: row._id, active: !active })} 
            />
           <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-emerald-500' : 'text-slate-300'}`}>
             {active ? 'Active' : 'Inactive'}
           </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="px-1 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <Link to="/admin" className="text-xs font-black text-slate-400 hover:text-primary-navy transition-colors flex items-center gap-1 uppercase tracking-widest mb-2">
            <ChevronLeft size={14} /> Back to Hub
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">Source Hub</h1>
          <p className="text-slate-500 font-medium italic">Manage organisation authority and data intake partners.</p>
        </div>
        
        <Button 
          variant="primary" 
          iconLeading={Plus} 
          onClick={() => {}}
        >
          Add Organisation
        </Button>
      </header>

      <div className="relative">
         <AdminDataTable 
            columns={tableColumns} 
            data={sources} 
            loading={isLoading}
            actions={[
              { 
                icon: ShieldCheck, 
                label: 'Verify (Official)', 
                onClick: (row) => verifyMutation.mutate({ id: row._id, level: 'official' }) 
              },
              { 
                icon: CheckCircle2, 
                label: 'Verify (Verified)', 
                onClick: (row) => verifyMutation.mutate({ id: row._id, level: 'verified' }) 
              },
              { 
                icon: XCircle, 
                label: 'Strip Verification', 
                variant: 'danger', 
                onClick: (row) => verifyMutation.mutate({ id: row._id, level: 'unverified' }) 
              }
            ]}
          />
      </div>

      <section className="p-10 bg-primary-navy rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20">
        <div className="max-w-2xl space-y-4">
          <h3 className="text-xl font-black tracking-tight">Intake Intelligence</h3>
          <p className="text-sm font-medium text-white/60 leading-relaxed italic">
            Listings curated from Official sources skip the "Pending" audit queue and are automatically flagged as Curated. 
            Deactivating a source prevents students from creating manual listings under that organization but does not hide existing data.
          </p>
        </div>
      </section>
    </div>
  );
}
