import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar';
import InstallPWA from './components/InstallPWA';
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import FeedPage from './pages/FeedPage'
import ExplorePage from './pages/ExplorePage'
import CalendarPage from './pages/CalendarPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminListingTable from './pages/admin/AdminListingTable'
import AdminSourceManager from './pages/admin/AdminSourceManager'

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  if (requireOnboarding && !user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/app/feed" replace />;
  }
  
  return children;
};

function App() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {user && user.onboardingComplete && <Navbar />}
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageTransition>
                <div className="p-10 text-center">
                  <h1 className="text-4xl font-black text-primary-navy tracking-tight">COA<span className="text-accent-amber">.</span></h1>
                  <p className="mt-4 text-slate-600 font-medium max-w-md mx-auto">
                    The Campus Opportunity Aggregator. Discover internships, hackathons, and research gigs curated for you.
                  </p>
                  <div className="mt-8 space-x-4">
                    <Link to="/login" className="inline-block px-8 py-3 font-bold text-white bg-primary-navy rounded-xl shadow-[4px_4px_0px_0px_rgba(230,168,23,1)] hover:translate-y-px transition-all">
                      Login
                    </Link>
                    <Link to="/signup" className="inline-block px-8 py-3 font-bold text-primary-navy bg-white border-2 border-primary-navy rounded-xl hover:bg-slate-50 transition-all">
                      Sign Up
                    </Link>
                  </div>
                </div>
              </PageTransition>
            } />
            
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
            
            <Route path="/onboarding" element={
              <ProtectedRoute requireOnboarding={false}>
                <PageTransition><OnboardingPage /></PageTransition>
              </ProtectedRoute>
            } />
            
            {/* Student Routes */}
            <Route path="/app/feed" element={
              <ProtectedRoute>
                <PageTransition><FeedPage /></PageTransition>
              </ProtectedRoute>
            } />
            
            <Route path="/app/explore" element={
              <ProtectedRoute>
                <PageTransition><ExplorePage /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/app/calendar" element={
              <ProtectedRoute>
                <PageTransition><CalendarPage /></PageTransition>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <PageTransition><AdminDashboard /></PageTransition>
              </AdminRoute>
            } />
            <Route path="/admin/listings" element={
              <AdminRoute>
                <PageTransition><AdminListingTable /></PageTransition>
              </AdminRoute>
            } />
            <Route path="/admin/sources" element={
              <AdminRoute>
                <PageTransition><AdminSourceManager /></PageTransition>
              </AdminRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <InstallPWA />
    </div>
  )
}

export default App
