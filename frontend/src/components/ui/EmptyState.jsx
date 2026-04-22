import { Info, Search, Heart, BellOff, ListTodo } from 'lucide-react';
import Button from './Button';

const icons = {
  search: Search,
  heart: Heart,
  bell: BellOff,
  todo: ListTodo,
  info: Info
};

export default function EmptyState({
  title,
  message,
  icon = 'info',
  actionLabel,
  onAction,
  className = ''
}) {
  const Icon = icons[icon] || icons.info;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in-95 duration-500 ${className}`}>
      <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 text-slate-300 border-2 border-dashed border-slate-200">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-black text-primary-navy tracking-tight mb-2">
        {title}
      </h3>
      
      <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8 leading-relaxed">
        {message}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
