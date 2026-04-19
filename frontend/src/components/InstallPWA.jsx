import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[200]"
        >
          <div className="bg-primary-navy text-white p-6 rounded-2xl shadow-2xl border-2 border-accent-amber relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-accent-amber/10 rounded-full blur-2xl" />
            
            <div className="relative flex items-start gap-4">
              <div className="bg-accent-amber p-3 rounded-xl text-primary-navy">
                <Download size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black tracking-tight">Access COA Faster!</h4>
                <p className="text-sm text-slate-300 font-medium mt-1">Install the app to your home screen for offline access and instant alerts.</p>
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={handleInstall}
                    className="flex-1 bg-white text-primary-navy py-2 rounded-xl font-bold text-sm hover:bg-accent-amber hover:text-primary-navy transition-all"
                  >
                    Install Now
                  </button>
                  <button 
                    onClick={() => setIsVisible(false)}
                    className="px-4 py-2 border-2 border-white/20 rounded-xl font-bold text-sm hover:bg-white/10 transition-all text-white/60"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InstallPWA;
