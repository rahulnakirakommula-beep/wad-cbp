import { Calendar, Info, Clock } from 'lucide-react';
import Badge from './Badge';

export default function TimelineCard({ timeline, confidenceLevel, prepLeadWeeks }) {
  if (!timeline) return (
    <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
        <Calendar size={32} />
      </div>
      <p className="text-slate-400 font-medium italic">Timeline data not yet confirmed.</p>
    </div>
  );

  const { openDate, deadline, lastDeadline } = timeline;
  
  const getDaysLeft = () => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft();
  const isUrgent = daysLeft !== null && daysLeft <= 2;

  const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { 
    day: 'numeric', month: 'short', year: 'numeric' 
  });

  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
        <div className="w-10 h-10 bg-primary-navy rounded-xl flex items-center justify-center text-white">
          <Calendar size={20} />
        </div>
        <h3 className="text-xl font-black text-primary-navy tracking-tight">Timeline & Cycle</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Main Dates */}
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Application Deadline</p>
            <div className="flex items-end gap-3">
              <span className={`text-2xl font-black tracking-tighter ${isUrgent ? 'text-red-500' : 'text-primary-navy'}`}>
                {deadline ? formatDate(deadline) : 'Rolling Basis'}
              </span>
              {daysLeft !== null && (
                <span className={`text-sm font-bold pb-1 ${isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>
                  ({daysLeft > 0 ? `in ${daysLeft} days` : 'Closed'})
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Window Opens</p>
            <p className="text-xl font-bold text-slate-600">
              {openDate ? formatDate(openDate) : 'Already Open'}
            </p>
          </div>
        </div>

        {/* Intelligence */}
        <div className="space-y-6">
          {confidenceLevel && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Confidence</p>
              <div className="flex items-center gap-2 group cursor-help">
                <Badge variant="curated">{confidenceLevel}</Badge>
                <Info size={14} className="text-slate-300 group-hover:text-primary-navy transition-colors" />
              </div>
            </div>
          )}

          {prepLeadWeeks && deadline && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
              <Clock size={16} className="text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Expert Tip</p>
                <p className="text-xs font-bold text-blue-900 leading-normal">
                  Start preparing around {formatDate(new Date(new Date(deadline).getTime() - (prepLeadWeeks * 7 * 24 * 60 * 60 * 1000)))}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {lastDeadline && (
        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Historical Data</p>
          <span className="text-xs font-bold text-slate-400">
            Last cycle closed: {formatDate(lastDeadline)}
          </span>
        </div>
      )}
    </div>
  );
}
