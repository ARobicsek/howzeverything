// src/components/CommentForm.tsx
import React, { useState } from 'react';
import { COMPONENT_STYLES, DESIGN_TOKENS } from '../constants';

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

  const dynamicSubmitStyle = {
    ...COMPONENT_STYLES.button.primary,
    opacity: (!commentText.trim() || isLoading) ? 0.5 : 1,
    cursor: (!commentText.trim() || isLoading) ? 'not-allowed' : 'pointer',
    backgroundColor: (!commentText.trim() || isLoading) ? DESIGN_TOKENS.colors.gray300 : DESIGN_TOKENS.colors.primary,
    borderColor: (!commentText.trim() || isLoading) ? DESIGN_TOKENS.colors.gray300 : DESIGN_TOKENS.colors.primary,
  };

  return (
    <form onSubmit={handleSubmit} style={COMPONENT_STYLES.forms.commentForm.form}>
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={4}
        style={{
          ...COMPONENT_STYLES.forms.commentForm.textarea,
          ...(isFocused ? { borderColor: DESIGN_TOKENS.colors.accent, boxShadow: '0 0 0 3px rgba(100, 46, 50, 0.25)' } : {}),
        }}
        disabled={isLoading}
        autoFocus
      />
      <div style={COMPONENT_STYLES.forms.commentForm.buttonContainer}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            ...COMPONENT_STYLES.button.secondary,
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!commentText.trim() || isLoading}
          style={dynamicSubmitStyle}
        >
          {isLoading ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;