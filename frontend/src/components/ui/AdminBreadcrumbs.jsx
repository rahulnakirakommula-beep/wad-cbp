import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function AdminBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Map of URL segments to human readable names
  const breadcrumbMap = {
    admin: 'Admin Hub',
    listings: 'Listings',
    new: 'New Listing',
    sources: 'Sources',
    tags: 'Domain Tags',
    guides: 'Knowledge Guides',
    users: 'User Management',
    audit: 'Audit Log',
    queue: 'Submission Queue',
    stale: 'Staleness Queue'
  };

  return (
    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 overflow-x-auto no-scrollbar py-2">
      <Link 
        to="/admin" 
        className="flex items-center gap-1.5 hover:text-primary-navy transition-colors whitespace-nowrap"
      >
        <Home size={12} />
        <span>Hub</span>
      </Link>

      {pathnames.length > 1 && pathnames.slice(1).map((value, index) => {
        const last = index === pathnames.length - 2;
        const to = `/${pathnames.slice(0, index + 2).join('/')}`;
        const label = breadcrumbMap[value] || value;

        return (
          <div key={to} className="flex items-center gap-2">
            <ChevronRight size={10} className="text-slate-300 flex-shrink-0" />
            {last ? (
              <span className="text-primary-navy whitespace-nowrap">{label}</span>
            ) : (
              <Link 
                to={to} 
                className="hover:text-primary-navy transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
