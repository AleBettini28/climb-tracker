import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { gymsApi, GymCreateUpdateRequest } from '../api';
import { auth } from '../utils/auth';
import { ImageUpload } from '../components/ImageUpload';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

export function NewGym() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    address: '',
    logoUrl: undefined as string | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Inserisci il nome della palestra');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await auth.getSession();
      if (!session?.id || !session.isAdmin) {
        toast.error('Solo gli admin possono creare palestre');
        return;
      }

      const body: GymCreateUpdateRequest = {
        name: formData.name.trim(),
        description: formData.description || undefined,
        city: formData.city || undefined,
        address: formData.address || undefined,
        logo_url: formData.logoUrl || undefined,
        added_by: session.id,
      };

      await gymsApi.createOne(session.id, body);
      toast.success('Palestra creata con successo!');
      navigate('/palestre');
    } catch (error) {
      console.error('Error creating gym:', error);
      toast.error('Errore durante la creazione della palestra');
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
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl">Nuova palestra</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Aggiungi una palestra al catalogo
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
                placeholder="Es. Boulder Lab Milano"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrivi la palestra..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Es. Milano"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Es. Via Roma 1"
                />
              </div>
            </div>

            <ImageUpload
              label="Logo palestra"
              currentImageUrl={formData.logoUrl}
              onImageUrlChange={(url) => setFormData({ ...formData, logoUrl: url })}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
              <PlusCircle className="w-4 h-4" />
              {isSubmitting ? 'Salvataggio...' : 'Crea palestra'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
