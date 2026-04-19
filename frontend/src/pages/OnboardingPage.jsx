import { useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const BRANCHES = ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL', 'EEE', 'CHEM'];
const TAGS = [
  { id: 'frontend', name: 'Frontend' },
  { id: 'backend', name: 'Backend' },
  { id: 'machine-learning', name: 'Machine Learning' },
  { id: 'data-science', name: 'Data Science' },
  { id: 'cybersecurity', name: 'Cybersecurity' },
  { id: 'cloud', name: 'Cloud Computing' },
  { id: 'devops', name: 'DevOps' },
  { id: 'mobile', name: 'Mobile Dev' }
];

function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    branch: 'CSE',
    currentYear: 1,
    interests: []
  });
  const { user, updateOnboarding } = useAuth();
  const navigate = useNavigate();

  const handleInterestToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(tagId)
        ? prev.interests.filter(id => id !== tagId)
        : prev.interests.length < 5 ? [...prev.interests, tagId] : prev.interests
    }));
  };

  const handleComplete = async () => {
    try {
      const { data } = await api.put('/user/onboarding', formData);
      updateOnboarding(data);
      navigate('/app/feed');
    } catch (error) {
      console.error('Onboarding failed', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="w-full max-w-lg p-8 bg-white border-2 rounded-2xl border-primary-navy shadow-[8px_8px_0px_0px_rgba(27,42,74,1)]">
        
        {/* Progress Bar */}
        <div className="flex mb-8 justify-between">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-2 flex-1 mx-1 rounded-full transition-colors ${step >= s ? 'bg-accent-amber' : 'bg-slate-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-primary-navy">Academics</h2>
            <p className="text-slate-600">Tell us what you're studying so we can filter opportunities for you.</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
              <select 
                value={formData.branch}
                onChange={e => setFormData({...formData, branch: e.target.value})}
                className="w-full p-3 border-2 rounded-xl outline-none focus:border-accent-amber appearance-none bg-white"
              >
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Year: {formData.currentYear}</label>
              <input 
                type="range" min="1" max="6" step="1"
                value={formData.currentYear}
                onChange={e => setFormData({...formData, currentYear: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-navy"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Year 1</span>
                <span>Year 6</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold text-primary-navy">Interests</h2>
            <p className="text-slate-600">Select up to 5 domains you're interested in.</p>
            
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleInterestToggle(tag.id)}
                  className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                    formData.interests.includes(tag.id)
                      ? 'bg-primary-navy text-white border-primary-navy'
                      : 'bg-white text-primary-navy border-slate-200 hover:border-accent-amber'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center">{formData.interests.length}/5 selected</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-primary-navy">All Set!</h2>
            <p className="text-slate-600">We've personalized your feed. Ready to discover opportunities?</p>
          </div>
        )}

        <div className="mt-10 flex justify-between gap-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-2 font-bold text-primary-navy hover:text-accent-amber transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
          )}
          
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="ml-auto flex items-center gap-2 px-8 py-3 bg-primary-navy text-white font-bold rounded-xl active:scale-95 transition-transform"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleComplete}
              className="w-full py-4 bg-accent-amber text-primary-navy font-black text-xl rounded-xl shadow-[4px_4px_0px_0px_rgba(27,42,74,1)] active:scale-95 transition-transform"
            >
              GET STARTED
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
