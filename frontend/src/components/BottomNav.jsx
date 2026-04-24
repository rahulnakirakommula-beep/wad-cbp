import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, BarChart3, Bell, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();

  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return data;
    },
    enabled: !!user,
    refetchInterval: 60000
  });

  const tabs = [
    { to: '/app/feed', icon: LayoutDashboard, label: 'Feed' },
    { to: '/app/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/app/dashboard', icon: BarChart3, label: 'Stats' },
    { to: '/app/notifications', icon: Bell, label: 'Alerts', badge: unreadData?.count },
    { to: '/app/settings', icon: Settings, label: 'More' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t-2 border-slate-50 flex items-center justify-around px-2 pb-safe-area-inset-bottom">
      {tabs.map((tab, idx) => (
        <NavLink
          key={idx}
          to={tab.to}
          className={({ isActive }) => `
            relative flex flex-col items-center gap-1.5 py-3 flex-1 transition-all duration-200
            ${isActive ? 'text-primary-navy' : 'text-slate-400 hover:text-slate-600'}
          `}
        >
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-slate-100 shadow-inner' : ''}`}>
                <tab.icon size={22} className={isActive ? 'animate-in zoom-in duration-300' : ''} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0 scale-75'}`}>
                {tab.label}
              </span>
              
              {tab.badge > 0 && (
                <span className="absolute top-2 right-1/4 w-4 h-4 bg-accent-amber text-primary-navy text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
