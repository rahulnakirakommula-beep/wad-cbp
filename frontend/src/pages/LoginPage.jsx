import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        addToast({
          title: 'Login Failed',
          message: result.message || 'Invalid credentials. Please try again.',
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
          <h2 className="text-3xl font-black text-primary-navy tracking-tight mb-2">Welcome Back</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Login to your COA account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="College Email"
            type="email"
            iconLeading={Mail}
            placeholder="you@college.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              iconLeading={Lock}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" size="xs" className="text-xs font-bold text-slate-400 hover:text-primary-navy transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-4 text-base"
            loading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-sm text-slate-500 font-medium">
            New explorer?{' '}
            <Link to="/signup" className="font-black text-primary-navy hover:text-blue-600 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
