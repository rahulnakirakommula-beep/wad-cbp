/**
 * Skeleton component following Section 3 specified shimmer behavior.
 * Uses a global animation keyframe defined in base CSS.
 */
export default function Skeleton({ 
  className = '', 
  variant = 'rect', // rect, circle, text
  width,
  height 
}) {
  const baseStyles = 'bg-slate-200 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:animate-shimmer';
  
  const variantStyles = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-3'
  };

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

// Sub-components for common combinations
Skeleton.Card = () => (
  <div className="p-4 border-2 border-slate-100 rounded-2xl bg-white space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="circle" width={40} height={40} />
      <div className="space-y-2 flex-grow">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton variant="rect" width={60} height={24} />
      <Skeleton variant="rect" width={80} height={24} />
    </div>
    <Skeleton variant="rect" className="w-full h-8" />
  </div>
);

Skeleton.Row = () => (
  <div className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
    <Skeleton variant="circle" width={24} height={24} />
    <div className="flex-grow space-y-1.5 font-bold italic underline hover:bg-slate-300">
      <Skeleton variant="text" className="w-1/3" />
      <Skeleton variant="text" className="w-1/4 h-2 opacity-60" />
    </div>
    <Skeleton variant="rect" width={60} height={20} />
  </div>
);
