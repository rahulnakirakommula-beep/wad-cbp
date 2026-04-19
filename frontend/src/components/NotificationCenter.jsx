import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import { Bell, X, Check, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function NotificationCenter({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  // Fetch Notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
    enabled: isOpen
  });

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  // Mark single read mutation
  const markReadMutation = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b-2 border-slate-50 flex items-center justify-between bg-primary-navy text-white">
              <div className="flex items-center gap-3">
                <Bell size={24} className="text-accent-amber" />
                <h3 className="text-xl font-black tracking-tight">Your Alerts</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b-2 border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {notifications?.filter(n => n.status === 'unread').length || 0} Unread
              </span>
              <button 
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs font-bold text-primary-navy hover:text-accent-amber transition-colors flex items-center gap-1"
              >
                <Check size={14} /> Mark all read
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-slate-100 border-t-primary-navy rounded-full animate-spin" />
                </div>
              ) : notifications?.length === 0 ? (
                <div className="text-center py-20">
                  <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold italic">No alerts yet. We'll ping you here!</p>
                </div>
              ) : (
                notifications?.map(notification => (
                  <NotificationItem 
                    key={notification._id} 
                    notification={notification} 
                    onRead={() => markReadMutation.mutate(notification._id)}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NotificationItem({ notification, onRead }) {
  const isUnread = notification.status === 'unread';

  return (
    <div 
      className={`p-4 rounded-2xl border-2 transition-all group relative ${
        isUnread 
          ? 'bg-white border-primary-navy shadow-lg shadow-blue-900/5' 
          : 'bg-slate-50 border-transparent text-slate-500 opacity-60'
      }`}
    >
      <div className="flex gap-4">
        <div className={`mt-1 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border-2 ${
          isUnread ? 'bg-primary-navy border-primary-navy text-accent-amber' : 'bg-slate-200 border-slate-200 text-slate-400'
        }`}>
          {getIcon(notification.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h4 className={`text-sm font-black leading-tight ${isUnread ? 'text-primary-navy' : 'text-slate-600'}`}>
              {notification.payload.title}
            </h4>
            {isUnread && (
              <button 
                onClick={onRead}
                className="p-1 hover:bg-slate-100 rounded-lg text-primary-navy opacity-0 group-hover:opacity-100 transition-opacity"
                title="Mark as read"
              >
                <CheckCircle2 size={16} />
              </button>
            )}
          </div>
          <p className="text-xs font-medium mt-1 leading-relaxed">{notification.payload.message}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
            {new Date(notification.createdAt).toLocaleDateString()} · {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      {isUnread && <div className="absolute top-4 right-4 w-2 h-2 bg-accent-amber rounded-full" />}
    </div>
  );
}

function getIcon(type) {
  switch (type) {
    case 'deadline_3day':
    case 'deadline_1day':
      return <AlertCircle size={20} />;
    case 'dont_miss':
      return <CheckCircle2 size={20} />;
    default:
      return <Bell size={20} />;
  }
}

export default NotificationCenter;
