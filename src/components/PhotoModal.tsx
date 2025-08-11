// src/components/PhotoModal.tsx
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { COMPONENT_STYLES } from '../constants';
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
  const validInitialIndex = Math.max(0, Math.min(initialIndex, (photos?.length || 1) - 1));
  const [currentIndex, setCurrentIndex] = useState(validInitialIndex);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');

  if (!photos || photos.length === 0) {
    setTimeout(() => onClose(), 0);
    return null;
  }

  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, photos.length - 1));
  const currentPhoto = photos[safeCurrentIndex];

  if (!currentPhoto) {
    setTimeout(() => onClose(), 0);
    return null;
  }

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

  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }

  if (!modalRoot) return null;

  const modalElement = (
    <div style={COMPONENT_STYLES.modal.lightbox.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={COMPONENT_STYLES.modal.lightbox.content} onClick={(e) => e.stopPropagation()}>
        <div style={COMPONENT_STYLES.modal.lightbox.header}>
          <div style={COMPONENT_STYLES.modal.lightbox.headerControls}>
            {photos.length > 1 && (
              <div style={COMPONENT_STYLES.modal.lightbox.photoCounter}>
                {safeCurrentIndex + 1} / {photos.length}
              </div>
            )}
            {isOwner && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  disabled={isDeleting}
                  style={{ ...COMPONENT_STYLES.button.icon.primary, opacity: isDeleting ? 0.5 : 1, cursor: isDeleting ? 'not-allowed' : 'pointer' }}
                  title="Delete this photo"
                >
                  {isDeleting ? '...' : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEditCaption(); }}
                  style={COMPONENT_STYLES.button.icon.primary}
                  title="Edit caption"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
              </>
            )}
          </div>
          <button onClick={onClose} style={COMPONENT_STYLES.button.icon.light} aria-label="Close">
            ×
          </button>
        </div>

        {photos.length > 1 && (
          <>
            <button onClick={handlePrev} style={{ ...COMPONENT_STYLES.modal.lightbox.navButton, left: '1rem' }} aria-label="Previous photo">
              ‹
            </button>
            <button onClick={handleNext} style={{ ...COMPONENT_STYLES.modal.lightbox.navButton, right: '1rem' }} aria-label="Next photo">
              ›
            </button>
          </>
        )}

        <div style={COMPONENT_STYLES.modal.lightbox.imageContainer}>
          <img src={currentPhoto.url} alt={currentPhoto.caption || 'Dish photo'} style={COMPONENT_STYLES.modal.lightbox.image} />
        </div>

        {(currentPhoto.caption || currentPhoto.photographer_name || isEditingCaption) && (
          <div style={COMPONENT_STYLES.modal.lightbox.footer}>
            {isEditingCaption ? (
              <div>
                <textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  style={{...COMPONENT_STYLES.input, width: '100%', backgroundColor: 'rgba(255,255,255,0.1)'}}
                  placeholder="Enter a caption..."
                />
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem'}}>
                  <button onClick={handleCancelEditCaption} style={COMPONENT_STYLES.button.secondary}>Cancel</button>
                  <button onClick={handleSaveCaption} style={COMPONENT_STYLES.button.primary}>Save</button>
                </div>
              </div>
            ) : (
              currentPhoto.caption && (
                <p style={{ ...COMPONENT_STYLES.modal.lightbox.caption, marginBottom: currentPhoto.photographer_name ? '0.5rem' : 0 }}>
                  {currentPhoto.caption}
                </p>
              )
            )}
            <div style={COMPONENT_STYLES.modal.lightbox.meta}>
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