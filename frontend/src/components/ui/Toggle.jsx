import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Toggle = forwardRef(({
  label,
  helperText,
  checked,
  onChange,
  disabled = false,
  loading = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`flex items-start gap-4 ${className} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      <div className="relative mt-1">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => !disabled && !loading && onChange(e.target.checked)}
          disabled={disabled || loading}
          ref={ref}
          {...props}
        />
        <div 
          onClick={() => !disabled && !loading && onChange(!checked)}
          className={`
            w-11 h-6 rounded-full transition-all duration-300 cursor-pointer outline-none ring-primary-navy ring-offset-2 focus-within:ring-2
            ${checked ? 'bg-primary-navy' : 'bg-slate-200'}
            ${loading ? 'cursor-wait' : ''}
          `}
        >
          <div className={`
            absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}>
            {loading && <Loader2 className="w-2.5 h-2.5 animate-spin text-primary-navy" />}
          </div>
        </div>
      </div>
      
      {(label || helperText) && (
        <div className="flex flex-col select-none cursor-pointer" onClick={() => !disabled && !loading && onChange(!checked)}>
          {label && <span className="text-sm font-bold text-slate-900">{label}</span>}
          {helperText && <span className="text-xs text-slate-500 mt-0.5">{helperText}</span>}
        </div>
      )}
    </div>
  );
});

Toggle.displayName = 'Toggle';

export default Toggle;
