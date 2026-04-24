import { CheckCircle2, AlertCircle, XCircle, Users } from 'lucide-react';
import Badge from './Badge';

export default function EligibilityBlock({ listing, userProfile }) {
  const targetBranches = listing.targetAudience?.branches || [];
  const targetYears = listing.targetAudience?.years || [];
  const userBranch = userProfile?.branch;
  const userYear = userProfile?.currentYear;

  // Logic from Section 4.5
  const isBranchMatch = targetBranches.length === 0 || targetBranches.includes(userBranch);
  const isYearMatch = targetYears.length === 0 || targetYears.includes(userYear);

  let status = 'match';
  if (!isBranchMatch && !isYearMatch) status = 'no-match';
  else if (!isBranchMatch || !isYearMatch) status = 'partial';

  const configs = {
    match: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'You appear eligible'
    },
    partial: {
      icon: AlertCircle,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'Check eligibility criteria'
    },
    'no-match': {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'You may not be eligible'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`p-8 rounded-[2rem] border-2 ${config.bg} ${config.border} space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-200`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-white rounded-2xl shadow-sm ${config.color}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xl font-black text-primary-navy tracking-tight">{config.text}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Eligibility Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200/50">
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Target Branches</p>
          <div className="flex flex-wrap gap-1.5">
            {targetBranches.length > 0 ? (
              targetBranches.map(b => (
                <span key={b} className={`px-3 py-1 rounded-lg text-xs font-bold ${b === userBranch ? 'bg-primary-navy text-white' : 'bg-white text-slate-500 ring-1 ring-slate-100'}`}>
                  {b}
                </span>
              ))
            ) : (
              <span className="text-sm font-bold text-slate-500 italic">Open to all branches</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Target Years</p>
          <div className="flex flex-wrap gap-1.5">
            {targetYears.length > 0 ? (
              targetYears.map(y => (
                <span key={y} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black ${y === userYear ? 'bg-primary-navy text-white' : 'bg-white text-slate-500 ring-1 ring-slate-100'}`}>
                  {y}
                </span>
              ))
            ) : (
              <span className="text-sm font-bold text-slate-500 italic">Open to all years</span>
            )}
          </div>
        </div>
      </div>

      {listing.targetAudienceNote && (
        <div className="p-4 bg-white/50 rounded-xl">
          <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
            &ldquo;{listing.targetAudienceNote}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
