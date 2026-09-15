import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  label?: string;
  helperText?: string;
  value: string | string[];
  onChange: (val: any) => void;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  required?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  helperText,
  value,
  onChange,
  multiple = false,
  maxFiles = 6,
  className = '',
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const images: string[] = multiple
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : typeof value === 'string' && value.trim()
    ? [value.trim()]
    : [];

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select valid image files (PNG, JPG, WebP, etc.).');
        continue;
      }
      // Check max size (approx 8MB)
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage('One or more images exceed 8MB. Please use smaller files.');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const readers = validFiles.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file.'));
          }
        };
        reader.onerror = () => reject(new Error('File reading error.'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((dataUrls) => {
        if (multiple) {
          const combined = [...images, ...dataUrls].slice(0, maxFiles);
          onChange(combined);
        } else {
          onChange(dataUrls[0]);
        }
      })
      .catch((err) => {
        console.error('Image load failed:', err);
        setErrorMessage('Could not load selected image.');
      });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (indexToRemove: number) => {
    if (multiple) {
      const updated = images.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange('');
    }
  };

  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    if (multiple) {
      onChange([...images, manualUrl.trim()].slice(0, maxFiles));
    } else {
      onChange(manualUrl.trim());
    }
    setManualUrl('');
    setShowUrlInput(false);
  };

  return (
    <div className={`space-y-2 text-xs ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center space-x-1 cursor-pointer"
          >
            <LinkIcon className="h-3 w-3" />
            <span>{showUrlInput ? 'Switch to file upload' : 'Enter image URL instead'}</span>
          </button>
        </div>
      )}

      {/* Manual URL entry if chosen */}
      {showUrlInput ? (
        <div className="flex space-x-2">
          <input
            type="url"
            placeholder="https://example.com/photo.jpg"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Apply
          </button>
        </div>
      ) : (
        /* Drag and Drop File Upload Area */
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {(!multiple && images.length > 0) ? (
            /* Single Image Preview Box */
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2 overflow-hidden group">
              <div className="flex items-center space-x-3">
                <img
                  src={images[0]}
                  alt="Uploaded preview"
                  className="h-20 w-20 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center space-x-1 text-emerald-600 font-semibold text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Image Loaded</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {images[0].startsWith('data:') ? 'Local file uploaded successfully' : images[0]}
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(0)}
                      className="rounded-lg bg-rose-50 text-rose-600 px-2.5 py-1 text-[11px] font-medium hover:bg-rose-100 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Dropzone box */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-400'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-200 text-indigo-600 mb-2">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Click to browse or drag & drop image {multiple ? 'files' : 'file'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PNG, JPG, JPEG, WebP, GIF up to 8MB
              </p>
            </div>
          )}

          {/* Multiple Images Preview Grid */}
          {multiple && images.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-600">
                  Uploaded Photos ({images.length} / {maxFiles})
                </span>
                {images.length < maxFiles && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    + Add More
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
                  >
                    <img
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(idx);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-rose-600 transition cursor-pointer"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center space-x-1.5 text-rose-600 text-[11px] pt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {helperText && !errorMessage && (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      )}
    </div>
  );
};
