import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, 
  MapPin, 
  DollarSign, 
  Bookmark, 
  CheckCircle, 
  X, 
  Flag, 
  ShieldCheck, 
  ExternalLink,
  Building2,
  FileText
} from 'lucide-react';

// UI Components
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import TimelineCard from '../components/ui/TimelineCard';
import EligibilityBlock from '../components/ui/EligibilityBlock';
import ContentRenderer from '../components/ui/ContentRenderer';
import { useToast } from '../context/ToastContext';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await api.get(`/listings/${id}`);
      return data;
    }
  });

  const interactionMutation = useMutation({
    mutationFn: async (status) => {
      return api.post('/activity', { listingId: id, status });
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      addToast({
        title: status === 'saved' ? 'Saved!' : 'Action complete',
        body: `Opportunity marked as ${status}.`,
        type: 'success'
      });
    },
    onError: (error) => {
      addToast({
        title: 'Action failed',
        body: error.response?.data?.message || 'We could not update your status for this listing.',
        type: 'error'
      });
    }
  });

  if (isLoading) return (
    <div className="space-y-10 animate-pulse">
      <Skeleton variant="text" className="w-20" />
      <div className="space-y-4">
        <Skeleton variant="text" className="w-2/3 h-12" />
        <Skeleton variant="text" className="w-1/3" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    </div>
  );

  if (isError || !listing) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
        <X size={48} />
      </div>
      <h2 className="text-2xl font-black text-primary-navy mb-2">Listing not found</h2>
      <p className="text-slate-500 mb-8">This opportunity may have been removed or the ID is invalid.</p>
      <Button onClick={() => navigate('/app/feed')} iconLeading={ChevronLeft}>Back to Feed</Button>
    </div>
  );

  const isSaved = listing.userActivity?.status === 'saved';
  const isApplied = listing.userActivity?.status === 'applied';

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 relative">
      {/* Back Button */}
      <nav className="px-1">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-primary-navy transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back
        </button>
      </nav>

      {/* Header Block */}
      <header className="flex flex-col md:flex-row gap-8 items-start px-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border-2 border-slate-100 rounded-[2rem] flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
          {listing.orgLogoUrl ? (
            <img src={listing.orgLogoUrl} alt={listing.orgName} className="w-full h-full object-cover" />
          ) : (
            <Building2 size={40} className="text-slate-200" />
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-1">
              <Badge variant={listing.type?.toLowerCase()}>{listing.type}</Badge>
              {listing.isCurated && <Badge variant="curated" icon={ShieldCheck}>Verified</Badge>}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-primary-navy tracking-tight leading-tight">
              {listing.title}
            </h1>
            <p className="text-xl font-bold text-slate-400">{listing.orgName}</p>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <DollarSign size={16} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{listing.stipend || 'Unspecified'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                <MapPin size={16} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{listing.location || 'Remote'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Description */}
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <FileText className="text-accent-amber" size={24} />
              <h2 className="text-2xl font-black text-primary-navy tracking-tight">Opportunity Brief</h2>
            </div>
            <ContentRenderer content={listing.description} />
          </section>

          {listing.guideId && (
            <section className="p-8 bg-gradient-to-r from-primary-navy to-blue-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="relative z-10 space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-black tracking-tight leading-none">Preparation Guide Available</h3>
                <p className="text-blue-200 font-medium italic">Learn from success stories and previous cycles.</p>
              </div>
              <Button 
                variant="accent" 
                onClick={() => navigate(`/app/guide/${listing.guideId}`)}
                className="relative z-10 shrink-0"
                iconTrailing={ChevronLeft}
              >
                View Guide
              </Button>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            </section>
          )}

          <div className="flex justify-center pt-8">
            <button className="flex items-center gap-2 text-xs font-black text-slate-300 hover:text-red-400 transition-colors uppercase tracking-widest">
              <Flag size={14} /> Report an issue with this listing
            </button>
          </div>
        </div>

        {/* Right: Sidebar Cards */}
        <aside className="space-y-10">
          <TimelineCard 
            timeline={listing.timeline} 
            confidenceLevel={listing.confidenceLevel}
            prepLeadWeeks={listing.prepLeadWeeks}
          />
          <EligibilityBlock 
            listing={listing} 
            userProfile={user} 
          />
        </aside>
      </div>

      {/* Floating Action Bar */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-white border-2 border-slate-100 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4 z-50 animate-in slide-in-from-bottom-12 duration-700">
        <div className="hidden sm:block pl-2">
          {isApplied ? (
            <Badge variant="success" icon={CheckCircle}>Already Applied</Badge>
          ) : (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: {listing.userActivity?.status || 'New'}</p>
          )}
        </div>
        
        <div className="flex flex-1 sm:flex-none items-center gap-3 w-full sm:w-auto">
          {!isApplied && (
            <>
              <Button 
                variant={isSaved ? 'secondary' : 'primary'}
                className="flex-1 sm:flex-none"
                onClick={() => interactionMutation.mutate(isSaved ? 'none' : 'saved')}
                loading={interactionMutation.isPending && interactionMutation.variables === 'saved'}
                iconLeading={Bookmark}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button 
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={() => interactionMutation.mutate('applied')}
                loading={interactionMutation.isPending && interactionMutation.variables === 'applied'}
              >
                Done
              </Button>
            </>
          )}
          
          <Button 
            variant="accent"
            className="flex-1 sm:flex-none"
            onClick={() => window.open(listing.externalUrl, '_blank')}
            disabled={!listing.externalUrl}
            iconTrailing={ExternalLink}
          >
            Apply Now
          </Button>
        </div>
      </footer>
    </div>
  );
}
