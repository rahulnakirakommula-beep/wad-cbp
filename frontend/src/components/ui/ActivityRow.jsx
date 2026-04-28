import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  X, 
  ChevronRight,
  CheckCircle2,
  Clock3,
  XCircle
} from 'lucide-react';
import Badge from './Badge';
import Button from './Button';

const APP_STATUS_OPTIONS = [
  { value: 'pending',  label: 'Pending',  icon: Clock3,       color: 'text-amber-500',   bg: 'bg-amber-50',   activeBg: 'bg-amber-100 border-amber-300 text-amber-700' },
  { value: 'accepted', label: 'Accepted', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', activeBg: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
  { value: 'rejected', label: 'Rejected', icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-50',     activeBg: 'bg-red-100 border-red-300 text-red-600' },
];

export default function ActivityRow({ activity, onStatusChange, onApplicationStatusChange, onRemove }) {
  const navigate = useNavigate();
  const { listing, status, applicationStatus } = activity;

  if (!listing) return null;

  const isMissed = status === 'missed';
  const isApplied = status === 'applied';
  const isSaved = status === 'saved';

  const deadline = listing.timeline?.deadline;
  const isUrgent = deadline && new Date(deadline) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  const handleNavigate = () => navigate(`/app/listing/${listing.id || listing._id}`);

  const handleAppStatus = (e, val) => {
    e.stopPropagation();
    // Toggle off if already selected
    onApplicationStatusChange(val === applicationStatus ? null : val);
  };

  return (
    <div className={`
      flex flex-col gap-3 p-4 sm:p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] transition-all hover:border-primary-navy/30 hover:shadow-lg
      ${isMissed ? 'opacity-60 grayscale-[0.4]' : ''}
    `}>
      {/* Main Row */}
      <div className="flex items-center gap-4">
        {/* Brand Icon */}
        <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {listing.orgLogoUrl ? (
            <img src={listing.orgLogoUrl} alt={listing.orgName} className="w-full h-full object-cover" />
          ) : (
            <Building2 size={22} className="text-slate-300" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleNavigate}>
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-black text-primary-navy truncate">{listing.title}</h4>
            <Badge variant={status}>{status}</Badge>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="truncate max-w-[120px]">{listing.orgName}</span>
            {deadline && (
              <div className={`flex items-center gap-1 ${isUrgent && !isApplied ? 'text-red-500' : ''}`}>
                <Clock size={10} />
                <span>{isMissed ? 'Closed' : new Date(deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSaved && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onStatusChange('applied'); }}
              className="hidden sm:flex"
            >
              Mark Applied
            </Button>
          )}
          
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Remove from dashboard"
          >
            <X size={16} />
          </button>

          <ChevronRight size={16} className="text-slate-200 group-hover:text-primary-navy transition-colors" onClick={handleNavigate} />
        </div>
      </div>

      {/* Application Status Row — only for applied activities */}
      {isApplied && (
        <div className="flex items-center gap-2 pl-[3.25rem]">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mr-1 whitespace-nowrap">Result</span>
          {APP_STATUS_OPTIONS.map(({ value, label, icon: Icon, activeBg }) => {
            const isActive = applicationStatus === value;
            return (
              <button
                key={value}
                onClick={(e) => handleAppStatus(e, value)}
                className={`
                  flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-[10px] font-black uppercase tracking-wider transition-all
                  ${isActive ? activeBg : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'}
                `}
                title={isActive ? `Remove "${label}" status` : `Mark as ${label}`}
              >
                <Icon size={11} />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
