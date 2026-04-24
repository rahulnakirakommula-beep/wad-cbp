import { useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { BRANCHES, TAGS } from '../constants';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import TagPicker from './ui/TagPicker';
import { useToast } from '../context/ToastContext';

export default function ProfileSettingsModal({ isOpen, onClose }) {
  const { user, updateOnboarding } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    branch: user?.profile?.branch || 'CSE',
    currentYear: user?.profile?.currentYear || 1,
    interests: user?.interests || []
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const branchOptions = BRANCHES.map(b => ({ label: b, value: b }));

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.put('/user/preferences', formData);
      updateOnboarding(data); 
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      
      addToast({
        title: 'Settings Saved',
        body: 'Your academic profile and interests have been updated.',
        type: 'success'
      });
      
      setIsDirty(false);
      onClose();
    } catch (error) {
      console.error('Failed to update preferences', error);
      addToast({
        title: 'Error Saving',
        body: 'Could not update preferences. Please check your connection.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile Settings"
      isDirty={isDirty}
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            loading={isSaving} 
            iconLeading={Save}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-10">
        {/* Academic Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent-amber rounded-full shadow-[0_0_8px_rgba(230,168,23,0.5)]" />
            <h3 className="text-sm font-black text-primary-navy uppercase tracking-widest">Academic Track</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Branch / Major"
              options={branchOptions}
              value={formData.branch}
              onChange={(val) => handleChange('branch', val)}
              searchable
            />
            
            <Input
              label="Current Year"
              type="number"
              min="1"
              max="6"
              value={formData.currentYear}
              onChange={(e) => handleChange('currentYear', parseInt(e.target.value))}
              helperText="Year of study (1-6)"
            />
          </div>
        </section>

        {/* Interests Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent-amber rounded-full shadow-[0_0_8px_rgba(230,168,23,0.5)]" />
            <h3 className="text-sm font-black text-primary-navy uppercase tracking-widest">Interests & Focus</h3>
          </div>
          
          <TagPicker
            tags={TAGS}
            selectedTags={formData.interests}
            onChange={(val) => handleChange('interests', val)}
            max={8}
            // Tags don't have categories yet in constants.js, but TagPicker handles it
          />
        </section>
      </div>
    </Modal>
  );
}
