import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  isLoading,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/15">
          <AlertTriangle className="h-6 w-6 text-danger" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {message && (
          <p className="mt-2 text-sm text-text-secondary">{message}</p>
        )}
        <div className="mt-6 flex w-full gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
