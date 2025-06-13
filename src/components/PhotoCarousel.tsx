// src/components/PhotoCarousel.tsx  
import React from 'react';
import type { DishPhoto } from '../hooks/useDishes';

interface PhotoCarouselProps {  
  photos: DishPhoto[];  
  onPhotoClick: (photo: DishPhoto, index: number) => void;  
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
          {/* Optional: Add a subtle overlay on hover for better UX */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 pointer-events-none" />
        </button>  
      ))}  
    </div>  
  );  
};

export default PhotoCarousel;