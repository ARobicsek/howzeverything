// src/components/PhotoCarousel.tsx
import React from 'react';
import type { DishPhoto } from '../hooks/useDishes';

interface PhotoCarouselProps {
  photos: DishPhoto[];
  onPhotoClick: (photo: DishPhoto, index: number) => void;
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ photos, onPhotoClick }) => {
  const maxThumbnails = 5;
  const displayPhotos = photos.slice(0, maxThumbnails);
  const remainingCount = Math.max(0, photos.length - maxThumbnails);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* Photo thumbnails */}
      {displayPhotos.map((photo, index) => (
        <button
          key={photo.id}
          onClick={() => onPhotoClick(photo, index)}
          className="relative flex-shrink-0 rounded-md overflow-hidden hover:opacity-80 transition-opacity group"
          style={{ 
            width: '80px', 
            height: '80px'
          }}
        >
          <img
            src={photo.url}
            alt={photo.caption || `Photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Show "+X" overlay on last thumbnail if there are more photos */}
          {index === maxThumbnails - 1 && remainingCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span 
                className="text-white font-medium text-sm"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                +{remainingCount}
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default PhotoCarousel;