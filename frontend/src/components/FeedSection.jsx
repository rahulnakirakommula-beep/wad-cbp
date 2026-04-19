import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function FeedSection({ title, subtitle, children, viewAllPath }) {
  return (
    <section className="mb-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-primary-navy">{title}</h2>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
        
        {viewAllPath && (
          <Link 
            to={viewAllPath} 
            className="flex items-center gap-1 text-sm font-bold text-accent-amber hover:underline"
          >
            View All <ChevronRight size={16} />
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {children}
      </div>
    </section>
  );
}

export default FeedSection;
