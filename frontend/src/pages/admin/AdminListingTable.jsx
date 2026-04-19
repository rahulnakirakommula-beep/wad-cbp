import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { Loader2, RefreshCw, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function AdminListingTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fetch Admin Listings
  const { data, isLoading } = useQuery({
    queryKey: ['adminListings', page],
    queryFn: async () => {
      const { data } = await api.get(`/admin/listings?page=${page}`);
      return data;
    }
  });

  // Cycle Reset Mutation
  const cycleResetMutation = useMutation({
    mutationFn: async (id) => {
      return api.post(`/admin/listings/${id}/cycle-reset`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminListings'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-primary-navy animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <Link to="/admin" className="text-sm font-bold text-accent-amber hover:underline flex items-center gap-2 mb-4">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-primary-navy tracking-tight">Listings Manager</h1>
          </div>
          <button className="px-6 py-3 bg-primary-navy text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-blue-900/10">
            Create Manual Listing
          </button>
        </header>

        <div className="bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b-2 border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Title & Org</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Deadline</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Curated</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {data?.listings?.map(listing => (
                <tr key={listing._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-primary-navy leading-none mb-1">{listing.title}</p>
                    <p className="text-xs text-slate-400 font-bold">{listing.orgName}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusColor(listing.status)}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-600">
                      {listing.timeline?.deadline ? new Date(listing.timeline.deadline).toLocaleDateString() : 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    {listing.isCurated ? (
                      <span className="text-green-500 font-black">✓</span>
                    ) : (
                      <span className="text-slate-300 font-black">×</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                       <button className="p-2 text-slate-400 hover:text-primary-navy transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => cycleResetMutation.mutate(listing._id)}
                        className="p-2 text-slate-400 hover:text-accent-amber transition-colors"
                        title="Reset Cycle (Upcoming)"
                      >
                        <RefreshCw size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-6 bg-slate-50 border-t-2 border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">Page {data?.currentPage} of {data?.totalPages}</p>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border-2 border-slate-200 rounded-xl font-bold disabled:opacity-50"
              >
                Prev
              </button>
              <button 
                disabled={page === data?.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border-2 border-slate-200 rounded-xl font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'open': return 'bg-green-100 text-green-700';
    case 'upcoming': return 'bg-blue-100 text-blue-700';
    case 'closed': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export default AdminListingTable;
