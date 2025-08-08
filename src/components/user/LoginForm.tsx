// src/components/user/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {isVisible ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    )}
  </svg>
);

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onCancel }) => {
  const { signIn, signUp, loading, error, clearError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [validationError, setValidationError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    setValidationError('');
    clearError();
    if (!email.trim() || !email.includes('@')) { setValidationError('Please enter a valid email address'); return false; }
    if (!password || password.length < 4) { setValidationError('Password must be at least 4 characters'); return false; }
    if (mode === 'signup') {
      if (!username.trim() || username.trim().length < 2) { setValidationError('Username must be at least 2 characters'); return false; }
      if (password !== confirmPassword) { setValidationError('Passwords do not match'); return false; }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const success = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, username.trim());
    if (success && onSuccess) onSuccess();
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setValidationError('');
    clearError();
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const displayError = validationError || error;

  const getInputClasses = (fieldName: string) => `w-full p-3 pr-12 border-2 rounded-md transition-colors bg-white text-text disabled:opacity-50 ${focusedField === fieldName ? 'border-accent ring-2 ring-accent/50' : 'border-gray-200'}`;
  const labelClasses = "block font-body text-sm font-medium text-textSecondary mb-2";

  return (
    <div className="fixed inset-0 bg-black/60 z-modal flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full animate-slide-in">
        <div className="mb-6 text-center">
          <h2 className="font-heading text-2xl text-gray-900 mb-2">{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="font-body text-base text-textSecondary">{mode === 'signin' ? 'Sign in to continue to Howzeverything' : 'Join Howzeverything to start rating dishes'}</p>
        </div>

        {displayError && (
          <div className="bg-red-100 border border-red-200 rounded-md p-3 mb-5">
            <p className="font-body text-sm text-danger m-0">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="mb-5">
              <label className={labelClasses}>Username <span className="font-normal text-xs text-gray-400 ml-2">(displayed with your comments)</span></label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)} placeholder="Choose a username" className={getInputClasses('username')} disabled={loading} />
            </div>
          )}
          <div className="mb-5">
            <label className={labelClasses}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} placeholder="Enter your email" className={getInputClasses('email')} disabled={loading} autoComplete="email" />
          </div>
          <div className={`mb-${mode === 'signup' ? '5' : '6'}`}>
            <label className={labelClasses}>Password</label>
            <div className="relative flex items-center">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} placeholder="Enter your password" className={getInputClasses('password')} disabled={loading} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute right-3 p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 z-10"><EyeIcon isVisible={showPassword} /></button>
            </div>
          </div>
          {mode === 'signup' && (
            <div className="mb-6">
              <label className={labelClasses}>Confirm Password</label>
              <div className="relative flex items-center">
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)} placeholder="Confirm your password" className={getInputClasses('confirmPassword')} disabled={loading} autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading} className="absolute right-3 p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 z-10"><EyeIcon isVisible={showConfirmPassword} /></button>
              </div>
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full min-h-[50px] mb-4 px-4 py-3 rounded-lg border-2 text-white bg-accent border-black transition-colors hover:bg-accent-dark disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed">
            {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Please wait...</span> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
          <div className="text-center mb-4">
            <button type="button" onClick={toggleMode} disabled={loading} className="font-body bg-transparent border-none text-accent text-sm cursor-pointer no-underline p-2 rounded-md transition-colors hover:bg-accent/10 disabled:cursor-not-allowed">
              {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={loading} className="w-full px-4 py-3 rounded-lg border-2 border-black text-black bg-white hover:bg-gray-100 transition-colors disabled:opacity-50">
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;