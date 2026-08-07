import { LucideIcon, AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  icon?: LucideIcon;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  showCancel = true,
  icon: Icon = AlertTriangle,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-xl max-w-sm w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Chiudi"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{message}</p>
          <div className="flex gap-2 w-full mt-2">
            {showCancel && (
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {cancelLabel}
              </Button>
            )}
            <Button className="flex-1" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
