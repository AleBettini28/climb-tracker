import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Clock, Mountain, TrendingUp } from 'lucide-react';
import { dashboardApi, DashboardStatsResponse } from '../api/dashboard';
import { auth } from '../utils/auth';
import { toast } from 'sonner';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await auth.getSession();

        if (!user) {
          toast.error('Errore nel recuperare i dati dell utente.');
          return;
        }

        const data = await dashboardApi.getStats(user.id);
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast.error('Errore nel caricamento della dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <p className="text-muted-foreground">Impossibile caricare le statistiche.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-xl sm:text-2xl">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Panoramica delle tue scalate</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Totale Vie</p>
              <p className="text-xl sm:text-2xl font-semibold">{stats.total_climbs}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-accent/20 rounded-lg shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Grado Migliore (Primo)</p>
              <p className="text-xl sm:text-2xl font-semibold">
                {stats.best_grade || 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-secondary/50 rounded-lg shrink-0">
              <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Falesia Preferita</p>
              <p className="text-lg sm:text-xl font-semibold truncate">
                {stats.best_crag?.name || 'N/A'}
              </p>
              {stats.best_crag_climb_count != null && stats.best_crag_climb_count > 0 && (
                <p className="text-xs text-muted-foreground">
                  {stats.best_crag_climb_count} {stats.best_crag_climb_count === 1 ? 'via' : 'vie'}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <h2 className="mb-4 text-lg sm:text-xl">Vie per Grado</h2>
          {stats.climbs_by_grade.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.climbs_by_grade}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="grade"
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: '0.75rem' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
              Nessuna scalata registrata
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl">Ultime Scalate</h2>
            <Link to="/vie" className="text-xs sm:text-sm text-primary hover:underline">
              Vedi tutte
            </Link>
          </div>
          {stats.recent_climbs.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_climbs.map((climb) => (
                <div
                  key={climb.route.id}
                  className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{climb.route.nome_via || 'Via sconosciuta'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs sm:text-sm text-muted-foreground truncate">{climb.route.crag_name || 'N/A'}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground shrink-0">•</span>
                      <span className="text-xs sm:text-sm font-medium text-primary shrink-0">{climb.route.grado || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs px-2 py-1 bg-accent/20 text-accent-foreground rounded whitespace-nowrap">
                      {climb.is_lead ? 'Primo' : 'Secondo'}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(climb.day).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Clock className="w-10 sm:w-12 h-10 sm:h-12 mb-2 opacity-50" />
              <p className="text-sm sm:text-base">Nessuna scalata recente</p>
              <Link to="/nuova-salita" className="text-xs sm:text-sm text-primary hover:underline mt-2">
                Aggiungi la tua prima scalata
              </Link>
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg sm:text-xl">Migliori Gradi (Vie)</h2>
          {stats.top_grades.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {stats.top_grades.map((item, index) => (
                <div
                  key={item.grade}
                  className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-amber-700' :
                            'text-muted-foreground'
                        }`}
                    />
                    <span className="text-xl sm:text-2xl font-bold text-primary">{item.grade}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {item.count} {item.count === 1 ? 'via' : 'vie'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
              Inizia ad aggiungere scalate per vedere le statistiche
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
