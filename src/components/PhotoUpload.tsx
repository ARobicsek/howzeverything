// src/components/PhotoUpload.tsx  
import React, { useEffect, useRef, useState } from 'react';
import { COLORS, FONTS } from '../constants';

interface PhotoUploadProps {  
  onUpload: (file: File, caption?: string) => Promise<void>;  
  onCancel: () => void;  
  isUploading: boolean;  
  initialFile?: File; // For when photo is taken from camera or pre-selected
  skipFileSelection?: boolean; // Skip the file selection step and go straight to preview
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  onUpload, 
  onCancel, 
  isUploading, 
  initialFile,
  skipFileSelection = false 
}) => {  
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null);  
  const [preview, setPreview] = useState<string | null>(null);  
  const [caption, setCaption] = useState('');  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle initial file if provided (from camera or direct selection)  
  useEffect(() => {  
    if (initialFile) {  
      setSelectedFile(initialFile);  
      const reader = new FileReader();  
      reader.onloadend = () => {  
        setPreview(reader.result as string);  
      };  
      reader.readAsDataURL(initialFile);  
    }  
  }, [initialFile]);

  // Auto-trigger file selection if we're not skipping and don't have a file
  useEffect(() => {
    if (!skipFileSelection && !selectedFile && !initialFile) {
      fileInputRef.current?.click();
    }
  }, [skipFileSelection, selectedFile, initialFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {  
    const file = event.target.files?.[0];  
    if (file) {  
      // Validate file type  
      if (!file.type.startsWith('image/')) {  
        alert('Please select an image file');  
        return;  
      }

      // Validate file size (5MB limit)  
      if (file.size > 5 * 1024 * 1024) {  
        alert('File size must be less than 5MB');  
        return;  
      }

      setSelectedFile(file);  
       
      // Create preview  
      const reader = new FileReader();  
      reader.onloadend = () => {  
        setPreview(reader.result as string);  
      };  
      reader.readAsDataURL(file);  
    }  
  };

  const handleUpload = async () => {  
    if (!selectedFile) return;

    await onUpload(selectedFile, caption);  
     
    // Reset form after successful upload  
    setSelectedFile(null);  
    setPreview(null);  
    setCaption('');  
    if (fileInputRef.current) {  
      fileInputRef.current.value = '';  
    }  
  };

  const handleCancel = () => {  
    setSelectedFile(null);  
    setPreview(null);  
    setCaption('');  
    if (fileInputRef.current) {  
      fileInputRef.current.value = '';  
    }  
    onCancel();  
  };

  const resetSelection = () => {  
    setPreview(null);  
    setSelectedFile(null);  
    if (fileInputRef.current) {  
      fileInputRef.current.value = '';  
    }  
    // Auto-trigger file selection again if not skipping
    if (!skipFileSelection) {
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  };

  return (  
    <div className="w-full">  
      <h3 style={{  
        ...FONTS.elegant,  
        fontSize: '1.2rem',  
        fontWeight: '600',  
        color: COLORS.textWhite, // Updated for modal text color
        marginBottom: '16px'  
      }}>  
        {preview ? 'Photo Preview' : 'Upload Photo'}  
      </h3>  
       
      {!preview ? (  
        <div className="text-center">  
          <input  
            ref={fileInputRef}  
            type="file"  
            accept="image/*"  
            onChange={handleFileSelect}  
            className="hidden"  
            id="photo-upload"  
          />  
          {/* Only show the Choose Photo button if we're not skipping file selection */}
          {!skipFileSelection && (
            <label  
              htmlFor="photo-upload"  
              className="inline-block px-12 py-4 border border-black cursor-pointer transition-all duration-300 hover:bg-blue-600"  
              style={{  
                ...FONTS.elegant,  
                backgroundColor: '#3B82F6',  
                color: COLORS.textWhite,  
                fontSize: '1rem',  
                fontWeight: '500'  
              }}  
            >  
              Choose Photo  
            </label>  
          )}
          {/* If skipping file selection, show a loading message while file is being processed */}
          {skipFileSelection && !selectedFile && (
            <div style={{ ...FONTS.elegant, color: COLORS.textWhite }}>
              Preparing photo upload...
            </div>
          )}
        </div>  
      ) : (  
        <div className="space-y-3">  
          <div className="relative">  
            <img  
              src={preview}  
              alt="Preview"  
              className="w-full rounded-lg object-contain"  
              style={{ maxHeight: '300px' }}  
            />  
            {!isUploading && (  
              <button  
                onClick={resetSelection}  
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"  
                style={{ color: COLORS.textWhite }}  
              >  
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">  
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>  
                </svg>  
              </button>  
            )}  
          </div>

          <div className="space-y-2">  
            <label  
              htmlFor="photo-caption"  
              style={{  
                ...FONTS.elegant,  
                color: COLORS.textWhite, // Updated for modal text color
                fontSize: '0.85rem',  
                fontWeight: '500'  
              }}  
            >  
              Caption (optional)  
            </label>  
            <input  
              id="photo-caption"  
              type="text"  
              value={caption}  
              onChange={(e) => setCaption(e.target.value)}  
              placeholder="Add a caption..."  
              disabled={isUploading}  
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all bg-white"  
              style={{  
                ...FONTS.elegant,  
                color: COLORS.textDark, // Keep dark text for input field
                fontSize: '0.95rem'  
              }}  
            />  
          </div>

          {/* Updated button styling to match Save Photo/Cancel pattern */}
          <div className="flex gap-2">  
            <button  
              onClick={handleUpload}  
              disabled={isUploading}  
              className="flex-1 py-2 px-4 border border-black transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"  
              style={{  
                ...FONTS.elegant,  
                backgroundColor: isUploading ? COLORS.disabled : '#3B82F6', // Blue background
                color: COLORS.textWhite, // White text
                fontSize: '0.95rem',  
                fontWeight: '500'  
              }}  
              onMouseEnter={(e) => !isUploading && (e.currentTarget.style.backgroundColor = '#2563EB')}  
              onMouseLeave={(e) => !isUploading && (e.currentTarget.style.backgroundColor = '#3B82F6')}  
            >  
              {isUploading ? (  
                <span className="flex items-center justify-center gap-2">  
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">  
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>  
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>  
                  </svg>  
                  Uploading...  
                </span>  
              ) : (  
                'Save Photo'  
              )}  
            </button>  
            <button  
              onClick={handleCancel}  
              disabled={isUploading}  
              className="px-4 py-2 border border-black hover:bg-gray-100 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"  
              style={{  
                ...FONTS.elegant,  
                backgroundColor: 'white', // White background
                color: COLORS.textDark, // Black text
                fontSize: '0.95rem',  
                fontWeight: '500'  
              }}  
            >  
              Cancel  
            </button>  
          </div>  
        </div>  
      )}  
    </div>  
  );  
};

export default PhotoUpload;