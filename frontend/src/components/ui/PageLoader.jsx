import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  const [show, setShow] = useState(false);

  // Prevent flash on fast connections by delaying the loader appearance
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
      <Loader2 className="w-10 h-10 animate-spin text-primary-navy" />
      <span className="mt-4 text-sm font-medium text-slate-500 uppercase tracking-widest">Loading</span>
    </div>
  );
}
