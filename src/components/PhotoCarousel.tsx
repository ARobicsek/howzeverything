// src/components/PhotoCarousel.tsx
import React from 'react';
import type { DishPhoto } from '../hooks/useDishes';


interface PhotoCarouselProps {
  photos: DishPhoto[];
  // UPDATED: onPhotoClick now expects the React.MouseEvent event object
  onPhotoClick: (photo: DishPhoto, index: number, event: React.MouseEvent) => void;
}


const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ photos, onPhotoClick }) => {
  // Remove the artificial limit - show all photos
  const displayPhotos = photos; // Show all photos instead of limiting to 5


  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* Photo thumbnails - now shows all photos */}
      {displayPhotos.map((photo, index) => (
        <button
          key={photo.id}
          // UPDATED: Pass the event object (e) to the onPhotoClick handler
          onClick={(e) => onPhotoClick(photo, index, e)}
          className="relative flex-shrink-0 rounded-md overflow-hidden hover:opacity-80 transition-opacity group"
          style={{
            width: '80px',
            height: '80px',
            // MODIFIED: Added border: 'none' to remove default button borders
            border: 'none',
          }}
        >
          <img
            src={photo.url}
            alt={photo.caption || `Photo ${index + 1}`}
            // MODIFIED: Applied objectFit: 'cover' directly via inline style for guaranteed fit
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {/* Optional: Add a subtle overlay on hover for better UX */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 pointer-events-none" />
        </button>
      ))}
    </div>
  );
};


export default PhotoCarousel;