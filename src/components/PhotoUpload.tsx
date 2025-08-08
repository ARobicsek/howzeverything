// src/components/PhotoUpload.tsx
import React, { useEffect, useRef, useState } from 'react';
import { IMAGE_COMPRESSION } from '../constants';

interface PhotoUploadProps {
  onUpload: (file: File, caption?: string) => Promise<void>;
  onCancel: () => void;
  isUploading: boolean;
  initialFile?: File;
  skipFileSelection?: boolean;
}

const UploadProgressAnimation: React.FC<{
  progress: number;
  isIndeterminate?: boolean;
  status: string;
}> = ({ progress, isIndeterminate = false, status }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (!isIndeterminate) {
      const timer = setTimeout(() => setAnimatedProgress(progress), 100);
      return () => clearTimeout(timer);
    }
  }, [progress, isIndeterminate]);

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white/90 rounded-md backdrop-blur-sm border border-gray-200">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-16 h-16 rounded-full bg-primary opacity-20 animate-pulse" />
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            <path d="M12,11L16,15H13V19H11V15H8L12,11Z" />
          </svg>
        </div>
      </div>
      <div className="w-52 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
        {isIndeterminate ? (
          <div className="absolute top-0 left-0 w-1/2 h-full bg-primary rounded-full animate-indeterminate-progress" />
        ) : (
          <div
            className="h-full bg-primary rounded-full transition-width duration-300 ease-out"
            style={{ width: `${animatedProgress}%` }}
          />
        )}
      </div>
      <div className="text-center">
        <p className="font-elegant text-base font-semibold text-text m-0 mb-1">{status}</p>
        {!isIndeterminate && (
          <p className="font-elegant text-sm text-textSecondary m-0">{Math.round(progress)}% complete</p>
        )}
      </div>
    </div>
  );
};

const compressImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  return new Promise((resolve, reject) => {
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
    const timeout = setTimeout(() => reject(new Error('Image compression timed out')), IMAGE_COMPRESSION.COMPRESSION_TIMEOUT);
    img.onload = () => {
      try {
        clearTimeout(timeout);
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
        ctx.drawImage(img, 0, 0, width, height);
        let quality = IMAGE_COMPRESSION.INITIAL_QUALITY;
        let attempts = 0;
        const maxAttempts = Math.floor((IMAGE_COMPRESSION.INITIAL_QUALITY - IMAGE_COMPRESSION.MIN_QUALITY) / IMAGE_COMPRESSION.QUALITY_STEP) + 1;
        const compress = () => {
          attempts++;
          const progressPercent = (attempts / maxAttempts) * 100;
          onProgress?.(Math.min(progressPercent, 95));
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            const targetSizeBytes = IMAGE_COMPRESSION.MAX_FILE_SIZE_MB * 1024 * 1024;
            if (blob.size <= targetSizeBytes || quality <= IMAGE_COMPRESSION.MIN_QUALITY) {
              onProgress?.(100);
              const originalName = file.name.replace(/\.[^/.]+$/, '');
              const compressedFile = new File([blob], `${originalName}.jpg`, { type: IMAGE_COMPRESSION.MIME_TYPE });
              resolve(compressedFile);
            } else {
              quality -= IMAGE_COMPRESSION.QUALITY_STEP;
              setTimeout(compress, 100);
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
  skipFileSelection = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('Preparing upload...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) {
      setSelectedFile(initialFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(initialFile);
    }
  }, [initialFile]);

  useEffect(() => {
    if (!skipFileSelection && !selectedFile && !initialFile) {
      fileInputRef.current?.click();
    }
  }, [skipFileSelection, selectedFile, initialFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > IMAGE_COMPRESSION.MAX_ORIGINAL_SIZE_MB * 1024 * 1024) {
        alert(`File size must be less than ${IMAGE_COMPRESSION.MAX_ORIGINAL_SIZE_MB}MB`);
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadProgress(0);
    setUploadStatus('Validating image...');
    try {
      setUploadStatus('Compressing image...');
      setUploadProgress(10);
      const compressedFile = await compressImage(selectedFile, (progress) => {
        const mappedProgress = 10 + progress * 0.5;
        setUploadProgress(mappedProgress);
      });
      setUploadProgress(60);
      setUploadStatus('Preparing upload...');
      const originalSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
      const compressionRatio = ((1 - compressedFile.size / selectedFile.size) * 100).toFixed(1);
      console.log(`📸 Image compression complete:`);
      console.log(`   Original: ${originalSizeMB}MB`);
      console.log(`   Compressed: ${compressedSizeMB}MB`);
      console.log(`   Reduction: ${compressionRatio}%`);
      setUploadProgress(70);
      setUploadStatus('Uploading to cloud storage...');
      const uploadProgressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 2 : prev));
      }, 200);
      await Promise.race([
        onUpload(compressedFile, caption),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout - please check your connection and try again')), 60000)),
      ]);
      clearInterval(uploadProgressInterval);
      setUploadProgress(100);
      setUploadStatus('Upload complete!');
      setTimeout(() => {
        setSelectedFile(null);
        setPreview(null);
        setCaption('');
        setUploadProgress(0);
        setUploadStatus('Preparing upload...');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1000);
    } catch (error: any) {
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
    if (fileInputRef.current) fileInputRef.current.value = '';
    onCancel();
  };

  const resetSelection = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!skipFileSelection) {
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="w-full">
      <h3 className="font-elegant text-lg font-semibold text-textWhite mb-4">
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
          {!skipFileSelection && (
            <label
              htmlFor="photo-upload"
              className="inline-block px-12 py-4 border border-black cursor-pointer transition-all duration-300 hover:bg-blue-600 font-elegant bg-blue-500 text-textWhite text-base font-medium"
            >
              Choose Photo
            </label>
          )}
          {skipFileSelection && !selectedFile && (
            <div className="font-elegant text-textWhite">Preparing photo upload...</div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-lg object-contain max-h-72"
            />
            {!isUploading && (
              <button
                onClick={resetSelection}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors text-textWhite"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              </button>
            )}
          </div>
          {selectedFile && !isUploading && (
            <div className="font-elegant text-xs text-textWhite text-center p-2 bg-black/30 rounded-md">
              Original size: {formatFileSize(selectedFile.size)} → Will be compressed to ~{formatFileSize(IMAGE_COMPRESSION.MAX_FILE_SIZE_MB * 1024 * 1024)} max
            </div>
          )}
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
                  className="font-elegant text-textWhite text-sm font-medium"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all bg-white font-elegant text-text text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 py-2 px-4 border border-black transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-elegant bg-blue-500 text-textWhite text-sm font-medium hover:bg-blue-600"
                >
                  Save Photo
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="px-4 py-2 border border-black hover:bg-gray-100 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-elegant bg-white text-text text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;