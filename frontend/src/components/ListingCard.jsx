import { Calendar, Briefcase, MapPin, Bookmark, ExternalLink, Flag } from 'lucide-react';

function ListingCard({ listing, onSave, onIgnore, onFlag }) {
  const { title, orgName, type, stipendType, locationType, timeline, priority } = listing;

  const isClosingSoon = () => {
    if (!timeline?.deadline) return false;
    const deadline = new Date(timeline.deadline);
    const diff = deadline.getTime() - new Date().getTime();
    return diff > 0 && diff < (7 * 24 * 60 * 60 * 1000);
  };

  return (
    <div className="group bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-primary-navy transition-all hover:shadow-[6px_6px_0px_0px_rgba(27,42,74,1)] relative flex flex-col h-full">
      {priority === 'dont-miss' && (
        <span className="absolute -top-3 -right-2 bg-accent-amber text-primary-navy text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-sm z-10">
          Must See
        </span>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-slate-400 border border-slate-100">
          {orgName.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onFlag(listing._id)}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Flag issue"
          >
            <Flag size={18} />
          </button>
          <button 
            onClick={() => onSave(listing._id)}
            className="p-2 text-slate-400 hover:text-accent-amber hover:bg-amber-50 rounded-lg transition-colors"
            title="Save for later"
          >
            <Bookmark size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{orgName}</p>
        <h3 className="text-lg font-bold text-primary-navy leading-tight mb-3 group-hover:text-accent-amber transition-colors">
          {title}
        </h3>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Briefcase size={14} className="text-slate-400" />
            <span>{type} · {stipendType}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <MapPin size={14} className="text-slate-400" />
            <span>{locationType}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Calendar size={14} className={isClosingSoon() ? 'text-red-500' : 'text-slate-400'} />
            <span className={isClosingSoon() ? 'text-red-500' : 'text-slate-600'}>
              {timeline?.deadline ? new Date(timeline.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date TBD'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button 
          onClick={() => onIgnore(listing._id)}
          className="flex-1 py-2 text-xs font-bold text-slate-400 border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all"
        >
          Ignore
        </button>
        <a 
          href={listing.externalUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 border-2 border-primary-navy text-primary-navy rounded-xl hover:bg-primary-navy hover:text-white transition-all"
        >
          <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
}

export default ListingCard;
