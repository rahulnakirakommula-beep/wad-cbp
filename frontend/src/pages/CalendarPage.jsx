import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Info,
  Rocket,
  Clock,
  Circle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// UI Components
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DUMMY_LISTINGS = [
  {
    id: 'd1',
    orgName: 'Google',
    title: 'Software Engineering Intern',
    timeline: { openDate: new Date(new Date().getFullYear(), 0, 15).toISOString(), deadline: null },
  },
  {
    id: 'd2',
    orgName: 'Microsoft',
    title: 'SDE Full Time',
    timeline: { openDate: null, deadline: new Date(new Date().getFullYear(), 1, 20).toISOString() },
  },
  {
    id: 'd3',
    orgName: 'Amazon',
    title: 'SDE Intern',
    timeline: { openDate: new Date(new Date().getFullYear(), 2, 5).toISOString(), deadline: new Date(new Date().getFullYear(), 3, 10).toISOString() },
  },
  {
    id: 'd4',
    orgName: 'Meta',
    title: 'Production Engineer',
    timeline: { openDate: new Date(new Date().getFullYear(), 4, 12).toISOString(), deadline: null },
  },
  {
    id: 'd5',
    orgName: 'Netflix',
    title: 'UI Engineer',
    timeline: { openDate: null, deadline: new Date(new Date().getFullYear(), 5, 25).toISOString() },
  },
  {
    id: 'd6',
    orgName: 'Apple',
    title: 'Hardware Engineer Intern',
    timeline: { openDate: new Date(new Date().getFullYear(), 6, 1).toISOString(), deadline: null },
  },
  {
    id: 'd7',
    orgName: 'Tesla',
    title: 'Autopilot Engineer',
    timeline: { openDate: null, deadline: new Date(new Date().getFullYear(), 7, 30).toISOString() },
  },
  {
    id: 'd8',
    orgName: 'SpaceX',
    title: 'Software Engineer, Flight',
    timeline: { openDate: new Date(new Date().getFullYear(), 8, 15).toISOString(), deadline: null },
  },
  {
    id: 'd9',
    orgName: 'Stripe',
    title: 'Backend Engineer',
    timeline: { openDate: null, deadline: new Date(new Date().getFullYear(), 9, 20).toISOString() },
  },
  {
    id: 'd10',
    orgName: 'Airbnb',
    title: 'Frontend Engineer',
    timeline: { openDate: new Date(new Date().getFullYear(), 10, 5).toISOString(), deadline: null },
  },
  {
    id: 'd11',
    orgName: 'Uber',
    title: 'Data Scientist',
    timeline: { openDate: null, deadline: new Date(new Date().getFullYear(), 11, 10).toISOString() },
  },
  {
    id: 'd12',
    orgName: 'Lyft',
    title: 'Product Manager',
    timeline: { openDate: new Date(new Date().getFullYear(), 0, 25).toISOString(), deadline: null },
  },
  {
    id: 'd13',
    orgName: 'Atlassian',
    title: 'Security Engineer',
    timeline: { openDate: new Date(new Date().getFullYear(), 2, 18).toISOString(), deadline: null },
  },
  {
    id: 'd14',
    orgName: 'Salesforce',
    title: 'Cloud Engineer',
    timeline: { openDate: null, deadline: new Date(new Date().getFullYear(), 6, 15).toISOString() },
  }
];

export default function CalendarPage() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'interests'

  // Fetch all listings for the year (Simplified for V1: fetch a bulk list)
  const { data: listings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['calendar-year', year, filterMode],
    queryFn: async () => {
      // Return dummy data instead of fetching from API
      return DUMMY_LISTINGS.filter(l => {
        const d = new Date(l.timeline?.deadline || l.timeline?.openDate);
        return d.getFullYear() === year;
      });
      /*
      const { data } = await api.get(`/listings/calendar/year?year=${year}&mode=${filterMode}`);
      return data;
      */
    }
  });

  // Group listings by month
  const groupedListings = MONTHS.map((_, index) => {
    return listings.filter(l => {
      const d = new Date(l.timeline?.deadline || l.timeline?.openDate);
      return d.getMonth() === index && d.getFullYear() === year;
    });
  });

  // Removed auto-scroll logic as grid layout shows multiple items vertically

  return (
    <div className="space-y-10 pb-20 overflow-hidden">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">Annual Roadmap</h1>
          <p className="text-slate-500 font-medium italic">Visualize the full cycle of opportunities.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 border-2 border-slate-100 rounded-2xl shadow-sm">
          <button 
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterMode === 'all' ? 'bg-primary-navy text-white shadow-md' : 'text-slate-400 hover:text-primary-navy'}`}
          >
            All Listings
          </button>
          <button 
            onClick={() => setFilterMode('interests')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterMode === 'interests' ? 'bg-primary-navy text-white shadow-md' : 'text-slate-400 hover:text-primary-navy'}`}
          >
            My Interests
          </button>
        </div>
      </header>

      {/* Main Roadmap Grid */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8"
      >
        {MONTHS.map((monthName, idx) => (
          <MonthColumn 
            key={monthName}
            name={monthName}
            year={year}
            isCurrent={idx === new Date().getMonth() && year === new Date().getFullYear()}
            listings={groupedListings[idx]}
            isLoading={isLoading}
            onNavigate={(id) => navigate(`/app/listing/${id}`)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-8 py-6 border-t border-slate-50">
        <LegendItem icon={Rocket} color="text-emerald-500" bg="bg-emerald-50" label="Window Opening" />
        <LegendItem icon={Clock} color="text-amber-500" bg="bg-amber-50" label="Cycle Closing" />
        <LegendItem icon={Circle} color="text-slate-400" bg="bg-slate-50" label="Planned / Other" />
      </div>
    </div>
  );
}

function MonthColumn({ name, year, isCurrent, listings, isLoading, onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  const visibleListings = expanded ? listings : listings.slice(0, 6);

  return (
    <div className={`
      w-full transition-all duration-500 rounded-3xl border border-slate-100 bg-white shadow-sm
      ${isCurrent ? 'bg-blue-50/20 ring-2 ring-primary-navy/5' : ''}
    `}>
      <div className="p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h3 className={`text-xl font-black tracking-tight ${isCurrent ? 'text-primary-navy' : 'text-slate-400'}`}>
            {name}
            {isCurrent && <div className="h-1 w-8 bg-accent-amber rounded-full mt-1" />}
          </h3>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{year}</span>
        </header>

        <div className="space-y-3 min-h-[400px]">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl w-4/5" />
              <Skeleton className="h-10 rounded-xl w-2/3" />
            </div>
          ) : listings.length > 0 ? (
            <>
              {visibleListings.map(listing => (
                <ListingChip key={listing.id} listing={listing} onClick={() => onNavigate(listing.id)} />
              ))}
              
              {listings.length > 6 && (
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary-navy transition-colors text-center"
                >
                  {expanded ? 'Show Less' : `+${listings.length - 6} More`}
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center opacity-30">
              <CalendarIcon size={32} className="mb-2 text-slate-200" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Listings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ListingChip({ listing, onClick }) {
  const isClosing = !!listing.timeline?.deadline;
  const isOpening = !isClosing && !!listing.timeline?.openDate;
  
  const Icon = isClosing ? Clock : isOpening ? Rocket : Circle;
  const colorClass = isClosing ? 'text-amber-500' : isOpening ? 'text-emerald-500' : 'text-slate-300';
  const bgClass = isClosing ? 'bg-amber-50 group-hover:bg-amber-100' : isOpening ? 'bg-emerald-50 group-hover:bg-emerald-100' : 'bg-slate-50 group-hover:bg-slate-100';

  return (
    <button 
      onClick={onClick}
      className="group w-full flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-primary-navy hover:shadow-md transition-all text-left"
    >
      <div className={`p-1.5 rounded-lg ${bgClass} ${colorClass} transition-colors`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{listing.orgName}</p>
        <p className="text-xs font-bold text-primary-navy leading-tight truncate">{listing.title}</p>
      </div>
    </button>
  );
}

function LegendItem({ icon: Icon, color, bg, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${bg} ${color}`}>
        <Icon size={14} />
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}
