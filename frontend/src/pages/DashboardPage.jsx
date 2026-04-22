import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  BookmarkCheck, 
  XCircle, 
  Filter,
  X,
  ListTodo,
  TrendingDown
} from 'lucide-react';

// UI Components
import ActivityRow from '../components/ui/ActivityRow';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || null;

  // Fetch Activity Summary
  const { data: summary } = useQuery({
    queryKey: ['activitySummary'],
    queryFn: async () => {
      const { data } = await api.get('/activity/summary');
      return data;
    }
  });

  // Fetch Full Activity List
  const { data: activities = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['activities', statusFilter],
    queryFn: async () => {
      const { data } = await api.get(`/activity?status=${statusFilter || ''}`);
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }) => {
      if (status === 'removed') {
        return api.delete(`/activity/${id}`);
      }
      return api.put(`/activity/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activitySummary'] });
      addToast({
        title: 'Updated',
        message: `Activity marked as ${variables.status}.`,
        type: 'success'
      });
    }
  });

  const toggleFilter = (status) => {
    if (statusFilter === status) {
      setSearchParams({});
    } else {
      setSearchParams({ status });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-10">
        <Skeleton variant="text" className="w-1/4 h-10" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="px-1">
        <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">My Roadmap</h1>
        <p className="text-slate-500 font-medium italic">Track your progress and stay on top of deadlines.</p>
      </header>

      {/* Metric Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricTab 
          label="Saved" 
          value={summary?.saved || 0} 
          icon={PlusCircle} 
          color="text-blue-500" 
          bg="bg-blue-50"
          active={statusFilter === 'saved'}
          onClick={() => toggleFilter('saved')}
        />
        <MetricTab 
          label="Applied" 
          value={summary?.applied || 0} 
          icon={BookmarkCheck} 
          color="text-emerald-500" 
          bg="bg-emerald-50"
          active={statusFilter === 'applied'}
          onClick={() => toggleFilter('applied')}
        />
        <MetricTab 
          label="Missed" 
          value={summary?.missed || 0} 
          icon={XCircle} 
          color="text-red-400" 
          bg="bg-red-50"
          active={statusFilter === 'missed'}
          onClick={() => toggleFilter('missed')}
        />
      </div>

      {/* Activity List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
              {statusFilter ? `Filtered: ${statusFilter}` : 'All Activity'}
            </h2>
            {statusFilter && (
              <button 
                onClick={() => setSearchParams({})}
                className="text-[10px] font-black text-blue-600 uppercase hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{activities.length} Records</span>
        </div>

        {activities.length > 0 ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activities.map(activity => (
              <ActivityRow 
                key={activity._id} 
                activity={activity} 
                onStatusChange={(status) => mutation.mutate({ id: activity._id, status })}
                onRemove={() => mutation.mutate({ id: activity._id, status: 'removed' })}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={statusFilter === 'missed' ? 'todo' : 'heart'}
            title={statusFilter ? `No ${statusFilter} opportunities` : "Your roadmap is empty"}
            message={statusFilter ? `You haven't marked any opportunities as ${statusFilter} yet.` : "Start exploring the feed and save opportunities you're interested in."}
            actionLabel={statusFilter ? "View All Activity" : "Go to Feed"}
            onAction={() => statusFilter ? setSearchParams({}) : navigate('/app/feed')}
            className="bg-white border-2 border-slate-100 rounded-[2.5rem]"
          />
        )}
      </div>

      {/* Missed Nudge */}
      {summary?.missed > 5 && (
        <div className="p-6 bg-amber-50 border-2 border-amber-100 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6 animate-pulse">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm flex-shrink-0">
            <TrendingDown size={24} />
          </div>
          <div className="text-center sm:text-left flex-1">
            <p className="text-sm font-black text-amber-900 leading-tight mb-1">
              You've missed {summary.missed} opportunities lately.
            </p>
            <p className="text-xs font-bold text-amber-700/70">
              Setting custom deadline reminders can help you stay ahead.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/app/settings')}>
            Adjust Settings
          </Button>
        </div>
      )}
    </div>
  );
}

function MetricTab({ label, value, icon: Icon, color, bg, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`
        relative overflow-hidden p-6 rounded-[2rem] border-2 transition-all text-left group
        ${active ? 'bg-white border-primary-navy shadow-lg -translate-y-1' : 'bg-white border-slate-100 hover:border-slate-200'}
      `}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-3 ${bg} ${color} rounded-2xl group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-primary-navy tracking-tight leading-none mb-1">{value}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
      </div>
      
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary-navy animate-in slide-in-from-left duration-300" />
      )}
    </button>
  );
}
