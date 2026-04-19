import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FeedSection from '../components/FeedSection';
import ListingCard from '../components/ListingCard';
import { Loader2, PlusCircle, BookmarkCheck, XCircle } from 'lucide-react';

function FeedPage() {
  const queryClient = useQueryClient();

  // Fetch Feed Sections
  const { data, isLoading, isError } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data } = await api.get('/feed/sections');
      return data;
    }
  });

  // Fetch Summary
  const { data: summary } = useQuery({
    queryKey: ['activitySummary'],
    queryFn: async () => {
      const { data } = await api.get('/activity/summary');
      return data;
    }
  });

  // Mutation for Save/Ignore
  const interactionMutation = useMutation({
    mutationFn: async ({ listingId, status }) => {
      return api.post('/activity', { listingId, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['activitySummary'] });
    }
  });

  const handleSave = (listingId) => {
    interactionMutation.mutate({ listingId, status: 'saved' });
  };

  const handleIgnore = (listingId) => {
    interactionMutation.mutate({ listingId, status: 'ignored' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-accent-amber animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Waking up the server...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-primary-navy mb-2 tracking-tight">Your Opportunity Feed</h1>
            <p className="text-slate-500 font-medium">Verified opportunities tailored for your growth.</p>
          </div>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['feed'] })}
            className="px-6 py-3 bg-white border-2 border-primary-navy rounded-2xl font-bold text-primary-navy hover:bg-slate-50 transition-colors shadow-[4px_4px_0px_0px_rgba(27,42,74,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            Refresh Feed
          </button>
        </header>
        
        {/* Summary Strip */}
        <div className="flex flex-wrap gap-4 mb-12">
          <SummaryCard 
            label="Saved" 
            count={summary?.saved || 0} 
            icon={<PlusCircle className="text-blue-500" />} 
          />
          <SummaryCard 
            label="Applied" 
            count={summary?.applied || 0} 
            icon={<BookmarkCheck className="text-green-500" />} 
          />
          <SummaryCard 
            label="Missed" 
            count={summary?.missed || 0} 
            icon={<XCircle className="text-red-400" />} 
          />
        </div>

        {/* Closing Soon */}
        {data?.closingSoon?.length > 0 && (
          <FeedSection 
            title="Closing Soon" 
            subtitle="Apply before these opportunities disappear"
          >
            {data.closingSoon.map(listing => (
              <ListingCard 
                key={listing._id} 
                listing={listing} 
                onSave={handleSave} 
                onIgnore={handleIgnore} 
              />
            ))}
          </FeedSection>
        )}

        {/* Recommended */}
        <FeedSection 
          title="Recommended for You" 
          subtitle="Based on your branch, year, and interests"
          viewAllPath="/app/explore"
        >
          {data?.recommended?.map(listing => (
            <ListingCard 
              key={listing._id} 
              listing={listing} 
              onSave={handleSave} 
              onIgnore={handleIgnore} 
            />
          ))}
          {data?.recommended?.length === 0 && (
            <div className="col-span-full p-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center">
              <p className="text-slate-400 font-medium">No custom recommendations yet. Try updating your profile!</p>
            </div>
          )}
        </FeedSection>

        {/* Don't Miss */}
        {data?.dontMiss?.length > 0 && (
          <FeedSection 
            title="Don't Miss" 
            subtitle="High-impact opportunities curated by experts"
          >
            {data.dontMiss.map(listing => (
              <ListingCard 
                key={listing._id} 
                listing={listing} 
                onSave={handleSave} 
                onIgnore={handleIgnore} 
              />
            ))}
          </FeedSection>
        )}

      </main>
    </div>
  );
}

function SummaryCard({ label, count, icon }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 flex items-center gap-4 min-w-[160px]">
      <div className="p-2 bg-slate-50 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-2xl font-black text-primary-navy leading-none">{count}</p>
      </div>
    </div>
  );
}

export default FeedPage;
