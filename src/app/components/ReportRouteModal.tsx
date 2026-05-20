import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { X, AlertTriangle } from 'lucide-react';

interface ReportRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  routeName: string;
}

const REPORT_REASONS = [
  { value: 'wrong_grade', label: 'Grado Sbagliato' },
  { value: 'wrong_name', label: 'Nome Sbagliato' },
  { value: 'wrong_length', label: 'Lunghezza Sbagliata' },
  { value: 'non_existent', label: 'Via Inesistente' }
];

export function ReportRouteModal({ isOpen, onClose, onSubmit, routeName }: ReportRouteModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedReason);
      onClose();
    } finally {
      setIsSubmitting(false);
      setSelectedReason('');
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Segnala Via</h2>
              <p className="text-sm text-muted-foreground">{routeName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <Label className="text-base mb-3 block">Motivo della segnalazione</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              <div className="space-y-3">
                {REPORT_REASONS.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label
                      htmlFor={reason.value}
                      className="flex-1 cursor-pointer p-3 border-2 border-border rounded-lg hover:bg-accent/10 transition-colors"
                      style={{
                        backgroundColor: selectedReason === reason.value ? 'var(--accent)' : 'transparent',
                        borderColor: selectedReason === reason.value ? 'var(--primary)' : 'var(--border)'
                      }}
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <p className="text-xs text-muted-foreground">
            La tua segnalazione verrà inviata agli amministratori che verificheranno e correggeranno le informazioni errate.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? 'Invio...' : 'Invia Segnalazione'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
