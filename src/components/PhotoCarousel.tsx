// src/components/PhotoCarousel.tsx
import React from 'react';
import type { DishPhoto } from '../hooks/useDishes';

interface PhotoCarouselProps {
  photos: DishPhoto[];
  onPhotoClick: (photo: DishPhoto, index: number, event: React.MouseEvent) => void;
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ photos, onPhotoClick }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          onClick={(e) => onPhotoClick(photo, index, e)}
          className="relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden hover:opacity-80 transition-opacity group border-none"
        >
          <img
            src={photo.url}
            alt={photo.caption || `Photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 pointer-events-none" />
        </button>
      ))}
    </div>
  );
};

export default PhotoCarousel;