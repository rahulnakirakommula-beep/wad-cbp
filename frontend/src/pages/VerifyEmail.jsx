import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verify/${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Your email has been verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-10 rounded-[2.5rem] shadow-xl border-4 border-primary-navy max-w-lg w-full"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-primary-navy animate-spin mb-6" />
            <h2 className="text-3xl font-black text-primary-navy mb-4">Verifying...</h2>
            <p className="text-slate-500 font-medium tracking-tight">Please wait while we verify your academic status.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 flex items-center justify-center rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-primary-navy mb-4">Success!</h2>
            <p className="text-slate-500 font-medium tracking-tight mb-8">{message}</p>
            <Link 
              to="/login" 
              className="w-full px-8 py-4 font-black text-white bg-primary-navy rounded-2xl shadow-[6px_6px_0px_0px_rgba(230,168,23,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95"
            >
              Sign In to Continue
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 flex items-center justify-center rounded-full mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-black text-primary-navy mb-4">Oops!</h2>
            <p className="text-slate-500 font-medium tracking-tight mb-8">{message}</p>
            <div className="flex flex-col gap-3 w-full">
              <Link 
                to="/signup" 
                className="w-full px-8 py-4 font-black text-white bg-primary-navy rounded-2xl shadow-[6px_6px_0px_0px_rgba(230,168,23,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                Try Signing Up Again
              </Link>
              <Link to="/login" className="text-primary-navy font-bold hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
