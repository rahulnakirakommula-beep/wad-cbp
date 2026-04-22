import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import { 
  ChevronLeft, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';

// UI Components
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import ContentRenderer from '../components/ui/ContentRenderer';
import { useToast } from '../context/ToastContext';

export default function PrepGuidePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: guide, isLoading, isError } = useQuery({
    queryKey: ['guide', id],
    queryFn: async () => {
      const { data } = await api.get(`/guides/${id}`);
      return data;
    }
  });

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Skeleton variant="text" className="w-20" />
      <Skeleton variant="text" className="w-3/4 h-12" />
      <Skeleton className="h-96 rounded-[2.5rem]" />
    </div>
  );

  if (isError || !guide) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-2xl font-black text-primary-navy mb-2">Guide not found</h2>
      <p className="text-slate-500 mb-8">This resource might have been removed or the ID is invalid.</p>
      <button onClick={() => navigate(-1)} className="text-blue-600 font-black uppercase tracking-widest text-xs">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-32 relative">
      <nav className="px-1">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-primary-navy transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back
        </button>
      </nav>

      <header className="px-1 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 text-accent-amber">
          <FileText size={24} />
          <span className="text-xs font-black uppercase tracking-widest">Preparation Guide</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-primary-navy tracking-tight leading-tight">
          {guide.title}
        </h1>
      </header>

      <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <ContentRenderer content={guide.content} />
      </section>

      {guide.relatedListings?.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="px-1 flex items-center justify-between">
            <h2 className="text-xl font-black text-primary-navy tracking-tight">Related Opportunities</h2>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{guide.relatedListings.length} Listings</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {guide.relatedListings.map(listing => (
              <div 
                key={listing.id}
                onClick={() => navigate(`/app/listing/${listing.id}`)}
                className="group flex items-center gap-4 p-4 bg-white border-2 border-slate-50 rounded-2xl cursor-pointer hover:border-primary-navy hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {listing.orgLogoUrl ? (
                    <img src={listing.orgLogoUrl} alt={listing.orgName} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={20} className="text-slate-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-primary-navy truncate group-hover:text-blue-600 transition-colors">{listing.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{listing.orgName}</p>
                </div>
                <ArrowRight size={18} className="text-slate-200 group-hover:text-primary-navy transition-all group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Floating Action / Back to Listing */}
      {guide.listingId && (
        <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-primary-navy text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4 z-50 animate-in slide-in-from-bottom-12 duration-700">
          <div className="pl-2">
            <p className="text-xs font-bold text-blue-200">Ready to apply?</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Return to opportunity</p>
          </div>
          <button 
            onClick={() => navigate(`/app/listing/${guide.listingId}`)}
            className="px-6 py-2.5 bg-white text-primary-navy font-black text-xs rounded-xl shadow-[4px_4px_0px_0px_rgba(230,168,23,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95"
          >
            Apply Now
          </button>
        </footer>
      )}
    </div>
  );
}
