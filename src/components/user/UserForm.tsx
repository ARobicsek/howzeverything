// src/components/user/UserForm.tsx
import React, { useState, useEffect } from 'react'
import { COLORS, FONTS } from '../../constants'
import { useAuth } from '../../hooks/useAuth'

interface UserFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const UserForm: React.FC<UserFormProps> = ({ onSuccess, onCancel }) => {
  const { profile, updateProfile, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    avatar_url: ''
  })
  const [validationError, setValidationError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with current profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile])

  const validateForm = (): boolean => {
    setValidationError('')
    clearError()

    if (!formData.full_name.trim()) {
      setValidationError('Full name is required')
      return false
    }

    if (formData.full_name.trim().length < 2) {
      setValidationError('Full name must be at least 2 characters')
      return false
    }

    if (formData.bio.length > 500) {
      setValidationError('Bio must be 500 characters or less')
      return false
    }

    if (formData.location.length > 100) {
      setValidationError('Location must be 100 characters or less')
      return false
    }

    // Basic URL validation for avatar
    if (formData.avatar_url && !isValidUrl(formData.avatar_url)) {
      setValidationError('Please enter a valid URL for the avatar image')
      return false
    }

    return true
  }

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const success = await updateProfile({
        full_name: formData.full_name.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        avatar_url: formData.avatar_url.trim() || null
      })

      if (success) {
        console.log('Profile updated successfully')
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (err) {
      console.error('Profile update error:', err)
    } finally {
      setIsSubmitting(false)
    }
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
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
            Edit Profile
          </h2>
          <p style={{
            ...FONTS.elegant,
            fontSize: '14px',
            color: COLORS.textDark,
            margin: 0
          }}>
            Update your profile information
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
          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              ...FONTS.elegant,
              fontSize: '14px',
              fontWeight: '500',
              color: COLORS.text,
              display: 'block',
              marginBottom: '6px'
            }}>
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={handleInputChange('full_name')}
              placeholder="Enter your full name"
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
              disabled={loading || isSubmitting}
              required
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              ...FONTS.elegant,
              fontSize: '14px',
              fontWeight: '500',
              color: COLORS.text,
              display: 'block',
              marginBottom: '6px'
            }}>
              Bio
              <span style={{ 
                fontWeight: '400', 
                color: COLORS.textDark,
                fontSize: '12px' 
              }}>
                {' '}({formData.bio.length}/500)
              </span>
            </label>
            <textarea
              value={formData.bio}
              onChange={handleInputChange('bio')}
              placeholder="Tell us a bit about yourself..."
              rows={3}
              maxLength={500}
              style={{
                ...FONTS.elegant,
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                boxSizing: 'border-box',
                resize: 'vertical',
                minHeight: '80px',
                WebkitAppearance: 'none'
              }}
              disabled={loading || isSubmitting}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              ...FONTS.elegant,
              fontSize: '14px',
              fontWeight: '500',
              color: COLORS.text,
              display: 'block',
              marginBottom: '6px'
            }}>
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={handleInputChange('location')}
              placeholder="e.g., Seattle, WA"
              maxLength={100}
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
              disabled={loading || isSubmitting}
            />
          </div>

          {/* Avatar URL */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              ...FONTS.elegant,
              fontSize: '14px',
              fontWeight: '500',
              color: COLORS.text,
              display: 'block',
              marginBottom: '6px'
            }}>
              Avatar Image URL
            </label>
            <input
              type="url"
              value={formData.avatar_url}
              onChange={handleInputChange('avatar_url')}
              placeholder="https://example.com/your-photo.jpg"
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
              disabled={loading || isSubmitting}
            />
            <p style={{
              ...FONTS.elegant,
              fontSize: '12px',
              color: COLORS.textDark,
              margin: '4px 0 0 0'
            }}>
              Enter a URL to an image for your profile picture
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column'
          }}>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              style={{
                ...FONTS.elegant,
                height: '50px',
                backgroundColor: (loading || isSubmitting) ? '#9CA3AF' : COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (loading || isSubmitting) ? 'not-allowed' : 'pointer',
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading || isSubmitting}
                style={{
                  ...FONTS.elegant,
                  height: '44px',
                  backgroundColor: 'transparent',
                  color: COLORS.textDark,
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: (loading || isSubmitting) ? 'not-allowed' : 'pointer',
                  WebkitAppearance: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm