import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  ChevronLeft,
  ShieldCheck,
  Zap,
  MoreVertical,
  Check
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// UI Components
import AdminDataTable from '../../components/ui/AdminDataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

export default function AdminListingTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);

  // Fetch Admin Listings with filters
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['adminListings', selectedStatus, search],
    queryFn: async () => {
      const { data } = await api.get(`/admin/listings?status=${selectedStatus === 'all' ? '' : selectedStatus}&q=${search}`);
      return data;
    }
  });

  const cycleResetMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/listings/${id}/cycle-reset`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminListings'] });
      addToast({
        title: 'Cycle Reset',
        message: 'Listing set back to Upcoming status.',
        type: 'info'
      });
    }
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/listings/${id}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminListings'] });
      addToast({
        title: 'Verified',
        message: 'Listing staleness reset and lastVerifiedAt updated.',
        type: 'success'
      });
    }
  });

  const tableColumns = [
    { 
      key: 'title', 
      label: 'Listing', 
      sortable: true,
      render: (title, row) => (
        <div className="flex flex-col">
          <span className="truncate max-w-[240px] group-hover:text-blue-600 transition-colors" title={title}>{title}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.orgName}</span>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (s) => <Badge variant={s}>{s}</Badge>
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      render: (p) => <Badge variant={p || 'normal'}>{p || 'Normal'}</Badge>
    },
    { 
      key: 'isCurated', 
      label: 'Curated', 
      render: (c) => c ? <ShieldCheck size={16} className="text-emerald-500" /> : <span className="text-slate-200">—</span>
    },
    { 
      key: 'deadline', 
      label: 'Deadline', 
      render: (_, row) => {
        const d = row.timeline?.deadline;
        if (!d) return <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic">N/A</span>;
        const isUrgent = new Date(d) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return <span className={`text-xs font-black p-1 rounded ${isUrgent ? 'bg-red-50 text-red-500' : 'text-slate-600'}`}>{new Date(d).toLocaleDateString()}</span>;
      }
    },
    {
      key: 'engagement',
      label: 'Saves / Apps',
      render: (_, row) => (
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {row.metrics?.saves || 0} / {row.metrics?.apps || 0}
        </span>
      )
    }
  ];

  const statuses = ['all', 'upcoming', 'open', 'closed', 'cancelled'];

  return (
    <div className="space-y-10 pb-20">
      <header className="px-1 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <Link to="/admin" className="text-xs font-black text-slate-400 hover:text-primary-navy transition-colors flex items-center gap-1 uppercase tracking-widest mb-2">
            <ChevronLeft size={14} /> Back to Hub
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">Listing Manager</h1>
          <p className="text-slate-500 font-medium italic">Full-cycle curation and operational auditing.</p>
        </div>
        
        <Button 
          variant="primary" 
          iconLeading={Plus} 
          onClick={() => navigate('/admin/listings/new')}
        >
          New Listing
        </Button>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-4 rounded-[2rem] border-2 border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex-1 w-full relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search listings or organizations..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-primary-navy focus:bg-white focus:ring-2 focus:ring-primary-navy transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto items-center no-scrollbar">
          <Filter size={16} className="text-slate-300 mr-2 hidden lg:block" />
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`
                px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                ${selectedStatus === s ? 'bg-primary-navy text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-primary-navy'}
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-primary-navy text-white rounded-3xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4 pl-4">
              <span className="text-xs font-black uppercase tracking-widest">{selectedRows.length} Rows Selected</span>
              <div className="h-4 w-px bg-white/20" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="accent" className="!bg-white !text-primary-navy shadow-none">Mark Verified</Button>
              <Button size="sm" variant="danger" className="border-white/20 hover:bg-white/10 transition-colors">Archive</Button>
              <button 
                onClick={() => setSelectedRows([])}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <AdminDataTable 
          columns={tableColumns} 
          data={listings} 
          loading={isLoading}
          selectedRows={selectedRows}
          onSelectRows={setSelectedRows}
          onRowClick={(row) => navigate(`/admin/listings/${row.id || row._id}`)}
          actions={[
            { icon: ShieldCheck, label: 'Quick Verify', onClick: (row) => verifyMutation.mutate(row.id || row._id) },
            { icon: RotateCcw, label: 'Cycle Reset', onClick: (row) => cycleResetMutation.mutate(row.id || row._id) },
            { icon: Edit3, label: 'Edit', onClick: (row) => navigate(`/admin/listings/${row.id || row._id}`) },
            { icon: Trash2, label: 'Delete', variant: 'danger', onClick: (row) => console.log('Delete', row.id) }
          ]}
        />
      </div>
    </div>
  );
}
