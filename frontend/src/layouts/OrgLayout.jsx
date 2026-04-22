import { useAuth } from '../context/AuthContext';
import { LogOut, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrgLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* SRS 1.4: Organisation — Minimal Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/org" className="text-xl font-black text-primary-navy tracking-tighter">
              COA<span className="text-accent-amber">.</span>ORG
            </Link>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2 text-slate-600 font-bold">
              <Building2 size={18} className="text-accent-amber" />
              <span className="text-sm">{user?.profile?.name || 'Organisation Portal'}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              to="/org" 
              className="text-sm font-bold text-slate-600 hover:text-primary-navy transition-colors"
            >
              My Listings
            </Link>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default OrgLayout;
