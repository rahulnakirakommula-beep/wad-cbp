import React from 'react';
import { Star, Flame, ShieldCheck, AlertTriangle, User, Shield, Info } from 'lucide-react';

const badgeStyles = {
  // Statuses
  upcoming: 'bg-blue-50 text-blue-700 border-blue-100',
  open: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-red-50 text-red-700 border-red-100',
  unknown: 'bg-slate-50 text-slate-500 border-slate-100',

  // Activity statuses
  saved: 'bg-blue-50 text-blue-700 border-blue-100',
  applied: 'bg-violet-50 text-violet-700 border-violet-100',
  missed: 'bg-slate-100 text-slate-500 border-slate-200',

  // Application outcome statuses
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border-red-100',

  // Priorities
  high: 'bg-amber-50 text-amber-700 border-amber-100',
  'dont-miss': 'bg-amber-100 text-amber-800 border-amber-200 ring-2 ring-amber-500 ring-offset-1 animate-pulse',

  // Misc
  curated: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  stale: 'bg-amber-50 text-amber-600 border-amber-200',
  official: 'bg-blue-600 text-white border-blue-700 shadow-sm',
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  unverified: 'bg-slate-100 text-slate-400 border-slate-200',
  role: 'bg-slate-100 text-slate-700 border-slate-200 uppercase tracking-wider font-black',
  count: 'bg-primary-navy text-white px-1.5 min-w-[20px] rounded-full'
};

// Internal SVG icons
function CheckCircle2(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
  );
}

function XCircle(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
  );
}

const badgeIcons = {
  upcoming: Info,
  open: CheckCircle2,
  closed: XCircle,
  cancelled: XCircle,
  high: Star,
  'dont-miss': Flame,
  curated: ShieldCheck,
  stale: AlertTriangle,
  official: ShieldCheck,
  verified: CheckCircle2,
  unverified: XCircle,
  student: User,
  admin: Shield,
  source: User,
  // Application outcome
  pending: AlertTriangle,
  accepted: CheckCircle2,
  rejected: XCircle
};

export default function Badge({ 
  children, 
  variant = 'unknown', 
  icon: customIcon,
  count,
  className = '' 
}) {
  const Icon = customIcon || badgeIcons[variant];
  const isCount = variant === 'count';

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all
      ${badgeStyles[variant] || badgeStyles.unknown}
      ${className}
    `}>
      {Icon && !isCount && <Icon size={14} className="flex-shrink-0" />}
      <span className="capitalize">{children}</span>
      {count !== undefined && (
        <span className="ml-1 bg-white/20 px-1 rounded text-[10px]">{count}</span>
      )}
    </div>
  );
}
