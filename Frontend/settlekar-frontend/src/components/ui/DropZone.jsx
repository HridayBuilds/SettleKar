import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function DropZone({ onFileSelect, accept = 'image/*', preview, className }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  const displayPreview = preview || localPreview;

  const handleFile = (file) => {
    if (!file) return;
    onFileSelect?.(file);
    const reader = new FileReader();
    reader.onload = (e) => setLocalPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const clearPreview = (e) => {
    e.stopPropagation();
    setLocalPreview(null);
    onFileSelect?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-border p-6 transition-colors hover:border-border-focus',
        isDragging && 'border-accent bg-accent/5',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {displayPreview ? (
        <div className="relative">
          <img
            src={displayPreview}
            alt="Preview"
            className="max-h-32 rounded-sm object-contain"
          />
          <button
            onClick={clearPreview}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <>
          <Upload className="mb-2 h-8 w-8 text-text-muted" />
          <p className="text-sm text-text-secondary">
            Drop file here or click to upload
          </p>
          <p className="mt-1 text-xs text-text-muted">
            PNG, JPG up to 5MB
          </p>
        </>
      )}
    </div>
  );
}
