import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { Loader2, AlertCircle, CheckCircle, Database, Shield, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const queryClient = useQueryClient();

  // Fetch Admin Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    }
  });

  // Fetch Pending Flags
  const { data: flags, isLoading: flagsLoading } = useQuery({
    queryKey: ['adminFlags'],
    queryFn: async () => {
      const { data } = await api.get('/admin/flags');
      return data;
    }
  });

  // Flag Resolution Mutation
  const resolveFlagMutation = useMutation({
    mutationFn: async ({ flagId, status, resolutionNotes }) => {
      return api.put(`/admin/flags/${flagId}`, { status, resolutionNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFlags'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    }
  });

  if (statsLoading || flagsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-primary-navy animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-primary-navy tracking-tight mb-2 flex items-center gap-4">
            Admin Console <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full uppercase tracking-widest font-black">Restricted</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage listings, verify sources, and resolve data quality issues.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard label="Total Listings" value={stats?.totalListings} icon={<Database className="text-blue-500" />} />
          <StatCard label="Pending Flags" value={stats?.pendingFlags} icon={<AlertCircle className="text-red-500" />} color="bg-red-50" />
          <StatCard label="Open Positions" value={stats?.openOpportunities} icon={<LayoutGrid className="text-green-500" />} />
          <StatCard label="Active Users" value={stats?.activeUsers} icon={<Shield className="text-amber-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Flag Management (Main Content) */}
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-black text-primary-navy mb-6 flex items-center gap-3">
              Data Quality Queue
              <span className="text-sm font-bold bg-primary-navy text-white px-3 py-1 rounded-lg italic">
                {flags?.length || 0}
              </span>
            </h2>

            <div className="space-y-4">
              {flags?.length === 0 && (
                <div className="p-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center">
                  <CheckCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold italic underline decoration-accent-amber underline-offset-4 decoration-2">Zero pending issues. Good job!</p>
                </div>
              )}
              {flags?.map(flag => (
                <FlagCard 
                  key={flag._id} 
                  flag={flag} 
                  onResolve={(status) => resolveFlagMutation.mutate({ 
                    flagId: flag._id, 
                    status, 
                    resolutionNotes: 'Updated by admin' 
                  })} 
                />
              ))}
            </div>
          </section>

          {/* Sidebar Tools */}
          <aside className="space-y-8">
            <section className="bg-primary-navy p-8 rounded-[2rem] text-white shadow-xl shadow-blue-900/10">
              <h3 className="text-xl font-black mb-6 border-b border-white/10 pb-4">Admin Tools</h3>
              <div className="space-y-4 font-bold">
                <Link to="/admin/listings" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                  <span>Listings Manager</span>
                  <span className="text-accent-amber">→</span>
                </Link>
                <Link to="/admin/sources" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                  <span>Source Verification</span>
                  <span className="text-accent-amber">→</span>
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color = 'bg-white' }) {
  return (
    <div className={`${color} border-2 border-slate-200 rounded-3xl p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-sm leading-none flex items-center">
          {icon}
        </div>
        <span className="text-3xl font-black text-primary-navy">{value}</span>
      </div>
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
    </div>
  );
}

function FlagCard({ flag, onResolve }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-accent-amber transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1 rounded-full mb-2 inline-block">
            {flag.issueType.replace('_', ' ')}
          </span>
          <h4 className="text-lg font-black text-primary-navy leading-tight">{flag.listingId?.title}</h4>
          <p className="text-sm font-bold text-slate-500 italic mt-1 font-['Inter']">Reported by: {flag.reporterId?.name}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onResolve('resolved')}
            className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors border-2 border-green-100"
            title="Mark Resolved"
          >
            <CheckCircle size={20} />
          </button>
          <button 
            onClick={() => onResolve('dismissed')}
            className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors border-2 border-slate-100"
            title="Dismiss"
          >
            <AlertCircle size={20} />
          </button>
        </div>
      </div>
      <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 mb-2">
        <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
          "{flag.proposedFix || 'No correction proposed'}"
        </p>
      </div>
    </div>
  );
}

export default AdminDashboard;
