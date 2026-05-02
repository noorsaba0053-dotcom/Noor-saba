import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google Login failed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: name });
      }
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password signup is not enabled in Firebase Console. Please enable it or use Google Login.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] ring-1 ring-gray-100"
      >
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 font-black text-white text-2xl shadow-lg shadow-blue-200">
            MV
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">MedVault</h1>
          <p className="mt-2 text-sm font-medium text-gray-400">Portable Digital Health Records</p>
        </div>

        <div className="mb-8 flex rounded-2xl bg-gray-100 p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
              isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
              !isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="group relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-11 py-3.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          )}
          <div className="group relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-11 py-3.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
          <div className="group relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-11 py-3.5 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-500">
               <AlertCircle size={14} />
               <p className="flex-1">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : isLogin ? (
              <>
                <LogIn size={20} />
                Login
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Get Started
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
            <span className="bg-white px-4 text-gray-300">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-gray-50 bg-white py-4 font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
          Google Account
        </button>

        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-300">
          Secure Biometric Encryption Enabled
        </p>
      </motion.div>
    </div>
  );
}
