import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

import NotificationItem from '../components/ui/NotificationItem';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 20;

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const groupLabelForDate = (value) => {
  const today = startOfToday();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  return 'Earlier';
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [notificationItems, setNotificationItems] = useState([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['notifications-page', filter, page],
    queryFn: async () => {
      const { data: response } = await api.get('/notifications', {
        params: {
          page,
          limit: PAGE_SIZE,
          status: filter === 'unread' ? 'unread' : 'all'
        }
      });
      return response;
    }
  });

  useEffect(() => {
    if (!data) return;

    setNotificationItems((current) => (
      page === 1
        ? data.notifications
        : [
            ...current,
            ...data.notifications.filter((item) => !current.some((existing) => existing._id === item._id))
          ]
    ));
  }, [data, page]);

  useEffect(() => {
    setPage(1);
    setNotificationItems([]);
  }, [filter]);

  const unreadCount = useMemo(
    () => notificationItems.filter((notification) => notification.status === 'unread').length,
    [notificationItems]
  );

  const groupedNotifications = useMemo(() => (
    notificationItems.reduce((acc, notification) => {
      const group = groupLabelForDate(notification.createdAt);
      if (!acc[group]) acc[group] = [];
      acc[group].push(notification);
      return acc;
    }, {})
  ), [notificationItems]);

  const markAllReadMutation = useMutation({
    mutationFn: async () => api.put('/notifications/read-all'),
    onSuccess: async () => {
      setNotificationItems((current) => current.map((notification) => ({
        ...notification,
        status: 'read'
      })));
      await queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      addToast({
        title: 'All notifications marked read',
        body: 'Your notification badge is now cleared.',
        type: 'success'
      });
    }
  });

  const markOneReadMutation = useMutation({
    mutationFn: async (id) => api.put(`/notifications/${id}/read`),
    onSuccess: async (_, id) => {
      setNotificationItems((current) => current.map((notification) => (
        notification._id === id ? { ...notification, status: 'read' } : notification
      )));
      await queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  const handleNotificationClick = async (notification) => {
    if (notification.status === 'unread') {
      setNotificationItems((current) => current.map((item) => (
        item._id === notification._id ? { ...item, status: 'read' } : item
      )));
      markOneReadMutation.mutate(notification._id);
    }

    if (notification.payload?.actionUrl) {
      navigate(notification.payload.actionUrl);
    }
  };

  const hasMore = data ? page < data.totalPages : false;

  if (isLoading && page === 1) {
    return (
      <div className="max-w-3xl mx-auto space-y-10 pb-20">
        <Skeleton variant="text" className="w-1/4 h-10" />
        <div className="space-y-4">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-24 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">Notifications</h1>
          <p className="text-slate-500 font-medium italic">Important signals about deadlines and opportunities.</p>
        </div>

        {notificationItems.some((notification) => notification.status === 'unread') && (
          <Button
            variant="secondary"
            iconLeading={CheckCircle2}
            onClick={() => markAllReadMutation.mutate()}
            loading={markAllReadMutation.isPending}
          >
            Mark all read
          </Button>
        )}
      </header>

      <div className="flex items-center gap-6 px-1 border-b border-slate-100">
        <TabButton label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
        <TabButton
          label={`Unread (${filter === 'unread' ? data?.totalCount ?? unreadCount : unreadCount})`}
          active={filter === 'unread'}
          onClick={() => setFilter('unread')}
        />
      </div>

      {notificationItems.length === 0 ? (
        <EmptyState
          icon="todo"
          title={filter === 'unread' ? "You're all caught up!" : 'You’re all caught up'}
          message={filter === 'unread' ? 'There are no unread notifications right now.' : 'No notifications yet.'}
          actionLabel={filter === 'unread' ? 'View all notifications' : undefined}
          onAction={filter === 'unread' ? () => setFilter('all') : undefined}
          className="bg-white border-2 border-slate-100 rounded-[2.5rem]"
        />
      ) : (
        <div className="space-y-8">
          {['Today', 'Yesterday', 'Earlier'].filter((group) => groupedNotifications[group]?.length).map((group) => (
            <section key={group} className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">{group}</h3>
              <div className="grid gap-4">
                {groupedNotifications[group].map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            </section>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                onClick={() => setPage((current) => current + 1)}
                loading={isFetching}
              >
                Load more notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pb-4 text-xs font-black uppercase tracking-widest relative transition-all ${active ? 'text-primary-navy' : 'text-slate-400 hover:text-primary-navy'}`}
    >
      {label}
      {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-navy rounded-t-full" />}
    </button>
  );
}
