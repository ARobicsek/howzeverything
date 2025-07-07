// src/components/DishCard.tsx - MODIFIED
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../constants';
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
  onShare: (dish: DishWithDetails) => void;
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
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem'
  };
   
  const colorMap = {
    personal: { filled: COLORS.accent, empty: COLORS.ratingEmpty }, // UPDATED
    community: { filled: '#101010', empty: COLORS.ratingEmpty } // UPDATED
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={(e) => { e.stopPropagation(); !readonly && onRatingChange?.(star); }}
            disabled={readonly}
            className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            style={{
              color: star <= rating ? colorMap[variant].filled : colorMap[variant].empty,
              background: 'none',
              border: 'none',
              padding: '0',
              fontSize: sizeMap[size],
              lineHeight: '1'
            }}
            aria-label={readonly ? `${rating} of 5 stars` : `Rate ${star} of 5 stars`}
          >
            ★
          </button>
        ))}
      </div>
      {!readonly && showClearButton && rating > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onRatingChange?.(0); }}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: COLORS.textSecondary,
            transition: 'color 0.2s ease, transform 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            marginLeft: SPACING[1]
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = COLORS.danger;
            e.currentTarget.style.transform = 'scale(1.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = COLORS.textSecondary;
            e.currentTarget.style.transform = 'scale(1)';
          }}
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
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: SPACING[1] }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
      <span style={{
        ...FONTS.body,
        fontSize: TYPOGRAPHY.sm.fontSize,
        color: COLORS.textSecondary,
        fontWeight: TYPOGRAPHY.medium
      }}>Average:</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[1] }}>
        <StarRating rating={communityAverage} readonly variant="community" size="sm" />
        <span style={{ color: COLORS.text, fontWeight: TYPOGRAPHY.medium, fontSize: TYPOGRAPHY.sm.fontSize }}>
          {communityAverage.toFixed(1)}
        </span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
      <span style={{
        ...FONTS.body,
        fontSize: TYPOGRAPHY.sm.fontSize,
        color: COLORS.textSecondary,
        fontWeight: TYPOGRAPHY.medium
      }}>You:</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[1] }}>
        <StarRating rating={personalRating || 0} readonly variant="personal" size="sm" />
        <span style={{ color: COLORS.text, fontWeight: TYPOGRAPHY.medium, fontSize: TYPOGRAPHY.sm.fontSize }}>
          {personalRating || '—'}
        </span>
      </div>
    </div>
  </div>
);

const RatingBreakdown: React.FC<{
  personalRating: number | null;
  communityAverage: number;
  totalRatings: number;
  onUpdatePersonalRating: (rating: number) => void;
}> = ({
  personalRating,
  communityAverage,
  totalRatings,
  onUpdatePersonalRating
}) => (
  <div style={{
    backgroundColor: COLORS.gray50,
    padding: SPACING[4],
    borderRadius: STYLES.borderRadiusMedium,
    marginTop: SPACING[4]
  }}>
    <div style={{ display: 'flex', gap: SPACING[8], alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: SPACING[2] }}>
          <span style={{
            ...FONTS.body,
            fontSize: TYPOGRAPHY.sm.fontSize,
            color: COLORS.textSecondary,
            fontWeight: TYPOGRAPHY.medium
          }}>
            Average
          </span>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
            <StarRating
              rating={communityAverage}
              readonly={true}
              variant="community"
              size="md"
            />
          </div>
          <div style={{ marginTop: SPACING[1] }}>
            <span style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.xs.fontSize,
              color: COLORS.textSecondary
            }}>
              {communityAverage.toFixed(1)}/5 • {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: SPACING[2] }}>
          <span style={{
            ...FONTS.body,
            fontSize: TYPOGRAPHY.sm.fontSize,
            color: COLORS.textSecondary,
            fontWeight: TYPOGRAPHY.medium
          }}>
            Your Rating
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
          <StarRating
            rating={personalRating || 0}
            onRatingChange={onUpdatePersonalRating}
            variant="personal"
            size="md"
            showClearButton={true}
          />
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
    <div style={{ marginTop: SPACING[6] }}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={{
          background: 'none',
          border: 'none',
          padding: `${SPACING[3]} 0`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: SPACING[2],
          ...FONTS.body,
          fontSize: TYPOGRAPHY.base.fontSize,
          color: COLORS.text,
          fontWeight: TYPOGRAPHY.medium,
          width: '100%',
          textAlign: 'left'
        }}
      >
        <span>Comments ({comments.length})</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            transform: showComments ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: COLORS.gray400
          }}
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </button>

      {showComments && (
        <div style={{ marginTop: SPACING[3], display: 'flex', flexDirection: 'column', gap: SPACING[3] }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                backgroundColor: COLORS.gray50,
                padding: SPACING[4],
                borderRadius: STYLES.borderRadiusMedium
              }}
            >
              {editingComment?.id === comment.id ? (
                <div style={{ width: '100%' }}>
                  <CommentForm
                    initialText={editingComment?.currentText || ''}
                    onSubmit={(text) => onUpdateComment(comment.id, text)}
                    onCancel={onCancelEdit}
                    isLoading={isSubmittingComment}
                    submitButtonText="Update Comment"
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: SPACING[2] }}>
                    <p style={{
                      ...FONTS.body,
                      fontSize: TYPOGRAPHY.sm.fontSize,
                      color: COLORS.text,
                      margin: 0,
                      wordBreak: 'break-word'
                    }}>
                      {comment.comment_text}
                    </p>
                    <p style={{
                      ...FONTS.body,
                      fontSize: TYPOGRAPHY.xs.fontSize,
                      color: COLORS.textSecondary,
                      margin: 0,
                      marginTop: SPACING[1]
                    }}>
                      <span style={{ fontWeight: TYPOGRAPHY.medium }}>
                        {comment.commenter_name || 'Anonymous'}
                      </span>
                      {' • '}
                      {new Date(comment.created_at).toLocaleDateString()}
                      {comment.updated_at !== comment.created_at && ` (edited ${new Date(comment.updated_at).toLocaleDateString()})`}
                    </p>
                  </div>
                  {currentUserId && comment.user_id === currentUserId && (
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenuCommentId(openActionMenuCommentId === comment.id ? null : comment.id);
                        }}
                        style={{
                          ...STYLES.iconButton,
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'transparent',
                          border: 'none',
                        }}
                        aria-label="Comment actions"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"/>
                        </svg>
                      </button>
                      {openActionMenuCommentId === comment.id && (
                        <div
                          ref={actionMenuRef}
                          style={{
                            position: 'absolute',
                            bottom: '100%',
                            right: 0,
                            marginBottom: SPACING[1],
                            backgroundColor: COLORS.white,
                            borderRadius: STYLES.borderRadiusMedium,
                            boxShadow: STYLES.shadowLarge,
                            border: `1px solid ${COLORS.gray200}`,
                            overflow: 'hidden',
                            zIndex: STYLES.zDropdown,
                            minWidth: '120px'
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditComment(comment);
                              setOpenActionMenuCommentId(null);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: SPACING[2],
                              width: '100%',
                              padding: `${SPACING[2]} ${SPACING[3]}`,
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              ...FONTS.body,
                              fontSize: TYPOGRAPHY.sm.fontSize,
                              color: COLORS.text,
                              textAlign: 'left',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = COLORS.gray50;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteComment(comment.id);
                              setOpenActionMenuCommentId(null);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: SPACING[2],
                              width: '100%',
                              padding: `${SPACING[2]} ${SPACING[3]}`,
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              ...FONTS.body,
                              fontSize: TYPOGRAPHY.sm.fontSize,
                              color: COLORS.danger,
                              textAlign: 'left',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = COLORS.gray50;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                            </svg>
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

const getUserPersonalRating = (dishRatings: DishRating[], userId: string | null): number | null => {
  if (!userId) return null;
  const userRating = dishRatings.find(rating => rating.user_id === userId);
  return userRating ? userRating.rating : null;
};

const PortalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  const modalRoot = document.getElementById('modal-root');
   
  if (!isOpen || !modalRoot) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      style={STYLES.modalOverlay}
      onClick={onClose}
    >
      <div
        style={{
          ...STYLES.modal,
          animation: 'slideIn 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    modalRoot
  );
};

const DishCard: React.FC<DishCardProps> = ({
  dish,
  currentUserId,
  onDelete,
  onUpdateRating,
  onUpdateDishName,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddPhoto,
  onDeletePhoto,
  onShare,
  isSubmittingComment,
  isExpanded,
  onToggleExpand
}) => {
  if (!dish) {
    return null;
  }

  const [showComments, setShowComments] = useState(false);
  const [editingComment, setEditingComment] = useState<{ id: string; currentText: string } | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<{ photo: DishPhoto; index: number } | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedFileForUpload, setSelectedFileForUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const personalRating = getUserPersonalRating(dish.dish_ratings, currentUserId);
  const canModify = currentUserId && dish.created_by === currentUserId;

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsMenuOpen(false);
  };

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

  const handleDirectPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handleEditName = async (newName: string) => {
    if (onUpdateDishName) {
      const success = await onUpdateDishName(dish.id, newName);
      if (success) {
        setIsEditingName(false);
      }
    }
  };

  const handleCardClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }
    onToggleExpand();
  };

  if (!isExpanded) {
    return (
      <div
        id={`dish-card-${dish.id}`}
        style={{
          ...STYLES.card,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          borderColor: isHovering ? COLORS.accent : COLORS.gray200, // Use accent color on hover
          boxShadow: isHovering ? STYLES.shadowMedium : STYLES.shadowSmall,
        }}
        onClick={onToggleExpand}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              ...FONTS.heading,
              fontSize: TYPOGRAPHY.lg.fontSize,
              color: COLORS.gray900,
              margin: 0,
              marginBottom: SPACING[2]
            }}>
              {dish.name}
            </h3>
            <RatingSummary
              personalRating={personalRating}
              communityAverage={dish.average_rating}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[3] }}>
            {dish.dish_photos.length > 0 && (
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: STYLES.borderRadiusMedium,
                overflow: 'hidden',
                flexShrink: 0
              }}>
                <img
                  src={dish.dish_photos[0].url}
                  alt="Dish photo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: COLORS.gray400 }}
            >
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const menuButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING[2],
    width: '100%',
    padding: `${SPACING[2]} ${SPACING[3]}`,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    ...FONTS.body,
    fontSize: TYPOGRAPHY.sm.fontSize,
    textAlign: 'left',
    transition: 'background-color 0.2s ease',
  };

  return (
    <>
      <div
        ref={cardRef}
        id={`dish-card-${dish.id}`}
        style={{
          ...STYLES.card,
          borderColor: COLORS.accent, // UPDATED BORDER COLOR
          boxShadow: STYLES.shadowLarge,
          cursor: 'default',
        }}
        onClick={handleCardClick}
      >
        <div style={{ marginBottom: SPACING[4] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING[2] }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: SPACING[4] }}>
              {isEditingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2] }}>
                  <input type="text" value={dish.name} onChange={(e) => handleEditName(e.target.value)} style={{ ...STYLES.input, flex: 1 }} autoFocus/>
                  <button onClick={() => setIsEditingName(false)} style={{ ...STYLES.primaryButton, padding: '8px 16px', minHeight: '36px', backgroundColor: COLORS.success }}>Save</button>
                  <button onClick={() => setIsEditingName(false)} style={{ ...STYLES.secondaryButton, padding: '8px 16px', minHeight: '36px' }}>Cancel</button>
                </div>
              ) : (
                <h3 style={{ ...FONTS.heading, fontSize: TYPOGRAPHY.lg.fontSize, color: COLORS.gray900, margin: 0, wordBreak: 'break-word' }}>
                  {dish.name}
                </h3>
              )}
              <p style={{ ...FONTS.body, fontSize: TYPOGRAPHY.xs.fontSize, color: COLORS.textSecondary, margin: 0, marginTop: SPACING[1] }}>
                Added {new Date(dish.dateAdded).toLocaleDateString()}
              </p>
            </div>

            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev); }} style={{ ...STYLES.iconButton, width: '40px', height: '40px', backgroundColor: isMenuOpen ? COLORS.gray100 : 'transparent' }} aria-label="More options">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
              {isMenuOpen && (
                <div ref={menuRef} style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, backgroundColor: COLORS.white, borderRadius: STYLES.borderRadiusMedium, boxShadow: STYLES.shadowLarge, border: `1px solid ${COLORS.gray200}`, overflow: 'hidden', zIndex: STYLES.zDropdown, minWidth: '160px', }}>
                  <button onClick={(e) => handleAction(e, () => onShare(dish!))} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                    Share Dish
                  </button>
                  <button onClick={(e) => handleAction(e, handleDirectPhotoUpload)} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    Add Photo
                  </button>
                  <button onClick={(e) => handleAction(e, () => setShowCommentModal(true))} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Add Comment
                  </button>
                  {canModify && (
                    <>
                      <hr style={{ border: 0, borderTop: `1px solid ${COLORS.gray200}`, margin: `${SPACING[1]} 0` }} />
                      <button onClick={(e) => handleAction(e, () => setIsEditingName(true))} style={{...menuButtonStyle, color: COLORS.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        Edit Name
                      </button>
                      <button onClick={(e) => handleAction(e, handleDeleteDish)} style={{...menuButtonStyle, color: COLORS.danger}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=COLORS.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
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

        <RatingBreakdown
          personalRating={personalRating}
          communityAverage={dish.average_rating}
          totalRatings={dish.total_ratings}
          onUpdatePersonalRating={(rating) => onUpdateRating(dish.id, rating)}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {dish.dish_photos.length > 0 && (
          <div style={{ marginTop: SPACING[3] }}>
            <PhotoCarousel
              photos={dish.dish_photos}
              onPhotoClick={(photo, index, e) => {
                e.stopPropagation();
                setSelectedPhotoModal({ photo, index });
              }}
            />
          </div>
        )}

        <CommentsSection
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
      </div>

      <PortalModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
      >
        <h3 style={{
          ...FONTS.heading,
          fontSize: TYPOGRAPHY.xl.fontSize,
          color: COLORS.gray900,
          marginBottom: SPACING[4]
        }}>
          Add Comment about {dish.name}
        </h3>
        <CommentForm
          onSubmit={handleAddCommentInternal}
          onCancel={() => setShowCommentModal(false)}
          isLoading={isSubmittingComment}
        />
      </PortalModal>

      <PortalModal
        isOpen={showPhotoUpload}
        onClose={() => {
          setShowPhotoUpload(false);
          setSelectedFileForUpload(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      >
        <PhotoUpload
          onUpload={handlePhotoUpload}
          onCancel={() => {
            setShowPhotoUpload(false);
            setSelectedFileForUpload(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          isUploading={isUploadingPhoto}
          initialFile={selectedFileForUpload || undefined}
          skipFileSelection={true}
        />
      </PortalModal>

      {selectedPhotoModal && (
        <PhotoModal
          photos={dish.dish_photos}
          initialIndex={selectedPhotoModal.index}
          currentUserId={currentUserId}
          onClose={() => {
            setSelectedPhotoModal(null);
          }}
          onDelete={handleDeletePhoto}
        />
      )}
    </>
  );
};

export default DishCard;