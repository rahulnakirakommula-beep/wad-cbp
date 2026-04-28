import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Bell, Calendar, LayoutDashboard, LogOut, Settings, Shield, Moon, Sun, ChevronDown } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return data;
    },
    enabled: !!user,
    refetchInterval: 60000
  });

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-slate-100 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/app/feed" className="text-2xl font-black text-primary-navy tracking-tighter hover:text-accent-amber transition-colors">
            COA<span className="text-accent-amber">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/app/feed" icon={<LayoutDashboard size={20} />} label="Feed" active={location.pathname === '/app/feed'} />
            <NavLink to="/app/calendar" icon={<Calendar size={20} />} label="Calendar" active={location.pathname === '/app/calendar'} />
            <NavLink to="/app/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname === '/app/dashboard'} />
            {user?.role === 'admin' && (
              <NavLink to="/admin" icon={<Shield size={20} className="text-red-500" />} label="Admin" active={location.pathname.startsWith('/admin')} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 hover:text-primary-navy transition-colors rounded-xl hover:bg-slate-50"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>

          <button
            onClick={() => navigate('/app/notifications')}
            className="relative p-2 text-slate-600 hover:text-primary-navy group rounded-xl hover:bg-slate-50"
          >
            <Bell size={24} className="group-hover:rotate-12 transition-transform" />
            {unreadData?.count > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-accent-amber text-primary-navy text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                {unreadData.count > 9 ? '9+' : unreadData.count}
              </span>
            )}
          </button>

          <div className="h-8 w-[1px] bg-slate-200 mx-1" />

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-xl transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-primary-navy leading-none">{user?.name}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter font-black">{user?.profile?.branch} · Year {user?.profile?.currentYear}</p>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-in slide-in-from-top-2 fade-in">
                <button
                  onClick={() => { setProfileOpen(false); navigate('/app/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-navy transition-colors"
                >
                  <Settings size={18} /> Settings
                </button>
                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 text-sm font-bold transition-all px-3 py-2 rounded-xl ${
        active
          ? 'bg-slate-50 text-primary-navy border-b-2 border-accent-amber shadow-inner'
          : 'text-slate-600 hover:text-primary-navy hover:bg-slate-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default Navbar;
