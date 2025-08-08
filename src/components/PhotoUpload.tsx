// src/components/PhotoUpload.tsx
import React, { useEffect, useRef, useState } from 'react';
import { COLORS, FONTS, IMAGE_COMPRESSION, SPACING, STYLES } from '../constants';

interface PhotoUploadProps {
  onUpload: (file: File, caption?: string) => Promise<void>;
  onCancel: () => void;
  isUploading: boolean;
  initialFile?: File; // For when photo is taken from camera or pre-selected
  skipFileSelection?: boolean; // Skip the file selection step and go straight to preview
}

// Progress animation component
const UploadProgressAnimation: React.FC<{
  progress: number;
  isIndeterminate?: boolean;
  status: string;
}> = ({ progress, isIndeterminate = false, status }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (!isIndeterminate) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, isIndeterminate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: SPACING[3],
      padding: SPACING[4],
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: STYLES.borderRadiusMedium,
      backdropFilter: 'blur(8px)',
      border: `1px solid ${COLORS.gray200}`
    }}>
      {/* Upload icon with pulse animation */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Pulsing background circle */}
        <div style={{
          position: 'absolute',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: COLORS.primary,
          opacity: 0.2,
          animation: 'pulse 2s infinite'
        }} />

        {/* Upload icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: COLORS.primary,
          color: COLORS.white,
          zIndex: 1
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            <path d="M12,11L16,15H13V19H11V15H8L12,11Z" />
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '200px',
        height: '6px',
        backgroundColor: COLORS.gray200,
        borderRadius: '3px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {isIndeterminate ? (
          // Indeterminate progress bar with moving animation
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-50%',
            width: '50%',
            height: '100%',
            backgroundColor: COLORS.primary,
            borderRadius: '3px',
            animation: 'indeterminateProgress 2s infinite linear'
          }} />
        ) : (
          // Determinate progress bar
          <div style={{
            width: `${animatedProgress}%`,
            height: '100%',
            backgroundColor: COLORS.primary,
            borderRadius: '3px',
            transition: 'width 0.3s ease-out'
          }} />
        )}
      </div>

      {/* Status text */}
      <div style={{
        textAlign: 'center'
      }}>
        <p style={{
          ...FONTS.elegant,
          fontSize: '1rem',
          fontWeight: '600',
          color: COLORS.text,
          margin: 0,
          marginBottom: SPACING[1]
        }}>
          {status}
        </p>
        {!isIndeterminate && (
          <p style={{
            ...FONTS.elegant,
            fontSize: '0.85rem',
            color: COLORS.textSecondary,
            margin: 0
          }}>
            {Math.round(progress)}% complete
          </p>
        )}
      </div>
    </div>
  );
};

// Image compression function
const compressImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Check file size limit before processing
    if (file.size > IMAGE_COMPRESSION.MAX_ORIGINAL_SIZE_MB * 1024 * 1024) {
      reject(new Error(`File too large. Please select an image smaller than ${IMAGE_COMPRESSION.MAX_ORIGINAL_SIZE_MB}MB.`));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    // Set timeout for compression
    const timeout = setTimeout(() => {
      reject(new Error('Image compression timed out'));
    }, IMAGE_COMPRESSION.COMPRESSION_TIMEOUT);

    img.onload = () => {
      try {
        clearTimeout(timeout);

        // Calculate optimal dimensions
        let { width, height } = img;
        const maxDimension = Math.max(IMAGE_COMPRESSION.MAX_WIDTH, IMAGE_COMPRESSION.MAX_HEIGHT);

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Start compression with quality reduction
        let quality = IMAGE_COMPRESSION.INITIAL_QUALITY;
        let attempts = 0;
        const maxAttempts = Math.floor((IMAGE_COMPRESSION.INITIAL_QUALITY - IMAGE_COMPRESSION.MIN_QUALITY) / IMAGE_COMPRESSION.QUALITY_STEP) + 1;

        const compress = () => {
          attempts++;
          const progressPercent = (attempts / maxAttempts) * 100;
          onProgress?.(Math.min(progressPercent, 95)); // Leave 5% for final processing

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const targetSizeBytes = IMAGE_COMPRESSION.MAX_FILE_SIZE_MB * 1024 * 1024;

            // If file is small enough or we've reached minimum quality, we're done
            if (blob.size <= targetSizeBytes || quality <= IMAGE_COMPRESSION.MIN_QUALITY) {
              onProgress?.(100);

              // Create file with proper extension
              const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
              const compressedFile = new File(
                [blob],
                `${originalName}.jpg`,
                { type: IMAGE_COMPRESSION.MIME_TYPE }
              );

              resolve(compressedFile);
            } else {
              // Try again with lower quality
              quality -= IMAGE_COMPRESSION.QUALITY_STEP;
              setTimeout(compress, 100); // Small delay to allow UI update
            }
          }, IMAGE_COMPRESSION.OUTPUT_FORMAT, quality);
        };

        compress();
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = URL.createObjectURL(file);
  });
};

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('Preparing upload...');
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

      // Validate file size (check against max original size)
      if (file.size > IMAGE_COMPRESSION.MAX_ORIGINAL_SIZE_MB * 1024 * 1024) {
        alert(`File size must be less than ${IMAGE_COMPRESSION.MAX_ORIGINAL_SIZE_MB}MB`);
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

    // Reset progress tracking
    setUploadProgress(0);
    setUploadStatus('Validating image...');

    try {
      // Step 1: Compress the image (10-60% of progress)
      setUploadStatus('Compressing image...');
      setUploadProgress(10);

      const compressedFile = await compressImage(selectedFile, (progress) => {
        // Map compression progress to 10-60% of total progress
        const mappedProgress = 10 + (progress * 0.5);
        setUploadProgress(mappedProgress);
      });

      // Step 2: Prepare for upload (60-70% of progress)
      setUploadProgress(60);
      setUploadStatus('Preparing upload...');

      // Log compression results
      const originalSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
      const compressionRatio = ((1 - compressedFile.size / selectedFile.size) * 100).toFixed(1);

      console.log(`📸 Image compression complete:`);
      console.log(`   Original: ${originalSizeMB}MB`);
      console.log(`   Compressed: ${compressedSizeMB}MB`);
      console.log(`   Reduction: ${compressionRatio}%`);

      // Step 3: Upload (70-95% of progress)
      setUploadProgress(70);
      setUploadStatus('Uploading to cloud storage...');

      // Simulate upload progress
      const uploadProgressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) {
            return prev + 2;
          }
          return prev;
        });
      }, 200);

      // Call the actual upload function with extended timeout handling
      await Promise.race([
        onUpload(compressedFile, caption),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout - please check your connection and try again')), 60000) // 60 second timeout
        )
      ]);

      // Complete the progress
      clearInterval(uploadProgressInterval);
      setUploadProgress(100);
      setUploadStatus('Upload complete!');

      // Give user a moment to see completion before cleanup
      setTimeout(() => {
        // Reset form after successful upload
        setSelectedFile(null);
        setPreview(null);
        setCaption('');
        setUploadProgress(0);
        setUploadStatus('Preparing upload...');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);

    } catch (error: any) {
      // Handle compression, timeout or other errors
      setUploadProgress(0);

      if (error.message.includes('compression') || error.message.includes('Canvas')) {
        setUploadStatus('Compression failed');
        alert('Failed to compress image: ' + error.message);
      } else if (error.message.includes('timeout')) {
        setUploadStatus('Upload failed - connection timeout');
        alert('Upload timed out. The compressed image should upload faster - please try again.');
      } else {
        setUploadStatus('Upload failed');
        alert('Upload failed: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');
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

  // Calculate and display file size info
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)}KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
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

          {/* File size information */}
          {selectedFile && !isUploading && (
            <div style={{
              ...FONTS.elegant,
              fontSize: '0.8rem',
              color: COLORS.textWhite,
              textAlign: 'center',
              padding: SPACING[2],
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: STYLES.borderRadiusMedium
            }}>
              Original size: {formatFileSize(selectedFile.size)} → Will be compressed to ~{formatFileSize(IMAGE_COMPRESSION.MAX_FILE_SIZE_MB * 1024 * 1024)} max
            </div>
          )}

          {/* Show upload progress animation when uploading */}
          {isUploading && (
            <UploadProgressAnimation
              progress={uploadProgress}
              isIndeterminate={uploadProgress === 0}
              status={uploadStatus}
            />
          )}

          {!isUploading && (
            <>
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
                    color: COLORS.text, // Keep dark text for input field
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Upload and Cancel buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 py-2 px-4 border border-black transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    ...FONTS.elegant,
                    backgroundColor: isUploading ? COLORS.gray300 : '#3B82F6', // Blue background
                    color: COLORS.textWhite, // White text
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => !isUploading && (e.currentTarget.style.backgroundColor = '#2563EB')}
                  onMouseLeave={(e) => !isUploading && (e.currentTarget.style.backgroundColor = '#3B82F6')}
                >
                  Save Photo
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="px-4 py-2 border border-black hover:bg-gray-100 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    ...FONTS.elegant,
                    backgroundColor: 'white', // White background
                    color: COLORS.text, // Black text
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Add CSS animations for the progress indicators */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.2;
          }
        }

        @keyframes indeterminateProgress {
          0% {
            left: -50%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PhotoUpload;