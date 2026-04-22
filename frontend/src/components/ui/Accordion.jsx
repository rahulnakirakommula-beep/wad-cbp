import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Accordion({ title, children, defaultOpen = false, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`
      border-2 rounded-[2rem] transition-all duration-300 overflow-hidden bg-white
      ${isOpen ? 'border-primary-navy shadow-lg' : 'border-slate-100 hover:border-slate-200'}
    `}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 sm:p-8 text-left"
      >
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`p-3 rounded-2xl transition-colors ${isOpen ? 'bg-primary-navy text-white' : 'bg-slate-50 text-slate-400'}`}>
              <Icon size={20} />
            </div>
          )}
          <div>
            <h3 className={`text-lg font-black tracking-tight ${isOpen ? 'text-primary-navy' : 'text-slate-500'}`}>
              {title}
            </h3>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-navy' : 'text-slate-300'}`}>
          <ChevronDown size={24} />
        </div>
      </button>

      <div className={`
        transition-all duration-300 ease-in-out
        ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-8 pb-8 sm:px-10 sm:pb-10 border-t border-slate-50 pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
