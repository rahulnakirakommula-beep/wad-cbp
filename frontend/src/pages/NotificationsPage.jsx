import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle2, 
  X,
  Trash2,
  Inbox
} from 'lucide-react';

// UI Components
import NotificationItem from '../components/ui/NotificationItem';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const { data } = await api.get(`/notifications?filter=${filter}`);
      return data;
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      addToast({
        title: 'Marked all as read',
        message: 'Your inbox is clear.',
        type: 'success'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, read, remove }) => {
      if (remove) return api.delete(`/notifications/${id}`);
      return api.put(`/notifications/${id}`, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const groupNotifications = (items) => {
    const today = new Date().setHours(0,0,0,0);
    const yesterday = new Date(Date.now() - 86400000).setHours(0,0,0,0);

    return items.reduce((acc, n) => {
      const date = new Date(n.createdAt).setHours(0,0,0,0);
      let group = 'Earlier';
      if (date === today) group = 'Today';
      else if (date === yesterday) group = 'Yesterday';

      if (!acc[group]) acc[group] = [];
      acc[group].push(n);
      return acc;
    }, {});
  };

  const grouped = groupNotifications(notifications);

  if (isLoading) return (
    <div className="space-y-10">
      <Skeleton variant="text" className="w-1/4 h-10" />
      <div className="space-y-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-[2rem]" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">Broadcasts</h1>
          <p className="text-slate-500 font-medium italic">Important signals you don&apos;t want to miss.</p>
        </div>

        {unreadCount > 0 && (
          <Button 
            variant="secondary" 
            size="sm" 
            iconLeading={CheckCircle2}
            onClick={() => markAllReadMutation.mutate()}
            loading={markAllReadMutation.isPending}
          >
            Mark all read
          </Button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-6 px-1 border-b border-slate-100">
        <button 
          onClick={() => setFilter('all')}
          className={`pb-4 text-xs font-black uppercase tracking-widest relative transition-all ${filter === 'all' ? 'text-primary-navy' : 'text-slate-400 hover:text-primary-navy'}`}
        >
          All Notifications
          {filter === 'all' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-navy rounded-t-full" />}
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`pb-4 text-xs font-black uppercase tracking-widest relative transition-all ${filter === 'unread' ? 'text-primary-navy' : 'text-slate-400 hover:text-primary-navy'}`}
        >
          Unread ({unreadCount})
          {filter === 'unread' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-navy rounded-t-full" />}
        </button>
      </div>

      {/* List */}
      <div className="space-y-12">
        {notifications.length > 0 ? (
          Object.keys(grouped).map(group => (
            <div key={group} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">{group}</h3>
              <div className="grid grid-cols-1 gap-4">
                {grouped[group].map(n => (
                  <NotificationItem 
                    key={n._id} 
                    notification={n} 
                    onClick={() => {
                      updateMutation.mutate({ id: n._id, read: true });
                      if (n.payload?.actionUrl) navigate(n.payload.actionUrl);
                    }}
                    onRemove={() => updateMutation.mutate({ id: n._id, remove: true })}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon="todo"
            title={filter === 'unread' ? "Zero notifications!" : "Your inbox is empty"}
            message={filter === 'unread' ? "You're all caught up with your unread alerts." : "We'll notify you when interesting opportunities or deadlines come up."}
            actionLabel="View All"
            onAction={() => setFilter('all')}
            className="bg-white border-2 border-slate-100 rounded-[2.5rem]"
          />
        )}
      </div>
    </div>
  );
}
