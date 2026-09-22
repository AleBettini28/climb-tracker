import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { gymBouldersApi, GymBoulderCreateUpdateRequest } from '../api';
import { auth } from '../utils/auth';
import { GYM_DIFFICULTIES, GYM_DIFFICULTY_META, GymDifficulty } from '../types/gym';
import { ImageUpload } from '../components/ImageUpload';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { gymPath } from '../paths';

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
      navigate(gymPath(`palestra/${gymId}`));
    } catch (error) {
      console.error('Error creating gym boulder:', error);
      toast.error("Errore durante l'aggiunta del boulder");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="gym-page">
      <div className="px-4 sm:px-5 pb-4 border-b border-[var(--gym-border)]">
        <p className="gym-eyebrow mb-1">Admin</p>
        <h1 className="gym-title text-3xl sm:text-4xl">Nuovo boulder</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--gym-text-dim)' }}>
          Aggiungi un boulder con grado a colore
        </p>
      </div>

      <div className="px-4 sm:px-5 py-5">
        <div className="gym-card-surface p-4 sm:p-6">
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
              <Label>Difficolta' *</Label>
              <div className="flex flex-wrap gap-2">
                {GYM_DIFFICULTIES.map((difficulty) => {
                  const meta = GYM_DIFFICULTY_META[difficulty];
                  const selected = formData.difficulty === difficulty;
                  return (
                    <button
                      key={difficulty}
                      type="button"
                      onClick={() => setFormData({ ...formData, difficulty })}
                      className={meta.className}
                      style={
                        selected
                          ? {
                              boxShadow: `0 0 14px ${meta.color}55`,
                              background: meta.color,
                              color: meta.textOnFill,
                              borderColor: meta.color,
                            }
                          : undefined
                      }
                    >
                      {meta.label} · {meta.points}pt
                    </button>
                  );
                })}
              </div>
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
        </div>
      </div>
    </div>
  );
}
