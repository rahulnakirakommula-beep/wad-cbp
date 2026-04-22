import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeedSection({ title, subtitle, children, viewAllPath, icon: Icon }) {
  return (
    <section className="mb-14 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between mb-6 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="text-accent-amber" size={20} />}
            <h2 className="text-xl sm:text-2xl font-black text-primary-navy tracking-tight">{title}</h2>
          </div>
          {subtitle && <p className="text-slate-500 text-xs sm:text-sm font-medium">{subtitle}</p>}
        </div>
        
        {viewAllPath && (
          <Link 
            to={viewAllPath} 
            className="flex items-center gap-1 text-xs sm:text-sm font-black text-primary-navy hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            Browse All <ChevronRight size={16} />
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {children}
      </div>
    </section>
  );
}
