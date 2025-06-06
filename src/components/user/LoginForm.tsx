// src/components/user/LoginForm.tsx
import React, { useState } from 'react'
import { COLORS, FONTS } from '../../constants'
import { useAuth } from '../../hooks/useAuth'

interface LoginFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onCancel }) => {
  const { signIn, signUp, loading, error, clearError } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [validationError, setValidationError] = useState('')

  const validateForm = (): boolean => {
    setValidationError('')
    clearError()

    if (!email.trim()) {
      setValidationError('Email is required')
      return false
    }

    if (!email.includes('@')) {
      setValidationError('Please enter a valid email address')
      return false
    }

    if (!password) {
      setValidationError('Password is required')
      return false
    }

    if (password.length < 4) {
      setValidationError('Password must be at least 4 characters')
      return false
    }

    if (mode === 'signup') {
      if (!username.trim()) {
        setValidationError('Username is required')
        return false
      }

      if (username.trim().length < 2) {
        setValidationError('Username must be at least 2 characters')
        return false
      }

      if (password !== confirmPassword) {
        setValidationError('Passwords do not match')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    let success = false

    if (mode === 'signin') {
      success = await signIn(email, password)
    } else {
      success = await signUp(email, password, username.trim())
    }

    if (success && onSuccess) {
      onSuccess()
    }
  }

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setValidationError('')
    clearError()
    setPassword('')
    setConfirmPassword('')
    setUsername('')
  }

  const displayError = validationError || error

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{
            ...FONTS.elegant,
            fontSize: '24px',
            fontWeight: '600',
            color: COLORS.text,
            margin: '0 0 8px 0'
          }}>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p style={{
            ...FONTS.elegant,
            fontSize: '14px',
            color: COLORS.textDark,
            margin: 0
          }}>
            {mode === 'signin' 
              ? 'Welcome back! Please sign in to continue.' 
              : 'Join Howzeverything to start rating dishes!'}
          </p>
        </div>

        {/* Error Display */}
        {displayError && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{
              ...FONTS.elegant,
              fontSize: '14px',
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
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                ...FONTS.elegant,
                fontSize: '14px',
                fontWeight: '500',
                color: COLORS.text,
                display: 'block',
                marginBottom: '6px'
              }}>
                Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                style={{
                  ...FONTS.elegant,
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none'
                }}
                disabled={loading}
              />
              <p style={{
                ...FONTS.elegant,
                fontSize: '12px',
                color: COLORS.textDark,
                margin: '4px 0 0 0'
              }}>
                This name will be visible to other users
              </p>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              ...FONTS.elegant,
              fontSize: '14px',
              fontWeight: '500',
              color: COLORS.text,
              display: 'block',
              marginBottom: '6px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                ...FONTS.elegant,
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                boxSizing: 'border-box',
                WebkitAppearance: 'none'
              }}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: mode === 'signup' ? '16px' : '24px' }}>
            <label style={{
              ...FONTS.elegant,
              fontSize: '14px',
              fontWeight: '500',
              color: COLORS.text,
              display: 'block',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                ...FONTS.elegant,
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                boxSizing: 'border-box',
                WebkitAppearance: 'none'
              }}
              disabled={loading}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'signup' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                ...FONTS.elegant,
                fontSize: '14px',
                fontWeight: '500',
                color: COLORS.text,
                display: 'block',
                marginBottom: '6px'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                style={{
                  ...FONTS.elegant,
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                  WebkitAppearance: 'none'
                }}
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
              ...FONTS.elegant,
              width: '100%',
              height: '50px',
              backgroundColor: loading ? '#9CA3AF' : COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>

          {/* Mode Toggle */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              style={{
                ...FONTS.elegant,
                background: 'none',
                border: 'none',
                color: COLORS.primary,
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                textDecoration: 'underline',
                WebkitAppearance: 'none'
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
                ...FONTS.elegant,
                width: '100%',
                height: '44px',
                backgroundColor: 'transparent',
                color: COLORS.textDark,
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

export default LoginForm