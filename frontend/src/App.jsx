import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import InstallPWA from './components/InstallPWA';

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import FeedPage from './pages/FeedPage'
import ExplorePage from './pages/ExplorePage'
import CalendarPage from './pages/CalendarPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminListingTable from './pages/admin/AdminListingTable'
import AdminSourceManager from './pages/admin/AdminSourceManager'
import AdminCurationPanel from './pages/admin/AdminCurationPanel'
import AdminTagManager from './pages/admin/AdminTagManager'
import AdminGuideManager from './pages/admin/AdminGuideManager'
import AdminGuideEditor from './pages/admin/AdminGuideEditor'
import ListingDetailPage from './pages/ListingDetailPage'
import DashboardPage from './pages/DashboardPage'
import NotificationsPage from './pages/NotificationsPage'
import PrepGuidePage from './pages/PrepGuidePage'
import SettingsPage from './pages/SettingsPage'
import OrgDashboard from './pages/OrgDashboard'
import AdminUserManager from './pages/admin/AdminUserManager'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'
import VerifyEmail from './pages/VerifyEmail'

// Layouts & UI
import AppShell from './layouts/AppShell'
import RouteGuard from './layouts/RouteGuard'
import StudentLayout from './layouts/StudentLayout'
import AdminLayout from './layouts/AdminLayout'
import OrgLayout from './layouts/OrgLayout'

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.15, ease: 'easeOut' }}
    className="w-full"
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={
            <div className="max-w-7xl mx-auto px-4 py-16">
              <PageTransition>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <div className="badge mb-6 px-4 py-1.5 bg-accent-amber/10 border-2 border-accent-amber text-accent-amber rounded-full text-xs font-black uppercase tracking-widest">
                    v1.0 Now Live
                  </div>
                  <h1 className="text-5xl sm:text-7xl font-black text-primary-navy tracking-tight leading-none mb-6">
                    Campus Opportunity <span className="text-accent-amber">Aggregator</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                    Personalized internships, hackathons, and research gigs curated for the modern student explorer.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/login" className="px-10 py-4 font-black text-white bg-primary-navy rounded-2xl shadow-[6px_6px_0px_0px_rgba(230,168,23,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95">
                      Get Started
                    </Link>
                    <Link to="/signup" className="px-10 py-4 font-black text-primary-navy bg-white border-2 border-primary-navy rounded-2xl hover:bg-slate-50 transition-all">
                      Create Account
                    </Link>
                  </div>
                </div>
              </PageTransition>
            </div>
          } />
          
          <Route path="/login" element={<div className="max-w-7xl mx-auto px-4 py-16"><PageTransition><LoginPage /></PageTransition></div>} />
          <Route path="/signup" element={<div className="max-w-7xl mx-auto px-4 py-16"><PageTransition><SignupPage /></PageTransition></div>} />
          <Route path="/verify-email" element={<div className="max-w-7xl mx-auto px-4 py-16"><PageTransition><VerifyEmail /></PageTransition></div>} />
          
          {/* Onboarding */}
          <Route path="/onboarding" element={
            <RouteGuard allowUnonboarded={true}>
              <div className="max-w-7xl mx-auto px-4 py-16"><PageTransition><OnboardingPage /></PageTransition></div>
            </RouteGuard>
          } />
          
          {/* Student Experience */}
          <Route path="/app/*" element={
            <RouteGuard>
              <StudentLayout>
                <Routes>
                  <Route path="feed" element={<PageTransition><FeedPage /></PageTransition>} />
                  <Route path="dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
                  <Route path="explore" element={<PageTransition><ExplorePage /></PageTransition>} />
                  <Route path="listing/:id" element={<PageTransition><ListingDetailPage /></PageTransition>} />
                  <Route path="calendar" element={<PageTransition><CalendarPage /></PageTransition>} />
                  <Route path="notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />
                  <Route path="guide/:id" element={<PageTransition><PrepGuidePage /></PageTransition>} />
                  <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
                </Routes>
              </StudentLayout>
            </RouteGuard>
          } />
          
          {/* Organisation Experience */}
          <Route path="/org/*" element={
            <RouteGuard requiredRole="source">
              <OrgLayout>
                <Routes>
                  <Route index element={<PageTransition><OrgDashboard /></PageTransition>} />
                </Routes>
              </OrgLayout>
            </RouteGuard>
          } />
          
          {/* Admin Experience */}
          <Route path="/admin/*" element={
            <RouteGuard requiredRole="admin">
              <AdminLayout>
                <Routes>
                  <Route index element={<PageTransition><AdminDashboard /></PageTransition>} />
                  <Route path="listings" element={<PageTransition><AdminListingTable /></PageTransition>} />
                  <Route path="queue" element={<PageTransition><AdminListingTable /></PageTransition>} />
                  <Route path="stale" element={<PageTransition><AdminListingTable /></PageTransition>} />
                  <Route path="listings/new" element={<PageTransition><AdminCurationPanel /></PageTransition>} />
                  <Route path="listings/:id" element={<PageTransition><AdminCurationPanel /></PageTransition>} />
                  <Route path="sources" element={<PageTransition><AdminSourceManager /></PageTransition>} />
                  <Route path="tags" element={<PageTransition><AdminTagManager /></PageTransition>} />
                  <Route path="guides" element={<PageTransition><AdminGuideManager /></PageTransition>} />
                  <Route path="guides/:id" element={<PageTransition><AdminGuideEditor /></PageTransition>} />
                  <Route path="users" element={<PageTransition><AdminUserManager /></PageTransition>} />
                  <Route path="audit" element={<PageTransition><AdminAuditLogs /></PageTransition>} />
                </Routes>
              </AdminLayout>
            </RouteGuard>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <InstallPWA />
    </AppShell>
  )
}

export default App
