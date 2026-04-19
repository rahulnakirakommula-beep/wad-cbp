import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setError('');
    const result = await login(data.email, data.password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white border-2 rounded-2xl border-primary-navy shadow-[8px_8px_0px_0px_rgba(27,42,74,1)]">
        <h2 className="mb-6 text-3xl font-bold text-center text-primary-navy">Login to COA</h2>
        
        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-4 py-2 border-2 rounded-xl focus:ring-0 focus:border-accent-amber transition-colors outline-none"
              placeholder="you@college.edu"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-4 py-2 border-2 rounded-xl focus:ring-0 focus:border-accent-amber transition-colors outline-none"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 text-lg font-bold text-white transition-transform active:scale-95 bg-primary-navy rounded-xl hover:opacity-90"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-accent-amber hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
