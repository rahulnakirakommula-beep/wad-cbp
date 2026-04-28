import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Lock, LogOut, Save, Settings, User } from 'lucide-react';

import { api, useAuth } from '../context/AuthContext';
import { BRANCHES, YEAR_OPTIONS } from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import TagPicker from '../components/ui/TagPicker';
import Toggle from '../components/ui/Toggle';
import { useToast } from '../context/ToastContext';

const DEFAULT_NOTIFICATION_PREFS = {
  deadlineReminders: true,
  seasonAlerts: true,
  dontMissAlerts: true,
  cancellationAlerts: true,
  emailEnabled: true
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user, logout, updateOnboarding } = useAuth();
  const { addToast } = useToast();
  const [profileForm, setProfileForm] = useState({
    name: '',
    branch: 'CSE',
    currentYear: 1
  });
  const [interestState, setInterestState] = useState([]);
  const [notificationPrefs, setNotificationPrefs] = useState(DEFAULT_NOTIFICATION_PREFS);
  const [availableTags, setAvailableTags] = useState([]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [interestSaveState, setInterestSaveState] = useState('idle');
  const [notificationSaveState, setNotificationSaveState] = useState('idle');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSaving, setPasswordSaving] = useState(false);

  const initializedInterests = useRef(false);
  const initializedNotifications = useRef(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const [{ data: profile }, { data: tags }] = await Promise.all([
        api.get('/user/profile'),
        api.get('/tags?active=true')
      ]);

      return {
        profile,
        tags: tags.map((tag) => ({
          id: tag.tagId,
          name: tag.displayName,
          category: tag.category
        }))
      };
    }
  });

  useEffect(() => {
    if (!profileData) return;

    setProfileForm({
      name: profileData.profile.name || '',
      branch: profileData.profile?.branch || 'CSE',
      currentYear: profileData.profile?.currentYear || 1
    });
    setInterestState(profileData.profile.interests || []);
    setNotificationPrefs({
      ...DEFAULT_NOTIFICATION_PREFS,
      ...(profileData.profile.notificationPrefs || {})
    });
    setAvailableTags(profileData.tags);
  }, [profileData]);

  const profileDirty = useMemo(() => {
    if (!profileData) return false;
    return (
      profileForm.name !== (profileData.profile.name || '') ||
      profileForm.branch !== (profileData.profile?.branch || 'CSE') ||
      profileForm.currentYear !== (profileData.profile?.currentYear || 1)
    );
  }, [profileData, profileForm]);

  const categoryOrder = useMemo(
    () => ['role', 'skill', 'sector'].filter((category) => availableTags.some((tag) => tag.category === category)),
    [availableTags]
  );

  const persistProfile = async (payload, successMessage) => {
    const { data } = await api.put('/user/profile', payload);
    updateOnboarding(data);
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    addToast({
      title: successMessage,
      body: 'Your account settings are up to date.',
      type: 'success'
    });
    return data;
  };

  useEffect(() => {
    if (!profileData) return;
    if (!initializedInterests.current) {
      initializedInterests.current = true;
      return;
    }

    setInterestSaveState('saving');
    const timer = setTimeout(async () => {
      try {
        await persistProfile({ interests: interestState }, 'Interests saved');
        setInterestSaveState('saved');
        setTimeout(() => setInterestSaveState('idle'), 1500);
      } catch (error) {
        setInterestSaveState('idle');
        addToast({
          title: 'Could not save interests',
          body: error.response?.data?.message || 'Please try again.',
          type: 'error'
        });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [interestState]);

  useEffect(() => {
    if (!profileData) return;
    if (!initializedNotifications.current) {
      initializedNotifications.current = true;
      return;
    }

    setNotificationSaveState('saving');
    const timer = setTimeout(async () => {
      try {
        await persistProfile({ notificationPrefs }, 'Notification preferences saved');
        setNotificationSaveState('saved');
        setTimeout(() => setNotificationSaveState('idle'), 1800);
      } catch (error) {
        setNotificationSaveState('idle');
        addToast({
          title: 'Could not save notifications',
          body: error.response?.data?.message || 'Please try again.',
          type: 'error'
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [notificationPrefs]);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      await persistProfile(profileForm, 'Profile updated');
    } catch (error) {
      addToast({
        title: 'Could not update profile',
        body: error.response?.data?.message || 'Please try again.',
        type: 'error'
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async () => {
    const errors = {};

    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required.';
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters.';
    }
    if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPasswordSaving(true);
    try {
      await api.put('/user/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      addToast({
        title: 'Password changed successfully',
        body: 'Your new password is now active.',
        type: 'success'
      });
    } catch (error) {
      setPasswordErrors({
        currentPassword: error.response?.data?.message?.toLowerCase().includes('current')
          ? 'Current password is incorrect.'
          : undefined
      });
      addToast({
        title: 'Password update failed',
        body: error.response?.data?.message || 'Please try again.',
        type: 'error'
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    addToast({
      title: "You've been logged out",
      body: 'See you next time.',
      type: 'info'
    });
    logout();
  };

  if (isLoading || !profileData) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        <div className="h-10 w-48 bg-slate-100 rounded-xl animate-pulse" />
        {[1, 2, 3].map((item) => <div key={item} className="h-48 bg-white rounded-3xl border-2 border-slate-100 animate-pulse" />)}
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary-navy/5 rounded-3xl">
            <Settings className="w-8 h-8 text-primary-navy" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-primary-navy tracking-tight">Settings</h1>
            <p className="text-slate-500 font-medium">Manage your profile, interests, notifications, and security.</p>
          </div>
        </div>

        <section className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-accent-amber" />
              <div>
                <h2 className="text-xl font-bold text-primary-navy">Profile</h2>
                {profileDirty && <p className="text-xs font-bold uppercase tracking-widest text-amber-600">• Unsaved</p>}
              </div>
            </div>
            <Button
              iconLeading={Save}
              onClick={handleProfileSave}
              loading={profileSaving}
              disabled={!profileDirty}
            >
              Save
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Name"
              value={profileForm.name}
              onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Select
              label="Branch"
              searchable
              options={BRANCHES.map((branch) => ({ label: branch, value: branch }))}
              value={profileForm.branch}
              onChange={(value) => setProfileForm((current) => ({ ...current, branch: value }))}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-primary-navy">Current Year</p>
            <div className="flex flex-wrap gap-2">
              {YEAR_OPTIONS.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setProfileForm((current) => ({ ...current, currentYear: year }))}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-black transition-all ${profileForm.currentYear === year ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  Year {year}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-accent-amber" />
            <div>
              <h2 className="text-xl font-bold text-primary-navy">Interests</h2>
              <p className="text-sm text-slate-500">Choose up to 5 focus tags. Your feed recommendations update after saving.</p>
            </div>
          </div>

          <TagPicker
            tags={availableTags}
            selectedTags={interestState}
            onChange={setInterestState}
            max={5}
            categories={categoryOrder}
          />

          <p className="text-sm font-medium text-slate-500">
            {interestSaveState === 'saving' ? 'Saving…' : interestSaveState === 'saved' ? 'Saved ✓' : ' '}
          </p>
        </section>

        <section className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-accent-amber" />
            <div>
              <h2 className="text-xl font-bold text-primary-navy">Notifications</h2>
              <p className="text-sm text-slate-500">Changes save automatically after each toggle.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Toggle
              label="Deadline reminders"
              helperText="Get alerted as deadlines get closer."
              checked={notificationPrefs.deadlineReminders}
              onChange={(value) => setNotificationPrefs((current) => ({ ...current, deadlineReminders: value }))}
            />
            <Toggle
              label="Season alerts"
              helperText="See when a domain season starts opening."
              checked={notificationPrefs.seasonAlerts}
              onChange={(value) => setNotificationPrefs((current) => ({ ...current, seasonAlerts: value }))}
            />
            <Toggle
              label="Don't miss alerts"
              helperText="Highlight the most urgent curated opportunities."
              checked={notificationPrefs.dontMissAlerts}
              onChange={(value) => setNotificationPrefs((current) => ({ ...current, dontMissAlerts: value }))}
            />
            <Toggle
              label="Cancellation alerts"
              helperText="Get notified if a saved opportunity is cancelled."
              checked={notificationPrefs.cancellationAlerts}
              onChange={(value) => setNotificationPrefs((current) => ({ ...current, cancellationAlerts: value }))}
            />
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Email Notifications</p>
            <Toggle
              label="Email enabled"
              helperText="Send email in addition to in-app notifications."
              checked={notificationPrefs.emailEnabled}
              onChange={(value) => setNotificationPrefs((current) => ({ ...current, emailEnabled: value }))}
            />
          </div>

          <p className="text-sm font-medium text-slate-500">
            {notificationSaveState === 'saving' ? 'Saving…' : notificationSaveState === 'saved' ? 'Saved ✓' : ' '}
          </p>
        </section>

        <section className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="secondary" iconLeading={Lock} onClick={() => setPasswordModalOpen(true)}>
              Change Password
            </Button>
            <Button variant="ghost" iconLeading={LogOut} onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </section>
      </div>

      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Password"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setPasswordModalOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordSubmit} loading={passwordSaving}>Update Password</Button>
          </>
        )}
      >
        <div className="space-y-5">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            error={passwordErrors.currentPassword}
            onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            helperText="At least 8 characters."
            error={passwordErrors.newPassword}
            onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            error={passwordErrors.confirmPassword}
            onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
          />
        </div>
      </Modal>
    </>
  );
}
