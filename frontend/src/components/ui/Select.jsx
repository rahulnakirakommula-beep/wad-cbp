import { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, Search, Check, X, Loader2 } from 'lucide-react';

const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  multiple = false,
  searchable = false,
  error,
  placeholder = 'Select option',
  disabled = false,
  loading = false,
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = multiple 
    ? options.filter(opt => value?.includes(opt.value))
    : options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    if (multiple) {
      const newValue = value?.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...(value || []), optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const isSelected = (optionValue) => {
    if (multiple) return value?.includes(optionValue);
    return value === optionValue;
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className={`
          absolute left-4 -top-2.5 px-1 bg-white text-xs font-bold transition-colors z-10
          ${error ? 'text-red-500' : isOpen ? 'text-primary-navy' : 'text-slate-500'}
        `}>
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        className={`
          relative w-full h-12 flex items-center justify-between px-4 bg-white border-2 rounded-xl cursor-pointer transition-all duration-200
          ${error ? 'border-red-500' : isOpen ? 'border-primary-navy shadow-sm' : 'border-slate-200 hover:border-slate-300'}
          ${disabled ? 'bg-slate-50 opacity-40 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          {multiple && selectedOptions.length > 0 ? (
            <div className="flex gap-1 overflow-hidden">
              {selectedOptions.length <= 2 ? (
                selectedOptions.map(opt => (
                  <span key={opt.value} className="text-sm border bg-slate-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                    {opt.label}
                  </span>
                ))
              ) : (
                <span className="text-sm font-bold text-primary-navy bg-slate-50 px-2 py-0.5 rounded-lg">
                  {selectedOptions.length} selected
                </span>
              )}
            </div>
          ) : !multiple && selectedOptions ? (
            <span className="text-sm text-slate-900 truncate">{selectedOptions.label}</span>
          ) : (
            <span className="text-sm text-slate-400">{placeholder}</span>
          )}
        </div>

        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        ) : (
          <ChevronDown 
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1 px-1 font-medium">{error}</p>}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border-2 border-slate-100 shadow-2xl rounded-xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {searchable && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search options..."
                  className="w-full h-10 pl-9 pr-4 bg-slate-50 text-sm rounded-lg border-none focus:ring-2 focus:ring-primary-navy"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {multiple && (
            <div className="p-2 border-b border-slate-50 flex justify-between bg-slate-50/50">
              <button 
                type="button" 
                onClick={() => onChange(options.map(o => o.value))}
                className="text-xs font-bold text-primary-navy hover:underline"
              >
                Select All
              </button>
              <button 
                type="button" 
                onClick={() => onChange([])}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          <div className="max-h-[240px] overflow-y-auto overflow-x-hidden p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center">
                <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">No results found</p>
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors
                    ${isSelected(opt.value) ? 'bg-primary-navy text-white' : 'text-slate-700 hover:bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {multiple && (
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${isSelected(opt.value) ? 'bg-white border-white' : 'border-slate-300'}`}>
                        {isSelected(opt.value) && <Check size={12} className="text-primary-navy" />}
                      </div>
                    )}
                    <span>{opt.label}</span>
                  </div>
                  {!multiple && isSelected(opt.value) && <Check size={16} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
