"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from "react-image-crop";
import { Upload, X, Check, RotateCcw } from "lucide-react";
import "react-image-crop/dist/ReactCrop.css";

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onUpload?: (file: File, croppedImageUrl: string) => Promise<string>;
  aspectRatio?: number;
  className?: string;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  onUpload,
  aspectRatio = 1, // Default to square
  className 
}: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropper, setShowCropper] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height,
      ),
      width,
      height,
    ));
  }, [aspectRatio]);

  const getCroppedImageUrl = useCallback((
    image: HTMLImageElement,
    crop: PixelCrop,
  ): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg', 0.95);
    });
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !selectedImage) return;

          setUploading(true);
      try {
        const croppedImageUrl = await getCroppedImageUrl(imgRef.current, completedCrop);
        
        if (onUpload && fileInputRef.current?.files?.[0]) {
          // If onUpload is provided, upload to storage
          const uploadedUrl = await onUpload(fileInputRef.current.files[0], croppedImageUrl);
          onChange(uploadedUrl);
        } else {
          // Otherwise, use the cropped blob URL directly
          onChange(croppedImageUrl);
        }
        
        setShowCropper(false);
        setSelectedImage(null);
      } catch (error) {
        console.error('Error processing image:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        if (errorMessage.includes('Bucket not found')) {
          alert('Storage setup required. Please check the setup guide or contact your administrator.');
        } else if (errorMessage.includes('Permission denied')) {
          alert('Upload permission denied. Please check your access rights.');
        } else if (errorMessage.includes('File too large')) {
          alert('Image file is too large. Please use an image smaller than 5MB.');
        } else {
          alert(`Failed to process image: ${errorMessage}`);
        }
      } finally {
        setUploading(false);
      }
  }, [completedCrop, selectedImage, onUpload, onChange, getCroppedImageUrl]);

  const handleCancel = useCallback(() => {
    setShowCropper(false);
    setSelectedImage(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleReset = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image or Upload Button */}
      {!showCropper && (
        <div>
          {value ? (
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#1A1B1B] mx-auto">
                <img 
                  src={value} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#509887", color: "#090A0A" }}
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-red-900/20"
                  style={{ color: "#EF4444", border: "1px solid #EF4444" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: "#1A1B1B", color: "#8C8D8D" }}
            >
              <Upload size={32} />
              <div className="text-center">
                <p className="font-medium">Upload Profile Image</p>
                <p className="text-sm">PNG, JPG up to 5MB</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0C0D0D] rounded-xl border border-[#1A1B1B] p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold" style={{ color: "#E7E7E7" }}>
                Crop Image
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 rounded hover:bg-white/10 transition-colors"
                style={{ color: "#8C8D8D" }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={selectedImage}
                  onLoad={onImageLoad}
                  className="max-w-full max-h-96 object-contain"
                />
              </ReactCrop>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/10"
                style={{ color: "#8C8D8D", border: "1px solid #1A1B1B" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                disabled={uploading || !completedCrop}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{ backgroundColor: "#509887", color: "#090A0A" }}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Apply Crop
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
