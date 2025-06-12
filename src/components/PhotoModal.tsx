// src/components/PhotoModal.tsx  
import React, { useEffect, useState } from 'react';
import { COLORS, FONTS } from '../constants';
import type { DishPhoto } from '../hooks/useDishes';

interface PhotoModalProps {  
  photos: DishPhoto[];  
  initialIndex: number;  
  currentUserId: string | null;  
  onClose: () => void;  
  onDelete: (photoId: string) => Promise<void>;  
  onDoubleClickDelete?: boolean;  
}

const PhotoModal: React.FC<PhotoModalProps> = ({  
  photos,  
  initialIndex,  
  currentUserId,  
  onClose,  
  onDelete,  
  onDoubleClickDelete = false  
}) => {  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);  
  const [isDeleting, setIsDeleting] = useState(false);  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentPhoto = photos[currentIndex];  
  const canDelete = currentPhoto && currentUserId === currentPhoto.user_id;

  useEffect(() => {  
    const handleKeyDown = (e: KeyboardEvent) => {  
      if (e.key === 'Escape') {  
        onClose();  
      } else if (e.key === 'ArrowLeft') {  
        navigatePrevious();  
      } else if (e.key === 'ArrowRight') {  
        navigateNext();  
      }  
    };

    document.addEventListener('keydown', handleKeyDown);  
    return () => document.removeEventListener('keydown', handleKeyDown);  
  }, [currentIndex]);

  const navigatePrevious = () => {  
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));  
  };

  const navigateNext = () => {  
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));  
  };

  const handleDelete = async () => {  
    if (!currentPhoto || !canDelete) return;

    setIsDeleting(true);  
    try {  
      await onDelete(currentPhoto.id);  
      setShowDeleteConfirm(false);  
       
      // If this was the last photo, close modal  
      if (photos.length === 1) {  
        onClose();  
      } else {  
        // Otherwise, navigate to next/previous photo  
        if (currentIndex === photos.length - 1) {  
          setCurrentIndex(currentIndex - 1);  
        }  
      }  
    } catch (error) {  
      console.error('Error deleting photo:', error);  
    } finally {  
      setIsDeleting(false);  
    }  
  };

  const handleDoubleClick = () => {  
    if (onDoubleClickDelete && canDelete) {  
      setShowDeleteConfirm(true);  
    }  
  };

  if (!currentPhoto) return null;

  return (  
    <div className="fixed inset-0 z-50 flex flex-col">  
      {/* Greyed out backdrop */}  
      <div  
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"  
        onClick={onClose}  
      />

      {/* Modal content - moved up */}  
      <div className="relative z-10 w-full h-full flex flex-col pt-8 pb-4 px-4">  
        {/* Header with navigation controls in upper right */}  
        <div className="flex items-center justify-between mb-4">  
          {/* Left side - photo counter and photographer info */}  
          <div className="flex items-center gap-4">  
            <p style={{  
              ...FONTS.elegant,  
              color: COLORS.textDark,  
              fontSize: '0.9rem',  
              fontWeight: '600',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '4px 12px',
              borderRadius: '6px'
            }}>  
              {currentIndex + 1} / {photos.length}  
            </p>  
            {currentPhoto.photographer_name && (  
              <p style={{  
                ...FONTS.elegant,  
                color: COLORS.textDark,  
                fontSize: '0.85rem',  
                fontWeight: '500',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '4px 12px',
                borderRadius: '6px'
              }}>  
                by {currentPhoto.photographer_name}  
              </p>  
            )}  
          </div>  
           
          {/* Right side - navigation and controls */}  
          <div className="flex items-center gap-2">  
            {/* Navigation arrows - moved to upper right */}
            {photos.length > 1 && (  
              <div className="flex gap-1">
                <button  
                  onClick={navigatePrevious}  
                  className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"  
                  style={{ color: COLORS.textDark }}  
                  aria-label="Previous photo"  
                >  
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">  
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>  
                  </svg>  
                </button>  
                <button  
                  onClick={navigateNext}  
                  className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"  
                  style={{ color: COLORS.textDark }}  
                  aria-label="Next photo"  
                >  
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">  
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>  
                  </svg>  
                </button>  
              </div>
            )}

            {canDelete && !showDeleteConfirm && !onDoubleClickDelete && (  
              <button  
                onClick={() => setShowDeleteConfirm(true)}  
                className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"  
                style={{ color: COLORS.danger }}  
                aria-label="Delete photo"  
              >  
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">  
                  <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />  
                </svg>  
              </button>  
            )}  
             
            {showDeleteConfirm && (  
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-lg">  
                <span style={{  
                  ...FONTS.elegant,  
                  color: COLORS.textDark,  
                  fontSize: '0.85rem'  
                }}>Delete photo?</span>  
                <button  
                  onClick={handleDelete}  
                  disabled={isDeleting}  
                  className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 transition-colors disabled:opacity-50"  
                  style={{  
                    ...FONTS.elegant,  
                    color: COLORS.textWhite,  
                    fontSize: '0.85rem',  
                    fontWeight: '500'  
                  }}  
                >  
                  {isDeleting ? 'Deleting...' : 'Yes'}  
                </button>  
                <button  
                  onClick={() => setShowDeleteConfirm(false)}  
                  disabled={isDeleting}  
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"  
                  style={{  
                    ...FONTS.elegant,  
                    color: COLORS.textDark,  
                    fontSize: '0.85rem',  
                    fontWeight: '500'  
                  }}  
                >  
                  No  
                </button>  
              </div>  
            )}  
             
            <button  
              onClick={onClose}  
              className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"  
              style={{ color: COLORS.textDark }}  
              aria-label="Close"  
            >  
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">  
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>  
              </svg>  
            </button>  
          </div>  
        </div>

        {/* Image container - takes up remaining space */}  
        <div  
          className="relative flex-1 flex items-center justify-center"  
        >  
          <img  
            src={currentPhoto.url}  
            alt={currentPhoto.caption || 'Dish photo'}  
            className="max-w-full max-h-full object-contain"  
            style={{ maxHeight: 'calc(100vh - 200px)' }}  
            onDoubleClick={handleDoubleClick}  
          />

          {/* Double-click hint */}  
          {onDoubleClickDelete && canDelete && !showDeleteConfirm && (  
            <div  
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 px-3 py-1 rounded shadow-lg"  
              style={{  
                ...FONTS.elegant,  
                color: COLORS.textDark,  
                fontSize: '0.75rem',  
                fontWeight: '500'
              }}  
            >  
              Double-click to delete  
            </div>  
          )}
        </div>

        {/* Caption */}  
        {currentPhoto.caption && (  
          <div className="mt-4 flex justify-center">  
            <p style={{  
              ...FONTS.elegant,  
              color: COLORS.textDark,  
              fontSize: '0.95rem',  
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 16px',
              borderRadius: '8px',
              maxWidth: '80%',
              textAlign: 'center'
            }}>  
              {currentPhoto.caption}  
            </p>  
          </div>  
        )}  
      </div>  
    </div>  
  );  
};

export default PhotoModal;