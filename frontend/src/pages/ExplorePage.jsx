import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Filter } from 'lucide-react';

// UI Components
import ListingCard from '../components/ui/ListingCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

import { DOMAIN_OPTIONS, BRANCH_OPTIONS } from '../constants';

export default function ExplorePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State derived from URL
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedDomains, setSelectedDomains] = useState(searchParams.get('domains')?.split(',').filter(Boolean) || []);
  const [selectedBranches, setSelectedBranches] = useState(searchParams.get('branches')?.split(',').filter(Boolean) || []);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Sync URL on state change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (selectedDomains.length > 0) params.set('domains', selectedDomains.join(','));
    if (selectedBranches.length > 0) params.set('branches', selectedBranches.join(','));
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params, { replace: true });
  }, [search, selectedDomains, selectedBranches, page]);

  // Fetch Logic
  const { data, isLoading, isPlaceholderData, refetch } = useQuery({
    queryKey: ['explore', search, selectedDomains, selectedBranches, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        domainTags: selectedDomains.join(','),
        branches: selectedBranches.join(','),
        page,
        limit: 12
      });
      const { data } = await api.get(`/listings/explore?${params}`);
      return data;
    },
    placeholderData: (previousData) => previousData
  });

  const interactionMutation = useMutation({
    mutationFn: async ({ listingId, status }) => {
      return api.post('/activity', { listingId, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const toggleFilter = (list, setList, item) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedDomains([]);
    setSelectedBranches([]);
    setPage(1);
  };

  const handleNavigate = (id) => navigate(`/app/listing/${id}`);

  const activeFilterCount = selectedDomains.length + selectedBranches.length;

  return (
    <div className="space-y-10 pb-20">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1 text-center md:text-left w-full md:w-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">Explore</h1>
          <p className="text-slate-500 font-medium italic">Discover fellowships, workshops, and high-impact roles.</p>
        </div>
      </header>

      {/* Filter Section */}
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by title, skill, or organization..."
              iconLeading={Search}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="py-4"
            />
          </div>
          <Button 
            variant={activeFilterCount > 0 ? 'accent' : 'secondary'}
            onClick={clearFilters}
            className="whitespace-nowrap h-[60px]"
            iconLeading={activeFilterCount > 0 ? X : SlidersHorizontal}
          >
            {activeFilterCount > 0 ? `Clear (${activeFilterCount})` : 'Filters'}
          </Button>
        </div>

        <div className="space-y-6 pt-4 border-t border-slate-50">
          <FilterSection 
            label="Domains" 
            items={DOMAIN_OPTIONS} 
            selected={selectedDomains} 
            onToggle={(item) => toggleFilter(selectedDomains, setSelectedDomains, item)} 
          />
          <FilterSection 
            label="Eligible Branches" 
            items={BRANCH_OPTIONS} 
            selected={selectedBranches} 
            onToggle={(item) => toggleFilter(selectedBranches, setSelectedBranches, item)} 
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            Showing <span className="text-primary-navy">{data?.totalListings || 0}</span> Opportunities
          </h2>
        </div>

        {isLoading && !isPlaceholderData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton.Card key={i} />)}
          </div>
        ) : data?.listings?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.listings.map(listing => (
                <ListingCard
                  key={listing._id || listing.id}
                  listing={listing}
                  onSave={(id) => interactionMutation.mutate({ listingId: id, status: 'saved' })}
                  onIgnore={(id) => interactionMutation.mutate({ listingId: id, status: 'ignored' })}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
            
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            icon="search"
            title="No results found"
            message="We couldn't find anything matching your filters. Try widening your scope."
            actionLabel="Clear all filters"
            onAction={clearFilters}
          />
        )}
      </div>
    </div>
  );
}

function FilterSection({ label, items, selected, onToggle }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={`
              px-4 py-2 rounded-xl text-xs font-black transition-all border-2
              ${selected.includes(item)
                ? 'bg-primary-navy border-primary-navy text-white shadow-md'
                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}
            `}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
