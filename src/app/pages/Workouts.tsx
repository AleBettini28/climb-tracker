import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Dumbbell, PlusCircle, ListChecks, Sparkles, ArrowRight, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workoutsApi } from '../api';

export function Workouts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasOpenWorkout, setHasOpenWorkout] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const openWorkout = await workoutsApi.getOpenOne(user.id);
        if (!cancelled) setHasOpenWorkout(!!openWorkout);
      } catch (error) {
        console.error('Error checking for open workout:', error);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const options = [
    {
      title: hasOpenWorkout ? 'Continua Allenamento' : 'Nuovo Allenamento',
      description: hasOpenWorkout
        ? 'Hai un allenamento in corso: continua ad aggiungere i tuoi invii'
        : 'Apri un nuovo allenamento e registra i blocchi/vie fatti mentre ti alleni',
      icon: hasOpenWorkout ? PlayCircle : PlusCircle,
      path: '/allenamenti/nuovo',
    },
    {
      title: 'I Miei Allenamenti',
      description: 'Rivedi lo storico dei tuoi allenamenti e i progressi registrati',
      icon: ListChecks,
      path: '/allenamenti/lista',
    },
    {
      title: 'Piano AI per Migliorare',
      description: 'Genera un piano personalizzato basato sui tuoi obiettivi',
      icon: Sparkles,
      path: '/allenamenti/piano-ai',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Tracciamento Progressi</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Traccia i tuoi allenamenti, salva i blocchi/vie chiusi e analizza i tuoi progressi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((option) => (
            <Card
              key={option.path}
              onClick={() => navigate(option.path)}
              className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group flex flex-col"
            >
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <option.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{option.title}</h3>
              <p className="text-sm text-muted-foreground flex-1">{option.description}</p>
              <div className="flex items-center gap-1 text-sm font-medium text-primary mt-4">
                Vai <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
