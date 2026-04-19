import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';

const DOMAIN_OPTIONS = ['Development', 'Design', 'AI', 'Cybersecurity', 'Web3', 'Product', 'Data Science'];
const BRANCH_OPTIONS = ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL', 'EEE', 'CHEM'];

function ExplorePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [page, setPage] = useState(1);

  // Fetch Explore Listings
  const { data, isLoading, isPlaceholderData } = useQuery({
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

  // Activity mutation
  const activityMutation = useMutation({
    mutationFn: async ({ listingId, status }) => {
      return api.post('/activity', { listingId, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const toggleFilter = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
    setPage(1); // Reset to page 1 on filter change
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black text-primary-navy tracking-tight mb-4">Explore Opportunities</h1>
          <p className="text-slate-500 font-medium">Browse everything from internships to global hackathons.</p>
        </header>

        {/* Search & Filter Bar */}
        <section className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by title, organization..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-primary-navy placeholder:text-slate-300 focus:outline-none focus:border-primary-navy transition-all"
              />
            </div>
            
            <button className="px-8 py-4 bg-primary-navy text-white rounded-2xl font-bold flex items-center justify-center gap-3">
              <Search size={20} /> Search
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-6 pt-8 border-t-2 border-slate-50">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Domains</p>
              <div className="flex flex-wrap gap-2">
                {DOMAIN_OPTIONS.map(domain => (
                  <FilterChip 
                    key={domain} 
                    label={domain} 
                    active={selectedDomains.includes(domain)} 
                    onClick={() => toggleFilter(selectedDomains, setSelectedDomains, domain)} 
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Eligible Branches</p>
              <div className="flex flex-wrap gap-2">
                {BRANCH_OPTIONS.map(branch => (
                  <FilterChip 
                    key={branch} 
                    label={branch} 
                    active={selectedBranches.includes(branch)} 
                    onClick={() => toggleFilter(selectedBranches, setSelectedBranches, branch)} 
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Results Grid */}
        <section className="relative">
          {isLoading && !isPlaceholderData ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary-navy animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.listings?.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                    <p className="text-xl font-black text-slate-300 italic">No matches found. Try adjusting your lens.</p>
                  </div>
                ) : (
                  data?.listings?.map(listing => (
                    <ListingCard 
                      key={listing._id} 
                      listing={listing} 
                      onSave={(id) => activityMutation.mutate({ listingId: id, status: 'saved' })}
                      onIgnore={(id) => activityMutation.mutate({ listingId: id, status: 'ignored' })}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="w-12 h-12 border-2 border-slate-200 rounded-xl flex items-center justify-center font-black disabled:opacity-30 hover:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] active:shadow-none"
                  >
                    ←
                  </button>
                  <span className="text-sm font-black text-primary-navy px-4">
                    {page} <span className="text-slate-300 mx-1">/</span> {data.totalPages}
                  </span>
                  <button 
                    disabled={page === data.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="w-12 h-12 border-2 border-slate-200 rounded-xl flex items-center justify-center font-black disabled:opacity-30 hover:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] active:shadow-none"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
        active 
          ? 'bg-accent-amber border-accent-amber text-primary-navy' 
          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

export default ExplorePage;
