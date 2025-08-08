// src/components/CommentForm.tsx
import React, { useState } from 'react';
import { COLORS, SPACING, STYLES } from '../constants';

interface CommentFormProps {
  initialText?: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  placeholder?: string;
  submitButtonText?: string;
  isLoading?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  initialText = '',
  onSubmit,
  onCancel,
  placeholder = 'Write your comment...',
  submitButtonText = 'Save Comment',
  isLoading = false,
}) => {
  const [commentText, setCommentText] = useState(initialText);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onSubmit(commentText.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={4}
        style={{
          ...STYLES.input,
          ...(isFocused ? STYLES.inputFocus : {}),
          minHeight: '100px',
          resize: 'vertical',
          marginBottom: SPACING[4]
        }}
        disabled={isLoading}
        autoFocus
      />
      <div style={{
        display: 'flex',
        gap: SPACING[3],
        justifyContent: 'flex-end'
      }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            ...STYLES.secondaryButton,
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!commentText.trim() || isLoading}
          style={{
            ...STYLES.primaryButton,
            opacity: (!commentText.trim() || isLoading) ? 0.5 : 1,
            cursor: (!commentText.trim() || isLoading) ? 'not-allowed' : 'pointer',
            backgroundColor: (!commentText.trim() || isLoading) ? COLORS.gray300 : COLORS.primary,
            borderColor: (!commentText.trim() || isLoading) ? COLORS.gray300 : COLORS.black
          }}
          onMouseEnter={(e) => {
            if (commentText.trim() && !isLoading) {
              e.currentTarget.style.backgroundColor = COLORS.primaryHover;
            }
          }}
          onMouseLeave={(e) => {
            if (commentText.trim() && !isLoading) {
              e.currentTarget.style.backgroundColor = COLORS.primary;
            }
          }}
        >
          {isLoading ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;