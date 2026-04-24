import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search, X, Calendar, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  success,
  loading,
  helperText,
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  className = '',
  required,
  maxLength,
  value,
  onChange,
  onClear,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const isSearch = type === 'search';
  const isDate = type === 'date';
  const isTextArea = type === 'textarea';
  
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const hasValue = value && value.length > 0;
  const shouldFloat = isFocused || hasValue || props.placeholder || isDate;

  const baseContainerStyles = 'relative w-full group';
  const labelStyles = `
    absolute transition-all duration-200 pointer-events-none select-none z-10
    ${shouldFloat ? '-top-2.5 left-3 text-xs font-bold px-1.5 bg-white' : `top-3.5 ${(IconLeading || isSearch) ? 'left-11' : 'left-4'} text-sm text-slate-400`}
    ${error ? 'text-red-500' : isFocused ? 'text-primary-navy' : 'text-slate-500'}
  `;

  const inputStyles = `
    w-full bg-white text-sm text-slate-900 rounded-xl border-2 transition-all duration-200 outline-none
    ${isTextArea ? 'py-4 min-h-[80px] resize-y' : 'h-12'}
    ${IconLeading ? 'pl-11' : 'pl-4'}
    ${(IconTrailing || isPassword || isSearch || isDate || error || success || loading) ? 'pr-11' : 'pr-4'}
    ${error ? 'border-red-500 focus:border-red-600' : isFocused ? 'border-primary-navy' : 'border-slate-200 hover:border-slate-300'}
    ${props.disabled ? 'bg-slate-50 opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  const renderTrailingIcon = () => {
    if (loading) return <Loader2 className="w-5 h-5 animate-spin text-slate-400" />;
    if (error) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (success) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    
    if (isPassword) {
      return (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      );
    }

    if (isSearch && hasValue) {
      return (
        <button
          type="button"
          onClick={onClear}
          className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
        >
          <X size={18} />
        </button>
      );
    }

    if (isDate) return <Calendar size={18} className="text-slate-400" />;
    
    if (IconTrailing) {
      const Trailing = IconTrailing;
      return <Trailing size={18} className="text-slate-400" />;
    }

    return null;
  };

  const Component = isTextArea ? 'textarea' : 'input';

  return (
    <div className={baseContainerStyles}>
      <div className="relative">
        {label && (
          <label className={labelStyles}>
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        {IconLeading && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-navy transition-colors">
            <IconLeading size={18} />
          </div>
        )}

        {isSearch && !IconLeading && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-navy transition-colors">
            <Search size={18} />
          </div>
        )}

        <Component
          ref={ref}
          type={actualType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={inputStyles}
          {...props}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {renderTrailingIcon()}
        </div>
      </div>

      <div className="flex justify-between mt-1 px-1">
        {error ? (
          <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">
            {helperText}
          </p>
        ) : <div />}

        {maxLength && (
          <p className="text-xs text-slate-400">
            {value?.length || 0} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
