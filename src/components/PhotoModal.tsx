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
  onDoubleClickDelete = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteHint, setShowDeleteHint] = useState(false);
  
  const currentPhoto = photos[currentIndex];
  const isOwner = currentPhoto?.user_id === currentUserId;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) setCurrentIndex(currentIndex + 1);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos.length, onClose]);

  useEffect(() => {
    // Show delete hint for photo owners
    if (isOwner && onDoubleClickDelete) {
      setShowDeleteHint(true);
      const timer = setTimeout(() => setShowDeleteHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isOwner, onDoubleClickDelete]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      setIsDeleting(true);
      try {
        await onDelete(currentPhoto.id);
        if (photos.length === 1) {
          onClose();
        } else if (currentIndex >= photos.length - 1) {
          setCurrentIndex(currentIndex - 1);
        }
      } catch (error) {
        console.error('Error deleting photo:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDoubleClick = () => {
    if (isOwner && onDoubleClickDelete) {
      handleDelete();
    }
  };

  if (!currentPhoto) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Enhanced backdrop with blur effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal content - positioned higher with pt-8 */}
      <div 
        className="relative max-w-4xl max-h-screen w-full h-full flex flex-col pt-8 px-4 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {/* Navigation arrows - positioned in upper right */}
        {photos.length > 1 && (
          <div className="absolute top-4 right-20 z-10 flex gap-2">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className={`p-2 rounded-full transition-all ${
                currentIndex === 0 
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' 
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
              aria-label="Previous photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(photos.length - 1, currentIndex + 1))}
              disabled={currentIndex === photos.length - 1}
              className={`p-2 rounded-full transition-all ${
                currentIndex === photos.length - 1 
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' 
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
              aria-label="Next photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>
        )}

        {/* Photo counter with improved visibility */}
        {photos.length > 1 && (
          <div className="absolute top-4 left-4 z-10">
            <div 
              className="px-3 py-1 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: COLORS.textDark,
                ...FONTS.elegant,
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
        )}

        {/* Image container */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.caption || 'Dish photo'}
            className="max-w-full max-h-full object-contain cursor-pointer"
            style={{ maxHeight: '70vh' }}
            onDoubleClick={handleDoubleClick}
          />
        </div>

        {/* Photo information with improved visibility */}
        <div className="mt-4 space-y-2">
          {/* Caption */}
          {currentPhoto.caption && (
            <div 
              className="px-4 py-2 rounded-lg inline-block"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: COLORS.textDark
              }}
            >
              <p style={{...FONTS.elegant, fontSize: '1rem', margin: 0}}>
                {currentPhoto.caption}
              </p>
            </div>
          )}

          {/* Photographer and date */}
          <div className="flex items-center justify-between">
            <div 
              className="px-3 py-1 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: COLORS.textDark
              }}
            >
              <p style={{...FONTS.elegant, fontSize: '0.75rem', opacity: 0.8, margin: 0}}>
                by {currentPhoto.photographer_name || 'Anonymous'} • {new Date(currentPhoto.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Delete button for owners */}
            {isOwner && !onDoubleClickDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: COLORS.danger,
                  color: 'white',
                  ...FONTS.elegant,
                  fontSize: '0.875rem',
                  opacity: isDeleting ? 0.5 : 1,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Photo'}
              </button>
            )}
          </div>

          {/* Delete hint */}
          {showDeleteHint && isOwner && onDoubleClickDelete && (
            <div 
              className="px-3 py-1 rounded-lg inline-block animate-pulse"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: COLORS.textDark
              }}
            >
              <p style={{...FONTS.elegant, fontSize: '0.75rem', margin: 0}}>
                💡 Double-click photo to delete
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;