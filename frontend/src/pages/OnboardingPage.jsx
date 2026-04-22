import { useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle2, Rocket, Sparkles } from 'lucide-react';
import { BRANCHES, TAGS } from '../constants';

// UI Components
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TagPicker from '../components/ui/TagPicker';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import { useToast } from '../context/ToastContext';

const ONBOARDING_STEPS = ['Academic', 'Interests', 'All Set'];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    branch: 'CSE',
    currentYear: 1,
    interests: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateOnboarding } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await api.put('/user/onboarding', formData);
      updateOnboarding(data);
      addToast({
        title: 'Welcome Aboard!',
        message: "Your profile is set. Let's find some opportunities.",
        type: 'success'
      });
      navigate('/app/feed');
    } catch (error) {
      console.error('Onboarding failed', error);
      addToast({
        title: 'Signup Error',
        message: 'Could not save your preferences. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 2 && formData.interests.length === 0) {
      addToast({
        title: 'Interests Required',
        message: 'Please select at least one interest to personalize your feed.',
        type: 'warning'
      });
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
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
                  Tell us what you're studying. This helps us prioritize opportunities that match your degree path.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Branch / Major"
                  options={BRANCHES.map(b => ({ label: b, value: b }))}
                  value={formData.branch}
                  onChange={(v) => setFormData({ ...formData, branch: v })}
                  searchable
                />
                
                <Input
                  label="Current Year"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.currentYear}
                  onChange={(e) => setFormData({ ...formData, currentYear: parseInt(e.target.value) })}
                  helperText="1st to 6th year"
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
                  What are you passionate about? Select up to 8 areas to customize your recommendation engine.
                </p>
              </div>
              
              <TagPicker
                tags={TAGS}
                selectedTags={formData.interests}
                onChange={(tags) => setFormData({ ...formData, interests: tags })}
                max={8}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 text-center animate-in zoom-in-95 fade-in duration-500">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100 mb-6">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full animate-bounce flex items-center justify-center border-2 border-white">
                  <Sparkles size={16} className="text-white" />
                </div>
              </div>
              <div className="space-y-4 px-4">
                <h2 className="text-4xl font-black text-primary-navy tracking-tight">You're All Set!</h2>
                <p className="text-slate-500 font-medium text-lg">
                  We've curated a personalized feed of {formData.interests.length} focus areas. Your journey starts now.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
            {step > 1 ? (
              <Button 
                variant="ghost" 
                onClick={() => setStep(step - 1)}
                iconLeading={ChevronLeft}
              >
                Back
              </Button>
            ) : <div />}
            
            {step < 3 ? (
              <Button 
                onClick={nextStep}
                iconTrailing={ChevronRight}
              >
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
