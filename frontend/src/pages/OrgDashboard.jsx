import { useQuery } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import { Package, Plus, BarChart3, Activity, ExternalLink, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import AdminDataTable from '../components/ui/AdminDataTable';
import Skeleton from '../components/ui/Skeleton';

export default function OrgDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['orgStats'],
    queryFn: async () => (await api.get('/org/stats')).data
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['orgListings'],
    queryFn: async () => (await api.get('/org/listings')).data
  });

  const columns = [
    {
      key: 'title',
      label: 'Opportunity',
      render: (title, row) => (
        <div className="flex flex-col">
          <span className="font-black text-primary-navy truncate max-w-[300px]">{title}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{row.type}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <Badge variant={status}>{status}</Badge>
    },
    {
      key: 'interestCount',
      label: 'Engagement',
      render: (count) => (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-5 h-5 rounded-full bg-slate-100 border-2 border-white" />
            ))}
          </div>
          <span className="text-xs font-black text-blue-500">+{count || 0}</span>
        </div>
      )
    },
    {
      key: 'timeline',
      label: 'Deadline',
      render: (timeline) => (
        <span className="text-xs font-bold text-slate-500">
          {timeline?.deadline ? new Date(timeline.deadline).toLocaleDateString() : 'TBD'}
        </span>
      )
    }
  ];

  if (statsLoading && listingsLoading) return (
    <div className="space-y-10 animate-pulse">
      <Skeleton className="h-12 w-1/3 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
      </div>
      <Skeleton className="h-96 rounded-[2.5rem]" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black text-primary-navy tracking-tight leading-none">Partner Portal</h1>
          <p className="text-slate-500 font-medium italic">Empowering organizations to connect with talent.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="outline" 
            iconLeading={Search}
            className="rounded-2xl"
          >
            Find Talent
          </Button>
          <Button 
            variant="primary" 
            iconLeading={Plus}
            onClick={() => navigate('/org/listings/new')}
            className="rounded-2xl shadow-xl shadow-blue-900/10"
          >
            Publish Opportunity
          </Button>
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <OrgMetricCard 
          label="Active Talent Feed" 
          value={stats?.totalListings || 0} 
          icon={Package} 
          color="text-blue-500" 
          bg="bg-blue-50" 
        />
        <OrgMetricCard 
          label="Live Engagement" 
          value={stats?.openOpportunities || 0} 
          icon={Activity} 
          color="text-emerald-500" 
          bg="bg-emerald-50" 
        />
        <OrgMetricCard 
          label="Awaiting Approval" 
          value={stats?.pendingApprovals || 0} 
          icon={BarChart3} 
          color="text-amber-500" 
          bg="bg-amber-50" 
          trend="Reviewing now"
        />
      </div>

      {/* Database Container */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Your Submissions</h2>
             <div className="h-px w-20 bg-slate-100" />
          </div>
          <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-1">
            Export Data <ExternalLink size={10} />
          </button>
        </div>

        <AdminDataTable 
          columns={columns} 
          data={listings} 
          loading={listingsLoading}
          onRowClick={(row) => navigate(`/org/listings/${row._id}`)}
        />
      </div>

      {/* Support Card */}
      <footer className="p-10 bg-primary-navy rounded-[3rem] text-white relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h3 className="text-2xl font-black mb-4 italic">Need recruitment assistance?</h3>
          <p className="text-white/60 font-medium mb-8 leading-relaxed">
            Our curation team is ready to help you optimize your opportunity descriptions for maximum engagement with the student body.
          </p>
          <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white">
            Contact Partner Success
          </Button>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent flex items-center justify-center pointer-events-none">
           <Activity size={120} className="text-white/5" />
        </div>
      </footer>
    </div>
  );
}

function OrgMetricCard({ label, value, icon: Icon, color, bg, trend }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-[1.5rem] ${bg} ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        {trend && (
           <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full">
             {trend}
           </span>
        )}
      </div>
      <div className="text-5xl font-black text-primary-navy tracking-tighter mb-2">{value}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}
