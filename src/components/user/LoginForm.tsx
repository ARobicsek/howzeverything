// src/components/user/LoginForm.tsx
import React, { useState } from 'react';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onCancel }) => {
  const { signIn, signUp, loading, error, clearError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [validationError, setValidationError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateForm = (): boolean => {
    setValidationError('');
    clearError();

    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }

    if (!email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setValidationError('Password is required');
      return false;
    }

    if (password.length < 4) {
      setValidationError('Password must be at least 4 characters');
      return false;
    }

    if (mode === 'signup') {
      if (!username.trim()) {
        setValidationError('Username is required');
        return false;
      }

      if (username.trim().length < 2) {
        setValidationError('Username must be at least 2 characters');
        return false;
      }

      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    let success = false;

    if (mode === 'signin') {
      success = await signIn(email, password);
    } else {
      success = await signUp(email, password, username.trim());
    }

    if (success && onSuccess) {
      onSuccess();
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setValidationError('');
    clearError();
    setPassword('');
    setConfirmPassword('');
    setUsername('');
  };

  const displayError = validationError || error;

  const getInputStyle = (fieldName: string) => ({
    ...STYLES.input,
    ...(focusedField === fieldName ? STYLES.inputFocus : {}),
    opacity: loading ? 0.5 : 1
  });

  return (
    <div style={STYLES.modalOverlay}>
      <div style={{
        ...STYLES.modal,
        maxWidth: '400px',
        width: '100%',
        padding: SPACING[8]
      }}>
        {/* Header */}
        <div style={{ marginBottom: SPACING[6], textAlign: 'center' }}>
          <h2 style={{
            ...FONTS.heading,
            fontSize: TYPOGRAPHY['2xl'].fontSize,
            color: COLORS.gray900,
            margin: `0 0 ${SPACING[2]} 0`
          }}>
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{
            ...FONTS.body,
            fontSize: TYPOGRAPHY.base.fontSize,
            color: COLORS.textSecondary,
            margin: 0
          }}>
            {mode === 'signin'
              ? 'Sign in to continue to Howzeverything'
              : 'Join Howzeverything to start rating dishes'}
          </p>
        </div>

        {/* Error Display */}
        {displayError && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: `1px solid #FECACA`,
            borderRadius: STYLES.borderRadiusMedium,
            padding: SPACING[3],
            marginBottom: SPACING[5]
          }}>
            <p style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.sm.fontSize,
              color: COLORS.danger,
              margin: 0
            }}>
              {displayError}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: SPACING[5] }}>
              <label style={{
                ...FONTS.body,
                fontSize: TYPOGRAPHY.sm.fontSize,
                fontWeight: TYPOGRAPHY.medium,
                color: COLORS.textSecondary,
                display: 'block',
                marginBottom: SPACING[2]
              }}>
                Username
                <span style={{
                  ...FONTS.body,
                  fontSize: TYPOGRAPHY.xs.fontSize,
                  fontWeight: TYPOGRAPHY.normal,
                  color: COLORS.gray400,
                  marginLeft: SPACING[2]
                }}>
                  (displayed with your comments)
                </span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                placeholder="Choose a username"
                style={getInputStyle('username')}
                disabled={loading}
              />
            </div>
          )}

          <div style={{ marginBottom: SPACING[5] }}>
            <label style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.sm.fontSize,
              fontWeight: TYPOGRAPHY.medium,
              color: COLORS.textSecondary,
              display: 'block',
              marginBottom: SPACING[2]
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your email"
              style={getInputStyle('email')}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: mode === 'signup' ? SPACING[5] : SPACING[6] }}>
            <label style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.sm.fontSize,
              fontWeight: TYPOGRAPHY.medium,
              color: COLORS.textSecondary,
              display: 'block',
              marginBottom: SPACING[2]
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your password"
              style={getInputStyle('password')}
              disabled={loading}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'signup' && (
            <div style={{ marginBottom: SPACING[6] }}>
              <label style={{
                ...FONTS.body,
                fontSize: TYPOGRAPHY.sm.fontSize,
                fontWeight: TYPOGRAPHY.medium,
                color: COLORS.textSecondary,
                display: 'block',
                marginBottom: SPACING[2]
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirm your password"
                style={getInputStyle('confirmPassword')}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...STYLES.primaryButton,
              width: '100%',
              minHeight: '50px',
              marginBottom: SPACING[4],
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: loading ? COLORS.gray300 : COLORS.primary,
              borderColor: loading ? COLORS.gray300 : COLORS.black
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = COLORS.primaryHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = COLORS.primary;
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: SPACING[2] }}>
                <span className="loading-spinner" style={{
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: COLORS.white,
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  animation: 'spin 0.8s linear infinite'
                }}></span>
                Please wait...
              </span>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>

          {/* Mode Toggle */}
          <div style={{ textAlign: 'center', marginBottom: SPACING[4] }}>
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              style={{
                ...FONTS.body,
                background: 'none',
                border: 'none',
                color: COLORS.primary,
                fontSize: TYPOGRAPHY.sm.fontSize,
                cursor: loading ? 'not-allowed' : 'pointer',
                textDecoration: 'none',
                padding: `${SPACING[2]} ${SPACING[3]}`,
                borderRadius: STYLES.borderRadiusMedium,
                transition: 'background-color 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = COLORS.gray50;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {mode === 'signin'
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Cancel Button */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                ...STYLES.secondaryButton,
                width: '100%',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;