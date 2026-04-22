import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  BookOpen, 
  Edit3, 
  Trash2,
  ToggleRight as ToggleIcon,
  Link as LinkIcon,
  Calendar
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// UI Components
import AdminDataTable from '../../components/ui/AdminDataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';
import { useToast } from '../../context/ToastContext';

export default function AdminGuideManager() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: guides = [], isLoading } = useQuery({
    queryKey: ['adminGuides'],
    queryFn: async () => (await api.get('/admin/guides')).data
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }) => api.put(`/admin/guides/${id}`, { isPublished: published }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['adminGuides'] });
      addToast({
        title: vars.published ? 'Guide Published' : 'Guide Unpublished',
        message: 'Student visibility has been updated.',
        type: 'success'
      });
    }
  });

  const tableColumns = [
    { 
      key: 'title', 
      label: 'Knowledge Guide', 
      render: (title, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-primary-navy">
            <BookOpen size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-primary-navy truncate max-w-[300px]">{title}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Last Updated: {new Date(row.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      )
    },
    { 
      key: 'isPublished', 
      label: 'Status', 
      render: (published, row) => (
        <div className="flex items-center gap-2">
          <Toggle 
            checked={published} 
            onChange={() => publishMutation.mutate({ id: row._id, published: !published })} 
          />
          <Badge variant={published ? 'open' : 'unknown'}>{published ? 'LIVE' : 'DRAFT'}</Badge>
        </div>
      )
    },
    { 
      key: 'linkedListingsCount', 
      label: 'Linked Ops', 
      render: (_, row) => (
        <div className="flex items-center gap-1 text-xs font-black text-slate-500">
           <LinkIcon size={12} className="text-slate-300" />
           {row.linkedListings?.length || 0}
        </div>
      )
    },
    { 
      key: 'prepLeadWeeks', 
      label: 'Lead Time', 
      render: (weeks) => <span className="text-xs font-black text-blue-500">{weeks || 0} weeks</span>
    }
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="px-1 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <Link to="/admin" className="text-xs font-black text-slate-400 hover:text-primary-navy transition-colors flex items-center gap-1 uppercase tracking-widest mb-2">
            <ChevronLeft size={14} /> Back to Hub
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">Authoring Studio</h1>
          <p className="text-slate-500 font-medium italic">Create preparation blueprints and strategic guides.</p>
        </div>
        
        <Button 
          variant="primary" 
          iconLeading={Plus} 
          onClick={() => navigate('/admin/guides/new')}
        >
          New Guide
        </Button>
      </header>

      <AdminDataTable 
        columns={tableColumns} 
        data={guides} 
        loading={isLoading}
        onRowClick={(row) => navigate(`/admin/guides/${row._id}`)}
        actions={[
          { 
            icon: Edit3, 
            label: 'Open Editor', 
            onClick: (row) => navigate(`/admin/guides/${row._id}`) 
          },
          { 
            icon: Trash2, 
            label: 'Delete', 
            variant: 'danger', 
            onClick: (row) => {
              if(confirm('Delete this guide? It will be removed from all linked listings.')) {
                // Delete mutation
              }
            } 
          }
        ]}
      />

      <section className="p-8 bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] flex gap-6 items-center">
        <div className="p-4 bg-white rounded-2xl text-blue-600 shadow-sm border border-blue-100">
          <Calendar size={24} />
        </div>
        <div>
          <h3 className="text-sm font-black text-primary-navy uppercase tracking-widest mb-1">Knowledge Strategy</h3>
          <p className="text-xs font-bold text-blue-900/60 leading-relaxed italic">
            Guides linked to listings appear in the student view once the "Prep Weeks" threshold is met. 
            Drafts are never visible to students even if linked to live listings.
          </p>
        </div>
      </section>
    </div>
  );
}
