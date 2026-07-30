import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { BOULDER_GRADES } from '../types/boulderArea';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PlusCircle, Hexagon } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '../utils/auth';
import { boulderRoutesApi } from '../api/boulderRoutes';

export function NewBoulderRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedBoulder = (location.state as any)?.selectedBoulder;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    routeName: '',
    routeDescription: '',
    grade: '',
  });

  const id = useParams<{ id: string }>().id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.routeName || !formData.grade) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await auth.getSession();
      if (!session?.id) {
        toast.error('Devi essere autenticato per aggiungere un blocco');
        return;
      }

      if (!id) {
        toast.error('Id boulder non trovato');
        return;
      }

      await boulderRoutesApi.createOneBoulderRoute(session.id, id, {
        route_name: formData.routeName,
        route_description: formData.routeDescription || "",
        grade: formData.grade,
      });

      toast.success('Blocco aggiunto con successo! 🎉');
      navigate(`/masso/${id}`);
    } catch (error) {
      console.error('Error adding boulder route:', error);
      toast.error('Errore durante l\'aggiunta del blocco');
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
            <h1 className="text-xl sm:text-2xl">Aggiungi Nuovo Blocco</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Aggiungi un blocco (linea/passaggio) su questo boulder</p>
        </div>

        {selectedBoulder && (
          <Card className="p-4 mb-4 bg-accent/10">
            <div className="flex items-start gap-3">
              <Hexagon className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Boulder selezionato</h3>
                <p className="text-sm text-muted-foreground">{selectedBoulder.name}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="routeName">Nome del Blocco *</Label>
              <Input
                id="routeName"
                type="text"
                placeholder="Es. Faccia Nord"
                value={formData.routeName}
                onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="routeDescription">Descrizione (opzionale)</Label>
              <Textarea
                id="routeDescription"
                placeholder="Descrivi il blocco, la partenza, i movimenti chiave, ecc."
                value={formData.routeDescription}
                onChange={(e) => setFormData({ ...formData, routeDescription: e.target.value })}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                rows={4}
              />
            </div>

            {/* Grade */}
            <div className="space-y-2">
              <Label htmlFor="grade">Grado *</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => setFormData({ ...formData, grade: value })}
                required
              >
                <SelectTrigger id="grade" className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Seleziona il grado" />
                </SelectTrigger>
                <SelectContent>
                  {BOULDER_GRADES.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                Aggiungi Blocco
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
