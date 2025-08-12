// src/components/user/UserForm.tsx  
import React, { useEffect, useState } from 'react'
import { COLORS, COMPONENT_STYLES, FONTS } from '../../constants'
import { useAuth } from '../../hooks/useAuth'


interface UserFormProps {  
  onSuccess?: () => void  
  onCancel?: () => void  
}


const UserForm: React.FC<UserFormProps> = ({ onSuccess, onCancel }) => {  
  const { profile, updateProfile, loading, error, clearError } = useAuth()  
  const [formData, setFormData] = useState({  
    full_name: '',  
    avatar_url: ''  
  })  
  const [validationError, setValidationError] = useState('')  
  const [isSubmitting, setIsSubmitting] = useState(false)


  // Initialize form with current profile data  
  useEffect(() => {  
    if (profile) {  
      setFormData({  
        full_name: profile.full_name || '',  
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
    <div style={COMPONENT_STYLES.userForm.overlay}>
      <div style={COMPONENT_STYLES.userForm.content}>
        {/* Header */}  
        <div style={COMPONENT_STYLES.userForm.headerContainer}>
          <h2 style={COMPONENT_STYLES.userForm.headerTitle}>
            Edit Profile  
          </h2>  
          <p style={COMPONENT_STYLES.userForm.headerSubtitle}>
            Update your profile information  
          </p>  
        </div>


        {/* Error Display */}  
        {displayError && (  
          <div style={COMPONENT_STYLES.userForm.errorContainer}>
            <p style={COMPONENT_STYLES.userForm.errorText}>
              {displayError}  
            </p>  
          </div>  
        )}


        {/* Form */}  
        <form onSubmit={handleSubmit}>  
          {/* Full Name */}  
          <div style={COMPONENT_STYLES.userForm.formFieldContainer}>
            <label style={COMPONENT_STYLES.userForm.label}>
              Full Name *  
            </label>  
            <input  
              type="text"  
              value={formData.full_name}  
              onChange={handleInputChange('full_name')}  
              placeholder="Enter your full name"  
              style={COMPONENT_STYLES.userForm.input}
              disabled={loading || isSubmitting}  
              required  
            />  
          </div>


          {/* Avatar URL */}  
          <div style={COMPONENT_STYLES.userForm.formFieldContainerLargeMargin}>
            <label style={COMPONENT_STYLES.userForm.label}>
              Avatar Image URL  
            </label>  
            <input  
              type="url"  
              value={formData.avatar_url}  
              onChange={handleInputChange('avatar_url')}  
              placeholder="https://example.com/your-photo.jpg"  
              style={COMPONENT_STYLES.userForm.input}
              disabled={loading || isSubmitting}  
            />  
            <p style={COMPONENT_STYLES.userForm.avatarUrlHint}>
              Enter a URL to an image for your profile picture  
            </p>  
          </div>


          {/* Action Buttons */}  
          <div style={COMPONENT_STYLES.userForm.actionButtonsContainer}>
            <button  
              type="submit"  
              disabled={loading || isSubmitting}  
              style={{  
                ...COMPONENT_STYLES.userForm.submitButton,
                backgroundColor: (loading || isSubmitting) ? COLORS.gray300 : COLORS.primary, 
                cursor: (loading || isSubmitting) ? 'not-allowed' : 'pointer',  
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
                  ...COMPONENT_STYLES.userForm.cancelButton,
                  cursor: (loading || isSubmitting) ? 'not-allowed' : 'pointer',  
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