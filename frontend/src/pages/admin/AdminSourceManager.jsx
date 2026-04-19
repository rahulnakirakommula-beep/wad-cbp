import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { Loader2, ShieldCheck, Globe, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

function AdminSourceManager() {
  const queryClient = useQueryClient();

  // Fetch Sources
  const { data: sources, isLoading } = useQuery({
    queryKey: ['adminSources'],
    queryFn: async () => {
      const { data } = await api.get('/admin/sources');
      return data;
    }
  });

  // Verify Source Mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ id, level }) => {
      return api.put(`/admin/sources/${id}/verify`, { verificationLevel: level });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSources'] });
    }
  });

  if (isLoading) {
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
          <Link to="/admin" className="text-sm font-bold text-accent-amber hover:underline flex items-center gap-2 mb-4">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-primary-navy tracking-tight">Source Verification</h1>
          <p className="text-slate-500 font-medium mt-2">Manage external scrapers and manual listing providers.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sources?.map(source => (
            <div key={source._id} className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm hover:border-primary-navy transition-colors group">
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-primary-navy group-hover:bg-primary-navy group-hover:text-white transition-colors">
                  {source.sourceType === 'scraper' ? <Globe size={28} /> : <ShieldCheck size={28} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getLevelColor(source.verificationLevel)}`}>
                  {source.verificationLevel}
                </span>
              </div>

              <h3 className="text-xl font-black text-primary-navy mb-1">{source.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{source.sourceType}</p>

              <div className="space-y-3 pt-6 border-t-2 border-slate-50">
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-2">Set Verification Level</p>
                <div className="flex flex-wrap gap-2">
                  <LevelButton 
                    label="Official" 
                    active={source.verificationLevel === 'official'} 
                    onClick={() => verifyMutation.mutate({ id: source._id, level: 'official' })}
                  />
                  <LevelButton 
                    label="Verified" 
                    active={source.verificationLevel === 'verified'} 
                    onClick={() => verifyMutation.mutate({ id: source._id, level: 'verified' })}
                  />
                  <LevelButton 
                    label="Student" 
                    active={source.verificationLevel === 'student'} 
                    onClick={() => verifyMutation.mutate({ id: source._id, level: 'student' })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function LevelButton({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border-2 transition-all ${
        active 
          ? 'bg-primary-navy border-primary-navy text-white' 
          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
      }`}
    >
      {label}
    </button>
  );
}

function getLevelColor(level) {
  switch (level) {
    case 'official': return 'bg-blue-100 text-blue-700';
    case 'verified': return 'bg-green-100 text-green-700';
    case 'unverified': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export default AdminSourceManager;
