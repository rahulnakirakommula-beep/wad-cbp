import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookmarkCheck,
  Clock,
  Flame,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  XCircle
} from 'lucide-react';

import {
  DOMAIN_OPTIONS,
  LISTING_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  STIPEND_OPTIONS
} from '../constants';
import FeedSection from '../components/FeedSection';
import ListingCard from '../components/ui/ListingCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { useToast } from '../context/ToastContext';

const parseArrayParam = (searchParams, key) => {
  const values = searchParams.getAll(key);
  if (values.length > 0) return values;
  const csv = searchParams.get(key);
  return csv ? csv.split(',').filter(Boolean) : [];
};

export default function FeedPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [domainFilter, setDomainFilter] = useState(() => parseArrayParam(searchParams, 'domain'));
  const [typeFilter, setTypeFilter] = useState(() => parseArrayParam(searchParams, 'type'));
  const [stipendFilter, setStipendFilter] = useState(() => searchParams.get('stipend') || '');
  const [locationFilter, setLocationFilter] = useState(() => searchParams.get('location') || '');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [browsePage, setBrowsePage] = useState(() => Number(searchParams.get('page')) || 1);
  const [browseListings, setBrowseListings] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams();
    domainFilter.forEach((value) => params.append('domain', value));
    typeFilter.forEach((value) => params.append('type', value));
    if (stipendFilter) params.set('stipend', stipendFilter);
    if (locationFilter) params.set('location', locationFilter);
    if (searchQuery) params.set('q', searchQuery);
    if (browsePage > 1) params.set('page', String(browsePage));
    setSearchParams(params, { replace: true });
  }, [browsePage, domainFilter, locationFilter, setSearchParams, stipendFilter, typeFilter, searchQuery]);

  const browseQueryKey = useMemo(() => ([
    'browse-all',
    domainFilter,
    typeFilter,
    stipendFilter,
    locationFilter,
    searchQuery,
    browsePage
  ]), [browsePage, domainFilter, locationFilter, stipendFilter, typeFilter, searchQuery]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data: response } = await api.get('/feed/sections');
      return response;
    }
  });

  const { data: summary } = useQuery({
    queryKey: ['activitySummary'],
    queryFn: async () => {
      const { data: response } = await api.get('/activity/summary');
      return response;
    }
  });

  const {
    data: browseData,
    isLoading: browseLoading,
    isFetching: browseFetching
  } = useQuery({
    queryKey: browseQueryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      domainFilter.forEach((value) => params.append('domain', value));
      typeFilter.forEach((value) => params.append('type', value));
      if (stipendFilter) params.set('stipend', stipendFilter);
      if (locationFilter) params.set('location', locationFilter);
      if (searchQuery) params.set('q', searchQuery);
      params.set('page', String(browsePage));
      params.set('limit', '12');

      const { data: response } = await api.get(`/feed/browse?${params.toString()}`);
      return response;
    }
  });

  useEffect(() => {
    if (!browseData) return;

    setBrowseListings((current) => (
      browsePage === 1
        ? browseData.listings
        : [
            ...current,
            ...browseData.listings.filter((listing) => !current.some((existing) => existing._id === listing._id))
          ]
    ));
  }, [browseData, browsePage]);

  const interactionMutation = useMutation({
    mutationFn: async ({ listingId, status }) => api.post('/activity', { listingId, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['activitySummary'] });
      queryClient.invalidateQueries({ queryKey: ['browse-all'] });
    }
  });

  const handleSave = (listingId) => interactionMutation.mutate({ listingId, status: 'saved' });
  const handleIgnore = (listingId) => interactionMutation.mutate({ listingId, status: 'ignored' });
  const handleNavigate = (id) => navigate(`/app/listing/${id}`);

  const updateBrowseFilter = (setter, value) => {
    setter(value);
    setBrowsePage(1);
  };

  const clearBrowseFilters = () => {
    setDomainFilter([]);
    setTypeFilter([]);
    setStipendFilter('');
    setLocationFilter('');
    setSearchQuery('');
    setBrowsePage(1);
  };

  const hasActiveFilters = domainFilter.length > 0 || typeFilter.length > 0 || Boolean(stipendFilter) || Boolean(locationFilter) || Boolean(searchQuery);

  if (isLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="space-y-4">
          <Skeleton variant="text" className="w-1/4 h-8" />
          <Skeleton variant="text" className="w-1/3" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => <Skeleton.Card key={item} />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Offline or unavailable"
        message="We couldn't reach the server. Please check your connection."
        actionLabel="Try again"
        onAction={refetch}
      />
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">Your Feed</h1>
          <p className="text-slate-500 font-medium italic">Curated opportunities, timelines, and browse-all discovery.</p>
        </div>
        <Button variant="secondary" onClick={() => refetch()} iconLeading={RefreshCw}>
          Refresh
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Saved" value={summary?.saved || 0} icon={PlusCircle} color="text-blue-500" bg="bg-blue-50" to="/app/dashboard?status=saved" />
        <MetricCard label="Applied" value={summary?.applied || 0} icon={BookmarkCheck} color="text-emerald-500" bg="bg-emerald-50" to="/app/dashboard?status=applied" />
        <MetricCard label="Missed" value={summary?.missed || 0} icon={XCircle} color="text-red-400" bg="bg-red-50" to="/app/dashboard?status=missed" />
      </div>

      <FeedSection title="Recommended For You" subtitle="Based on your interests and eligibility" icon={Sparkles}>
        {data?.recommended?.length > 0 ? (
          data.recommended.map((listing) => (
            <ListingCard
              key={listing._id || listing.id}
              listing={listing}
              onSave={handleSave}
              onIgnore={handleIgnore}
              onNavigate={handleNavigate}
            />
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              title={user?.interests?.length ? 'No recommendations right now' : 'Set your interests for better recommendations'}
              message={user?.interests?.length ? 'Check Browse All for more opportunities.' : 'Update your interests to improve personalized matches.'}
              actionLabel={user?.interests?.length ? 'Browse all' : 'Update interests'}
              onAction={() => navigate(user?.interests?.length ? '/app/feed' : '/app/settings')}
            />
          </div>
        )}
      </FeedSection>

      {data?.closingSoon?.length > 0 && (
        <FeedSection title="Closing Soon" subtitle="Deadlines in the next 7 days" icon={Clock}>
          {data.closingSoon.map((listing) => (
            <ListingCard
              key={listing._id || listing.id}
              listing={listing}
              onSave={handleSave}
              onIgnore={handleIgnore}
              onNavigate={handleNavigate}
            />
          ))}
        </FeedSection>
      )}

      {data?.dontMiss?.length > 0 && (
        <FeedSection title="Don't Miss" subtitle="High-impact opportunities with urgency" icon={Flame}>
          {data.dontMiss.map((listing) => (
            <ListingCard
              key={listing._id || listing.id}
              listing={listing}
              onSave={handleSave}
              onIgnore={handleIgnore}
              onNavigate={handleNavigate}
            />
          ))}
        </FeedSection>
      )}

      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Search className="text-primary-navy" size={20} />
            <h2 className="text-xl sm:text-2xl font-black text-primary-navy tracking-tight">Browse All</h2>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-black uppercase tracking-widest text-slate-500">
              {browseData?.totalPages ? `${browseData.currentPage === 1 ? browseListings.length : browseData.currentPage * 12 - (12 - browseData.listings.length)} shown` : `${browseListings.length} shown`}
            </span>
          </div>
          <div className="flex-1 max-w-md relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-navy transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Search listings, roles, or firms..."
              value={searchQuery}
              onChange={(e) => updateBrowseFilter(setSearchQuery, e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:border-primary-navy transition-all"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearBrowseFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <div className="sticky top-[72px] z-20 bg-slate-50/95 backdrop-blur py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Select
              label="Domain"
              multiple
              searchable
              options={DOMAIN_OPTIONS.map((domain) => ({ label: domain, value: domain }))}
              value={domainFilter}
              onChange={(value) => updateBrowseFilter(setDomainFilter, value)}
            />
            <Select
              label="Type"
              multiple
              searchable
              options={LISTING_TYPE_OPTIONS.map((type) => ({ label: type, value: type }))}
              value={typeFilter}
              onChange={(value) => updateBrowseFilter(setTypeFilter, value)}
            />
            <Select
              label="Stipend"
              options={STIPEND_OPTIONS}
              value={stipendFilter}
              onChange={(value) => updateBrowseFilter(setStipendFilter, value)}
            />
            <Select
              label="Location"
              options={LOCATION_OPTIONS}
              value={locationFilter}
              onChange={(value) => updateBrowseFilter(setLocationFilter, value)}
            />
          </div>
        </div>

        {browseLoading && browsePage === 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => <Skeleton.Card key={item} />)}
          </div>
        ) : browseListings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {browseListings.map((listing) => (
                <ListingCard
                  key={listing._id || listing.id}
                  listing={listing}
                  onSave={handleSave}
                  onIgnore={handleIgnore}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>

            {browseData && browsePage < browseData.totalPages && (
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setBrowsePage((current) => current + 1)}
                  loading={browseFetching}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No results for these filters"
            message="Try removing a few filters to widen the opportunity list."
            actionLabel="Clear filters"
            onAction={clearBrowseFilters}
          />
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, bg, to }) {
  return (
    <Link to={to} className="bg-white border-2 border-slate-100 rounded-2xl p-5 flex items-center gap-5 group transition-all hover:bg-slate-50">
      <div className={`p-3 ${bg} rounded-xl group-hover:scale-110 transition-transform`}>
        <Icon className={color} size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-primary-navy leading-none tracking-tighter">{value}</p>
      </div>
    </Link>
  );
}
