import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { PlusCircle, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '../utils/auth';
import { bouldersApi } from '../api/boulders';

export function NewBoulder() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedBoulderArea = (location.state as any)?.selectedBoulderArea;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });

  const id = useParams<{ id: string }>().id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Inserisci il nome del boulder');
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await auth.getSession();
      if (!session?.id) {
        toast.error('Devi essere autenticato per aggiungere un boulder');
        return;
      }

      if (!id) {
        toast.error('Id area boulder non trovato');
        return;
      }

      await bouldersApi.createOneBoulder(session.id, id, {
        name: formData.name,
      });

      toast.success('Boulder aggiunto con successo! 🎉');
      navigate(`/area-boulder/${id}`);
    } catch (error) {
      console.error('Error adding boulder:', error);
      toast.error('Errore durante l\'aggiunta del boulder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl">Aggiungi Nuovo Boulder</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Aggiungi un boulder all'archivio condiviso. Potrai poi aggiungere i singoli blocchi/vie su di esso</p>
        </div>

        {selectedBoulderArea && (
          <Card className="p-4 mb-4 bg-accent/10">
            <div className="flex items-start gap-3">
              <Circle className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Area boulder selezionata</h3>
                <p className="text-sm text-muted-foreground">{selectedBoulderArea.name}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome del Boulder *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Es. Il Masso Grande"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Aggiungi Boulder
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
