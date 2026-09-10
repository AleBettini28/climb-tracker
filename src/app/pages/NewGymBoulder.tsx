import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Hexagon, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { gymBouldersApi, GymBoulderCreateUpdateRequest } from '../api';
import { auth } from '../utils/auth';
import { GYM_DIFFICULTIES, GYM_DIFFICULTY_META, GymDifficulty } from '../types/gym';
import { ImageUpload } from '../components/ImageUpload';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

export function NewGymBoulder() {
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photoUrl: undefined as string | undefined,
    difficulty: 'BIANCO' as GymDifficulty,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gymId) {
      toast.error('Palestra non valida');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Inserisci il nome del boulder');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await auth.getSession();
      if (!session?.id || !session.isAdmin) {
        toast.error('Solo gli admin possono aggiungere boulder');
        return;
      }

      const body: GymBoulderCreateUpdateRequest = {
        name: formData.name.trim(),
        description: formData.description || undefined,
        photo_url: formData.photoUrl || undefined,
        difficulty: formData.difficulty,
      };

      await gymBouldersApi.createOne(session.id, gymId, body);
      toast.success('Boulder aggiunto con successo!');
      navigate(`/palestra/${gymId}`);
    } catch (error) {
      console.error('Error creating gym boulder:', error);
      toast.error("Errore durante l'aggiunta del boulder");
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
              <Hexagon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl">Nuovo boulder palestra</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Aggiungi un boulder con grado a colore
          </p>
        </div>

        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Es. Dyno Corner"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrivi il boulder..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficoltà *</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as GymDifficulty,
                  })
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {GYM_DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {GYM_DIFFICULTY_META[difficulty].label} (
                    {GYM_DIFFICULTY_META[difficulty].points} pt)
                  </option>
                ))}
              </select>
            </div>

            <ImageUpload
              label="Foto boulder"
              currentImageUrl={formData.photoUrl}
              onImageUrlChange={(url) => setFormData({ ...formData, photoUrl: url })}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
              <PlusCircle className="w-4 h-4" />
              {isSubmitting ? 'Salvataggio...' : 'Aggiungi boulder'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
