// src/components/PhotoModal.tsx
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
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

  const handleCancelEditCaption = () => setIsEditingCaption(false);

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
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-modal animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-auto h-auto flex flex-col bg-black rounded-lg overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            {photos.length > 1 && (
              <div className="px-3 py-2 rounded-md bg-white/90 font-body text-sm font-medium text-black">
                {safeCurrentIndex + 1} / {photos.length}
              </div>
            )}
            {isOwner && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  disabled={isDeleting}
                  className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center transition-all hover:bg-danger disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete this photo"
                >
                  {isDeleting ? '...' : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEditCaption(); }}
                  className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center transition-all hover:bg-primary"
                  title="Edit caption"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center text-2xl font-bold transition-all hover:bg-white hover:scale-110"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center text-2xl transition-all hover:bg-white hover:scale-110"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center text-2xl transition-all hover:bg-white hover:scale-110"
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}

        <div className="flex items-center justify-center min-h-[400px] p-20">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.caption || 'Dish photo'}
            className="max-w-full max-h-[70vh] object-contain rounded-md"
          />
        </div>

        {(currentPhoto.caption || currentPhoto.photographer_name || isEditingCaption) && (
          <div className="p-5 bg-black/80 border-t border-gray-700">
            {isEditingCaption ? (
              <div>
                <textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="w-full p-2 rounded-md bg-white/10 text-white border border-gray-600 focus:border-primary focus:ring-primary/50"
                  placeholder="Enter a caption..."
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={handleCancelEditCaption} className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500">Cancel</button>
                  <button onClick={handleSaveCaption} className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primaryHover">Save</button>
                </div>
              </div>
            ) : (
              currentPhoto.caption && (
                <p className={`font-body text-base text-white m-0 ${currentPhoto.photographer_name ? 'mb-2' : ''}`}>
                  {currentPhoto.caption}
                </p>
              )
            )}
            <div className="font-body text-sm text-gray-400">
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