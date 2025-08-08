// src/components/PhotoModal.tsx
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../constants';
import type { DishPhoto } from '../hooks/useDishes';

interface PhotoModalProps {
  photos: DishPhoto[];
  initialIndex: number;
  currentUserId: string | null;
  onClose: () => void;
  onDelete: (photoId: string) => Promise<void>;
  onUpdateCaption: (photoId: string, caption: string) => Promise<void>;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  photos,
  initialIndex,
  currentUserId,
  onClose,
  onDelete,
  onUpdateCaption,
}) => {
  // Ensure initial currentIndex is always valid
  const validInitialIndex = Math.max(0, Math.min(initialIndex, (photos?.length || 1) - 1));
  const [currentIndex, setCurrentIndex] = useState(validInitialIndex);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');

  // Early validation
  if (!photos || photos.length === 0) {
    setTimeout(() => onClose(), 0);
    return null;
  }

  // Always ensure we have a valid current photo
  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, photos.length - 1));
  const currentPhoto = photos[safeCurrentIndex];

  if (!currentPhoto) {
    setTimeout(() => onClose(), 0);
    return null;
  }

  // Check if current user owns the photo
  const isOwner = currentPhoto.user_id === currentUserId;

  useEffect(() => {
    const validIndex = Math.max(0, Math.min(initialIndex, photos.length - 1));
    setCurrentIndex(validIndex);
  }, [initialIndex, photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  }, [photos.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      setIsDeleting(true);
      try {
        await onDelete(currentPhoto.id);
      } catch (error) {
        console.error('Error deleting photo:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEditCaption = () => {
    setEditedCaption(currentPhoto.caption || '');
    setIsEditingCaption(true);
  };

  const handleCancelEditCaption = () => {
    setIsEditingCaption(false);
  };

  const handleSaveCaption = async () => {
    try {
      await onUpdateCaption(currentPhoto.id, editedCaption);
      setIsEditingCaption(false);
    } catch (error) {
      console.error('Error updating caption:', error);
    }
  };

  // Get or create modal root
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }

  if (!modalRoot) {
    return null;
  }

  const modalElement = (
    <div
      style={{
        ...STYLES.modalOverlay,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal content */}
      <div
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: 'auto',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: COLORS.black,
          borderRadius: STYLES.borderRadiusLarge,
          overflow: 'hidden',
          animation: 'slideIn 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header controls */}
        <div style={{
          position: 'absolute',
          top: SPACING[4],
          left: SPACING[4],
          right: SPACING[4],
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Left side controls */}
          <div style={{ display: 'flex', gap: SPACING[3], alignItems: 'center' }}>
            {/* Photo counter */}
            {photos.length > 1 && (
              <div style={{
                padding: `${SPACING[2]} ${SPACING[3]}`,
                borderRadius: STYLES.borderRadiusMedium,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                ...FONTS.body,
                fontSize: TYPOGRAPHY.sm.fontSize,
                fontWeight: TYPOGRAPHY.medium,
                color: COLORS.black
              }}>
                {safeCurrentIndex + 1} / {photos.length}
              </div>
            )}
            
            {/* Delete button for photo owners */}
            {isOwner && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  style={{
                    ...STYLES.deleteButton,
                    opacity: isDeleting ? 0.5 : 1,
                    cursor: isDeleting ? 'not-allowed' : 'pointer'
                  }}
                  title="Delete this photo"
                >
                  {isDeleting ? '...' : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCaption();
                  }}
                  style={{...STYLES.deleteButton}}
                  title="Edit caption"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: COLORS.black,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.white;
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: SPACING[4],
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: COLORS.black,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.white;
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: SPACING[4],
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: COLORS.black,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.white;
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}

        {/* Image container */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: `80px ${SPACING[8]} ${SPACING[6]}`
        }}>
          <img
            src={currentPhoto.url}
            alt={currentPhoto.caption || 'Dish photo'}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: STYLES.borderRadiusMedium
            }}
          />
        </div>

        {/* Photo info */}
        {(currentPhoto.caption || currentPhoto.photographer_name || isEditingCaption) && (
          <div style={{
            padding: SPACING[5],
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderTop: `1px solid ${COLORS.gray700}`
          }}>
            {/* Caption */}
            {isEditingCaption ? (
              <div>
                <textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  style={{...STYLES.input, width: '100%', color: COLORS.white, backgroundColor: 'rgba(255,255,255,0.1)'}}
                  placeholder="Enter a caption..."
                />
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: SPACING[2], marginTop: SPACING[2]}}>
                  <button onClick={handleCancelEditCaption} style={{...STYLES.secondaryButton}}>Cancel</button>
                  <button onClick={handleSaveCaption} style={{...STYLES.primaryButton}}>Save</button>
                </div>
              </div>
            ) : (
              currentPhoto.caption && (
                <p style={{
                  ...FONTS.body,
                  fontSize: TYPOGRAPHY.base.fontSize,
                  color: COLORS.white,
                  margin: 0,
                  marginBottom: currentPhoto.photographer_name ? SPACING[2] : 0
                }}>
                  {currentPhoto.caption}
                </p>
              )
            )}

            {/* Photo metadata */}
            <div style={{
              ...FONTS.body,
              fontSize: TYPOGRAPHY.sm.fontSize,
              color: COLORS.gray400
            }}>
              <span>
                by {currentPhoto.photographer_name || 'Anonymous'}
                {' • '}
                {new Date(currentPhoto.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalElement, modalRoot);
};

export default PhotoModal;