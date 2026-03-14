import { DropZone } from '../ui/DropZone';

export function ReceiptUpload({ file, onFileSelect, existingReceiptUrl }) {
  const preview =
    !file && existingReceiptUrl ? existingReceiptUrl : undefined;

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
        Receipt
      </label>
      <DropZone
        onFileSelect={onFileSelect}
        accept="image/*"
        preview={preview}
      />
    </div>
  );
}
