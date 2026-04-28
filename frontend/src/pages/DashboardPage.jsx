import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  BookmarkCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// UI Components
import ActivityRow from '../components/ui/ActivityRow';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

const APP_STATUS_TABS = [
  { key: 'pending',  label: 'Pending',  icon: Clock3,       color: 'text-amber-500',   bg: 'bg-amber-50',   activeBorder: 'border-amber-400',  activeText: 'text-amber-700'  },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', activeBorder: 'border-emerald-400', activeText: 'text-emerald-700' },
  { key: 'rejected', label: 'Rejected', icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-50',     activeBorder: 'border-red-400',    activeText: 'text-red-600'    },
];

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || null;
  const appStatusFilter = searchParams.get('appStatus') || null;
  const [statusOpen, setStatusOpen] = useState(true);

  // Fetch Activity Summary
  const { data: summary } = useQuery({
    queryKey: ['activitySummary'],
    queryFn: async () => {
      const { data } = await api.get('/activity/summary');
      return data;
    }
  });

  // Fetch Full Activity List
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', statusFilter],
    queryFn: async () => {
      const { data } = await api.get(`/activity?status=${statusFilter || ''}`);
      return data;
    }
  });

  // Mutation: update activity status (save/apply/remove)
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
        body: `Activity marked as ${variables.status}.`,
        type: 'success'
      });
    },
    onError: (error) => {
      addToast({
        title: 'Update failed',
        body: error.response?.data?.message || 'We could not update your roadmap at this time.',
        type: 'error'
      });
    }
  });

  // Mutation: update applicationStatus (pending/accepted/rejected)
  const appStatusMutation = useMutation({
    mutationFn: async ({ id, applicationStatus }) =>
      api.put(`/activity/${id}`, { applicationStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activitySummary'] });
    },
    onError: (error) => {
      addToast({
        title: 'Could not update result',
        body: error.response?.data?.message || 'Please try again.',
        type: 'error'
      });
    }
  });

  const toggleFilter = (status) => {
    setSearchParams(statusFilter === status ? {} : { status });
  };

  const toggleAppStatusFilter = (key) => {
    if (appStatusFilter === key) {
      setSearchParams(statusFilter ? { status: statusFilter } : {});
    } else {
      const params = { appStatus: key };
      if (statusFilter) params.status = statusFilter;
      setSearchParams(params);
    }
  };

  // When filtering by appStatus, always show applied activities and filter client-side
  const displayedActivities = appStatusFilter
    ? activities.filter(
        (a) => a.status === 'applied' && a.applicationStatus === appStatusFilter
      )
    : activities;

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
    <div className="space-y-8 pb-20">
      <header className="px-1">
        <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">My Roadmap</h1>
        <p className="text-slate-500 font-medium italic">Track your progress and application results.</p>
      </header>

      {/* Metric Tabs: Saved + Applied */}
      <div className="grid grid-cols-2 gap-4">
        <MetricTab
          label="Saved"
          value={summary?.saved || 0}
          icon={PlusCircle}
          color="text-blue-500"
          bg="bg-blue-50"
          active={statusFilter === 'saved'}
          onClick={() => { toggleFilter('saved'); setSearchParams(p => { p.delete('appStatus'); return p; }); }}
        />
        <MetricTab
          label="Applied"
          value={summary?.applied || 0}
          icon={BookmarkCheck}
          color="text-violet-500"
          bg="bg-violet-50"
          active={statusFilter === 'applied'}
          onClick={() => { toggleFilter('applied'); setSearchParams(p => { p.delete('appStatus'); return p; }); }}
        />
      </div>

      {/* Status Panel */}
      <div className="bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
        {/* Header */}
        <button
          onClick={() => setStatusOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <CheckCircle2 size={18} className="text-slate-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-primary-navy">Application Status</p>
              <p className="text-[11px] text-slate-400 font-medium">
                Track what happened after you applied
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Mini counts */}
            <div className="hidden sm:flex items-center gap-2">
              {APP_STATUS_TABS.map(({ key, color }) => (
                <span key={key} className={`text-xs font-black ${color}`}>
                  {summary?.[key] || 0}
                </span>
              ))}
            </div>
            {statusOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>
        </button>

        {/* Sub-tabs */}
        {statusOpen && (
          <div className="border-t border-slate-100 px-6 py-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-3 gap-3">
              {APP_STATUS_TABS.map(({ key, label, icon: Icon, color, bg, activeBorder, activeText }) => {
                const isActive = appStatusFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => toggleAppStatusFilter(key)}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all
                      ${isActive
                        ? `${bg} ${activeBorder} shadow-sm -translate-y-0.5`
                        : 'bg-slate-50 border-slate-100 hover:border-slate-200'}
                    `}
                  >
                    <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/80' : bg}`}>
                      <Icon size={20} className={color} />
                    </div>
                    <div>
                      <p className={`text-2xl font-black leading-none ${isActive ? activeText : 'text-primary-navy'}`}>
                        {summary?.[key] || 0}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
                    </div>
                    {isActive && (
                      <div className={`text-[9px] font-black uppercase tracking-widest ${activeText}`}>
                        Filtering ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {appStatusFilter && (
              <button
                onClick={() => setSearchParams(statusFilter ? { status: statusFilter } : {})}
                className="text-[10px] font-black text-slate-400 hover:text-primary-navy uppercase tracking-widest transition-colors"
              >
                ✕ Clear status filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
              {appStatusFilter
                ? `Applied — ${appStatusFilter}`
                : statusFilter
                ? `Filtered: ${statusFilter}`
                : 'All Activity'}
            </h2>
            {(statusFilter || appStatusFilter) && (
              <button
                onClick={() => setSearchParams({})}
                className="text-[10px] font-black text-blue-600 uppercase hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            {displayedActivities.length} Records
          </span>
        </div>

        {displayedActivities.length > 0 ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {displayedActivities.map(activity => (
              <ActivityRow
                key={activity._id}
                activity={activity}
                onStatusChange={(status) => mutation.mutate({ id: activity._id, status })}
                onApplicationStatusChange={(applicationStatus) =>
                  appStatusMutation.mutate({ id: activity._id, applicationStatus })
                }
                onRemove={() => mutation.mutate({ id: activity._id, status: 'removed' })}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="heart"
            title={
              appStatusFilter
                ? `No ${appStatusFilter} applications`
                : statusFilter
                ? `No ${statusFilter} opportunities`
                : 'Your roadmap is empty'
            }
            message={
              appStatusFilter
                ? `Mark applied opportunities as ${appStatusFilter} using the Result pills.`
                : statusFilter
                ? `You haven't marked any opportunities as ${statusFilter} yet.`
                : "Start exploring the feed and save opportunities you're interested in."
            }
            actionLabel={statusFilter || appStatusFilter ? 'View All Activity' : 'Go to Feed'}
            onAction={() =>
              statusFilter || appStatusFilter ? setSearchParams({}) : navigate('/app/feed')
            }
            className="bg-white border-2 border-slate-100 rounded-[2.5rem]"
          />
        )}
      </div>
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
