import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../context/AuthContext'
import { PlusCircle, BookmarkCheck, XCircle, Sparkles, Clock, Flame, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// UI Components
import FeedSection from '../components/FeedSection'
import ListingCard from '../components/ui/ListingCard'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import { useToast } from '../context/ToastContext'

export default function FeedPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { addToast } = useToast()

  // Fetch Feed Data
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data } = await api.get('/feed/sections')
      return data
    }
  })

  // Fetch Summary Metrics
  const { data: summary } = useQuery({
    queryKey: ['activitySummary'],
    queryFn: async () => {
      const { data } = await api.get('/activity/summary')
      return data
    }
  })

  // Mutations
  const interactionMutation = useMutation({
    mutationFn: async ({ listingId, status }) => {
      return api.post('/activity', { listingId, status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['activitySummary'] })
    }
  })

  const handleSave = (listingId) => interactionMutation.mutate({ listingId, status: 'saved' })
  const handleIgnore = (listingId) => interactionMutation.mutate({ listingId, status: 'ignored' })
  const handleNavigate = (id) => navigate(`/app/listing/${id}`)

  if (isLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="space-y-4">
          <Skeleton variant="text" className="w-1/4 h-8" />
          <Skeleton variant="text" className="w-1/3" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton.Card key={i} />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        title="Offline or Unavailable"
        message="We couldn't reach the server. Please check your connection."
        actionLabel="Try Again"
        onAction={refetch}
      />
    )
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">Your Feed</h1>
          <p className="text-slate-500 font-medium italic">Hand-picked opportunities for your next big jump.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => refetch()} 
            iconLeading={RefreshCw}
          >
            Refresh
          </Button>
        </div>
      </header>

      {/* Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard 
          label="Interests Saved" 
          value={summary?.saved || 0} 
          icon={PlusCircle} 
          color="text-blue-500" 
          bg="bg-blue-50"
        />
        <MetricCard 
          label="Applied Tasks" 
          value={summary?.applied || 0} 
          icon={BookmarkCheck} 
          color="text-emerald-500" 
          bg="bg-emerald-50"
        />
        <MetricCard 
          label="Cycles Missed" 
          value={summary?.missed || 0} 
          icon={XCircle} 
          color="text-red-400" 
          bg="bg-red-50"
        />
      </div>

      {/* Recommended Section */}
      <FeedSection 
        title="Recommended For You" 
        subtitle="Based on academic branch and interests" 
        icon={Sparkles}
        viewAllPath="/app/explore"
      >
        {data?.recommended?.length > 0 ? (
          data.recommended.map(listing => (
            <ListingCard 
              key={listing._id || listing.id} 
              listing={listing} 
              onSave={handleSave} 
              onIgnore={handleIgnore}
              onNavigate={handleNavigate}
            />
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState 
              title="Tailor your feed"
              message="Set your interests to get personalized recommendations."
              actionLabel="Update Interests"
              onAction={() => addToast({ title: 'Navigation', message: 'Redirecting to settings...', type: 'info' })}
            />
          </div>
        )}
      </FeedSection>

      {/* Closing Soon Section */}
      {data?.closingSoon?.length > 0 && (
        <FeedSection 
          title="Closing Soon" 
          subtitle="Opportunities ending in within 7 days" 
          icon={Clock}
        >
          {data.closingSoon.map(listing => (
            <ListingCard 
              key={listing._id || listing.id} 
              listing={listing} 
              onSave={handleSave} 
              onIgnore={handleIgnore}
              onNavigate={handleNavigate}
            />
          ))}
        </FeedSection>
      )}

      {/* Don't Miss Section */}
      {data?.dontMiss?.length > 0 && (
        <FeedSection 
          title="Don't Miss" 
          subtitle="High-impact opportunities with verified quality" 
          icon={Flame}
        >
          {data.dontMiss.map(listing => (
            <ListingCard 
              key={listing._id || listing.id} 
              listing={listing} 
              onSave={handleSave} 
              onIgnore={handleIgnore}
              onNavigate={handleNavigate}
            />
          ))}
        </FeedSection>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 flex items-center gap-5 group transition-all hover:bg-slate-50">
      <div className={`p-3 ${bg} rounded-xl group-hover:scale-110 transition-transform`}>
        <Icon className={color} size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-primary-navy leading-none tracking-tighter">{value}</p>
      </div>
    </div>
  )
}
