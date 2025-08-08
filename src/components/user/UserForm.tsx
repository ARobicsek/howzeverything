// src/components/user/UserForm.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface UserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ onSuccess, onCancel }) => {
  const { profile, updateProfile, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({ full_name: '', avatar_url: '' });
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const validateForm = (): boolean => {
    setValidationError('');
    clearError();
    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      setValidationError('Full name must be at least 2 characters');
      return false;
    }
    if (formData.avatar_url && !isValidUrl(formData.avatar_url)) {
      setValidationError('Please enter a valid URL for the avatar image');
      return false;
    }
    return true;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const success = await updateProfile({
        full_name: formData.full_name.trim(),
        avatar_url: formData.avatar_url.trim() || null,
      });
      if (success && onSuccess) onSuccess();
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-[1000]">
      <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="mb-6 text-center">
          <h2 className="font-elegant text-2xl font-semibold text-text mb-2">Edit Profile</h2>
          <p className="font-elegant text-sm text-text">Update your profile information</p>
        </div>

        {displayError && (
          <div className="bg-red-100 border border-red-200 rounded-md p-3 mb-5">
            <p className="font-elegant text-sm text-danger m-0">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="font-elegant text-sm font-medium text-text block mb-1.5">Full Name *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={handleInputChange('full_name')}
              placeholder="Enter your full name"
              className="font-elegant w-full p-3 border border-gray-300 rounded-md text-base bg-white box-border appearance-none disabled:opacity-50"
              disabled={loading || isSubmitting}
              required
            />
          </div>

          <div className="mb-6">
            <label className="font-elegant text-sm font-medium text-text block mb-1.5">Avatar Image URL</label>
            <input
              type="url"
              value={formData.avatar_url}
              onChange={handleInputChange('avatar_url')}
              placeholder="https://example.com/your-photo.jpg"
              className="font-elegant w-full p-3 border border-gray-300 rounded-md text-base bg-white box-border appearance-none disabled:opacity-50"
              disabled={loading || isSubmitting}
            />
            <p className="font-elegant text-xs text-text m-1">Enter a URL to an image for your profile picture</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="font-elegant h-12 text-white border-none rounded-md text-base font-semibold cursor-pointer appearance-none tap-highlight-transparent disabled:bg-gray-300 disabled:cursor-not-allowed bg-primary hover:bg-primary-dark transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading || isSubmitting}
                className="font-elegant h-11 bg-transparent text-text border border-gray-300 rounded-md text-sm cursor-pointer appearance-none tap-highlight-transparent hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;