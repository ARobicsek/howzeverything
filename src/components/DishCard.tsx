// src/components/DishCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { COLORS } from '../constants';
import type { DishComment, DishPhoto, DishRating, DishWithDetails } from '../hooks/useDishes';
import CommentForm from './CommentForm';
import PhotoCarousel from './PhotoCarousel';
import PhotoModal from './PhotoModal';
import PhotoUpload from './PhotoUpload';

interface DishCardProps {
  dish: DishWithDetails | null;
  currentUserId: string | null;
  onDelete: (dishId: string) => void;
  onUpdateRating: (dishId: string, rating: number) => void;
  onUpdateDishName?: (dishId: string, newName: string) => Promise<boolean>;
  onAddComment: (dishId: string, text: string) => Promise<void>;
  onUpdateComment: (commentId: string, dishId: string, text: string) => Promise<void>;
  onDeleteComment: (dishId: string, commentId: string) => Promise<void>;
  onAddPhoto: (dishId: string, file: File, caption?: string) => Promise<void>;
  onDeletePhoto: (dishId: string, photoId: string) => Promise<void>;
  onUpdatePhotoCaption: (photoId: string, caption: string) => Promise<void>;
  onShare: (dish: DishWithDetails) => void;
  isSubmittingComment: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const Star: React.FC<{
  type: 'full' | 'half' | 'empty';
  filledColor: string;
  emptyColor: string;
  size: string;
}> = ({ type, filledColor, emptyColor, size }) => {
  const starPath = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

  return (
    <div className="inline-block relative leading-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" className="absolute left-0 top-0">
        <path d={starPath} fill={emptyColor} />
      </svg>
      {type !== 'empty' &&
        <div className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: type === 'half' ? '50%' : '100%' }}>
          <svg width={size} height={size} viewBox="0 0 24 24" className="absolute left-0 top-0" style={{ width: size, height: size }}>
            <path d={starPath} fill={filledColor} />
          </svg>
        </div>
      }
    </div>
  );
};

const StarRating: React.FC<{
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  variant?: 'personal' | 'community';
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
}> = ({ rating, onRatingChange, readonly = false, variant = 'personal', size = 'md', showClearButton = false }) => {
  const sizeMap = { sm: '1rem', md: '1.25rem', lg: '1.5rem' };
  const colorMap = {
    personal: { filled: COLORS.accent, empty: COLORS.ratingEmpty },
    community: { filled: '#101010', empty: COLORS.ratingEmpty }
  };
  const roundedRating = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          let type: 'full' | 'half' | 'empty' = 'empty';
          if (roundedRating >= star) type = 'full';
          else if (roundedRating >= star - 0.5) type = 'half';

          return (
            <button
              key={star}
              onClick={(e) => { e.stopPropagation(); !readonly && onRatingChange?.(star); }}
              disabled={readonly}
              className={`transition-all duration-200 bg-transparent border-none p-0 leading-none ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
              aria-label={readonly ? `${rating} of 5 stars` : `Rate ${star} of 5 stars`}
            >
              <Star type={type} filledColor={colorMap[variant].filled} emptyColor={colorMap[variant].empty} size={sizeMap[size]} />
            </button>
          );
        })}
      </div>
      {!readonly && showClearButton && rating > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onRatingChange?.(0); }}
          className="bg-transparent border-none p-0 cursor-pointer text-textSecondary transition-all duration-200 ease-in-out flex items-center justify-center leading-none ml-1 hover:text-danger hover:scale-115"
          aria-label="Clear rating"
          title="Clear rating"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </button>
      )}
    </div>
  );
};

const RatingSummary: React.FC<{
  personalRating: number | null;
  communityAverage: number;
}> = ({ personalRating, communityAverage }) => (
  <div className="flex flex-col items-start gap-1">
    <div className="flex items-center gap-2">
      <span className="font-body text-sm text-textSecondary font-medium">Me:</span>
      <div className="flex items-center gap-1">
        <StarRating rating={personalRating || 0} readonly variant="personal" size="sm" />
        <span className="text-text font-medium text-sm">{personalRating || '—'}</span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-body text-sm text-textSecondary font-medium">Average:</span>
      <div className="flex items-center gap-1">
        <StarRating rating={communityAverage} readonly variant="community" size="sm" />
        <span className="text-text font-medium text-sm">{communityAverage.toFixed(1)}</span>
      </div>
    </div>
  </div>
);

const RatingBreakdown: React.FC<{
  personalRating: number | null;
  communityAverage: number;
  totalRatings: number;
  onUpdatePersonalRating: (rating: number) => void;
}> = ({ personalRating, communityAverage, totalRatings, onUpdatePersonalRating }) => (
  <div className="bg-gray-50 p-4 rounded-lg mt-4">
    <div className="flex gap-8 items-start">
      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <span className="font-body text-sm text-textSecondary font-medium">My Rating</span>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={personalRating || 0} onRatingChange={onUpdatePersonalRating} variant="personal" size="md" showClearButton={true} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <span className="font-body text-sm text-textSecondary font-medium">Average</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <StarRating rating={communityAverage} readonly={true} variant="community" size="md" />
          </div>
          <div className="mt-1">
            <span className="font-body text-xs text-textSecondary">
              {communityAverage.toFixed(1)}/5 • {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CommentsSection: React.FC<{
  comments: DishComment[];
  showComments: boolean;
  onToggle: () => void;
  currentUserId: string | null;
  editingComment: { id: string; currentText: string } | null;
  onEditComment: (comment: DishComment) => void;
  onUpdateComment: (commentId: string, text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onCancelEdit: () => void;
  isSubmittingComment: boolean;
}> = ({
  comments, showComments, onToggle, currentUserId, editingComment, onEditComment, onUpdateComment, onDeleteComment, onCancelEdit, isSubmittingComment
}) => {
  const [openActionMenuCommentId, setOpenActionMenuCommentId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionMenuCommentId && actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenuCommentId(null);
      }
    };
    if (openActionMenuCommentId) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenuCommentId]);

  if (comments.length === 0) return null;

  const menuButtonClasses = "flex items-center gap-2 w-full px-3 py-2 border-none bg-none cursor-pointer font-body text-sm text-left transition-colors duration-200 ease-in-out hover:bg-gray-50";

  return (
    <div className="mt-6">
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="bg-transparent border-none py-3 px-0 cursor-pointer flex items-center gap-2 font-body text-base text-text font-medium w-full text-left"
      >
        <span>Comments ({comments.length})</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={`transition-transform duration-200 ease-in-out text-gray-400 ${showComments ? 'rotate-180' : 'rotate-0'}`}>
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </button>

      {showComments && (
        <div className="mt-3 flex flex-col gap-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              onClick={editingComment?.id === comment.id ? (e) => e.stopPropagation() : (e) => { e.stopPropagation(); onToggle(); }}
              className={`bg-gray-50 p-4 rounded-lg ${editingComment?.id === comment.id ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {editingComment?.id === comment.id ? (
                <div className="w-full">
                  <CommentForm initialText={editingComment?.currentText || ''} onSubmit={(text) => onUpdateComment(comment.id, text)} onCancel={onCancelEdit} isLoading={isSubmittingComment} submitButtonText="Update Comment" />
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-body text-sm text-text m-0 break-words">{comment.comment_text}</p>
                    <p className="font-body text-xs text-textSecondary m-0 mt-1">
                      <span className="font-medium">{comment.commenter_name || 'Anonymous'}</span>
                      {' • '}
                      {new Date(comment.created_at).toLocaleDateString()}
                      {comment.updated_at !== comment.created_at && ` (edited ${new Date(comment.updated_at).toLocaleDateString()})`}
                    </p>
                  </div>
                  {currentUserId && comment.user_id === currentUserId && (
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setOpenActionMenuCommentId(openActionMenuCommentId === comment.id ? null : comment.id); }} className="p-2 -m-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Comment actions">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"/></svg>
                      </button>
                      {openActionMenuCommentId === comment.id && (
                        <div ref={actionMenuRef} className="absolute bottom-full right-0 mb-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-dropdown min-w-[120px]">
                          <button onClick={(e) => { e.stopPropagation(); onEditComment(comment); setOpenActionMenuCommentId(null); }} className={`${menuButtonClasses} text-text`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            Edit
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteComment(comment.id); setOpenActionMenuCommentId(null); }} className={`${menuButtonClasses} text-danger`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                            Delete
                          </button>
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

const getUserPersonalRating = (dishRatings: DishRating[] | undefined | null, userId: string | null): number | null => {
  if (!userId || !dishRatings) return null;
  const userRating = dishRatings.find(rating => rating.user_id === userId);
  return userRating ? userRating.rating : null;
};

const PortalModal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-overlay z-modal flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg border-2 border-black p-6 max-w-lg w-full max-h-[90vh] overflow-auto animate-slide-in" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

const DishCard: React.FC<DishCardProps> = ({
  dish, currentUserId, onDelete, onUpdateRating, onUpdateDishName, onAddComment, onUpdateComment, onDeleteComment, onAddPhoto, onDeletePhoto, onUpdatePhotoCaption, onShare, isSubmittingComment, isExpanded, onToggleExpand
}) => {
  if (!dish) return null;

  const [showComments, setShowComments] = useState(false);
  const [editingComment, setEditingComment] = useState<{ id: string; currentText: string } | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<{ photo: DishPhoto; index: number } | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedDishName, setEditedDishName] = useState(dish.name);
  const [selectedFileForUpload, setSelectedFileForUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const safeRatings = dish.ratings || [];
  const safePhotos = dish.photos || [];
  const safeComments = dish.comments || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const personalRating = getUserPersonalRating(safeRatings, currentUserId);
  const canModify = currentUserId && dish.created_by === currentUserId;

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsMenuOpen(false);
  };

  const handleDeleteDish = () => {
    if (window.confirm('Are you sure you want to delete this dish and all its comments?')) onDelete(dish.id);
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
    if (window.confirm('Are you sure you want to delete this comment?')) await onDeleteComment(dish.id, commentId);
  };

  const handleDirectPhotoUpload = () => fileInputRef.current?.click();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
      if (file.size > 10 * 1024 * 1024) { alert('File size must be less than 10MB'); return; }
      setSelectedFileForUpload(file);
      setShowPhotoUpload(true);
    }
  };

  const handlePhotoUpload = async (file: File, caption?: string) => {
    setIsUploadingPhoto(true);
    try {
      await onAddPhoto(dish.id, file, caption);
      setShowPhotoUpload(false);
      setSelectedFileForUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await onDeletePhoto(dish.id, photoId);
      if (safePhotos.length <= 1) setSelectedPhotoModal(null);
    } catch (error) {
      console.error("Failed to delete photo from DishCard:", error);
      alert("Failed to delete photo. Please try again.");
    }
  };

  const handleSaveDishName = async () => {
    if (onUpdateDishName && editedDishName.trim() && editedDishName.trim() !== dish.name) {
      const success = await onUpdateDishName(dish.id, editedDishName.trim());
      if (success) setIsEditingName(false);
    } else {
      setIsEditingName(false);
    }
  };

  const handleCardClick = () => {
    if (isMenuOpen) { setIsMenuOpen(false); return; }
    onToggleExpand();
  };

  if (!isExpanded) {
    return (
      <div
        id={`dish-card-${dish.id}`}
        className="bg-white p-5 rounded-lg border border-gray-200 cursor-pointer transition-all duration-300 ease-in-out hover:border-accent hover:shadow-medium"
        onClick={onToggleExpand}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-lg text-gray-900 m-0 mb-2">{dish.name}</h3>
            <RatingSummary personalRating={personalRating} communityAverage={dish.average_rating} />
          </div>
          <div className="flex items-center gap-3">
            {safePhotos.length > 0 && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img src={safePhotos[0].url} alt="Dish photo" className="w-full h-full object-cover" />
              </div>
            )}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const menuButtonClasses = "flex items-center gap-2 w-full px-3 py-2 border-none bg-transparent cursor-pointer font-body text-sm text-left transition-colors duration-200 ease-in-out hover:bg-gray-50";

  return (
    <>
      <div ref={cardRef} id={`dish-card-${dish.id}`} className="bg-white p-5 rounded-lg border-2 border-accent shadow-lg cursor-default" onClick={handleCardClick}>
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0 pr-4">
              {isEditingName ? (
                <div className="flex flex-col gap-3 w-full">
                  <input
                    type="text"
                    value={editedDishName}
                    onChange={(e) => setEditedDishName(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-accent focus:ring-accent/50"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleSaveDishName(); }
                      if (e.key === 'Escape') { setIsEditingName(false); setEditedDishName(dish.name); }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setIsEditingName(false); setEditedDishName(dish.name); }} className="px-4 py-2 rounded-md border-2 border-primary text-primary bg-white hover:bg-gray-100 transition-colors">Cancel</button>
                    <button onClick={handleSaveDishName} className="px-4 py-2 rounded-md border-2 border-black text-white bg-primary hover:bg-primaryHover transition-colors">Save</button>
                  </div>
                </div>
              ) : (
                <h3 className="font-heading text-lg text-gray-900 m-0 break-words">{dish.name}</h3>
              )}
              {!isEditingName && (
                <p className="font-body text-xs text-textSecondary m-0 mt-1">Added {new Date(dish.dateAdded).toLocaleDateString()}</p>
              )}
            </div>

            <div className="relative flex-shrink-0">
              <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev); }} className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-gray-100' : 'bg-transparent'} hover:bg-gray-100`} aria-label="More options">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
              {isMenuOpen && (
                <div ref={menuRef} className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-dropdown min-w-[160px]">
                  <button onClick={(e) => handleAction(e, () => onShare(dish!))} className={`${menuButtonClasses} text-text`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                    Share Dish
                  </button>
                  <button onClick={(e) => handleAction(e, handleDirectPhotoUpload)} className={`${menuButtonClasses} text-text`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    Add Photo
                  </button>
                  <button onClick={(e) => handleAction(e, () => setShowCommentModal(true))} className={`${menuButtonClasses} text-text`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Add Comment
                  </button>
                  {canModify && (
                    <>
                      <hr className="border-0 border-t border-gray-200 my-1" />
                      <button onClick={(e) => handleAction(e, () => { setIsEditingName(true); setEditedDishName(dish.name); })} className={`${menuButtonClasses} text-text`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        Edit Name
                      </button>
                      <button onClick={(e) => handleAction(e, handleDeleteDish)} className={`${menuButtonClasses} text-danger`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                        Delete Dish
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <RatingBreakdown personalRating={personalRating} communityAverage={dish.average_rating} totalRatings={dish.total_ratings} onUpdatePersonalRating={(rating) => onUpdateRating(dish.id, rating)} />

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

        {safePhotos.length > 0 && (
          <div className="mt-3">
            <PhotoCarousel photos={safePhotos} onPhotoClick={(photo, index, e) => { e.stopPropagation(); setSelectedPhotoModal({ photo, index }); }} />
          </div>
        )}

        <CommentsSection comments={safeComments} showComments={showComments} onToggle={() => setShowComments(!showComments)} currentUserId={currentUserId} editingComment={editingComment} onEditComment={(comment) => setEditingComment({ id: comment.id, currentText: comment.comment_text })} onUpdateComment={handleUpdateCommentInternal} onDeleteComment={handleDeleteCommentInternal} onCancelEdit={() => setEditingComment(null)} isSubmittingComment={isSubmittingComment} />
      </div>

      <PortalModal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)}>
        <h3 className="font-heading text-xl text-gray-900 mb-4">Add Comment about {dish.name}</h3>
        <CommentForm onSubmit={handleAddCommentInternal} onCancel={() => setShowCommentModal(false)} isLoading={isSubmittingComment} />
      </PortalModal>

      <PortalModal isOpen={showPhotoUpload} onClose={() => { setShowPhotoUpload(false); setSelectedFileForUpload(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
        <PhotoUpload onUpload={handlePhotoUpload} onCancel={() => { setShowPhotoUpload(false); setSelectedFileForUpload(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} isUploading={isUploadingPhoto} initialFile={selectedFileForUpload || undefined} skipFileSelection={true} />
      </PortalModal>

      {selectedPhotoModal && (
        <PhotoModal photos={safePhotos} initialIndex={selectedPhotoModal.index} currentUserId={currentUserId} onClose={() => setSelectedPhotoModal(null)} onDelete={handleDeletePhoto} onUpdateCaption={onUpdatePhotoCaption} />
      )}
    </>
  );
};

export default DishCard;