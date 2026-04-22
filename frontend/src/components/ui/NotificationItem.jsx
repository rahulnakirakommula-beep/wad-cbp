import { 
  Clock, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Bell,
  Trash2
} from 'lucide-react';

export default function NotificationItem({ notification, onClick, onRemove }) {
  const { type, title, message, read, createdAt } = notification;

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
      default: 
        return { icon: Bell, color: 'text-slate-400', bg: 'bg-slate-50' };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div 
      onClick={onClick}
      className={`
        group relative flex items-start gap-4 p-5 rounded-[2rem] border-2 transition-all cursor-pointer
        ${read ? 'bg-white border-slate-50 opacity-70' : 'bg-blue-50/30 border-blue-100 shadow-sm'}
        hover:border-primary-navy hover:bg-white hover:shadow-lg hover:-translate-y-0.5
      `}
    >
      <div className={`p-3 rounded-2xl ${config.bg} ${config.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0 pr-8">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`text-sm font-black tracking-tight truncate ${read ? 'text-slate-600' : 'text-primary-navy'}`}>
            {title}
          </h4>
          {!read && (
            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 animate-pulse" />
          )}
        </div>
        <p className="text-xs font-bold text-slate-500 leading-relaxed mb-2">
          {message}
        </p>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
          {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-5 right-5 p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
