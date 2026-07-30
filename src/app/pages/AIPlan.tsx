import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

export function AIPlan() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna Indietro
        </Button>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Piano AI per Migliorare</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Racconta i tuoi obiettivi e l'AI ti aiuterà a creare un piano di allenamento su misura
          </p>
        </div>

        <Card className="p-12 text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Prossimamente</h3>
          <p className="text-sm text-muted-foreground">
            Questa sezione permetterà di compilare un form dettagliato sui tuoi obiettivi
            per generare un piano di allenamento personalizzato con l'AI.
          </p>
        </Card>
      </div>
    </div>
  );
}
