import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  List, 
  FileCheck, 
  Clock, 
  Building2, 
  Tags, 
  BookOpen, 
  Users, 
  Activity,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { Menu, X } from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuGroups = [
    {
      title: 'Content',
      items: [
        { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
        { label: 'Listings', icon: List, path: '/admin/listings' },
        { label: 'Submission Queue', icon: FileCheck, path: '/admin/listings?status=unknown' },
        { label: 'Staleness Queue', icon: Clock, path: '/admin/listings?isStale=true' },
      ]
    },
    {
      title: 'Organisation',
      items: [
        { label: 'Sources', icon: Building2, path: '/admin/sources' },
      ]
    },
    {
      title: 'Taxonomy',
      items: [
        { label: 'Domain Tags', icon: Tags, path: '/admin/tags' },
      ]
    },
    {
      title: 'Knowledge',
      items: [
        { label: 'Guides', icon: BookOpen, path: '/admin/guides' },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Users', icon: Users, path: '/admin/users' },
        { label: 'Audit Log', icon: Activity, path: '/admin/audit' },
      ]
    }
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`
      fixed left-0 top-0 h-screen w-60 bg-white border-r-2 border-slate-100 flex flex-col z-[60] transition-transform duration-300 ease-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6 flex items-center justify-between">
        <Link to="/admin" className="text-2xl font-black text-primary-navy tracking-tighter">
          COA<span className="text-accent-amber">.</span>ADMIN
        </Link>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-400"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item, itemIdx) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={itemIdx}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                      active 
                        ? 'bg-slate-50 text-primary-navy shadow-inner' 
                        : 'text-slate-500 hover:text-primary-navy hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={active ? 'text-accent-amber' : 'group-hover:text-accent-amber transition-colors'} />
                      <span className="text-sm font-bold">{item.label}</span>
                    </div>
                    {active && <ChevronRight size={14} className="text-accent-amber" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t-2 border-slate-50">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Logout Session</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
