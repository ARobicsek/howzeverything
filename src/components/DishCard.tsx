// src/components/DishCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { COLORS, FONTS } from '../constants';
import type { DishPhoto, DishRating, DishWithDetails } from '../hooks/useDishes';
import CommentForm from './CommentForm';
import PhotoCarousel from './PhotoCarousel';
import PhotoModal from './PhotoModal';
import PhotoUpload from './PhotoUpload';


interface DishCardProps {
  dish: DishWithDetails | null; // MODIFIED: Allow dish to be null
  currentUserId: string | null;
  onDelete: (dishId: string) => void;
  onUpdateRating: (dishId: string, rating: number) => void;
  onUpdateDishName?: (dishId: string, newName: string) => Promise<boolean>;
  onAddComment: (dishId: string, text: string) => Promise<void>;
  onUpdateComment: (commentId: string, dishId: string, text: string) => Promise<void>;
  onDeleteComment: (dishId: string, commentId: string) => Promise<void>;
  onAddPhoto: (dishId: string, file: File, caption?: string) => Promise<void>;
  onDeletePhoto: (dishId: string, photoId: string) => Promise<void>;
  isSubmittingComment: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}


const StarRating: React.FC<{
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  variant?: 'personal' | 'community';
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
}> = ({ rating, onRatingChange, readonly = false, variant = 'personal', size = 'md', showClearButton = false }) => {
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
    <div className="flex items-center gap-px">
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
      {/* Clear rating button */}
      {!readonly && showClearButton && rating > 0 && (
        <button
          onClick={() => onRatingChange?.(0)}
          className="ml-2 text-xs hover:opacity-80 transition-opacity focus:outline-none"
          style={{ color: COLORS.danger }}
          aria-label="Clear rating"
        >
          Clear
        </button>
      )}
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
            showClearButton={true}
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
  createdBy: string;
  currentUserId: string | null;
  onDelete: () => void;
  onToggleActionMenu: () => void;
  onToggleEditMode: () => void;
  isMenuOpen: boolean;
  isEditing?: boolean;
  onEditName?: (newName: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}> = ({
  name,
  dateAdded,
  createdBy,
  currentUserId,
  onDelete,
  onToggleActionMenu,
  onToggleEditMode,
  isMenuOpen,
  isEditing = false,
  onEditName,
  onSaveEdit,
  onCancelEdit
}) => {
  const [editedName, setEditedName] = useState(name);


  useEffect(() => {
    setEditedName(name);
  }, [name]);


  return (
    <div className="mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2 sm:pr-6">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 px-2 py-1 rounded border border-white/30 bg-white/10"
                style={{
                  ...FONTS.elegant,
                  color: COLORS.text,
                  fontSize: '1.1rem'
                }}
                autoFocus
              />
              <button
                onClick={() => {
                  onEditName?.(editedName);
                  onSaveEdit?.();
                }}
                className="px-2 py-1 rounded bg-green-500 text-white text-sm"
              >
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="px-2 py-1 rounded bg-gray-500 text-white text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
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
          )}
          <p className="text-xs" style={{...FONTS.elegant, color: COLORS.text, opacity: 0.5, lineHeight: '1.3', fontSize: '0.7rem', marginTop: '-2px' }}>
            Added {new Date(dateAdded).toLocaleDateString()}
          </p>
        </div>
       
        {/* Action buttons container */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" style={{ marginTop: '4px' }}>
          {/* Edit button - only show if user created the dish */}
          {!isEditing && currentUserId && createdBy === currentUserId && (
            <button
              onClick={onToggleEditMode}
              className="p-2 rounded-full transition-colors focus:outline-none"
              style={{
                backgroundColor: '#000000',
                color: COLORS.textWhite,
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Edit dish name"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          )}


          {/* Plus button for add menu */}
          <button
            onClick={onToggleActionMenu}
            className="p-2 rounded-full transition-all focus:outline-none"
            style={{
              backgroundColor: isMenuOpen ? '#3B82F6' : '#000000',
              color: COLORS.textWhite,
              minHeight: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Add content"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>


          {/* Delete button */}
          <button
            onClick={onDelete}
            className="p-2 rounded-full transition-colors focus:outline-none flex-shrink-0"
            aria-label={`Delete ${name}`}
            style={{
              backgroundColor: '#000000',
              color: COLORS.textWhite,
              minHeight: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
              e.currentTarget.style.color = COLORS.textWhite;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#000000';
              e.currentTarget.style.color = COLORS.textWhite;
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};


const CollapsedRatingDisplay: React.FC<{
  personalRating: number | null;
  communityAverage: number;
}> = ({ personalRating, communityAverage }) => (
  <div className="flex items-center gap-4" style={{...FONTS.elegant, fontSize: '0.9rem'}}>
    <span>
      You: <strong style={{ color: COLORS.star }}>{personalRating || '—'}</strong>
    </span>
    <span>
      Community: <strong style={{ color: COLORS.starCommunity }}>{communityAverage.toFixed(1)}</strong>
    </span>
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
  onUpdateDishName, // MODIFIED: Destructure onUpdateDishName here
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddPhoto,
  onDeletePhoto,
  isSubmittingComment,
  isExpanded,
  onToggleExpand
}) => {
  // MODIFIED: Add early return for null dish to prevent accessing properties of undefined
  if (!dish) {
    return null; // Render nothing if dish is null, or a placeholder/loading state
  }

  const [showComments, setShowComments] = useState(false);
  const [editingComment, setEditingComment] = useState<{ id: string; currentText: string } | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<{ photo: DishPhoto; index: number } | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);


  const personalRating = getUserPersonalRating(dish.dish_ratings, currentUserId);


  const handleDeleteDish = () => {
    if (window.confirm('Are you sure you want to delete this dish and all its comments?')) {
      onDelete(dish.id);
    }
  };


  const handleAddCommentInternal = async (text: string) => {
    await onAddComment(dish.id, text);
    setShowCommentModal(false);
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
      setShowPhotoOptions(false);
      setCapturedPhoto(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };


  const handleDeletePhoto = async (photoId: string) => {
    await onDeletePhoto(dish.id, photoId);
    if (dish.dish_photos.length <= 1) {
      setSelectedPhotoModal(null);
    }
  };


  // REMOVED: handleTakePhoto is no longer used as per session 40 summary
  /*
  const handleTakePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image /*';
    input.capture = 'environment';
   
    input.onchange = (event: any) => {
      const file = event.target.files?.[0];
      if (file) {
        setCapturedPhoto(file);
        setShowPhotoUpload(true);
        setShowPhotoOptions(false);
      }
    };
   
    input.click();
  };
  */


  const handleUploadPhoto = () => {
    setShowPhotoUpload(true);
    setShowPhotoOptions(false);
  };


  const handleToggleActionMenu = () => {
    setShowActionMenu(!showActionMenu);
    // Close any open modals when toggling the menu
    if (!showActionMenu) {
      setShowCommentModal(false);
      setShowPhotoOptions(false);
    }
  };


  const handleEditName = async (newName: string) => {
    if (onUpdateDishName) {
      const success = await onUpdateDishName(dish.id, newName);
      if (success) {
        setIsEditingName(false);
      }
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


  // Collapsed view
  if (!isExpanded) {
    return (
      <div
        className="bg-white/5 backdrop-blur-sm p-5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        onClick={onToggleExpand}
      >
        <h3
          style={{
            ...FONTS.elegant,
            fontWeight: '500',
            color: COLORS.text,
            fontSize: '1.1rem',
            lineHeight: '1.3',
            margin: 0,
            marginBottom: '8px'
          }}
          className="break-words"
        >
          {dish.name}
        </h3>
        <CollapsedRatingDisplay
          personalRating={personalRating}
          communityAverage={dish.average_rating}
        />
      </div>
    );
  }


  // Expanded view
  return (
    <>
      {/* Grey overlay when action menu or modals are open */}
      {(showActionMenu || showCommentModal || showPhotoOptions) && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => {
            setShowActionMenu(false);
            setShowCommentModal(false);
            setShowPhotoOptions(false);
          }}
        />
      )}
     
      <div className="bg-white/5 backdrop-blur-sm p-5 rounded-lg hover:bg-white/10 transition-colors relative">
        <DishHeader
          name={dish.name}
          dateAdded={dish.dateAdded}
          createdBy={dish.created_by}
          currentUserId={currentUserId}
          onDelete={handleDeleteDish}
          onToggleActionMenu={handleToggleActionMenu}
          onToggleEditMode={() => setIsEditingName(true)}
          isMenuOpen={showActionMenu}
          isEditing={isEditingName}
          onEditName={handleEditName}
          onSaveEdit={() => setIsEditingName(false)}
          onCancelEdit={() => setIsEditingName(false)}
        />


        {/* Horizontal action buttons */}
        {showActionMenu && (
          <div ref={actionMenuRef} className="absolute z-50 flex items-center gap-2" style={{ top: '20px', right: '100px' }}>
            {/* Comments button */}
            <button
              onClick={() => {
                setShowCommentModal(true);
                setShowActionMenu(false);
                setShowPhotoOptions(false);
              }}
              className="p-2 rounded-full transition-all focus:outline-none"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: COLORS.textWhite,
                minHeight: '32px',
                minWidth: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Add comment"
            >
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>+</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z"/>
                </svg>
              </div>
            </button>


            {/* Photo button */}
            <button
              onClick={() => {
                setShowPhotoOptions(true);
                setShowActionMenu(false);
                setShowCommentModal(false);
              }}
              className="p-2 rounded-full transition-all focus:outline-none"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: COLORS.textWhite,
                minHeight: '32px',
                minWidth: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Add photo"
            >
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>+</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z"/>
                </svg>
              </div>
            </button>
          </div>
        )}


        {/* Comment Modal */}
        {showCommentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-screen-sm p-6">
              <h3 style={{
                ...FONTS.elegant,
                fontSize: '1.2rem',
                fontWeight: '600',
                color: COLORS.textDark,
                marginBottom: '16px'
              }}>
                Add Comment about {dish.name}
              </h3>
              <CommentForm
                onSubmit={handleAddCommentInternal}
                onCancel={() => setShowCommentModal(false)}
                isLoading={isSubmittingComment}
              />
            </div>
          </div>
        )}


        {/* Photo Options Modal */}
        {showPhotoOptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-screen-sm p-6">
              <h3 style={{
                ...FONTS.elegant,
                fontSize: '1.2rem',
                fontWeight: '600',
                color: COLORS.textDark,
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Add Photo
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handleUploadPhoto}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  style={{
                    ...FONTS.elegant,
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Add Photo
                </button>
                <button
                  onClick={() => setShowPhotoOptions(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{
                    ...FONTS.elegant,
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        <RatingBreakdown
          personalRating={personalRating}
          communityAverage={dish.average_rating}
          totalRatings={dish.total_ratings}
          onUpdatePersonalRating={(rating) => onUpdateRating(dish.id, rating)}
        />


        {/* Photo Upload Form */}
        {showPhotoUpload && (
          <div className="mt-3">
            <PhotoUpload
              onUpload={handlePhotoUpload}
              onCancel={() => {
                setShowPhotoUpload(false);
                setCapturedPhoto(null);
              }}
              isUploading={isUploadingPhoto}
              initialFile={capturedPhoto || undefined}
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
    </>
  );
};


export default DishCard;