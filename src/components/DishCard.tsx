// src/components/DishCard.tsx  
import React, { useEffect, useRef, useState } from 'react';
import { COLORS, FONTS, STYLES } from '../constants';
import type { DishRating, DishWithDetails } from '../hooks/useDishes';
import CommentForm from './CommentForm';

interface DishCardProps {  
  dish: DishWithDetails;  
  currentUserId: string | null;  
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
  readonly?: boolean;  
  variant?: 'personal' | 'community';  
  size?: 'sm' | 'md' | 'lg';  
}> = ({ rating, onRatingChange, readonly = false, variant = 'personal', size = 'md' }) => {  
  const sizeMap = {  
    sm: '0.9rem',  
    md: '1.2rem',  
    lg: '1.4rem'  
  };  
   
  const colorMap = {  
    personal: { filled: COLORS.star, empty: COLORS.starEmpty },  
    community: { filled: COLORS.starCommunity, empty: COLORS.starCommunityEmpty }  
  };

  return (  
    <div className="flex gap-px">  
      {[1, 2, 3, 4, 5].map((star) => (  
        <button    
          key={star}    
          onClick={() => !readonly && onRatingChange?.(star)}    
          disabled={readonly}    
          className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-105 focus:outline-none'}`}    
          style={{    
            color: star <= rating ? colorMap[variant].filled : colorMap[variant].empty,    
            background: 'none',    
            border: 'none',    
            padding: '0 1px',    
            fontSize: sizeMap[size],  
            lineHeight: '1'    
          }}    
          aria-label={readonly ? `${rating} of 5 stars` : `Rate ${star} of 5 stars`}    
        >    
          ★    
        </button>    
      ))}  
    </div>  
  );  
};

const RatingBreakdown: React.FC<{  
  personalRating: number | null;  
  communityAverage: number;  
  totalRatings: number;  
  onUpdatePersonalRating: (rating: number) => void;  
}> = ({ personalRating, communityAverage, totalRatings, onUpdatePersonalRating }) => (  
  <div className="space-y-3">  
    <div className="bg-white/5 p-3 rounded-lg">  
      <div className="flex items-center justify-between mb-2">  
        <span style={{...FONTS.elegant, fontSize: '0.85rem', color: COLORS.text, fontWeight: '500'}}>  
          Your Rating  
        </span>  
        {personalRating && (  
          <span style={{...FONTS.elegant, fontSize: '0.75rem', color: COLORS.text, opacity: 0.7}}>  
            {personalRating}/5  
          </span>  
        )}  
      </div>  
      <div className="flex items-center gap-2">  
        <StarRating  
          rating={personalRating || 0}  
          onRatingChange={onUpdatePersonalRating}  
          variant="personal"  
          size="md"  
        />  
        {!personalRating && (  
          <span style={{...FONTS.elegant, fontSize: '0.75rem', color: COLORS.text, opacity: 0.6}}>  
            Tap to rate  
          </span>  
        )}  
      </div>  
    </div>

    <div className="bg-white/5 p-3 rounded-lg">  
      <div className="flex items-center justify-between mb-2">  
        <span style={{...FONTS.elegant, fontSize: '0.85rem', color: COLORS.text, fontWeight: '500'}}>  
          Community Average  
        </span>  
        <span style={{...FONTS.elegant, fontSize: '0.75rem', color: COLORS.text, opacity: 0.7}}>  
          {communityAverage.toFixed(1)}/5 • {totalRatings} rating{totalRatings !== 1 ? 's' : ''}  
        </span>  
      </div>  
      <div className="flex items-center gap-2">  
        <StarRating  
          rating={communityAverage}  
          readonly={true}  
          variant="community"  
          size="md"  
        />  
      </div>  
    </div>  
  </div>  
);

const DishHeader: React.FC<{  
  name: string;  
  dateAdded: string;  
  onDelete: () => void;  
  personalRating: number | null;  
  communityAverage: number;  
  totalRatings: number;  
  onUpdateRating: (rating: number) => void;  
}> = ({ name, dateAdded, onDelete, personalRating, communityAverage, totalRatings, onUpdateRating }) => (  
  <div className="mb-4">  
    <div className="flex items-start justify-between mb-3">  
      <div className="flex-1 min-w-0 pr-6">  
        <h3    
          style={{    
            ...FONTS.elegant,    
            fontWeight: '500',    
            color: COLORS.text,    
            fontSize: '1.1rem',  
            lineHeight: '1.3',    
            margin: 0,    
            wordWrap: 'break-word',    
            hyphens: 'auto'    
          }}    
          className="break-words"    
        >    
          {name}    
        </h3>    
        <p className="text-xs mt-1" style={{...FONTS.elegant, color: COLORS.text, opacity: 0.5, lineHeight: '1.3', fontSize: '0.7rem' }}>    
          Added {new Date(dateAdded).toLocaleDateString()}    
        </p>  
      </div>    
      <div className="ml-4">    
        <button    
          onClick={onDelete}    
          className="p-1.5 rounded-full hover:bg-red-500/20 transition-colors focus:outline-none flex-shrink-0"    
          aria-label={`Delete ${name}`}    
          style={{ color: COLORS.text }}    
          onMouseEnter={(e) => e.currentTarget.style.color = COLORS.danger}    
          onMouseLeave={(e) => e.currentTarget.style.color = COLORS.text}    
        >    
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>    
        </button>    
      </div>    
    </div>  
     
    <RatingBreakdown  
      personalRating={personalRating}  
      communityAverage={communityAverage}  
      totalRatings={totalRatings}  
      onUpdatePersonalRating={onUpdateRating}  
    />  
  </div>    
);

const getUserPersonalRating = (dishRatings: DishRating[], userId: string | null): number | null => {  
  if (!userId) return null;  
  const userRating = dishRatings.find(rating => rating.user_id === userId);  
  return userRating ? userRating.rating : null;  
};

const DishCard: React.FC<DishCardProps> = ({  
  dish,  
  currentUserId,  
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
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const personalRating = getUserPersonalRating(dish.dish_ratings, currentUserId);

  const handleDeleteDish = () => {  
    if (window.confirm('Are you sure you want to delete this dish and all its comments?')) {  
      onDelete(dish.id);  
    }  
  };

  const handleAddCommentInternal = async (text: string) => {  
    await onAddComment(dish.id, text);  
    setShowAddCommentForm(false);  
    setShowComments(true);  
  };

  const handleUpdateCommentInternal = async (commentId: string, text: string) => {  
    await onUpdateComment(commentId, dish.id, text);  
    setEditingComment(null);  
    setOpenActionMenuCommentId(null);  
  };

  const handleDeleteCommentInternal = async (commentId: string) => {  
    if (window.confirm('Are you sure you want to delete this comment?')) {  
      await onDeleteComment(dish.id, commentId);  
      setOpenActionMenuCommentId(null);  
    }  
  };

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
    <div className="bg-white/5 backdrop-blur-sm p-5 rounded-lg hover:bg-white/10 transition-colors">  
      <DishHeader    
        name={dish.name}  
        dateAdded={dish.dateAdded}  
        onDelete={handleDeleteDish}  
        personalRating={personalRating}  
        communityAverage={dish.average_rating}  
        totalRatings={dish.total_ratings}  
        onUpdateRating={(rating) => onUpdateRating(dish.id, rating)}  
      />

      <div className="flex gap-2 mt-3 mb-4">  
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

      <div className="flex justify-end gap-2 mb-3">  
        {!showAddCommentForm && !editingComment && (  
          <button  
            onClick={() => setShowAddCommentForm(!showAddCommentForm)}  
            className="flex items-center gap-1.5 text-sm py-2 px-3 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none"  
            style={{  
              ...STYLES.addButton,  
              fontSize: '0.875rem',  
              padding: '8px 12px'  
            }}  
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonHover}  
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.addButtonBg}  
          >  
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">  
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>  
            </svg>  
            Add Comment  
          </button>  
        )}  
         
        {dish.dish_comments.length > 0 && !editingComment && (  
          <button  
            onClick={() => setShowComments(!showComments)}  
            className="text-sm py-2 px-3 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none"  
            style={{  
              ...FONTS.elegant,  
              fontWeight: '500',  
              fontSize: '0.875rem',  
              padding: '8px 12px',  
              backgroundColor: COLORS.viewCommentsBg,  
              color: COLORS.textWhite,  
              border: 'none',  
              borderRadius: '12px',  
              cursor: 'pointer',  
              transition: 'all 0.3s ease'  
            }}  
            onMouseEnter={(e) => {  
              e.currentTarget.style.backgroundColor = '#5b6574';  
            }}  
            onMouseLeave={(e) => {  
              e.currentTarget.style.backgroundColor = COLORS.viewCommentsBg;  
            }}  
          >  
            {showComments ? 'Hide Comments' : `View Comments (${dish.dish_comments.length})`}  
          </button>  
        )}  
      </div>

      <div className="space-y-3">  
        {showAddCommentForm && (  
          <CommentForm  
            onSubmit={handleAddCommentInternal}  
            onCancel={() => setShowAddCommentForm(false)}  
            isLoading={isSubmittingComment}  
          />  
        )}  
           
        {showComments && dish.dish_comments && dish.dish_comments.length > 0 && (  
          <div className="space-y-3">  
            {dish.dish_comments.map(comment => (  
              <div key={comment.id} className="bg-white/5 p-3 rounded-lg">  
                {editingComment?.id === comment.id ? (  
                  <CommentForm  
                    initialText={editingComment.currentText}  
                    onSubmit={(text) => handleUpdateCommentInternal(comment.id, text)}  
                    onCancel={() => setEditingComment(null)}  
                    isLoading={isSubmittingComment}  
                    submitButtonText="Update Comment"  
                  />  
                ) : (  
                  <div className="flex justify-between items-start">  
                    <div className="flex-grow mr-2 min-w-0">  
                      <p style={{...FONTS.elegant, fontSize: '0.875rem', color: COLORS.text, lineHeight: '1.5'}} className="break-words">  
                        {comment.comment_text}  
                      </p>  
                      <p style={{...FONTS.elegant, fontSize: '0.75rem', color: COLORS.text, opacity: 0.6, marginTop: '6px' }}>  
                        <span style={{ fontWeight: '500', opacity: 0.8 }}>{comment.commenter_name || 'Anonymous'}</span> • {new Date(comment.created_at).toLocaleDateString()}  
                        {comment.updated_at !== comment.created_at && ` (edited ${new Date(comment.updated_at).toLocaleDateString()})`}  
                      </p>  
                    </div>  
                    {currentUserId && comment.user_id === currentUserId && (  
                      <div className="relative flex-shrink-0">  
                        <button  
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuCommentId(openActionMenuCommentId === comment.id ? null : comment.id); }}  
                          className="p-1.5 rounded-full hover:bg-white/20 focus:outline-none"  
                          aria-label="Comment actions"  
                          style={{ color: COLORS.text }}  
                        >  
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"/></svg>  
                        </button>  
                        {openActionMenuCommentId === comment.id && (  
                          <div ref={actionMenuRef} className="absolute bottom-full mb-1 w-32 bg-white rounded-md shadow-lg z-20 border" style={{ borderColor: COLORS.text + '30', background: COLORS.background, right: '0' }}>  
                            <button onClick={() => setEditingComment({ id: comment.id, currentText: comment.comment_text })} className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10 rounded-t-md" style={{...FONTS.elegant, color: COLORS.text}}>Edit</button>  
                            <button onClick={() => handleDeleteCommentInternal(comment.id)} className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10 rounded-b-md" style={{...FONTS.elegant, color: COLORS.danger}}>Delete</button>  
                          </div>  
                        )}  
                      </div>  
                    )}  
                  </div>  
                )}  
              </div>  
            ))}  
          </div>  
        )}  
      </div>  
    </div>  
  );  
};

export default DishCard;