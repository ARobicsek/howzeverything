// src/components/DishCard.tsx  
import React, { useEffect, useRef, useState } from 'react';
import { COLORS, FONTS } from '../constants';
import type { DishPhoto, DishRating, DishWithDetails } from '../hooks/useDishes';
import CommentForm from './CommentForm';
import PhotoCarousel from './PhotoCarousel';
import PhotoModal from './PhotoModal';
import PhotoUpload from './PhotoUpload';

interface DishCardProps {  
  dish: DishWithDetails;  
  currentUserId: string | null;  
  onDelete: (dishId: string) => void;  
  onUpdateRating: (dishId: string, rating: number) => void;  
  onAddComment: (dishId: string, text: string) => Promise<void>;  
  onUpdateComment: (commentId: string, dishId: string, text: string) => Promise<void>;  
  onDeleteComment: (dishId: string, commentId: string) => Promise<void>;  
  onAddPhoto: (dishId: string, file: File, caption?: string) => Promise<void>;  
  onDeletePhoto: (dishId: string, photoId: string) => Promise<void>;  
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
    community: { filled: COLORS.starCommunity, empty: COLORS.starEmpty }  
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
  <div className="bg-white/5 p-3 rounded-lg">  
    {/* Horizontal layout with both ratings side by side */}  
    <div className="flex items-start gap-6">  
      {/* Personal Rating Section */}  
      <div className="flex-1 min-w-0">  
        <div className="mb-2">  
          <span style={{...FONTS.elegant, fontSize: '0.85rem', color: COLORS.text, fontWeight: '500'}}>  
            Your Rating  
          </span>  
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

      {/* Community Rating Section */}  
      <div className="flex-1 min-w-0">  
        <div className="mb-2">  
          <span style={{...FONTS.elegant, fontSize: '0.85rem', color: COLORS.text, fontWeight: '500'}}>  
            Community Average  
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
        {/* Community stats underneath the stars */}  
        <div className="mt-1">  
          <span style={{...FONTS.elegant, fontSize: '0.75rem', color: COLORS.text, opacity: 0.7}}>  
            {communityAverage.toFixed(1)}/5 • {totalRatings} rating{totalRatings !== 1 ? 's' : ''}  
          </span>  
        </div>  
      </div>  
    </div>  
  </div>  
);

const DishHeader: React.FC<{  
  name: string;  
  dateAdded: string;  
  onDelete: () => void;  
  onOpenActionMenu: () => void;  
}> = ({  
  name,  
  dateAdded,  
  onDelete,  
  onOpenActionMenu  
}) => (  
  <div className="mb-4">  
    <div className="flex items-start justify-between mb-3">  
      <div className="flex-1 min-w-0 pr-2 sm:pr-6">  
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
        <p className="text-xs" style={{...FONTS.elegant, color: COLORS.text, opacity: 0.5, lineHeight: '1.3', fontSize: '0.7rem', marginTop: '-2px' }}>  
          Added {new Date(dateAdded).toLocaleDateString()}  
        </p>  
      </div>  
       
      {/* Action buttons container */}  
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" style={{ marginTop: '4px' }}>  
        {/* Plus button for add menu */}  
        <button  
          onClick={onOpenActionMenu}  
          className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"  
          style={{ color: COLORS.text, minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}  
          aria-label="Add content"  
        >  
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">  
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>  
          </svg>  
        </button>

        {/* Delete button */}  
        <button  
          onClick={onDelete}  
          className="p-2 rounded-full hover:bg-red-500/20 transition-colors focus:outline-none flex-shrink-0"  
          aria-label={`Delete ${name}`}  
          style={{ color: COLORS.text, minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}  
          onMouseEnter={(e) => e.currentTarget.style.color = COLORS.danger}  
          onMouseLeave={(e) => e.currentTarget.style.color = COLORS.text}  
        >  
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">  
            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />  
          </svg>  
        </button>  
      </div>  
    </div>  
  </div>  
);

const CommentsAccordion: React.FC<{  
  comments: any[];  
  showComments: boolean;  
  onToggle: () => void;  
  currentUserId: string | null;  
  editingComment: { id: string; currentText: string } | null;  
  onEditComment: (comment: any) => void;  
  onUpdateComment: (commentId: string, text: string) => Promise<void>;  
  onDeleteComment: (commentId: string) => Promise<void>;  
  onCancelEdit: () => void;  
  isSubmittingComment: boolean;  
}> = ({  
  comments,  
  showComments,  
  onToggle,  
  currentUserId,  
  editingComment,  
  onEditComment,  
  onUpdateComment,  
  onDeleteComment,  
  onCancelEdit,  
  isSubmittingComment  
}) => {  
  const [openActionMenuCommentId, setOpenActionMenuCommentId] = useState<string | null>(null);  
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

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

  if (comments.length === 0) return null;

  return (  
    <div className="mt-4">  
      <button  
        onClick={onToggle}  
        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity focus:outline-none"  
        style={{...FONTS.elegant, color: COLORS.text, fontWeight: '500'}}  
      >  
        <span>Comments ({comments.length})</span>  
        <svg  
          width="16"  
          height="16"  
          viewBox="0 0 24 24"  
          fill="currentColor"  
          style={{  
            transform: showComments ? 'rotate(180deg)' : 'rotate(0deg)',  
            transition: 'transform 0.2s ease'  
          }}  
        >  
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>  
        </svg>  
      </button>

      {showComments && (  
        <div className="mt-3 space-y-3">  
          {comments.map((comment) => (  
            <div  
              key={comment.id}  
              className="bg-white/5 p-3 rounded-lg"  
            >  
              {editingComment?.id === comment.id ? (  
                <div className="w-full max-w-full overflow-hidden">  
                  <CommentForm  
                    initialText={editingComment?.currentText || ''}  
                    onSubmit={(text) => onUpdateComment(comment.id, text)}  
                    onCancel={onCancelEdit}  
                    isLoading={isSubmittingComment}  
                    submitButtonText="Update Comment"  
                  />  
                </div>  
              ) : (  
                <div className="flex justify-between items-start">  
                  <div className="flex-grow mr-2 min-w-0">  
                    <p style={{...FONTS.elegant, fontSize: '0.875rem', color: COLORS.text, lineHeight: '1.5', margin: 0}} className="break-words">  
                      {comment.comment_text}  
                    </p>  
                    <p style={{...FONTS.elegant, fontSize: '0.75rem', color: COLORS.text, opacity: 0.6, margin: 0, marginTop: '2px' }}>  
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">  
                          <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"/>  
                        </svg>  
                      </button>  
                      {openActionMenuCommentId === comment.id && (  
                        <div ref={actionMenuRef} className="absolute bottom-full mb-1 w-32 bg-white rounded-md shadow-lg z-20 border" style={{ borderColor: COLORS.text + '30', background: COLORS.background, right: '0' }}>  
                          <button onClick={() => { onEditComment(comment); setOpenActionMenuCommentId(null); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10 rounded-t-md" style={{...FONTS.elegant, color: COLORS.text}}>Edit</button>  
                          <button onClick={() => { onDeleteComment(comment.id); setOpenActionMenuCommentId(null); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10 rounded-b-md" style={{...FONTS.elegant, color: COLORS.danger}}>Delete</button>  
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
  );  
};

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
  onAddPhoto,  
  onDeletePhoto,  
  isSubmittingComment  
}) => {  
  const [showComments, setShowComments] = useState(false);  
  const [showAddCommentForm, setShowAddCommentForm] = useState(false);  
  const [editingComment, setEditingComment] = useState<{ id: string; currentText: string } | null>(null);  
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);  
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);  
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<{ photo: DishPhoto; index: number } | null>(null);  
  const [showActionMenu, setShowActionMenu] = useState(false);  
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
  };

  const handleDeleteCommentInternal = async (commentId: string) => {  
    if (window.confirm('Are you sure you want to delete this comment?')) {  
      await onDeleteComment(dish.id, commentId);  
    }  
  };

  const handlePhotoUpload = async (file: File, caption?: string) => {  
    setIsUploadingPhoto(true);  
    try {  
      await onAddPhoto(dish.id, file, caption);  
      setShowPhotoUpload(false);  
    } catch (error) {  
      console.error('Error uploading photo:', error);  
    } finally {  
      setIsUploadingPhoto(false);  
    }  
  };

  const handleDeletePhoto = async (photoId: string) => {  
    await onDeletePhoto(dish.id, photoId);  
    // If we deleted the last photo in the modal, close it  
    if (dish.dish_photos.length <= 1) {  
      setSelectedPhotoModal(null);  
    }  
  };

  useEffect(() => {  
    const handleClickOutside = (event: MouseEvent) => {  
      if (showActionMenu && actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {  
        setShowActionMenu(false);  
      }  
    };  
     
    if (showActionMenu) {  
      document.addEventListener('mousedown', handleClickOutside);  
    }  
     
    return () => {  
      document.removeEventListener('mousedown', handleClickOutside);  
    };  
  }, [showActionMenu]);

  return (  
    <div className="bg-white/5 backdrop-blur-sm p-5 rounded-lg hover:bg-white/10 transition-colors">  
      <DishHeader  
        name={dish.name}  
        dateAdded={dish.dateAdded}  
        onDelete={handleDeleteDish}  
        onOpenActionMenu={() => setShowActionMenu(!showActionMenu)}  
      />

      {/* Action Menu Dropdown */}  
      {showActionMenu && (  
        <div  
          ref={actionMenuRef}  
          className="absolute right-5 mt-2 w-40 bg-white rounded-md shadow-lg z-20 border"  
          style={{  
            borderColor: COLORS.text + '30',  
            background: 'white'  
          }}  
        >  
          <button  
            onClick={() => {  
              setShowAddCommentForm(true);  
              setShowActionMenu(false);  
            }}  
            className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 rounded-t-md"  
            style={{...FONTS.elegant, color: COLORS.textDark}}  
          >  
            Add Comment  
          </button>  
          <button  
            onClick={() => {  
              setShowPhotoUpload(true);  
              setShowActionMenu(false);  
            }}  
            className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 rounded-b-md"  
            style={{...FONTS.elegant, color: COLORS.textDark}}  
          >  
            Add Photo  
          </button>  
        </div>  
      )}

      <RatingBreakdown  
        personalRating={personalRating}  
        communityAverage={dish.average_rating}  
        totalRatings={dish.total_ratings}  
        onUpdatePersonalRating={(rating) => onUpdateRating(dish.id, rating)}  
      />

      {/* Add Comment Form */}  
      {showAddCommentForm && (  
        <div className="mt-3 w-full max-w-full overflow-hidden">  
          <CommentForm  
            onSubmit={handleAddCommentInternal}  
            onCancel={() => setShowAddCommentForm(false)}  
            isLoading={isSubmittingComment}  
          />  
        </div>  
      )}

      {/* Photo Upload Form */}  
      {showPhotoUpload && (  
        <div className="mt-3">  
          <PhotoUpload  
            onUpload={handlePhotoUpload}  
            onCancel={() => setShowPhotoUpload(false)}  
            isUploading={isUploadingPhoto}  
          />  
        </div>  
      )}

      {/* Photo Carousel - Only show if photos exist */}  
      {dish.dish_photos.length > 0 && (  
        <div className="mt-3">  
          <PhotoCarousel  
            photos={dish.dish_photos}  
            onPhotoClick={(photo, index) => setSelectedPhotoModal({ photo, index })}  
          />  
        </div>  
      )}

      {/* Comments Accordion */}  
      <CommentsAccordion  
        comments={dish.dish_comments}  
        showComments={showComments}  
        onToggle={() => setShowComments(!showComments)}  
        currentUserId={currentUserId}  
        editingComment={editingComment}  
        onEditComment={(comment) => setEditingComment({ id: comment.id, currentText: comment.comment_text })}  
        onUpdateComment={handleUpdateCommentInternal}  
        onDeleteComment={handleDeleteCommentInternal}  
        onCancelEdit={() => setEditingComment(null)}  
        isSubmittingComment={isSubmittingComment}  
      />

      {/* Photo Modal - Fixed null safety */}  
      {selectedPhotoModal && (  
        <PhotoModal  
          photos={dish.dish_photos}  
          initialIndex={selectedPhotoModal.index}  
          currentUserId={currentUserId}  
          onClose={() => setSelectedPhotoModal(null)}  
          onDelete={handleDeletePhoto}  
          onDoubleClickDelete={true}  
        />  
      )}  
    </div>  
  );  
};

export default DishCard;