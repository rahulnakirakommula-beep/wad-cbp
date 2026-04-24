import {
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  Flame,
  XCircle
} from 'lucide-react';

function getRelativeTime(createdAt) {
  const created = new Date(createdAt);
  const diffMs = Date.now() - created.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return created.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotificationItem({ notification, onClick }) {
  const { type, payload = {}, status, createdAt } = notification;
  const isUnread = status === 'unread';

  const getTypeConfig = () => {
    switch (type) {
      case 'deadline_3day':
        return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' };
      case 'deadline_1day':
        return { icon: Clock, color: 'text-red-500', bg: 'bg-red-50' };
      case 'dont_miss':
        return { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' };
      case 'season_open':
        return { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' };
      default:
        return { icon: Bell, color: 'text-slate-400', bg: 'bg-slate-50' };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group w-full flex items-start gap-4 p-5 rounded-[2rem] border-2 transition-all text-left
        ${isUnread ? 'bg-blue-50/40 border-blue-100 shadow-sm' : 'bg-white border-slate-100'}
        hover:border-primary-navy hover:bg-white hover:shadow-lg hover:-translate-y-0.5
      `}
    >
      <div className={`p-3 rounded-2xl ${config.bg} ${config.color} flex-shrink-0`}>
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h4 className={`text-sm font-black tracking-tight ${isUnread ? 'text-primary-navy' : 'text-slate-700'}`}>
            {payload.title}
          </h4>
          {isUnread && <span className="mt-1.5 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 animate-pulse" />}
        </div>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-1">{payload.message}</p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 pl-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          {getRelativeTime(createdAt)}
        </span>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-navy transition-colors" />
      </div>
    </button>
  );
}
