// src/components/user/ResetPasswordForm.tsx
import React, { useState } from 'react';
import { COMPONENT_STYLES, SPACING, STYLES, STYLE_FUNCTIONS } from '../../constants';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess }) => {
  const { theme } = useTheme();
  const { updatePassword, error, clearError } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    setValidationError('');
    clearError();

    if (!password) {
      setValidationError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const success = await updatePassword(password);
    setLoading(false);

    if (success && onSuccess) {
      onSuccess();
    }
  };

  const displayError = validationError || error;

  const getInputStyle = (fieldName: string) => ({
    ...STYLES.input,
    ...(focusedField === fieldName ? STYLES.inputFocus : {}),
    opacity: loading ? 0.5 : 1,
    paddingRight: '48px',
    ...(theme.colors.loginFormInputBackground && {
      backgroundColor: theme.colors.loginFormInputBackground,
    }),
    ...(theme.colors.loginFormInputBorder && {
      borderColor: theme.colors.loginFormInputBorder,
    }),
    ...(theme.colors.loginFormInputBoxShadow && {
      boxShadow: theme.colors.loginFormInputBoxShadow,
    }),
    ...(theme.colors.loginFormInputColor && {
      color: theme.colors.loginFormInputColor,
    }),
  });

  const getContainerStyle = () => ({
    ...COMPONENT_STYLES.loginForm.container,
    ...(theme.colors.loginFormContainer && {
      backgroundColor: theme.colors.loginFormContainer,
    }),
  });

  const getHeaderTitleStyle = () => ({
    ...COMPONENT_STYLES.loginForm.headerTitle,
    ...(theme.colors.loginFormHeaderTitleColor && {
      color: theme.colors.loginFormHeaderTitleColor,
    }),
    ...(theme.colors.loginFormHeaderTitleTextShadow && {
      textShadow: theme.colors.loginFormHeaderTitleTextShadow,
    }),
  });

  const getHeaderSubtitleStyle = () => ({
    ...COMPONENT_STYLES.loginForm.headerSubtitle,
    ...(theme.colors.loginFormHeaderSubtitleColor && {
      color: theme.colors.loginFormHeaderSubtitleColor,
    }),
  });

  const getErrorContainerStyle = () => ({
    ...COMPONENT_STYLES.loginForm.errorContainer,
    ...(theme.colors.loginFormErrorBackground && {
      backgroundColor: theme.colors.loginFormErrorBackground,
    }),
    ...(theme.colors.loginFormErrorBorder && {
      border: theme.colors.loginFormErrorBorder,
    }),
  });

  const getErrorTextStyle = () => ({
    ...COMPONENT_STYLES.loginForm.errorText,
    ...(theme.colors.loginFormErrorTextColor && {
      color: theme.colors.loginFormErrorTextColor,
    }),
  });

  const getLabelStyle = () => ({
    ...COMPONENT_STYLES.loginForm.label,
    ...(theme.colors.loginFormLabelColor && {
      color: theme.colors.loginFormLabelColor,
    }),
  });

  const getSubmitButtonStyle = () => ({
    ...STYLE_FUNCTIONS.getSubmitButtonStyle(loading),
    ...(theme.colors.loginFormSubmitButtonBackground && {
      backgroundColor: theme.colors.loginFormSubmitButtonBackground,
    }),
    ...(theme.colors.loginFormSubmitButtonTextColor && {
      color: theme.colors.loginFormSubmitButtonTextColor,
    }),
    ...(theme.colors.loginFormSubmitButtonBoxShadow && {
      boxShadow: theme.colors.loginFormSubmitButtonBoxShadow,
    }),
  });

  const getPasswordToggleButtonStyle = () => ({
    ...STYLE_FUNCTIONS.getPasswordToggleButtonStyle(loading),
    ...(theme.colors.loginFormPasswordToggleColor && {
      color: theme.colors.loginFormPasswordToggleColor,
    }),
  });

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
      <div style={getContainerStyle()}>
        {/* Header */}
        <div style={COMPONENT_STYLES.loginForm.headerContainer}>
          <h2 style={getHeaderTitleStyle()}>
            Reset Your Password
          </h2>
          <p style={getHeaderSubtitleStyle()}>
            Enter your new password below
          </p>
        </div>

        {/* Error Display */}
        {displayError && (
          <div style={getErrorContainerStyle()}>
            <p style={getErrorTextStyle()}>
              {displayError}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: SPACING[5] }}>
            <label style={getLabelStyle()}>
              New Password
            </label>
            <div style={COMPONENT_STYLES.loginForm.passwordInputContainer}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your new password"
                style={getInputStyle('password')}
                disabled={loading}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={getPasswordToggleButtonStyle()}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.color = theme.colors.gray500;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.colors.gray400;
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon isVisible={showPassword} />
              </button>
            </div>
          </div>

          <div style={{ marginBottom: SPACING[6] }}>
            <label style={getLabelStyle()}>
              Confirm New Password
            </label>
            <div style={COMPONENT_STYLES.loginForm.passwordInputContainer}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirm your new password"
                style={getInputStyle('confirmPassword')}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                style={getPasswordToggleButtonStyle()}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.color = theme.colors.gray500;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.colors.gray400;
                }}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                <EyeIcon isVisible={showConfirmPassword} />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={getSubmitButtonStyle()}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = theme.colors.loginFormSubmitButtonHoverBackground || theme.colors.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = theme.colors.loginFormSubmitButtonBackground || theme.colors.accent;
              }
            }}
          >
            {loading ? (
              <span style={COMPONENT_STYLES.loginForm.loadingSpinnerContainer}>
                <span className="loading-spinner" style={COMPONENT_STYLES.loginForm.loadingSpinner}></span>
                Resetting password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
