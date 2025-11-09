// src/components/user/ForgotPasswordForm.tsx
import React, { useState } from 'react';
import { COMPONENT_STYLES, SPACING, STYLES, STYLE_FUNCTIONS } from '../../constants';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, onCancel }) => {
  const { theme } = useTheme();
  const { resetPasswordForEmail, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const success = await resetPasswordForEmail(email);
    setLoading(false);

    if (success) {
      setEmailSent(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 3000);
    }
  };

  const displayError = validationError || error;

  const getInputStyle = (fieldName: string) => ({
    ...STYLES.input,
    ...(focusedField === fieldName ? STYLES.inputFocus : {}),
    opacity: loading ? 0.5 : 1,
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

  const getCancelButtonStyle = () => ({
    ...STYLE_FUNCTIONS.getCancelButtonStyle(loading),
    ...(theme.colors.loginFormCancelColor && {
      color: theme.colors.loginFormCancelColor,
    }),
  });

  const getSuccessContainerStyle = () => ({
    padding: SPACING[4],
    backgroundColor: '#d1fae5',
    borderRadius: '8px',
    border: '1px solid #10b981',
    marginBottom: SPACING[4],
  });

  const getSuccessTextStyle = () => ({
    margin: 0,
    fontSize: '14px',
    color: '#065f46',
    lineHeight: '1.5',
  });

  return (
    <div style={STYLES.modalOverlay}>
      <div style={getContainerStyle()}>
        {/* Header */}
        <div style={COMPONENT_STYLES.loginForm.headerContainer}>
          <h2 style={getHeaderTitleStyle()}>
            Forgot Password
          </h2>
          <p style={getHeaderSubtitleStyle()}>
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Success Message */}
        {emailSent && (
          <div style={getSuccessContainerStyle()}>
            <p style={getSuccessTextStyle()}>
              Password reset email sent! Please check your inbox and follow the instructions to reset your password.
            </p>
          </div>
        )}

        {/* Error Display */}
        {displayError && !emailSent && (
          <div style={getErrorContainerStyle()}>
            <p style={getErrorTextStyle()}>
              {displayError}
            </p>
          </div>
        )}

        {/* Form */}
        {!emailSent && (
          <form onSubmit={handleSubmit}>
            <div style={COMPONENT_STYLES.loginForm.formFieldContainer}>
              <label style={getLabelStyle()}>
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
                autoFocus
              />
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
                  Sending email...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>

            {/* Cancel Button */}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                style={getCancelButtonStyle()}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = theme.colors.gray100;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Back to Login
              </button>
            )}
          </form>
        )}

        {/* Back to login link after success */}
        {emailSent && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={getCancelButtonStyle()}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.gray100;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
