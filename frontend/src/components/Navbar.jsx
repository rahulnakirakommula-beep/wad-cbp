import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, LayoutDashboard, Calendar, Search } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-slate-100 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/app/feed" className="text-2xl font-black text-primary-navy tracking-tighter hover:text-accent-amber transition-colors">
            COA<span className="text-accent-amber">.</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/app/feed" icon={<LayoutDashboard size={20} />} label="Feed" />
            <NavLink to="/app/explore" icon={<Search size={20} />} label="Explore" />
            <NavLink to="/app/calendar" icon={<Calendar size={20} />} label="Calendar" />
            {user?.role === 'admin' && (
              <NavLink to="/admin" icon={<Shield size={20} className="text-red-500" />} label="Admin" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-600 hover:text-primary-navy">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-amber rounded-full ring-2 ring-white" />
          </button>
          
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-primary-navy leading-none">{user?.name}</p>
              <p className="text-xs text-slate-500 mt-1">{user?.profile?.branch} · Year {user?.profile?.currentYear}</p>
            </div>
            
            <button 
              onClick={logout}
              className="p-2 border-2 border-slate-100 rounded-xl hover:border-red-200 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link 
      to={to} 
      className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary-navy transition-colors px-3 py-2 rounded-xl"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default Navbar;
