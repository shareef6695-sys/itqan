import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const handleGoogle = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (e: any) {
      setError(e.message ?? 'Unable to sign in with Google');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      navigate(from, { replace: true });
    } catch (e: any) {
      setError(e.message ?? 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('auth.title', 'Sign in to your account')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('auth.subtitle', 'Use Google or your email to continue')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60"
        >
          <LogIn className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('auth.continueWithGoogle', 'Continue with Google')}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">
              {t('auth.or', 'Or')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email', 'Email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm rtl:text-right"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password', 'Password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm rtl:text-right"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
          >
            {mode === 'login'
              ? t('auth.signIn', 'Sign in')
              : t('auth.signUp', 'Create account')}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {t('auth.noAccount', 'No account? Create one with your email')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {t('auth.haveAccount', 'Already have an account? Sign in')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
