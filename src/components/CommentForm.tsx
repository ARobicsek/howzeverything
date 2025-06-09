// Updated CommentForm with fixed overflow and responsive constraints
// src/components/CommentForm.tsx
import React, { useState } from 'react';
import { COLORS, FONTS } from '../constants';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onSubmit(commentText.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 py-2 w-full max-w-full">
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full max-w-full box-border px-3 py-2 rounded-lg border border-white/30 outline-none focus:ring-2 focus:ring-white/50 resize-vertical"
        style={{
          background: 'white',
          fontSize: '0.9rem',
          ...FONTS.elegant,
          color: COLORS.textDark,
          minWidth: 0, // Allows shrinking below content width
        }}
        disabled={isLoading}
        autoFocus
      />
      <div className="flex gap-3 w-full max-w-full">
        {/* Save/Submit button with consistent add button styling (blue) */}
        <button
          type="submit"
          disabled={!commentText.trim() || isLoading}
          className="flex-1 py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50"
          style={{
            backgroundColor: (!commentText.trim() || isLoading) ? COLORS.disabled : COLORS.addButtonBg,
            color: COLORS.textWhite,
            border: 'none',
            ...FONTS.elegant,
            fontWeight: '500',
            fontSize: '0.9rem',
            padding: '8px 16px'
          }}
          onMouseEnter={(e) => {
            if (commentText.trim() && !isLoading) {
              e.currentTarget.style.backgroundColor = COLORS.addButtonHover;
            }
          }}
          onMouseLeave={(e) => {
            if (commentText.trim() && !isLoading) {
              e.currentTarget.style.backgroundColor = COLORS.addButtonBg;
            }
          }}
        >
          {isLoading ? 'Saving...' : submitButtonText}
        </button>
        
        {/* Cancel button with consistent secondary styling */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60"
          style={{
            backgroundColor: COLORS.viewCommentsBg,
            color: COLORS.textWhite,
            border: 'none',
            ...FONTS.elegant,
            fontWeight: '500',
            fontSize: '0.9rem',
            padding: '8px 16px'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#5b6574'; // Slightly lighter gray on hover
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = COLORS.viewCommentsBg;
            }
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CommentForm;