import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Clock, 
  X, 
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import Badge from './Badge';
import Button from './Button';

export default function ActivityRow({ activity, onStatusChange, onRemove }) {
  const navigate = useNavigate();
  const { listing, status, updatedAt } = activity;

  if (!listing) return null;

  const isMissed = status === 'missed';
  const isApplied = status === 'applied';
  const isSaved = status === 'saved';

  const deadline = listing.timeline?.deadline;
  const isUrgent = deadline && new Date(deadline) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  const handleNavigate = () => navigate(`/app/listing/${listing.id || listing._id}`);

  return (
    <div className={`
      group flex items-center gap-4 p-4 sm:p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] transition-all hover:border-primary-navy hover:shadow-lg
      ${isMissed ? 'opacity-70 grayscale-[0.5]' : ''}
    `}>
      {/* Brand Icon */}
      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
        {listing.orgLogoUrl ? (
          <img src={listing.orgLogoUrl} alt={listing.orgName} className="w-full h-full object-cover" />
        ) : (
          <Building2 size={24} className="text-slate-300" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handleNavigate}>
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-black text-primary-navy truncate">{listing.title}</h4>
          <Badge variant={status}>{status}</Badge>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="truncate max-w-[100px]">{listing.orgName}</span>
          {deadline && (
            <div className={`flex items-center gap-1 ${isUrgent && !isApplied ? 'text-red-500' : ''}`}>
              <Clock size={10} />
              <span>{isMissed ? 'Closed' : new Date(deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
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
          <X size={18} />
        </button>

        <ChevronRight size={18} className="text-slate-200 group-hover:text-primary-navy transition-colors ml-1" />
      </div>
    </div>
  );
}
