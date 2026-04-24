import { useEffect, useMemo, useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, ChevronRight, CheckCircle2, Rocket, Sparkles } from 'lucide-react';
import { BRANCHES } from '../constants';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TagPicker from '../components/ui/TagPicker';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Toggle from '../components/ui/Toggle';
import { useToast } from '../context/ToastContext';

const ONBOARDING_STEPS = ['Academic', 'Interests', 'Notifications'];

const DEFAULT_NOTIFICATION_PREFS = {
  deadlineReminders: true,
  seasonAlerts: true,
  dontMissAlerts: true,
  cancellationAlerts: true,
  emailEnabled: true
};

const CATEGORY_ORDER = ['role', 'skill', 'sector'];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [availableTags, setAvailableTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [formData, setFormData] = useState({
    branch: 'CSE',
    currentYear: 1,
    interests: [],
    notificationPrefs: DEFAULT_NOTIFICATION_PREFS
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateOnboarding, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadTags = async () => {
      try {
        const { data } = await api.get('/tags?active=true');
        if (!mounted) return;

        const mapped = data.map((tag) => ({
          id: tag.tagId,
          name: tag.displayName,
          category: tag.category
        }));
        setAvailableTags(mapped);
      } catch {
        if (!mounted) return;
        addToast({
          title: 'Tags unavailable',
          body: 'We could not load active domain tags right now.',
          type: 'error'
        });
      } finally {
        if (mounted) setLoadingTags(false);
      }
    };

    loadTags();

    return () => {
      mounted = false;
    };
  }, [addToast]);

  useEffect(() => {
    if (!user) return;

    setFormData((current) => ({
      branch: user.profile?.branch || current.branch,
      currentYear: user.profile?.currentYear || current.currentYear,
      interests: user.interests || current.interests,
      notificationPrefs: {
        ...DEFAULT_NOTIFICATION_PREFS,
        ...(user.notificationPrefs || {})
      }
    }));
  }, [user]);

  const categories = useMemo(() => (
    CATEGORY_ORDER.filter((category) => availableTags.some((tag) => tag.category === category))
  ), [availableTags]);

  const updateNotificationPref = (key, value) => {
    setFormData((current) => ({
      ...current,
      notificationPrefs: {
        ...current.notificationPrefs,
        [key]: value
      }
    }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await api.put('/user/onboarding', formData);
      updateOnboarding(data);
      addToast({
        title: 'Welcome aboard',
        body: "Your profile is ready and your feed is personalized.",
        type: 'success'
      });
      navigate('/app/feed');
    } catch (error) {
      addToast({
        title: 'Onboarding failed',
        body: error.response?.data?.message || 'Could not save your onboarding details.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (formData.currentYear < 1 || formData.currentYear > 6)) {
      addToast({
        title: 'Invalid study year',
        body: 'Please choose a year from 1 to 6.',
        type: 'warning'
      });
      return;
    }

    if (step === 2 && formData.interests.length === 0) {
      // Tags are optional according to test plan 2.7
      setStep((current) => current + 1);
      return;
    }

    setStep((current) => current + 1);
  };

  const isNextDisabled = () => {
    if (step === 1) return !formData.branch || !formData.currentYear;
    return false;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <ProgressIndicator steps={ONBOARDING_STEPS} currentStep={step} />

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500 delay-150">
              <div className="space-y-4">
                <div className="inline-flex p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
                  <Rocket size={24} />
                </div>
                <h2 className="text-3xl font-black text-primary-navy tracking-tight">Academic Focus</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Tell us your branch and current year so we can filter eligibility correctly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Branch / Major"
                  options={BRANCHES.map((branch) => ({ label: branch, value: branch }))}
                  value={formData.branch}
                  onChange={(value) => setFormData((current) => ({ ...current, branch: value }))}
                  searchable
                />

                <Input
                  label="Current Year"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.currentYear}
                  onChange={(event) => setFormData((current) => ({
                    ...current,
                    currentYear: event.target.value ? Number(event.target.value) : ''
                  }))}
                  helperText="Choose a year from 1 to 6"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="space-y-4">
                <div className="inline-flex p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-3xl font-black text-primary-navy tracking-tight">Focus Domains</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Choose up to 5 active domain tags, grouped by category, to shape your feed.
                </p>
              </div>

              {loadingTags ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-500">
                  Loading active domain tags...
                </div>
              ) : (
                <TagPicker
                  tags={availableTags}
                  selectedTags={formData.interests}
                  onChange={(interests) => setFormData((current) => ({ ...current, interests }))}
                  max={5}
                  categories={categories}
                />
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in zoom-in-95 fade-in duration-500">
              <div className="space-y-4">
                <div className="inline-flex p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
                  <Bell size={24} />
                </div>
                <h2 className="text-3xl font-black text-primary-navy tracking-tight">Notification Preferences</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  All alerts start enabled by default. Adjust what you want before entering the platform.
                </p>
              </div>

              <div className="grid gap-5 rounded-3xl border border-slate-100 bg-slate-50 p-6">
                <Toggle
                  label="Deadline reminders"
                  helperText="Receive alerts as important deadlines approach."
                  checked={formData.notificationPrefs.deadlineReminders}
                  onChange={(value) => updateNotificationPref('deadlineReminders', value)}
                />
                <Toggle
                  label="Season alerts"
                  helperText="Know when expected opportunity windows are opening."
                  checked={formData.notificationPrefs.seasonAlerts}
                  onChange={(value) => updateNotificationPref('seasonAlerts', value)}
                />
                <Toggle
                  label="Don't miss alerts"
                  helperText="Highlight top-priority opportunities that need attention."
                  checked={formData.notificationPrefs.dontMissAlerts}
                  onChange={(value) => updateNotificationPref('dontMissAlerts', value)}
                />
                <Toggle
                  label="Cancellation alerts"
                  helperText="Stay informed when an opportunity is withdrawn or changed."
                  checked={formData.notificationPrefs.cancellationAlerts}
                  onChange={(value) => updateNotificationPref('cancellationAlerts', value)}
                />
                <Toggle
                  label="Email notifications"
                  helperText="Receive email in addition to in-app notifications."
                  checked={formData.notificationPrefs.emailEnabled}
                  onChange={(value) => updateNotificationPref('emailEnabled', value)}
                />
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-600" size={22} />
                  <p className="text-sm font-semibold text-emerald-900">
                    You’re ready with {formData.interests.length} selected domain tags.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setStep((current) => current - 1)}
                iconLeading={ChevronLeft}
              >
                Back
              </Button>
            ) : <div />}

            {step < 3 ? (
              <Button onClick={nextStep} iconTrailing={ChevronRight} disabled={isNextDisabled()}>
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                loading={isSubmitting}
                className="px-12 py-5 text-lg"
              >
                Enter Platform
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
