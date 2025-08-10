// src/components/DishCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { COMPONENT_STYLES, DESIGN_TOKENS, FONTS, SPACING, TYPOGRAPHY } from '../constants';
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
    <div style={{ ...COMPONENT_STYLES.dishCard.star.container, width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" style={COMPONENT_STYLES.dishCard.star.svgBase as React.CSSProperties}>
        <path d={starPath} fill={emptyColor} />
      </svg>
      {type !== 'empty' &&
        <div style={{ ...COMPONENT_STYLES.dishCard.star.filledContainer, width: type === 'half' ? '50%' : '100%' }}>
          <svg width={size} height={size} viewBox="0 0 24 24" style={{ ...COMPONENT_STYLES.dishCard.star.svgBase, width: size, height: size } as React.CSSProperties}>
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
    personal: { filled: DESIGN_TOKENS.colors.accent, empty: DESIGN_TOKENS.colors.ratingEmpty },
    community: { filled: '#101010', empty: DESIGN_TOKENS.colors.ratingEmpty }
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
              className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
              style={{ background: 'none', border: 'none', padding: '0', lineHeight: '1' }}
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
          style={{ ...COMPONENT_STYLES.dishCard.starRating.clearButton, marginLeft: SPACING[1] } as React.CSSProperties}
          onMouseEnter={(e) => { e.currentTarget.style.color = DESIGN_TOKENS.colors.danger; e.currentTarget.style.transform = 'scale(1.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = DESIGN_TOKENS.colors.textSecondary; e.currentTarget.style.transform = 'scale(1)'; }}
          aria-label="Clear rating"
          title="Clear rating"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
        </button>
      )}
    </div>
  );
};


const RatingSummary: React.FC<{ personalRating: number | null; communityAverage: number; }> = ({ personalRating, communityAverage }) => (
  <div style={COMPONENT_STYLES.dishCard.ratingSummary.container as React.CSSProperties}>
    <div style={COMPONENT_STYLES.dishCard.ratingSummary.row as React.CSSProperties}>
      <span style={COMPONENT_STYLES.dishCard.ratingSummary.label as React.CSSProperties}>Me:</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[1] }}>
        <StarRating rating={personalRating || 0} readonly variant="personal" size="sm" />
        <span style={COMPONENT_STYLES.dishCard.ratingSummary.value as React.CSSProperties}>{personalRating || '—'}</span>
      </div>
    </div>
    <div style={COMPONENT_STYLES.dishCard.ratingSummary.row as React.CSSProperties}>
      <span style={COMPONENT_STYLES.dishCard.ratingSummary.label as React.CSSProperties}>Average:</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[1] }}>
        <StarRating rating={communityAverage} readonly variant="community" size="sm" />
        <span style={COMPONENT_STYLES.dishCard.ratingSummary.value as React.CSSProperties}>{communityAverage.toFixed(1)}</span>
      </div>
    </div>
  </div>
);


const RatingBreakdown: React.FC<{ personalRating: number | null; communityAverage: number; totalRatings: number; onUpdatePersonalRating: (rating: number) => void; }> = ({ personalRating, communityAverage, totalRatings, onUpdatePersonalRating }) => (
  <div style={COMPONENT_STYLES.dishCard.ratingBreakdown.container as React.CSSProperties}>
    <div style={COMPONENT_STYLES.dishCard.ratingBreakdown.flexContainer as React.CSSProperties}>
      <div style={COMPONENT_STYLES.dishCard.ratingBreakdown.column as React.CSSProperties}>
        <div style={COMPONENT_STYLES.dishCard.ratingBreakdown.titleContainer as React.CSSProperties}>
          <span style={COMPONENT_STYLES.dishCard.ratingBreakdown.title as React.CSSProperties}>My Rating</span>
        </div>
        <div style={COMPONENT_STYLES.dishCard.ratingBreakdown.ratingContainer as React.CSSProperties}>
          <StarRating rating={personalRating || 0} onRatingChange={onUpdatePersonalRating} variant="personal" size="md" showClearButton={true} />
        </div>
      </div>
      <div style={COMPONENT_STYLES.dishCard.ratingBreakdown.column as React.CSSProperties}>
        <div style={COMPONENT_STYLES.dishCard.ratingBreakdown.titleContainer as React.CSSProperties}>
          <span style={COMPONENT_STYLES.dishCard.ratingBreakdown.title as React.CSSProperties}>Average</span>
        </div>
        <div>
          <div style={COMPONENT_STYLES.dishCard.ratingBreakdown.ratingContainer as React.CSSProperties}>
            <StarRating rating={communityAverage} readonly={true} variant="community" size="md" />
          </div>
          <div style={COMPONENT_STYLES.dishCard.ratingBreakdown.totalSummary as React.CSSProperties}>
            <span style={COMPONENT_STYLES.dishCard.ratingBreakdown.totalText as React.CSSProperties}>
              {communityAverage.toFixed(1)}/5 • {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);


const CommentsSection: React.FC<{ comments: DishComment[]; showComments: boolean; onToggle: () => void; currentUserId: string | null; editingComment: { id: string; currentText: string } | null; onEditComment: (comment: DishComment) => void; onUpdateComment: (commentId: string, text: string) => Promise<void>; onDeleteComment: (commentId: string) => Promise<void>; onCancelEdit: () => void; isSubmittingComment: boolean; }> = ({ comments, showComments, onToggle, currentUserId, editingComment, onEditComment, onUpdateComment, onDeleteComment, onCancelEdit, isSubmittingComment }) => {
  const [openActionMenuCommentId, setOpenActionMenuCommentId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionMenuCommentId && actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) setOpenActionMenuCommentId(null);
    };
    if (openActionMenuCommentId) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenuCommentId]);

  if (comments.length === 0) return null;

  return (
    <div style={COMPONENT_STYLES.dishCard.commentsSection.container as React.CSSProperties}>
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} style={COMPONENT_STYLES.dishCard.commentsSection.toggleButton as React.CSSProperties}>
        <span>Comments ({comments.length})</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ ...COMPONENT_STYLES.dishCard.commentsSection.toggleIcon, transform: showComments ? 'rotate(180deg)' : 'rotate(0deg)' } as React.CSSProperties}>
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </button>

      {showComments && (
        <div style={COMPONENT_STYLES.dishCard.commentsSection.listContainer as React.CSSProperties}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              onClick={(e) => { if (editingComment?.id !== comment.id) { e.stopPropagation(); onToggle(); } else { e.stopPropagation(); } }}
              style={{ ...COMPONENT_STYLES.dishCard.commentsSection.commentContainer, cursor: editingComment?.id === comment.id ? 'default' : 'pointer' } as React.CSSProperties}
            >
              {editingComment?.id === comment.id ? (
                <div style={{ width: '100%' }}>
                  <CommentForm initialText={editingComment?.currentText || ''} onSubmit={(text) => onUpdateComment(comment.id, text)} onCancel={onCancelEdit} isLoading={isSubmittingComment} submitButtonText="Update Comment" />
                </div>
              ) : (
                <div style={COMPONENT_STYLES.dishCard.commentsSection.commentBody as React.CSSProperties}>
                  <div style={COMPONENT_STYLES.dishCard.commentsSection.commentTextContainer as React.CSSProperties}>
                    <p style={COMPONENT_STYLES.dishCard.commentsSection.commentText as React.CSSProperties}>{comment.comment_text}</p>
                    <p style={COMPONENT_STYLES.dishCard.commentsSection.commentMeta as React.CSSProperties}>
                      <span style={COMPONENT_STYLES.dishCard.commentsSection.commentAuthor as React.CSSProperties}>{comment.commenter_name || 'Anonymous'}</span>
                      {' • '} {new Date(comment.created_at).toLocaleDateString()}
                      {comment.updated_at !== comment.created_at && ` (edited ${new Date(comment.updated_at).toLocaleDateString()})`}
                    </p>
                  </div>
                  {currentUserId && comment.user_id === currentUserId && (
                    <div style={COMPONENT_STYLES.dishCard.commentsSection.actionMenuContainer as React.CSSProperties}>
                      <button onClick={(e) => { e.stopPropagation(); setOpenActionMenuCommentId(openActionMenuCommentId === comment.id ? null : comment.id); }} style={{ ...COMPONENT_STYLES.button.icon.transparent, width: '32px', height: '32px' }} aria-label="Comment actions">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"/></svg>
                      </button>
                      {openActionMenuCommentId === comment.id && (
                        <div ref={actionMenuRef} style={COMPONENT_STYLES.dishCard.commentsSection.actionMenu as React.CSSProperties}>
                          <button onClick={(e) => { e.stopPropagation(); onEditComment(comment); setOpenActionMenuCommentId(null); }} style={{ ...COMPONENT_STYLES.dishCard.commentsSection.actionButton, color: DESIGN_TOKENS.colors.text } as React.CSSProperties} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.gray50; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            Edit
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteComment(comment.id); setOpenActionMenuCommentId(null); }} style={{ ...COMPONENT_STYLES.dishCard.commentsSection.actionButton, color: DESIGN_TOKENS.colors.danger } as React.CSSProperties} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = DESIGN_TOKENS.colors.gray50; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
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
    <div style={COMPONENT_STYLES.modal.overlay as React.CSSProperties} onClick={onClose}>
      <div style={{ ...COMPONENT_STYLES.modal.content, animation: 'slideIn 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    modalRoot
  );
};


const DishCard: React.FC<DishCardProps> = ({ dish, currentUserId, onDelete, onUpdateRating, onUpdateDishName, onAddComment, onUpdateComment, onDeleteComment, onAddPhoto, onDeletePhoto, onUpdatePhotoCaption, onShare, isSubmittingComment, isExpanded, onToggleExpand }) => {
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
  const [isHovering, setIsHovering] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const safeRatings = dish.ratings || [];
  const safePhotos = dish.photos || [];
  const safeComments = dish.comments || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && cardRef.current && !cardRef.current.contains(event.target as Node)) setIsMenuOpen(false);
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

  const handleDeleteDish = () => { if (window.confirm('Are you sure you want to delete this dish and all its comments?')) onDelete(dish.id); };
  const handleAddCommentInternal = async (text: string) => { await onAddComment(dish.id, text); setShowCommentModal(false); setShowComments(true); };
  const handleUpdateCommentInternal = async (commentId: string, text: string) => { await onUpdateComment(commentId, dish.id, text); setEditingComment(null); };
  const handleDeleteCommentInternal = async (commentId: string) => { if (window.confirm('Are you sure you want to delete this comment?')) await onDeleteComment(dish.id, commentId); };
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
    } catch (error) { console.error('Error uploading photo:', error); }
    finally { setIsUploadingPhoto(false); }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await onDeletePhoto(dish.id, photoId);
      if (safePhotos.length <= 1) setSelectedPhotoModal(null);
    } catch (error) { console.error("Failed to delete photo from DishCard:", error); alert("Failed to delete photo. Please try again."); }
  };

  const handleSaveDishName = async () => {
    if (onUpdateDishName && editedDishName.trim() && editedDishName.trim() !== dish.name) {
      const success = await onUpdateDishName(dish.id, editedDishName.trim());
      if (success) setIsEditingName(false);
    } else { setIsEditingName(false); }
  };

  const handleCardClick = () => { if (isMenuOpen) { setIsMenuOpen(false); return; } onToggleExpand(); };

  if (!isExpanded) {
    return (
      <div
        id={`dish-card-${dish.id}`}
        style={{ ...COMPONENT_STYLES.card, ...COMPONENT_STYLES.dishCard.collapsed, borderColor: isHovering ? DESIGN_TOKENS.colors.accent : DESIGN_TOKENS.colors.gray200, boxShadow: isHovering ? DESIGN_TOKENS.shadows.medium : DESIGN_TOKENS.shadows.small } as React.CSSProperties}
        onClick={onToggleExpand}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div style={COMPONENT_STYLES.dishCard.collapsed.container as React.CSSProperties}>
          <div style={COMPONENT_STYLES.dishCard.collapsed.textContainer as React.CSSProperties}>
            <h3 style={COMPONENT_STYLES.dishCard.collapsed.title as React.CSSProperties}>{dish.name}</h3>
            <RatingSummary personalRating={personalRating} communityAverage={dish.average_rating} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[3] }}>
            {safePhotos.length > 0 && (
              <div style={COMPONENT_STYLES.dishCard.collapsed.imageContainer as React.CSSProperties}>
                <img src={safePhotos[0].url} alt="Dish photo" style={COMPONENT_STYLES.dishCard.collapsed.image as React.CSSProperties} />
              </div>
            )}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={COMPONENT_STYLES.dishCard.collapsed.arrow as React.CSSProperties}>
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const menuButtonStyle: React.CSSProperties = { ...COMPONENT_STYLES.dishCard.menuButton, ...FONTS.body, fontSize: TYPOGRAPHY.sm.fontSize };

  return (
    <>
      <div ref={cardRef} id={`dish-card-${dish.id}`} style={{ ...COMPONENT_STYLES.card, ...COMPONENT_STYLES.dishCard.expanded } as React.CSSProperties} onClick={handleCardClick}>
        <div style={COMPONENT_STYLES.dishCard.expanded.headerContainer as React.CSSProperties}>
          <div style={COMPONENT_STYLES.dishCard.expanded.header as React.CSSProperties}>
            <div style={COMPONENT_STYLES.dishCard.expanded.headerTextContainer as React.CSSProperties}>
              {isEditingName ? (
                <div style={COMPONENT_STYLES.dishCard.expanded.editContainer as React.CSSProperties}>
                  <input type="text" value={editedDishName} onChange={(e) => setEditedDishName(e.target.value)} style={COMPONENT_STYLES.dishCard.expanded.editInput as React.CSSProperties} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveDishName(); } if (e.key === 'Escape') { setIsEditingName(false); setEditedDishName(dish.name); } }} />
                  <div style={COMPONENT_STYLES.dishCard.expanded.editButtons as React.CSSProperties}>
                    <button onClick={() => { setIsEditingName(false); setEditedDishName(dish.name); }} style={COMPONENT_STYLES.button.secondary as React.CSSProperties}>Cancel</button>
                    <button onClick={handleSaveDishName} style={COMPONENT_STYLES.button.primary as React.CSSProperties}>Save</button>
                  </div>
                </div>
              ) : (
                <h3 style={COMPONENT_STYLES.dishCard.expanded.title as React.CSSProperties}>{dish.name}</h3>
              )}
              {!isEditingName && (
                <p style={COMPONENT_STYLES.dishCard.expanded.date as React.CSSProperties}>Added {new Date(dish.dateAdded).toLocaleDateString()}</p>
              )}
            </div>
            <div style={COMPONENT_STYLES.dishCard.expanded.actionMenuContainer as React.CSSProperties}>
              <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev); }} style={{ ...COMPONENT_STYLES.button.icon.transparent, backgroundColor: isMenuOpen ? DESIGN_TOKENS.colors.gray100 : 'transparent' }} aria-label="More options">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
              {isMenuOpen && (
                <div ref={menuRef} style={COMPONENT_STYLES.dishCard.expanded.actionMenu as React.CSSProperties}>
                  <button onClick={(e) => handleAction(e, () => onShare(dish!))} style={{...menuButtonStyle, color: DESIGN_TOKENS.colors.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=DESIGN_TOKENS.colors.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                    Share Dish
                  </button>
                  <button onClick={(e) => handleAction(e, handleDirectPhotoUpload)} style={{...menuButtonStyle, color: DESIGN_TOKENS.colors.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=DESIGN_TOKENS.colors.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    Add Photo
                  </button>
                  <button onClick={(e) => handleAction(e, () => setShowCommentModal(true))} style={{...menuButtonStyle, color: DESIGN_TOKENS.colors.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=DESIGN_TOKENS.colors.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Add Comment
                  </button>
                  {canModify && (
                    <>
                      <hr style={COMPONENT_STYLES.dishCard.expanded.hr as React.CSSProperties} />
                      <button onClick={(e) => handleAction(e, () => { setIsEditingName(true); setEditedDishName(dish.name); })} style={{...menuButtonStyle, color: DESIGN_TOKENS.colors.text}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=DESIGN_TOKENS.colors.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        Edit Name
                      </button>
                      <button onClick={(e) => handleAction(e, handleDeleteDish)} style={{...menuButtonStyle, color: DESIGN_TOKENS.colors.danger}} onMouseEnter={(e)=>{e.currentTarget.style.backgroundColor=DESIGN_TOKENS.colors.gray50}} onMouseLeave={(e)=>{e.currentTarget.style.backgroundColor='transparent'}}>
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
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={COMPONENT_STYLES.dishCard.expanded.hiddenInput as React.CSSProperties} />

        {safePhotos.length > 0 && (
          <div style={COMPONENT_STYLES.dishCard.expanded.photosContainer as React.CSSProperties}>
            <PhotoCarousel photos={safePhotos} onPhotoClick={(photo, index, e) => { e.stopPropagation(); setSelectedPhotoModal({ photo, index }); }} />
          </div>
        )}

        <CommentsSection comments={safeComments} showComments={showComments} onToggle={() => setShowComments(!showComments)} currentUserId={currentUserId} editingComment={editingComment} onEditComment={(comment) => setEditingComment({ id: comment.id, currentText: comment.comment_text })} onUpdateComment={handleUpdateCommentInternal} onDeleteComment={handleDeleteCommentInternal} onCancelEdit={() => setEditingComment(null)} isSubmittingComment={isSubmittingComment} />
      </div>

      <PortalModal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)}>
        <h3 style={COMPONENT_STYLES.dishCard.addCommentModal.title as React.CSSProperties}>Add Comment about {dish.name}</h3>
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