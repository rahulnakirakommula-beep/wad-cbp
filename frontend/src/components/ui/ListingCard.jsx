import { useState } from 'react';
import { Bookmark, X, ShieldCheck, Flame, AlertTriangle, MapPin, DollarSign, Clock } from 'lucide-react';
import Badge from './Badge';
import DomainTagChip from './DomainTagChip';
import Button from './Button';
import { useToast } from '../../context/ToastContext';

export default function ListingCard({
  listing,
  onSave,
  onIgnore,
  onNavigate,
  viewMode = 'student' // 'student', 'admin'
}) {
  const { addToast } = useToast();
  const [isSaved, setIsSaved] = useState(listing.status === 'saved');
  const [isIgnored, setIsIgnored] = useState(false);

  const {
    title,
    orgName,
    orgLogoUrl,
    type,
    domainTags = [],
    stipend,
    location,
    timeline,
    confidenceLevel,
    isCurated,
    isStale,
    priority
  } = listing;

  const handleSave = (e) => {
    e.stopPropagation();
    const newState = !isSaved;
    setIsSaved(newState);
    onSave?.(listing.id, newState);
    
    addToast({
      title: newState ? 'Saved' : 'Removed',
      message: `${title} has been ${newState ? 'added to' : 'removed from'} your saved opportunities.`,
      type: 'success'
    });
  };

  const handleIgnore = (e) => {
    e.stopPropagation();
    setIsIgnored(true);
    setTimeout(() => {
      onIgnore?.(listing.id);
    }, 300); // Wait for collapse animation

    addToast({
      title: 'Opportunity Ignored',
      message: 'This listing will no longer appear in your feed.',
      type: 'info'
    });
  };

  if (isIgnored) {
    return (
      <div className="animate-out slide-out-to-top fade-out duration-300 h-0 overflow-hidden" />
    );
  }

  // Color logic for deadline
  const getDeadlineColor = () => {
    if (!timeline?.deadline) return 'text-slate-500';
    const days = Math.ceil((new Date(timeline.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days <= 2) return 'text-red-500 font-black';
    if (days <= 7) return 'text-amber-500 font-bold';
    return 'text-slate-500';
  };

  const formattedDeadline = timeline?.deadline 
    ? `Closes ${new Date(timeline.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
    : 'No deadline';

  return (
    <div
      onClick={() => onNavigate?.(listing.id)}
      className={`
        group relative bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm transition-all duration-300 cursor-pointer
        hover:border-primary-navy hover:shadow-xl hover:-translate-y-1 active:scale-[0.99]
        ${priority === 'dont-miss' ? 'border-amber-200 bg-amber-50/10' : ''}
        ${isSaved ? 'bg-slate-50/50 border-slate-200' : ''}
      `}
    >
      {/* Priority Banner */}
      {priority === 'dont-miss' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-t-2xl animate-pulse" />
      )}

      {/* Header: Org & Badges */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-primary-navy transition-colors">
            {orgLogoUrl ? (
              <img src={orgLogoUrl} alt={orgName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-black text-slate-400">{orgName?.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant={type?.toLowerCase() || 'unknown'}>{type}</Badge>
            {isCurated && <Badge variant="curated" icon={ShieldCheck}>Verified</Badge>}
          </div>
        </div>

        <div className="flex gap-1">
          {isStale && viewMode === 'admin' && (
            <div className="p-1.5 text-amber-600 bg-amber-50 rounded-lg" title="Data might be outdated">
              <AlertTriangle size={16} />
            </div>
          )}
          {priority === 'dont-miss' && (
            <div className="p-1.5 text-amber-600 animate-bounce">
              <Flame size={18} fill="currentColor" />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-2 mb-4">
        <h3 className="text-base font-black text-primary-navy leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm font-bold text-slate-400">{orgName}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5 h-[28px] overflow-hidden">
        {domainTags.slice(0, 3).map(tag => (
          <DomainTagChip key={tag} label={tag} variant="display" className="px-2 py-0.5 border-none bg-slate-100 text-slate-500" />
        ))}
        {domainTags.length > 3 && (
          <span className="text-[10px] font-black text-slate-400 self-center">+{domainTags.length - 3}</span>
        )}
      </div>

      {/* Footer: Meta & Actions */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1">
              <Clock size={14} className={getDeadlineColor()} />
              <span className={getDeadlineColor()}>{formattedDeadline}</span>
            </div>
            {confidenceLevel && (
              <span className="opacity-60 font-medium italic">({confidenceLevel})</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
            <div className="flex items-center gap-1">
              <DollarSign size={12} className="text-emerald-500" />
              {stipend || 'Unspecified'}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-blue-500" />
              {location || 'Remote'}
            </div>
          </div>

          {viewMode === 'student' && (
            <div className="flex gap-2">
              <button
                onClick={handleIgnore}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Ignore"
              >
                <X size={20} />
              </button>
              <button
                onClick={handleSave}
                className={`p-2 rounded-xl transition-all ${
                  isSaved 
                    ? 'text-primary-navy bg-primary-navy/5' 
                    : 'text-slate-300 hover:text-primary-navy hover:bg-slate-50'
                }`}
                title={isSaved ? 'Unsave' : 'Save'}
              >
                <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
