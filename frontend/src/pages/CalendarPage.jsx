import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch Calendar Listings (Deadlines for current month)
  const { data: listings, isLoading } = useQuery({
    queryKey: ['calendar', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const { data } = await api.get(`/listings/calendar?month=${month}&year=${year}`);
      return data;
    }
  });

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));

  const getListingsForDay = (day) => {
    if (!listings) return [];
    return listings.filter(l => {
      const deadline = new Date(l.timeline.deadline);
      return deadline.getDate() === day && 
             deadline.getMonth() === currentDate.getMonth() && 
             deadline.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-primary-navy tracking-tight mb-2">Deadline Calendar</h1>
            <p className="text-slate-500 font-medium italic underline decoration-accent-amber underline-offset-4 decoration-2">Don't let them slide away.</p>
          </div>

          <div className="flex items-center gap-4 bg-white border-2 border-slate-100 p-2 rounded-2xl shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft size={24} /></button>
            <span className="text-xl font-black text-primary-navy min-w-[150px] text-center">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight size={24} /></button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary-navy animate-spin" />
          </div>
        ) : (
          <div className="bg-white border-4 border-primary-navy rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-primary-navy text-white font-black text-xs uppercase tracking-widest text-center py-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 grid-flow-row auto-rows-[140px] divide-x-2 divide-y-2 divide-slate-100">
              {blanks.map(b => (
                <div key={`blank-${b}`} className="bg-slate-50/50" />
              ))}
              {days.map(day => {
                const dayListings = getListingsForDay(day);
                const isToday = day === new Date().getDate() && 
                               currentDate.getMonth() === new Date().getMonth() && 
                               currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div key={day} className={`p-4 group hover:bg-slate-50 transition-colors relative ${isToday ? 'bg-amber-50/30' : ''}`}>
                    <span className={`text-xl font-black ${isToday ? 'text-accent-amber' : 'text-slate-300 group-hover:text-primary-navy'} transition-colors`}>
                      {day}
                    </span>
                    
                    <div className="mt-2 space-y-1">
                      {dayListings.map(listing => (
                        <div 
                          key={listing._id}
                          className="bg-primary-navy text-white text-[9px] font-black p-1.5 rounded-lg truncate shadow-sm border border-white/10 flex items-center gap-1"
                          title={`${listing.orgName}: ${listing.title}`}
                        >
                          <AlertCircle size={8} className="text-accent-amber" />
                          {listing.orgName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CalendarPage;
