import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await signup(formData.name, formData.email, formData.password);
      if (!result.success) {
        addToast({
          title: 'Signup Failed',
          message: result.message || 'Could not create account. Email might already be taken.',
          type: 'error'
        });
      }
    } catch (err) {
      addToast({
        title: 'Network Error',
        message: 'Could not connect to the server at this time.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white border-2 border-slate-100 rounded-3xl p-8 sm:p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-primary-navy tracking-tight mb-2">Join COA</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Start your opportunity journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            iconLeading={User}
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="College Email"
            type="email"
            iconLeading={Mail}
            placeholder="you@college.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            iconLeading={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            helperText="Minimum 8 characters with numbers"
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full py-4 text-base"
              loading={isSubmitting}
              iconLeading={ShieldCheck}
            >
              Create Account
            </Button>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-primary-navy hover:text-blue-600 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
