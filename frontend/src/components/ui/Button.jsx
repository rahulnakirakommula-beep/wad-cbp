import { forwardRef, useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';

const variants = {
  primary: 'bg-primary-navy text-white hover:bg-slate-800 active:bg-slate-900',
  secondary: 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100',
  ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 active:bg-slate-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  icon: 'p-2 bg-transparent text-slate-500 hover:bg-slate-100 active:bg-slate-200'
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  success = false,
  error = false,
  disabled = false,
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  type = 'button',
  ...props
}, ref) => {
  const [internalError, setInternalError] = useState(false);
  const [internalSuccess, setInternalSuccess] = useState(false);

  useEffect(() => {
    if (error) {
      setInternalError(true);
      const timer = setTimeout(() => setInternalError(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      setInternalSuccess(true);
      const timer = setTimeout(() => setInternalSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const isDisabled = disabled || loading || internalSuccess;

  // Base styles following Section 3.0 spec
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-navy';
  const paddingStyles = variant === 'icon' ? '' : 'px-6 py-2.5';
  const stateStyles = isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.97]';
  const animationStyles = internalError ? 'animate-shake' : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${paddingStyles}
        ${variants[variant]}
        ${stateStyles}
        ${animationStyles}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : internalSuccess ? (
        <Check className="w-5 h-5 animate-in fade-in zoom-in duration-300" />
      ) : (
        <>
          {IconLeading && <IconLeading className="w-4 h-4 flex-shrink-0" />}
          <span className="truncate">{children}</span>
          {IconTrailing && <IconTrailing className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
