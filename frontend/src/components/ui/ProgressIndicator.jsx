import { Check } from 'lucide-react';

export default function ProgressIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between w-full mb-12 px-2">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative">
              <div
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-black transition-all duration-300
                  ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : isActive ? 'border-primary-navy text-primary-navy ring-4 ring-primary-navy/10' : 'border-slate-200 text-slate-300'}
                `}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : stepNumber}
              </div>
              <span className={`absolute -bottom-7 whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary-navy' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-slate-100 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-emerald-500 transition-transform duration-500 origin-left"
                  style={{ transform: `scaleX(${isCompleted ? 1 : 0})` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
