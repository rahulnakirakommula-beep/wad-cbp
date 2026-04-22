import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import { 
  Save, 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  Settings,
  Link as LinkIcon,
  Search,
  X,
  History,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

// UI Components
import SplitPaneEditor from '../../components/ui/SplitPaneEditor';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Toggle from '../../components/ui/Toggle';
import Badge from '../../components/ui/Badge';
import TagPicker from '../../components/ui/TagPicker';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';

export default function AdminGuideEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const isNew = id === 'new';

  const [formData, setFormData] = useState({ title: '', content: '', isPublished: false, linkedListings: [], targetTags: [] });
  const [isDirty, setIsDirty] = useState(false);

  const { data: categories = [] } = useQuery({ queryKey: ['tags'], queryFn: async () => (await api.get('/meta/tags')).data });
  const { data: listings = [] } = useQuery({ queryKey: ['listings-compact'], queryFn: async () => (await api.get('/listings/compact')).data });

  const { data: guide, isLoading } = useQuery({
    queryKey: ['adminGuide', id],
    queryFn: async () => {
      if (isNew) return formData;
      const { data } = await api.get(`/admin/guides/${id}`);
      return data;
    },
    onSuccess: (data) => setFormData(data)
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isNew) return api.post('/admin/guides', data);
      return api.put(`/admin/guides/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGuides'] });
      addToast({ title: 'Guide Saved', message: 'Content has been synchronized.', type: 'success' });
      setIsDirty(false);
      if (isNew) navigate('/admin/guides');
    }
  });

  const updateField = (field, value) => {
    setIsDirty(true);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) return <div className="h-screen p-10 animate-pulse"><Skeleton className="h-10 w-1/3 mb-10" /><Skeleton className="h-full rounded-[2.5rem]" /></div>;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Dynamic Header */}
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/admin/guides')}
            className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-primary-navy hover:border-slate-200 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={formData.isPublished ? 'open' : 'unknown'}>{formData.isPublished ? 'LIVE' : 'DRAFT'}</Badge>
              {isDirty && <Badge variant="high">Unsaved</Badge>}
            </div>
            <input 
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Guide Title..."
              className="text-2xl font-black text-primary-navy bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-200 w-[400px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Publicity</span>
            <Toggle 
              checked={formData.isPublished} 
              onChange={() => updateField('isPublished', !formData.isPublished)} 
            />
          </div>
          <Button 
            variant="primary" 
            iconLeading={Save} 
            onClick={() => mutation.mutate(formData)}
            disabled={!isDirty || !formData.title}
            loading={mutation.isPending}
          >
            Sync Knowledge
          </Button>
        </div>
      </header>

      {/* Main Authoring Area */}
      <div className="flex-1 min-h-0">
        <SplitPaneEditor 
          value={formData.content} 
          onChange={(val) => updateField('content', val)} 
          placeholder="# Blueprint for Success\n\nStart by outlining the key steps..."
        />
      </div>

      {/* Metadata & Linking (Bottom Bar) */}
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <LinkIcon size={14} className="text-blue-500" />
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Linked Opportunities</h3>
           </div>
           <TagPicker 
             options={listings.map(l => l.title)} 
             selected={formData.linkedListings || []} 
             onChange={(v) => updateField('linkedListings', v)}
             placeholder="Search listings to link..."
           />
        </div>
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <Settings size={14} className="text-amber-500" />
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Taxonomy Tags</h3>
           </div>
           <TagPicker 
             options={categories} 
             selected={formData.targetTags || []} 
             onChange={(v) => updateField('targetTags', v)}
             placeholder="Search tags..."
           />
        </div>
      </div>
    </div>
  );
}
