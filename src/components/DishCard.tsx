// src/components/DishCard.tsx  
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { COLORS, FONTS } from '../constants';
import type { DishPhoto, DishRating, DishWithDetails } from '../hooks/useDishes';
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
            onClick={(e) => { e.stopPropagation(); !readonly && onRatingChange?.(star); }} // Stop propagation
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
          onClick={(e) => { e.stopPropagation(); onRatingChange?.(0); }} // Stop propagation
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
  onDelete: () => void; // This is the onDelete prop
  onToggleEditMode: () => void;  
  isEditing?: boolean;  
  onEditName?: (newName: string) => void;  
  onSaveEdit?: () => void;  
  onCancelEdit?: () => void;  
}> = ({  
  name,  
  dateAdded,  
  createdBy,  
  currentUserId,  
  onDelete, // Destructure the onDelete prop here
  onToggleEditMode,  
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
                onClick={(e) => { e.stopPropagation(); onEditName?.(editedName); onSaveEdit?.(); }} // Stop propagation
                className="px-2 py-1 rounded bg-green-500 text-white text-sm"  
              >  
                Save  
              </button>  
              <button  
                onClick={(e) => { e.stopPropagation(); onCancelEdit?.(); }} // Stop propagation
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
              onClick={(e) => { e.stopPropagation(); onToggleEditMode(); }} // Stop propagation here
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


          {/* Delete button */}  
          <button  
            onClick={(e) => { e.stopPropagation(); onDelete(); }} // NOW CORRECTLY CALLS the onDelete PROP
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
  onToggle: () => void; // Prop expects no arguments
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
      {/* Modified Comments button styling */}
      <button  
        onClick={(e) => { e.stopPropagation(); onToggle(); }} // Stop propagation here, call the prop with no arguments
        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity focus:outline-none"  
        style={{  
          ...FONTS.elegant,  
          color: COLORS.text,  
          fontWeight: '500',  
          background: 'none', // Remove background
          border: 'none',     // Remove border
          padding: '0',       // Remove padding to make it 'text only'
          cursor: 'pointer'   // Ensure cursor remains pointer
        }}  
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
                          <button onClick={(e) => { e.stopPropagation(); onEditComment(comment); setOpenActionMenuCommentId(null); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10 rounded-t-md" style={{...FONTS.elegant, color: COLORS.text}}>Edit</button>  
                          <button onClick={(e) => { e.stopPropagation(); onDeleteComment(comment.id); setOpenActionMenuCommentId(null); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10 rounded-b-md" style={{...FONTS.elegant, color: COLORS.danger}}>Delete</button>  
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


// Portal Modal Component - Clean Production Version with Updated Button Styling
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
      className="fixed inset-0 flex items-center justify-center p-4"  
      style={{  
        zIndex: 999999,  
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Clean grey overlay
        backdropFilter: 'blur(4px)',  
        position: 'fixed',  
        top: 0,  
        left: 0,  
        right: 0,  
        bottom: 0,  
        width: '100vw',  
        height: '100vh'  
      }}  
      onClick={onClose}  
    >  
      <div  
        className="rounded-lg shadow-xl w-full p-6 max-h-[90vh] overflow-y-auto"  
        style={{  
          backgroundColor: '#34343b', // Your specified modal background color
          maxWidth: '400px',  
          color: COLORS.textWhite, // White text
          fontFamily: FONTS.elegant.fontFamily, // Your Inter font
          border: '1px solid rgba(255, 255, 255, 0.1)' // Subtle border
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
  isSubmittingComment,  
  isExpanded,  
  onToggleExpand  
}) => {  
  // Early return if dish is null  
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


  // Direct photo upload - skip the "Choose Photo" step
  const handleDirectPhotoUpload = () => {  
    fileInputRef.current?.click();  
  };


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {  
    const file = event.target.files?.[0];  
    if (file) {  
      // Validate file type  
      if (!file.type.startsWith('image/')) {  
        alert('Please select an image file');  
        return;  
      }


      // Validate file size (5MB limit)  
      if (file.size > 5 * 1024 * 1024) {  
        alert('File size must be less than 5MB');  
        return;  
      }


      // Store the file and open upload modal
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
      // Reset file input
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
      <div
        className="bg-white/5 backdrop-blur-sm p-5 rounded-lg hover:bg-white/10 transition-colors relative cursor-pointer"
        // UPDATED: Only toggle if the click was directly on this div, not a child
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onToggleExpand();
          }
        }}
      >  
        <DishHeader  
          name={dish.name}  
          dateAdded={dish.dateAdded}  
          createdBy={dish.created_by}  
          currentUserId={currentUserId}  
          onDelete={handleDeleteDish}  
          onToggleEditMode={() => setIsEditingName(true)}  
          isEditing={isEditingName}  
          onEditName={handleEditName}  
          onSaveEdit={() => setIsEditingName(false)}  
          onCancelEdit={() => setIsEditingName(false)}  
        />


        <RatingBreakdown  
          personalRating={personalRating}  
          communityAverage={dish.average_rating}  
          totalRatings={dish.total_ratings}  
          onUpdatePersonalRating={(rating) => onUpdateRating(dish.id, rating)}  
        />


        {/* Add Photo Button - Moved to immediately on top of any photos */}
        <div className="mt-4">  
          <button  
            onClick={(e) => { e.stopPropagation(); handleDirectPhotoUpload(); }} // Stop propagation
            className="flex-1 py-2 px-4 border border-black text-white bg-blue-500 hover:bg-blue-600 transition-colors focus:outline-none w-full"  
            style={{  
              ...FONTS.elegant,  
              fontSize: '0.9rem',  
              fontWeight: '500'  
            }}  
          >  
            Add Photo  
          </button>  
        </div>


        {/* Hidden file input for direct photo upload */}  
        <input  
          ref={fileInputRef}  
          type="file"  
          accept="image/*"  
          onChange={handleFileSelect}  
          className="hidden"  
        />


        {/* Photo Carousel - Only show if photos exist */}  
        {dish.dish_photos.length > 0 && (  
          <div className="mt-3">  
            <PhotoCarousel  
              photos={dish.dish_photos}  
              // Now passes event object and stops propagation here.
              onPhotoClick={(photo, index, e) => { e.stopPropagation(); setSelectedPhotoModal({ photo, index }); }}  
            />  
          </div>  
        )}


        {/* Add Comment Button - Moved to immediately on top of comments section */}
        <div className="mt-4">  
          <button  
            onClick={(e) => { e.stopPropagation(); setShowCommentModal(true); }} // Stop propagation
            className="flex-1 py-2 px-4 border border-black text-white bg-blue-500 hover:bg-blue-600 transition-colors focus:outline-none w-full"  
            style={{  
              ...FONTS.elegant,  
              fontSize: '0.9rem',  
              fontWeight: '500'  
            }}  
          >  
            Add Comment  
          </button>  
        </div>


        {/* Comments Accordion */}  
        <CommentsAccordion  
          comments={dish.dish_comments}  
          showComments={showComments}  
          onToggle={() => setShowComments(!showComments)} // onToggle prop remains simple, stopPropagation is handled inside CommentsAccordion
          currentUserId={currentUserId}  
          editingComment={editingComment}  
          onEditComment={(comment) => setEditingComment({ id: comment.id, currentText: comment.comment_text })}  
          onUpdateComment={handleUpdateCommentInternal}  
          onDeleteComment={handleDeleteCommentInternal}  
          onCancelEdit={() => setEditingComment(null)}  
          isSubmittingComment={isSubmittingComment}  
        />  
      </div>


      {/* Comment Modal - Updated Button Styling */}  
      <PortalModal  
        isOpen={showCommentModal}  
        onClose={() => setShowCommentModal(false)}  
      >  
        <h3 style={{  
          ...FONTS.elegant,  
          fontSize: '1.2rem',  
          fontWeight: '600',  
          color: COLORS.textWhite,  
          marginBottom: '16px'  
        }}>  
          Add Comment about {dish.name}  
        </h3>  
        <CommentForm  
          onSubmit={handleAddCommentInternal}  
          onCancel={() => setShowCommentModal(false)}  
          isLoading={isSubmittingComment}  
        />  
      </PortalModal>


      {/* Photo Upload Modal - Pre-selected file */}  
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


      {/* PhotoModal is handled with its own portal logic internally */}  
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
    </>  
  );  
};


export default DishCard;