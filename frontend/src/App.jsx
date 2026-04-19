import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import FeedPage from './pages/FeedPage'
import ExplorePage from './pages/ExplorePage'
import CalendarPage from './pages/CalendarPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminListingTable from './pages/admin/AdminListingTable'
import AdminSourceManager from './pages/admin/AdminSourceManager'

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
  return (
    <div className="min-h-screen font-['Inter']">
      <Routes>
        <Route path="/" element={
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
        } />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route path="/onboarding" element={
          <ProtectedRoute requireOnboarding={false}>
            <OnboardingPage />
          </ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/app/feed" element={
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        } />
        
        <Route path="/app/explore" element={
          <ProtectedRoute>
            <ExplorePage />
          </ProtectedRoute>
        } />
        <Route path="/app/calendar" element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/listings" element={
          <AdminRoute>
            <AdminListingTable />
          </AdminRoute>
        } />
        <Route path="/admin/sources" element={
          <AdminRoute>
            <AdminSourceManager />
          </AdminRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
