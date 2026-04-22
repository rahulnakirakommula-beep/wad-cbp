import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../context/AuthContext';
import { 
  Save, 
  ChevronLeft, 
  RotateCcw, 
  ExternalLink, 
  FileText, 
  Users, 
  Tags, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  History,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2
} from 'lucide-react';

// UI Components
import Accordion from '../../components/ui/Accordion';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TagPicker from '../../components/ui/TagPicker';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';

export default function AdminCurationPanel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const isNew = id === 'new';

  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Fetch Data
  const { data: listing, isLoading } = useQuery({
    queryKey: ['adminListing', id],
    queryFn: async () => {
      if (isNew) return { title: '', status: 'upcoming', type: 'internship', timeline: {} };
      const { data } = await api.get(`/admin/listings/${id}`);
      return data;
    },
    onSuccess: (data) => setFormData(data)
  });

  // Fetch Tags and Branches for dropdowns
  const { data: branches = [] } = useQuery({ queryKey: ['branches'], queryFn: async () => (await api.get('/meta/branches')).data });
  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: async () => (await api.get('/meta/tags')).data });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isNew) return api.post('/admin/listings', data);
      return api.put(`/admin/listings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminListings'] });
      addToast({ title: 'Saved!', message: 'Listing has been updated.', type: 'success' });
      setIsDirty(false);
      if (isNew) navigate('/admin/listings');
    }
  });

  const updateField = (path, value) => {
    setIsDirty(true);
    const newData = { ...formData };
    const keys = path.split('.');
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setFormData(newData);
  };

  if (isLoading) return <div className="space-y-10 animate-pulse"><Skeleton className="h-10 w-1/3" /><div className="grid grid-cols-3 gap-10"><div className="col-span-2 space-y-6"><Skeleton className="h-40" /><Skeleton className="h-40" /></div><Skeleton className="h-96" /></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            <span className="cursor-pointer hover:text-primary-navy" onClick={() => navigate('/admin/listings')}>Listings</span>
            <ChevronLeft size={12} className="rotate-180" />
            <span className="text-primary-navy">{isNew ? 'New' : formData.title || 'Loading...'}</span>
          </nav>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-primary-navy tracking-tight">
              {isNew ? 'New Listing' : 'Curation Panel'}
            </h1>
            {isDirty && <Badge variant="high">Unsaved Changes</Badge>}
          </div>
        </div>
        {!isNew && (
          <Button variant="secondary" iconLeading={Eye} onClick={() => navigate(`/app/listing/${id}`)}>
            View Student View
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Accordion title="Content & Branding" icon={FileText} defaultOpen={true}>
            <div className="space-y-6">
              <Input 
                label="Listing Title" 
                value={formData.title || ''} 
                onChange={(e) => updateField('title', e.target.value)} 
                placeholder="e.g. Software Engineering Intern"
              />
              <div className="grid grid-cols-2 gap-6">
                <Input label="Org Name" value={formData.orgName || ''} onChange={(e) => updateField('orgName', e.target.value)} />
                <Input label="Org Logo URL" value={formData.orgLogoUrl || ''} onChange={(e) => updateField('orgLogoUrl', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <Select 
                  label="Type" 
                  value={formData.type || ''} 
                  options={['internship', 'hackathon', 'research', 'job']} 
                  onChange={(v) => updateField('type', v)} 
                />
                <Select label="Stipend" value={formData.stipend || ''} options={['Paid', 'Unpaid', 'Performance-based']} onChange={(v) => updateField('stipend', v)} />
                <Select label="Location" value={formData.location || ''} options={['Remote', 'On-site', 'Hybrid']} onChange={(v) => updateField('location', v)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description (Markdown)</label>
                <textarea 
                  className="w-full h-64 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-medium text-slate-700 focus:bg-white focus:border-primary-navy transition-all"
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>
              <Input label="External URL" value={formData.externalUrl || ''} onChange={(e) => updateField('externalUrl', e.target.value)} />
            </div>
          </Accordion>

          <Accordion title="Target Audience" icon={Users}>
            <div className="space-y-8">
              <TagPicker 
                label="Target Branches" 
                options={branches} 
                selected={formData.targetBranches || []} 
                onChange={(v) => updateField('targetBranches', v)} 
              />
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowed Years</label>
                <div className="flex gap-4">
                  {[1,2,3,4].map(y => (
                    <button 
                      key={y}
                      onClick={() => {
                        const years = formData.targetYears || [];
                        updateField('targetYears', years.includes(y) ? years.filter(v => v !== y) : [...years, y]);
                      }}
                      className={`w-12 h-12 rounded-xl border-2 font-black transition-all ${formData.targetYears?.includes(y) ? 'bg-primary-navy text-white border-primary-navy' : 'bg-slate-50 text-slate-300 border-slate-100'}`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Accordion>

          <Accordion title="Classification Tags" icon={Tags}>
             <TagPicker 
                label="Domain Tags" 
                options={tags} 
                selected={formData.domainTags || []} 
                onChange={(v) => updateField('domainTags', v)} 
              />
          </Accordion>

          <Accordion title="Timeline & Intelligence" icon={Calendar}>
             <div className="grid grid-cols-2 gap-6">
                <Input label="Application Opens" type="date" value={formData.timeline?.openDate?.split('T')[0] || ''} onChange={(e) => updateField('timeline.openDate', e.target.value)} />
                <Input label="Application Deadline" type="date" value={formData.timeline?.deadline?.split('T')[0] || ''} onChange={(e) => updateField('timeline.deadline', e.target.value)} />
             </div>
             <div className="grid grid-cols-2 gap-6 mt-6">
                <Select label="Confidence Level" value={formData.confidenceLevel || 'High'} options={['High', 'Medium', 'Low - Speculative']} onChange={(v) => updateField('confidenceLevel', v)} />
                <Input label="Prep Lead Weeks" type="number" value={formData.prepLeadWeeks || 0} onChange={(e) => updateField('prepLeadWeeks', e.target.value)} />
             </div>
          </Accordion>

          <Accordion title="Operational Status" icon={ShieldCheck}>
            <div className="grid grid-cols-2 gap-6">
              <Select label="Status" value={formData.status || ''} options={['upcoming', 'open', 'closed', 'cancelled']} onChange={(v) => updateField('status', v)} />
              <Select label="Priority" value={formData.priority || 'normal'} options={['normal', 'high', 'dont-miss']} onChange={(v) => updateField('priority', v)} />
            </div>
            <div className="mt-8 flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm font-black text-primary-navy">Verification Status</p>
                <p className="text-xs font-bold text-slate-400">Last verified: {formData.lastVerifiedAt ? new Date(formData.lastVerifiedAt).toLocaleDateString() : 'Never'}</p>
              </div>
              <Button size="sm" variant={formData.isCurated ? 'secondary' : 'primary'} onClick={() => updateField('isCurated', !formData.isCurated)}>
                {formData.isCurated ? 'Verified' : 'Verify Now'}
              </Button>
            </div>
          </Accordion>

          {!isNew && (
            <div className="pt-10 flex justify-center">
              <button 
                onClick={() => cycleResetMutation.mutate(id)}
                className="flex items-center gap-2 text-xs font-black text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
              >
                <RotateCcw size={14} /> Reset Cycle for Next Year
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Engagement & Audit */}
        <div className="space-y-10">
          {!isNew && (
            <>
              <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Engagement</h3>
                <div className="grid grid-cols-3 gap-2">
                  <EngagementStat label="Saves" value={formData.metrics?.saves} />
                  <EngagementStat label="Apps" value={formData.metrics?.apps} />
                  <EngagementStat label="Ignores" value={formData.metrics?.ignores} />
                </div>
              </section>

              <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Active Flags</h3>
                  <Badge variant="count">{formData.flags?.length || 0}</Badge>
                </div>
                {formData.flags?.length > 0 ? (
                  <div className="space-y-3">
                    {formData.flags.map(flag => (
                      <div key={flag._id} className="p-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-xs font-bold text-red-900">{flag.issueType.replace('_', ' ')}</p>
                        <p className="text-[10px] text-red-700/70 truncate">{flag.proposedFix}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-emerald-600">Clear</p>
                  </div>
                )}
              </section>

              <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} /> Audit Trail
                </h3>
                <div className="space-y-4">
                  {formData.auditTrail?.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5" />
                      <div>
                        <p className="text-[10px] font-bold text-primary-navy">{entry.action}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">View History →</button>
                </div>
              </section>
            </>
          )}

          {isNew && (
            <div className="p-8 bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] space-y-4">
              <div className="p-3 bg-white rounded-2xl w-fit text-blue-600">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-black text-primary-navy tracking-tight">Manual Entry Mode</h3>
              <p className="text-xs font-bold text-blue-900/60 leading-relaxed italic">
                You are adding a listing manually. Verified flags and engagement data will appear once published.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white border-2 border-slate-100 rounded-[2.5rem] p-4 shadow-2xl flex items-center justify-between z-50 animate-in slide-in-from-bottom-12 duration-700">
        <div className="pl-6 hidden sm:block">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Last Edit: {new Date().toLocaleTimeString()}</p>
          <p className="text-xs font-bold text-primary-navy">Version v{formData.version || 1}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => navigate(-1)}>Discard</Button>
          <Button 
            variant="primary" 
            className="flex-1 sm:flex-none" 
            iconLeading={Save} 
            onClick={() => mutation.mutate(formData)}
            loading={mutation.isPending}
            disabled={!isDirty}
          >
            Save Changes
          </Button>
        </div>
      </footer>
    </div>
  );
}

function EngagementStat({ label, value }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl text-center">
      <p className="text-xl font-black text-primary-navy leading-none mb-1">{value || 0}</p>
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}
