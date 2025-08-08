// src/components/CommentForm.tsx
import React, { useState } from 'react';

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

  const isDisabled = !commentText.trim() || isLoading;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={4}
        className={`
          w-full p-3 border-2 rounded-md transition-all duration-200
          bg-white text-text resize-y min-h-[100px] mb-4
          focus:outline-none focus:ring-2
          ${isFocused ? 'border-accent ring-accent/50' : 'border-gray-200'}
        `}
        disabled={isLoading}
        autoFocus
      />
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-3 rounded-lg border-2 border-primary text-primary bg-white hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isDisabled}
          className="px-6 py-3 rounded-lg border-2 border-black text-white bg-primary hover:bg-primaryHover transition-colors disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;