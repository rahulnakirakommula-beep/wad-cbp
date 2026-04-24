import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShortcutsHelpModal from '../components/ShortcutsHelpModal';

/**
 * AppShell is the root wrapper as specified in Section 2.1.
 * It manages global keyboard shortcuts and shell-level layout decisions.
 */
export default function AppShell({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // Ignore shortcuts if user is typing in form fields
      const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
      
      // Escape for closing modals/drawers
      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
        }
      }

      if (isTyping) return;

      // '?' for keyboard help
      if (e.key === '?') {
        setIsShortcutsModalOpen(true);
      }

      // '/' for search focus
      if (e.key === '/') {
        e.preventDefault();
        // Look for the first visible search input or text input
        const searchInput = document.querySelector('input[type="text"], input[type="search"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [isShortcutsModalOpen]);

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 font-sans selection:bg-amber-100 selection:text-amber-900">
      <main className="relative">{children}</main>
      
      <ShortcutsHelpModal 
        isOpen={isShortcutsModalOpen} 
        onClose={() => setIsShortcutsModalOpen(false)} 
      />
    </div>
  );
}
