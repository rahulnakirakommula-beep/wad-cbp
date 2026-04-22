import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AppShell is the root wrapper as specified in Section 2.1.
 * It manages global keyboard shortcuts and shell-level layout decisions.
 */
export default function AppShell({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // Escape for closing modals/drawers
      if (e.key === 'Escape') {
        // This will be handled by the Modal component or global state
        // For now we just log it as a hook
        console.debug('[AppShell] Global Escape detected');
      }

      // '?' for keyboard help
      if (e.key === '?' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        console.debug('[AppShell] Opening focus help modal');
        // TODO: Implement shortcuts help modal
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  // Check if we are in app, admin or public routes
  const isAdmin = location.pathname.startsWith('/admin');
  const isApp = location.pathname.startsWith('/app');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* 
        This is where we could conditionally render the top-level 
        Navbar or Sidebar if needed globally.
      */}
      <main className="relative">{children}</main>
    </div>
  );
}
