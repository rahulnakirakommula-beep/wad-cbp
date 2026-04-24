import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 min-h-screen overflow-x-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b-2 border-slate-100 sticky top-0 z-40">
          <span className="text-xl font-black text-primary-navy tracking-tighter">
            COA<span className="text-accent-amber">.</span>ADMIN
          </span>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-slate-50 rounded-xl text-primary-navy"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
