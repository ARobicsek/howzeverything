// Updated CommentForm with fixed overflow and responsive constraints + Modal Button Styling
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
        className="w-full max-w-full box-border px-3 py-2 rounded-lg border border-white/30 outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"  
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
        {/* Submit button - Blue background with white text and black border */}  
        <button  
          type="submit"  
          disabled={!commentText.trim() || isLoading}  
          className="flex-1 py-2 px-4 border border-black transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"  
          style={{  
            backgroundColor: (!commentText.trim() || isLoading) ? COLORS.disabled : '#3B82F6', // Blue background
            color: COLORS.textWhite, // White text
            ...FONTS.elegant,  
            fontWeight: '500',  
            fontSize: '0.9rem'  
          }}  
          onMouseEnter={(e) => {  
            if (commentText.trim() && !isLoading) {  
              e.currentTarget.style.backgroundColor = '#2563EB'; // Darker blue on hover
            }  
          }}  
          onMouseLeave={(e) => {  
            if (commentText.trim() && !isLoading) {  
              e.currentTarget.style.backgroundColor = '#3B82F6'; // Back to blue
            }  
          }}  
        >  
          {isLoading ? 'Saving...' : submitButtonText}  
        </button>  
         
        {/* Cancel button - White background with black text and black border */}  
        <button  
          type="button"  
          onClick={onCancel}  
          disabled={isLoading}  
          className="flex-1 py-2 px-4 border border-black transition-colors focus:outline-none disabled:opacity-50"  
          style={{  
            backgroundColor: 'white', // White background
            color: COLORS.textDark, // Black text
            ...FONTS.elegant,  
            fontWeight: '500',  
            fontSize: '0.9rem'  
          }}  
          onMouseEnter={(e) => {  
            if (!isLoading) {  
              e.currentTarget.style.backgroundColor = '#f3f4f6'; // Light gray on hover
            }  
          }}  
          onMouseLeave={(e) => {  
            if (!isLoading) {  
              e.currentTarget.style.backgroundColor = 'white'; // Back to white
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