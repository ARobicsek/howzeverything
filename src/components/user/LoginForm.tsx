// src/components/user/LoginForm.tsx  
import React, { useState } from 'react';
import { COLORS, COMPONENT_STYLES, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';
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
 
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


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
    // Reset password visibility when switching modes
    setShowPassword(false);
    setShowConfirmPassword(false);
  };


  const displayError = validationError || error;


  const getInputStyle = (fieldName: string) => ({  
    ...STYLES.input,  
    ...(focusedField === fieldName ? STYLES.inputFocus : {}),  
    opacity: loading ? 0.5 : 1  
  });


  // Style for password input container
  const passwordToggleButtonStyle: React.CSSProperties = {
    ...COMPONENT_STYLES.loginForm.passwordToggleButton,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.5 : 1,
  };


  // Eye icon SVG component
  const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isVisible ? (
        // Eye open icon
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      ) : (
        // Eye closed icon
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </>
      )}
    </svg>
  );


  return (  
    <div style={STYLES.modalOverlay}>  
      <div style={COMPONENT_STYLES.loginForm.container}>
        {/* Header */}  
        <div style={COMPONENT_STYLES.loginForm.headerContainer}>
          <h2 style={COMPONENT_STYLES.loginForm.headerTitle}>
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}  
          </h2>  
          <p style={COMPONENT_STYLES.loginForm.headerSubtitle}>
            {mode === 'signin'  
              ? 'Sign in to continue to Howzeverything'  
              : 'Join Howzeverything to start rating dishes'}  
          </p>  
        </div>


        {/* Error Display */}  
        {displayError && (  
          <div style={COMPONENT_STYLES.loginForm.errorContainer}>
            <p style={COMPONENT_STYLES.loginForm.errorText}>
              {displayError}  
            </p>  
          </div>  
        )}


        {/* Form */}  
        <form onSubmit={handleSubmit}>  
          {mode === 'signup' && (  
            <div style={COMPONENT_STYLES.loginForm.formFieldContainer}>
              <label style={COMPONENT_STYLES.loginForm.label}>
                Username  
                <span style={COMPONENT_STYLES.loginForm.usernameHint}>
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


          <div style={COMPONENT_STYLES.loginForm.formFieldContainer}>
            <label style={COMPONENT_STYLES.loginForm.label}>
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
            <label style={COMPONENT_STYLES.loginForm.label}>
              Password  
            </label>  
            <div style={COMPONENT_STYLES.loginForm.passwordInputContainer}>
              <input  
                type={showPassword ? "text" : "password"}  
                value={password}  
                onChange={(e) => setPassword(e.target.value)}  
                onFocus={() => setFocusedField('password')}  
                onBlur={() => setFocusedField(null)}  
                placeholder="Enter your password"  
                style={{
                  ...getInputStyle('password'),
                  paddingRight: '48px' // Make room for the eye icon
                }}
                disabled={loading}  
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}  
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={passwordToggleButtonStyle}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.color = COLORS.gray500;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLORS.gray400;
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon isVisible={showPassword} />
              </button>
            </div>
          </div>


          {mode === 'signup' && (  
            <div style={{ marginBottom: SPACING[6] }}>  
              <label style={COMPONENT_STYLES.loginForm.label}>
                Confirm Password  
              </label>  
              <div style={COMPONENT_STYLES.loginForm.passwordInputContainer}>
                <input  
                  type={showConfirmPassword ? "text" : "password"}  
                  value={confirmPassword}  
                  onChange={(e) => setConfirmPassword(e.target.value)}  
                  onFocus={() => setFocusedField('confirmPassword')}  
                  onBlur={() => setFocusedField(null)}  
                  placeholder="Confirm your password"  
                  style={{
                    ...getInputStyle('confirmPassword'),
                    paddingRight: '48px' // Make room for the eye icon
                  }}
                  disabled={loading}  
                  autoComplete="new-password"  
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  style={passwordToggleButtonStyle}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.color = COLORS.gray500;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = COLORS.gray400;
                  }}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  <EyeIcon isVisible={showConfirmPassword} />
                </button>
              </div>
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
              backgroundColor: loading ? COLORS.gray300 : COLORS.accent,  
              borderColor: loading ? COLORS.gray300 : COLORS.black  
            }}  
            onMouseEnter={(e) => {  
              if (!loading) {  
                e.currentTarget.style.backgroundColor = COLORS.accent;  
              }  
            }}  
            onMouseLeave={(e) => {  
              if (!loading) {  
                e.currentTarget.style.backgroundColor = COLORS.accent;  
              }  
            }}  
          >  
            {loading ? (  
              <span style={COMPONENT_STYLES.loginForm.loadingSpinnerContainer}>
                <span className="loading-spinner" style={COMPONENT_STYLES.loginForm.loadingSpinner}></span>
                Please wait...  
              </span>  
            ) : (  
              mode === 'signin' ? 'Sign In' : 'Create Account'  
            )}  
          </button>


          {/* Mode Toggle */}  
          <div style={COMPONENT_STYLES.loginForm.modeToggleContainer}>
            <button  
              type="button"  
              onClick={toggleMode}  
              disabled={loading}  
              style={{  
                ...FONTS.body,  
                background: 'none',  
                border: 'none',  
                color: COLORS.accent,  
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
                  e.currentTarget.style.backgroundColor = `${COLORS.accent}2A`;
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
                color: COLORS.black,
                borderColor: COLORS.black,
                opacity: loading ? 0.5 : 1,  
                cursor: loading ? 'not-allowed' : 'pointer'  
              }}  
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = COLORS.gray100;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
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