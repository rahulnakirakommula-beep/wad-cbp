import { useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { X, Check, Save, User as UserIcon } from 'lucide-react';
import { BRANCHES, TAGS } from '../constants';

function ProfileSettingsModal({ isOpen, onClose }) {
  const { user, updateOnboarding } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    branch: user?.profile?.branch || 'CSE',
    currentYear: user?.profile?.currentYear || 1,
    interests: user?.interests || []
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInterestToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(tagId)
        ? prev.interests.filter(id => id !== tagId)
        : prev.interests.length < 8 ? [...prev.interests, tagId] : prev.interests
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.put('/user/preferences', formData);
      updateOnboarding(data); // Using existing update function to sync context
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      onClose();
    } catch (error) {
      console.error('Failed to update preferences', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border-2 border-primary-navy rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(27,42,74,1)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b-2 border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-amber rounded-2xl flex items-center justify-center border-2 border-primary-navy shadow-[4px_4px_0px_0px_rgba(27,42,74,1)]">
              <UserIcon className="text-primary-navy" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary-navy tracking-tight">Profile Settings</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update your academic focus</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* Section: Academic */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent-amber rounded-full" />
                <h3 className="text-lg font-black text-primary-navy">Academic Track</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Branch / Major</label>
                  <select 
                    value={formData.branch}
                    onChange={e => setFormData({...formData, branch: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-primary-navy focus:border-accent-amber outline-none transition-all appearance-none"
                  >
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Current Year ({formData.currentYear})</label>
                    <input 
                        type="range" min="1" max="6" step="1"
                        value={formData.currentYear}
                        onChange={e => setFormData({...formData, currentYear: parseInt(e.target.value)})}
                        className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary-navy mt-4"
                    />
                </div>
             </div>
          </div>

          {/* Section: Interests */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent-amber rounded-full" />
                <h3 className="text-lg font-black text-primary-navy">Interests ({formData.interests.length}/8)</h3>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleInterestToggle(tag.id)}
                    className={`px-5 py-2.5 rounded-2xl border-2 font-black text-sm transition-all flex items-center gap-2 ${
                      formData.interests.includes(tag.id)
                        ? 'bg-primary-navy text-white border-primary-navy shadow-[4px_4px_0px_0px_rgba(230,168,23,1)]'
                        : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {formData.interests.includes(tag.id) && <Check size={14} className="text-accent-amber" />}
                    {tag.name}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t-2 border-slate-50 bg-white flex justify-end gap-4">
           <button 
             onClick={onClose}
             className="px-8 py-4 font-black text-slate-400 hover:text-primary-navy transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="px-10 py-4 bg-primary-navy text-white font-black rounded-[1.25rem] shadow-[6px_6px_0px_0px_rgba(230,168,23,1)] hover:translate-y-px transition-all flex items-center gap-3 active:shadow-none disabled:opacity-50"
           >
             {isSaving ? (
               <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
             ) : (
               <><Save size={20} /> Save Changes</>
             )}
           </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettingsModal;
