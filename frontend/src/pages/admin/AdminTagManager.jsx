import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Tag as TagIcon,
  Search,
  Filter,
  RefreshCw,
  X,
  MoveHorizontal
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// UI Components
import AdminDataTable from '../../components/ui/AdminDataTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';

export default function AdminTagManager() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [newTag, setNewTag] = useState({ displayName: '', slug: '', category: 'technical' });

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['adminTags'],
    queryFn: async () => (await api.get('/admin/tags')).data
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/tags', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTags'] });
      addToast({ title: 'Tag Created', body: 'New domain tag added and ready for classification.', type: 'success' });
      setShowCreate(false);
      setNewTag({ displayName: '', slug: '', category: 'technical' });
    },
    onError: (error) => {
      addToast({
        title: 'Creation failed',
        body: error.response?.data?.message || 'We could not create the tag.',
        type: 'error'
      });
    }
  });

  const retireMutation = useMutation({
    mutationFn: ({ id, replacementId }) => api.post(`/admin/tags/${id}/retire`, { replacementId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTags'] });
      addToast({ title: 'Tag Retired', body: 'References migrated and tag deactivated.', type: 'info' });
    },
    onError: (error) => {
      addToast({
        title: 'Retirement failed',
        body: error.response?.data?.message || 'We could not retire the tag.',
        type: 'error'
      });
    }
  });

  const handleDisplayNameChange = (val) => {
    const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setNewTag({ ...newTag, displayName: val, slug });
  };

  const tableColumns = [
    { 
      key: 'displayName', 
      label: 'Tag Name', 
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
            <TagIcon size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-primary-navy leading-none mb-1">{name}</span>
            <code className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{row.slug}</code>
          </div>
        </div>
      )
    },
    { 
      key: 'category', 
      label: 'Category', 
      render: (cat) => <Badge variant="role">{cat}</Badge>
    },
    { 
      key: 'listingCount', 
      label: 'Listings', 
      render: (c) => <span className="text-xs font-black text-slate-500">{c || 0}</span>
    },
    { 
      key: 'interestCount', 
      label: 'Student Interests', 
      render: (c) => <span className="text-xs font-black text-blue-500">{c || 0}</span>
    },
    { 
      key: 'isActive', 
      label: 'Status', 
      render: (active) => <Badge variant={active ? 'curated' : 'unknown'}>{active ? 'Active' : 'Retired'}</Badge>
    }
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="px-1 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <Link to="/admin" className="text-xs font-black text-slate-400 hover:text-primary-navy transition-colors flex items-center gap-1 uppercase tracking-widest mb-2">
            <ChevronLeft size={14} /> Back to Hub
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy tracking-tight">Domain Taxonomy</h1>
          <p className="text-slate-500 font-medium italic">Manage interest tags and classification logic.</p>
        </div>
        
        <Button 
          variant="primary" 
          iconLeading={Plus} 
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? 'Close Form' : 'Create Tag'}
        </Button>
      </header>

      {showCreate && (
        <div className="p-8 bg-white border-2 border-primary-navy rounded-[2.5rem] shadow-xl animate-in slide-in-from-top-4 duration-500">
          <h3 className="text-xl font-black text-primary-navy mb-8">New Domain Tag</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <Input 
              label="Display Name" 
              value={newTag.displayName} 
              onChange={(e) => handleDisplayNameChange(e.target.value)} 
              placeholder="e.g. Full Stack Development"
            />
            <Input 
              label="Slug (Auto)" 
              value={newTag.slug} 
              onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })} 
              placeholder="full-stack-development"
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <Select 
                  label="Category" 
                  value={newTag.category} 
                  options={['technical', 'role', 'domain', 'industry']} 
                  onChange={(v) => setNewTag({ ...newTag, category: v })} 
                />
              </div>
              <Button 
                variant="primary" 
                className="h-[52px]" 
                onClick={() => createMutation.mutate(newTag)}
                disabled={!newTag.displayName || !newTag.slug}
                loading={createMutation.isPending}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
         <AdminDataTable 
            columns={tableColumns} 
            data={tags} 
            loading={isLoading}
            actions={[
              { 
                icon: MoveHorizontal, 
                label: 'Retire & Map', 
                onClick: (row) => {
                  const target = prompt('Enter replacement tag ID (optional):');
                  retireMutation.mutate({ id: row._id, replacementId: target || undefined });
                } 
              },
              { 
                icon: Trash2, 
                label: 'Delete (Hard)', 
                variant: 'danger', 
                onClick: (row) => {
                   if(confirm('Hard delete this tag? This may break historical analytics.')) {
                     // Delete mutation
                   }
                } 
              }
            ]}
          />
      </div>

      <section className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem]">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm border border-slate-100">
            <RefreshCw size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-primary-navy uppercase tracking-widest mb-2">Automated Mapping</h3>
            <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
              When a tag is retired with a replacement, the system will automatically update all existing student interests 
              and listing classifications to the new tag. This process is irreversible and ensures feed consistency.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
