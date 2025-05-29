// src/components/CommentForm.tsx
import React, { useState } from 'react';
import { COLORS, FONTS, STYLES } from '../constants'; // Adjust path if necessary

interface CommentFormProps {
  initialText?: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  placeholder?: string;
  submitButtonText?: string;
  isLoading?: boolean; // To disable form while submitting
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
      // Optionally clear form after submit, or parent component can handle this
      // setCommentText(''); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 py-2">
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-white/30 outline-none focus:ring-2 focus:ring-white/50 text-gray-800"
        style={{
          background: 'white',
          fontSize: '0.9rem',
          ...FONTS.elegant,
          color: COLORS.textDark,
        }}
        disabled={isLoading}
        autoFocus
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!commentText.trim() || isLoading}
          className="flex-1 py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50"
          style={{
            ...STYLES.formButton, // Ensure STYLES.formButton is suitable or create a new one
            background: (!commentText.trim() || isLoading) ? COLORS.disabled : COLORS.success,
            fontSize: '0.9rem', // Adjusted font size
          }}
          onMouseEnter={(e) => { if (commentText.trim() && !isLoading) e.currentTarget.style.background = COLORS.successHover; }}
          onMouseLeave={(e) => { if (commentText.trim() && !isLoading) e.currentTarget.style.background = COLORS.success; }}
        >
          {isLoading ? 'Saving...' : submitButtonText}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60"
          style={{
            ...STYLES.secondaryButton, // Ensure STYLES.secondaryButton is suitable
            fontSize: '0.9rem', // Adjusted font size
          }}
          onMouseEnter={(e) => { if(!isLoading) e.currentTarget.style.background = COLORS.secondaryHover; }}
          onMouseLeave={(e) => { if(!isLoading) e.currentTarget.style.background = COLORS.secondary; }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CommentForm;