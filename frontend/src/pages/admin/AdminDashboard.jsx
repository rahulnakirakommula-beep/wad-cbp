import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import { 
  Database, 
  Shield, 
  AlertCircle, 
  Users, 
  CheckCircle,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Plus,
  FileText,
  Search,
  Check,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// UI Components
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import AdminDataTable from '../../components/ui/AdminDataTable';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    }
  });

  const { data: flags = [], isLoading: flagsLoading } = useQuery({
    queryKey: ['adminFlags'],
    queryFn: async () => {
      const { data } = await api.get('/admin/flags?status=pending');
      return data;
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, status }) => api.put(`/admin/flags/${id}`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminFlags'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      addToast({
        title: 'Flag Resolved',
        message: `Issue marked as ${variables.status}.`,
        type: 'success'
      });
    }
  });

  const tableColumns = [
    { 
      key: 'listingId', 
      label: 'Listing', 
      render: (listing) => (
        <div className="flex flex-col">
          <span className="truncate max-w-[200px]">{listing?.title || 'Unknown Listing'}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{listing?.orgName}</span>
        </div>
      )
    },
    { 
      key: 'issueType', 
      label: 'Issue Type', 
      render: (type) => <Badge variant="missed">{type?.replace('_', ' ')}</Badge>
    },
    { 
      key: 'reporterId', 
      label: 'Reporter', 
      render: (u) => <span className="text-xs">{u?.name || 'Anonymous'}</span>
    },
    { 
      key: 'createdAt', 
      label: 'Reported At', 
      render: (d) => <span className="text-xs text-slate-400 font-medium">{new Date(d).toLocaleDateString()}</span>
    }
  ];

  if (statsLoading) return (
    <div className="space-y-10 animate-pulse">
      <Skeleton variant="text" className="w-1/4 h-10" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
      </div>
      <Skeleton className="h-96 rounded-[2.5rem]" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <header className="px-1 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-red-50 text-red-500 border border-red-100 rounded text-[10px] font-black uppercase tracking-widest">System Admin</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">Intelligence Console</h1>
          <p className="text-slate-500 font-medium italic">Operational oversight and data quality management.</p>
        </div>
        
        <Button 
          variant="primary" 
          iconLeading={Plus} 
          onClick={() => navigate('/admin/listings/new')}
        >
          New Opportunity
        </Button>
      </header>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard label="Live Listings" value={stats?.totalListings} icon={Database} color="text-blue-500" bg="bg-blue-50" />
        <AdminStatCard label="Pending Flags" value={stats?.pendingFlags} icon={AlertCircle} color="text-red-500" bg="bg-red-50" trend="Action Required" />
        <AdminStatCard label="Verified Sources" value={stats?.verifiedSources || 0} icon={Shield} color="text-emerald-500" bg="bg-emerald-50" />
        <AdminStatCard label="Active Students" value={stats?.activeUsers} icon={Users} color="text-amber-500" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left: Quality Queue */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Data Quality Queue</h2>
            <Badge variant="primary">{flags.length} Issues</Badge>
          </div>

          <AdminDataTable 
            columns={tableColumns} 
            data={flags} 
            loading={flagsLoading}
            onRowClick={(row) => navigate(`/admin/listings/${row.listingId?._id || row.listingId}`)}
            actions={[
              { 
                icon: Check, 
                label: 'Resolve', 
                onClick: (row) => resolveMutation.mutate({ id: row._id, status: 'resolved' }) 
              },
              { 
                icon: X, 
                label: 'Dismiss', 
                variant: 'danger',
                onClick: (row) => resolveMutation.mutate({ id: row._id, status: 'dismissed' }) 
              }
            ]}
          />
        </div>

        {/* Right: Quick Tools */}
        <aside className="space-y-10">
          <section className="bg-primary-navy p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-8 pb-4 border-b border-white/10">Control Center</h3>
              <div className="space-y-4">
                <ToolLink 
                  label="Listing Manager" 
                  description="Edit and curate opportunities" 
                  icon={FileText} 
                  onClick={() => navigate('/admin/listings')} 
                />
                <ToolLink 
                  label="Submission Queue" 
                  description="Review organic submissions" 
                  icon={TrendingUp} 
                  onClick={() => navigate('/admin/listings?status=unknown')} 
                />
                <ToolLink 
                  label="Source Hub" 
                  description="Manage scrapers and crawls" 
                  icon={Shield} 
                  onClick={() => navigate('/admin/sources')} 
                />
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          </section>

          <section className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6">System Health</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-600">Sync Status</span>
              <Badge variant="success">All Healthy</Badge>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-full h-full bg-emerald-500" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, icon: Icon, color, bg, trend }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${bg} ${color} rounded-2xl group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-primary-navy tracking-tight leading-none mb-1">{value || 0}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 pt-4 border-t border-slate-50">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{trend}</span>
        </div>
      )}
    </div>
  );
}

function ToolLink({ label, description, icon: Icon, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group text-left"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white/10 rounded-xl text-blue-300 group-hover:text-white transition-colors">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-black tracking-tight leading-none mb-1">{label}</p>
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{description}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-all group-hover:translate-x-1" />
    </button>
  );
}
