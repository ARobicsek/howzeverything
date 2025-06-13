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
}

const PhotoModal: React.FC<PhotoModalProps> = ({    
  photos,    
  initialIndex,    
  currentUserId,    
  onClose,    
  onDelete   
}) => {    
  console.log('PhotoModal rendering with:', { 
    photosLength: photos?.length, 
    initialIndex, 
    photosExist: !!photos 
  });

  // FIXED: Ensure initial currentIndex is always valid
  const validInitialIndex = Math.max(0, Math.min(initialIndex, (photos?.length || 1) - 1));
  const [currentIndex, setCurrentIndex] = useState(validInitialIndex);    
  const [isDeleting, setIsDeleting] = useState(false);

  // Early validation with better error handling
  if (!photos || photos.length === 0) {
    console.warn("PhotoModal: No photos provided, closing modal");
    setTimeout(() => onClose(), 0);
    return null;
  }

  // FIXED: Always ensure we have a valid current photo
  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, photos.length - 1));
  const currentPhoto = photos[safeCurrentIndex];

  console.log('PhotoModal currentPhoto:', { 
    safeCurrentIndex, 
    currentPhoto: !!currentPhoto, 
    photoUrl: currentPhoto?.url,
    currentUserId: currentUserId,
    photoUserId: currentPhoto?.user_id
  });

  if (!currentPhoto) {
    console.error("PhotoModal: No current photo available after validation");
    setTimeout(() => onClose(), 0);
    return null;
  }

  // FIXED: Declare isOwner after currentPhoto is validated
  const isOwner = currentPhoto.user_id === currentUserId;

  useEffect(() => {    
    const validIndex = Math.max(0, Math.min(initialIndex, photos.length - 1));
    console.log('PhotoModal useEffect: Setting currentIndex from', initialIndex, 'to', validIndex);
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

  // Enhanced modal root detection and creation
  let modalRoot = document.getElementById('modal-root');    
  if (!modalRoot) {    
    console.warn("PhotoModal: modal-root not found, creating it");
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    modalRoot.style.position = 'fixed';
    modalRoot.style.top = '0';
    modalRoot.style.left = '0';
    modalRoot.style.width = '100vw';
    modalRoot.style.height = '100vh';
    modalRoot.style.pointerEvents = 'none'; // Allow clicks through when empty
    modalRoot.style.zIndex = '999999';
    document.body.appendChild(modalRoot);
    console.log("PhotoModal: Created and styled modal-root element");
  }

  // Double-check modal root
  if (!modalRoot) {
    console.error("PhotoModal: Still cannot find or create modal-root");
    return null;
  }

  console.log('PhotoModal: About to render portal with photo:', currentPhoto.url);
  console.log('PhotoModal: Modal root element:', modalRoot);

  // BULLETPROOF MODAL with forced visibility styles
  const modalElement = (    
    <div    
      style={{
        // FORCE these styles to ensure visibility
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647, // Maximum z-index value
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log('Backdrop clicked, closing modal');
          onClose();
        }
      }}
    >    
      {/* Backdrop - MORE VISIBLE for debugging */}    
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)'
        }}
      />    
         
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
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}    
      >    
        {/* Close button - ALWAYS VISIBLE */}    
        <button    
          onClick={() => {
            console.log('Close button clicked');
            onClose();
          }}    
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold'
          }}
          aria-label="Close"    
        >    
          ×
        </button>

        {/* Photo counter and delete button container */}    
        <div 
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 10,
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          {/* Photo counter */}
          {photos.length > 1 && (    
            <div 
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#000',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >    
              {safeCurrentIndex + 1} / {photos.length}    
            </div>    
          )}
          
          {/* Delete button for photo owners */}
          {isOwner && (    
            <button    
              onClick={(e) => {
                console.log('Delete button clicked - proceeding with delete');
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}    
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#3B82F6', // Blue background
                color: 'white',
                border: '2px solid black', // Black border
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                opacity: isDeleting ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}
              title="Delete this photo"
            >    
              {isDeleting ? '...' : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                </svg>
              )}
            </button>    
          )}
        </div>

        {/* Navigation arrows - if multiple photos */}    
        {photos.length > 1 && (    
          <>
            <button    
              onClick={() => {
                console.log('Previous button clicked');
                handlePrev();
              }}    
              disabled={safeCurrentIndex === 0}    
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: safeCurrentIndex === 0 ? 'rgba(128, 128, 128, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                color: '#000',
                border: 'none',
                cursor: safeCurrentIndex === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
              aria-label="Previous photo"    
            >    
              ‹
            </button>    
            <button    
              onClick={() => {
                console.log('Next button clicked');
                handleNext();
              }}
              disabled={safeCurrentIndex === photos.length - 1}    
              style={{
                position: 'absolute',
                right: '60px', // Account for close button
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: safeCurrentIndex === photos.length - 1 ? 'rgba(128, 128, 128, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                color: '#000',
                border: 'none',
                cursor: safeCurrentIndex === photos.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
              aria-label="Next photo"    
            >    
              ›
            </button>    
          </>
        )}

        {/* Image container - SIMPLIFIED */}    
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '60px 20px 20px 20px' // Account for buttons
          }}
        >    
          <img    
            src={currentPhoto.url}    
            alt={currentPhoto.caption || 'Dish photo'}    
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              cursor: 'default'
            }}
            onLoad={() => console.log('Photo loaded successfully:', currentPhoto.url)}
            onError={(e) => {
              console.error('Photo failed to load:', currentPhoto.url);
              console.error('Image error event:', e);
            }}
          />    
        </div>

        {/* Photo info - SIMPLIFIED */}    
        <div 
          style={{
            padding: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white'
          }}
        >    
          {/* Caption */}    
          {currentPhoto.caption && (    
            <div style={{marginBottom: '10px'}}>    
              <p style={{margin: 0, fontSize: '16px'}}>    
                {currentPhoto.caption}    
              </p>    
            </div>    
          )}

          {/* Photo metadata - simplified */}    
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              opacity: 0.8
            }}
          >    
            <span>    
              by {currentPhoto.photographer_name || 'Anonymous'} • {new Date(currentPhoto.created_at).toLocaleDateString()}    
            </span>
          </div>
        </div>    
      </div>    
    </div>
  );

  console.log('PhotoModal: Creating portal...');
  const portal = ReactDOM.createPortal(modalElement, modalRoot);
  console.log('PhotoModal: Portal created successfully');
  
  return portal;
};

export default PhotoModal;