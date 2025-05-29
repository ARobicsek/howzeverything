// src/components/DishCard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { COLORS, FONTS, STYLES } from '../constants';
import CommentForm from './CommentForm';

interface DishComment { 
  id: string; 
  comment_text: string; 
  created_at: string; 
  updated_at: string; 
}

interface DishWithComments {
  id: string;
  name: string;
  rating: number;
  dateAdded: string;
  restaurant_id: string;
  created_at: string;
  dish_comments: DishComment[];
}

interface DishCardProps {
  dish: DishWithComments;
  onDelete: (dishId: string) => void;
  onUpdateRating: (dishId: string, rating: number) => void;
  onAddComment: (dishId: string, text: string) => Promise<void>;
  onUpdateComment: (commentId: string, dishId: string, text: string) => Promise<void>;
  onDeleteComment: (dishId: string, commentId: string) => Promise<void>;
  isSubmittingComment: boolean;
}

const StarRating: React.FC<{ 
  rating: number; 
  onRatingChange?: (rating: number) => void; 
  readonly?: boolean 
}> = ({ rating, onRatingChange, readonly = false }) => (
  <div className="flex gap-px">
    {[1, 2, 3, 4, 5].map((star) => (
      <button 
        key={star} 
        onClick={() => !readonly && onRatingChange?.(star)} 
        disabled={readonly} 
        className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-105 focus:outline-none'}`} 
        style={{ 
          color: star <= rating ? COLORS.star : COLORS.starEmpty, 
          background: 'none', 
          border: 'none', 
          padding: '0 1px', 
          fontSize: '1.3rem', 
          lineHeight: '1' 
        }}
        aria-label={readonly ? `${rating} of 5 stars` : `Rate ${star} of 5 stars`} 
      > 
        ★ 
      </button> 
    ))}
  </div>
);

const DishHeader: React.FC<{
  name: string;
  rating: number;
  dateAdded: string;
  onDelete: () => void;
  onUpdateRating: (rating: number) => void;
}> = ({ name, rating, dateAdded, onDelete, onUpdateRating }) => (
  <>
    {/* FIXED: Trash icon positioned relative to text end */}
    <div className="flex items-center mb-px">
      <h3 
        style={{ 
          ...FONTS.elegant, 
          fontWeight: '500', 
          color: COLORS.text, 
          fontSize: '1.125rem', 
          lineHeight: '1.3',
          margin: 0,
          marginRight: '16px', // Space between text end and icon
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 'calc(100% - 40px)', // Leave space for icon
        }}
      >
        {name}
      </h3>
      <button
        onClick={onDelete}
        className="p-1.5 rounded-full hover:bg-red-500/20 transition-colors focus:outline-none flex-shrink-0"
        aria-label={`Delete ${name}`}
        style={{ color: COLORS.text }}
        onMouseEnter={(e) => e.currentTarget.style.color = COLORS.danger}
        onMouseLeave={(e) => e.currentTarget.style.color = COLORS.text}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      </button>
    </div>
    <div className="-ml-1">
      <StarRating rating={rating} onRatingChange={onUpdateRating} />
    </div>
    <p 
      className="text-xs mt-px" 
      style={{
        ...FONTS.elegant, 
        color: COLORS.text, 
        opacity: 0.6, 
        lineHeight: '1.3' 
      }}
    >
      {new Date(dateAdded).toLocaleDateString()}
    </p>
  </>
);

const PhotoPlaceholders: React.FC = () => (
  <div className="flex gap-2 mt-2">
    {[1, 2, 3].map(p => (
      <div 
        key={p} 
        className="w-16 h-16 bg-white/10 rounded-md border border-white/20 flex items-center justify-center flex-shrink-0"
      >
        <div style={{color: COLORS.text, opacity: 0.4}} className="text-xl">
          📷
        </div>
      </div>
    ))}
  </div>
);

const DishActions: React.FC<{
  dishId: string;
  hasComments: boolean;
  commentCount: number;
  showComments: boolean;
  showAddCommentForm: boolean;
  onToggleComments: () => void;
  onToggleAddComment: () => void;
  editingCommentDishId: string | null;
}> = ({ 
  dishId, 
  hasComments, 
  commentCount, 
  showComments, 
  showAddCommentForm, 
  onToggleComments, 
  onToggleAddComment,
  editingCommentDishId 
}) => (
  <div className="flex flex-col flex-shrink-0 w-44">
    {/* FIXED: Proper spacing between action buttons */}
    {!showAddCommentForm && editingCommentDishId !== dishId && (
      <div style={{ marginBottom: '8px' }}>
        <button
          onClick={onToggleAddComment}
          className="w-full flex items-center justify-center gap-1.5 text-sm py-2 px-3 rounded-xl transition-colors focus:outline-none focus:ring-1 focus:ring-white/50 shadow-md hover:shadow-lg"
          style={{
            ...FONTS.elegant,
            fontWeight: '400',
            color: COLORS.textWhite,
            ...STYLES.primaryButton,
            background: COLORS.primary,
            borderRadius: '0.75rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = COLORS.primaryHover}
          onMouseLeave={(e) => e.currentTarget.style.background = COLORS.primary}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Add Comment
        </button>
      </div>
    )}
    
    {hasComments && editingCommentDishId !== dishId && (
      <div>
        <button
          onClick={onToggleComments}
          className="w-full text-sm py-2 px-3 rounded-xl transition-colors focus:outline-none focus:ring-1 focus:ring-white/50 shadow-md hover:shadow-lg"
          style={{
            ...FONTS.elegant,
            fontWeight: '400',
            color: COLORS.textWhite,
            ...STYLES.primaryButton,
            background: showComments ? COLORS.primary : COLORS.viewCommentsBg,
            borderRadius: '0.75rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = showComments ? COLORS.primaryHover : COLORS.viewCommentsBgHover}
          onMouseLeave={(e) => e.currentTarget.style.background = showComments ? COLORS.primary : COLORS.viewCommentsBg}
        >
          {showComments ? 'Hide Comments' : `View (${commentCount})`}
        </button>
      </div>
    )}
  </div>
);

const CommentItem: React.FC<{
  comment: DishComment;
  dishId: string;
  isEditing: boolean;
  editingText: string;
  showActionMenu: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdateComment: (text: string) => Promise<void>;
  onDeleteComment: () => Promise<void>;
  onToggleActionMenu: () => void;
  isSubmitting: boolean;
  actionMenuRef: React.RefObject<HTMLDivElement>;
}> = ({
  comment,
  dishId,
  isEditing,
  editingText,
  showActionMenu,
  onStartEdit,
  onCancelEdit,
  onUpdateComment,
  onDeleteComment,
  onToggleActionMenu,
  isSubmitting,
  actionMenuRef
}) => (
  <div className="bg-white/5 p-3 rounded-lg">
    {isEditing ? (
      <CommentForm
        initialText={editingText}
        onSubmit={onUpdateComment}
        onCancel={onCancelEdit}
        isLoading={isSubmitting}
        submitButtonText="Update Comment"
      />
    ) : (
      <div className="flex justify-between items-start">
        <div className="flex-grow mr-2 min-w-0">
          <p 
            style={{
              ...FONTS.elegant, 
              fontSize: '0.875rem', 
              color: COLORS.text, 
              lineHeight: '1.5'
            }} 
            className="break-words"
          >
            {comment.comment_text}
          </p>
          <p 
            style={{
              ...FONTS.elegant, 
              fontSize: '0.75rem', 
              color: COLORS.text, 
              opacity: 0.6, 
              marginTop: '6px'
            }}
          >
            {new Date(comment.created_at).toLocaleDateString()}
            {comment.updated_at !== comment.created_at && 
              ` (edited ${new Date(comment.updated_at).toLocaleDateString()})`
            }
          </p>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActionMenu();
            }}
            className="p-1.5 rounded-full hover:bg-white/20 focus:outline-none"
            aria-label="Comment actions"
            style={{ color: COLORS.text }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"/>
            </svg>
          </button>
          {showActionMenu && (
            <div 
              ref={actionMenuRef}
              className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg z-20 border"
              style={{
                borderColor: COLORS.text + '30', 
                background: COLORS.background
              }}
            >
              <button
                onClick={onStartEdit}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10"
                style={{...FONTS.elegant, color: COLORS.text}}
              >
                Edit
              </button>
              <button
                onClick={onDeleteComment}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10"
                style={{...FONTS.elegant, color: COLORS.danger}}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

const DishCard: React.FC<DishCardProps> = ({
  dish,
  onDelete,
  onUpdateRating,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  isSubmittingComment
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);
  const [editingComment, setEditingComment] = useState<{ id: string; currentText: string } | null>(null);
  const [openActionMenuCommentId, setOpenActionMenuCommentId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const handleDeleteDish = () => {
    if (window.confirm('Are you sure you want to delete this dish and all its comments?')) {
      onDelete(dish.id);
    }
  };

  const handleAddComment = async (text: string) => {
    await onAddComment(dish.id, text);
    setShowAddCommentForm(false);
    setShowComments(true);
  };

  const handleUpdateComment = async (commentId: string, text: string) => {
    await onUpdateComment(commentId, dish.id, text);
    setEditingComment(null);
    setOpenActionMenuCommentId(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await onDeleteComment(dish.id, commentId);
      setOpenActionMenuCommentId(null);
    }
  };

  // Click outside handler for action menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionMenuCommentId && actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenuCommentId(null);
      }
    };
    
    if (openActionMenuCommentId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionMenuCommentId]);

  return (
    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start gap-x-3">
        <div className="flex-1 min-w-0">
          <DishHeader 
            name={dish.name}
            rating={dish.rating}
            dateAdded={dish.dateAdded}
            onDelete={handleDeleteDish}
            onUpdateRating={(rating) => onUpdateRating(dish.id, rating)}
          />
          <PhotoPlaceholders />
        </div>

        <DishActions
          dishId={dish.id}
          hasComments={dish.dish_comments.length > 0}
          commentCount={dish.dish_comments.length}
          showComments={showComments}
          showAddCommentForm={showAddCommentForm}
          onToggleComments={() => setShowComments(!showComments)}
          onToggleAddComment={() => setShowAddCommentForm(!showAddCommentForm)}
          editingCommentDishId={editingComment ? dish.id : null}
        />
      </div>

      <div className="mt-3 space-y-2">
        {showAddCommentForm && (
          <CommentForm
            onSubmit={handleAddComment}
            onCancel={() => setShowAddCommentForm(false)}
            isLoading={isSubmittingComment}
          />
        )}
        
        {showComments && dish.dish_comments && dish.dish_comments.length > 0 && (
          <div className="mt-2 space-y-3 pl-1">
            {dish.dish_comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                dishId={dish.id}
                isEditing={editingComment?.id === comment.id}
                editingText={editingComment?.currentText || ''}
                showActionMenu={openActionMenuCommentId === comment.id}
                onStartEdit={() => setEditingComment({ id: comment.id, currentText: comment.comment_text })}
                onCancelEdit={() => setEditingComment(null)}
                onUpdateComment={(text) => handleUpdateComment(comment.id, text)}
                onDeleteComment={() => handleDeleteComment(comment.id)}
                onToggleActionMenu={() => setOpenActionMenuCommentId(
                  openActionMenuCommentId === comment.id ? null : comment.id
                )}
                isSubmitting={isSubmittingComment}
                actionMenuRef={actionMenuRef}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DishCard;