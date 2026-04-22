import { X } from 'lucide-react';

export default function DomainTagChip({ 
  label, 
  active = false, 
  onClick, 
  onRemove,
  variant = 'display', // display, filter, picker, removable
  disabled = false,
  className = ''
}) {
  const isInteractive = variant !== 'display' && !disabled;
  
  const baseStyles = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 select-none';
  
  const stateStyles = active 
    ? 'bg-primary-navy border-primary-navy text-white shadow-md' 
    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200';

  const interactionStyles = isInteractive 
    ? 'cursor-pointer active:scale-95' 
    : 'cursor-default';
    
  const disabledStyles = disabled ? 'opacity-40 cursor-not-allowed' : '';

  return (
    <div 
      onClick={() => isInteractive && onClick?.()}
      className={`
        ${baseStyles}
        ${stateStyles}
        ${interactionStyles}
        ${disabledStyles}
        ${className}
      `}
    >
      <span>{label}</span>
      
      {variant === 'removable' && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-0.5 hover:bg-white/20 rounded-md transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
