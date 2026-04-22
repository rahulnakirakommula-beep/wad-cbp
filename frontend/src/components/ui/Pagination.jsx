import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-slate-50">
      <div className="text-sm font-black text-slate-400 uppercase tracking-widest">
        Page <span className="text-primary-navy">{currentPage}</span> of <span className="text-primary-navy">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          iconLeading={ChevronLeft}
        >
          Prev
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {getPages().map((page, idx) => (
            <button
              key={idx}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`
                w-10 h-10 rounded-xl text-sm font-black transition-all
                ${page === currentPage 
                  ? 'bg-primary-navy text-white shadow-lg' 
                  : page === '...' 
                    ? 'text-slate-300 cursor-default' 
                    : 'text-slate-500 hover:bg-slate-100'}
              `}
            >
              {page}
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          iconTrailing={ChevronRight}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
