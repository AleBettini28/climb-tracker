import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { storage } from '../utils/storage';
import { boulderStorage } from '../utils/boulderStorage';
import { Card } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Clock, Mountain, TrendingUp } from 'lucide-react';
import { Climb, DIFFICULTY_LABELS } from '../types/climb';
import { BoulderSend } from '../types/boulder';

export function Dashboard() {
  const [climbs, setClimbs] = useState<Climb[]>([]);
  const [boulders, setBoulders] = useState<BoulderSend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [climbsData, bouldersData] = await Promise.all([
          storage.getClimbs(),
          boulderStorage.getBoulderSends()
        ]);
        setClimbs(climbsData);
        setBoulders(bouldersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    // Top climbs by grade (only lead climbs)
    const gradeMap = new Map<string, number>();
    climbs.forEach(climb => {
      if (climb.routeGrade && climb.leadType === 'lead') {
        gradeMap.set(climb.routeGrade, (gradeMap.get(climb.routeGrade) || 0) + 1);
      }
    });

    const gradeOrder = ['3B', '3C', '4A', '4B', '4C',
                       '5A', '5A+', '5B', '5B+', '5C', '5C+',
                       '6A', '6A+', '6B', '6B+', '6C', '6C+',
                       '7A', '7A+', '7B', '7B+', '7C', '7C+',
                       '8A', '8A+', '8B', '8B+', '8C', '8C+',
                       '9A', '9A+', '9B', '9B+', '9C'];

    const topGrades = Array.from(gradeMap.entries())
      .filter(([grade]) => grade && gradeOrder.includes(grade))
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => {
        // Sort by grade difficulty
        return gradeOrder.indexOf(b.grade) - gradeOrder.indexOf(a.grade);
      })
      .slice(0, 5);

    // Best lead grade (only climbs done as lead)
    const leadClimbs = climbs.filter(climb => climb.leadType === 'lead' && climb.routeGrade && gradeOrder.includes(climb.routeGrade));
    const bestLeadGrade = leadClimbs.length > 0
      ? leadClimbs
          .map(climb => climb.routeGrade!)
          .sort((a, b) => gradeOrder.indexOf(b) - gradeOrder.indexOf(a))[0]
      : null;

    // Most frequent crag
    const cragMap = new Map<string, number>();
    climbs.forEach(climb => {
      if (climb.routeCrag) {
        cragMap.set(climb.routeCrag, (cragMap.get(climb.routeCrag) || 0) + 1);
      }
    });

    const topCrag = Array.from(cragMap.entries())
      .sort((a, b) => b[1] - a[1])[0];

    // Recent climbs
    const recent = [...climbs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Chart data
    const chartData = Array.from(gradeMap.entries())
      .filter(([grade]) => grade && gradeOrder.includes(grade))
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade));

    return {
      topGrades,
      bestLeadGrade,
      topCrag,
      recent,
      chartData,
      totalClimbs: climbs.length
    };
  }, [climbs]);

  const boulderStats = useMemo(() => {
    // Best boulder grade
    const gradeOrder = ['3c', '4a', '4b', '4c',
                       '5a', '5b', '5c',
                       '6a', '6a+', '6b', '6b+', '6c', '6c+',
                       '7a', '7a+', '7b', '7b+', '7c', '7c+',
                       '8a', '8a+', '8b', '8b+', '8c', '8c+',
                       '9a'];

    const bestBoulderGrade = boulders.length > 0
      ? boulders
          .filter(boulder => boulder.boulderGrade && gradeOrder.includes(boulder.boulderGrade))
          .map(boulder => boulder.boulderGrade!)
          .sort((a, b) => gradeOrder.indexOf(b) - gradeOrder.indexOf(a))[0]
      : null;

    // Recent boulders
    const recentBoulders = [...boulders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Boulder chart data
    const boulderGradeMap = new Map<string, number>();
    boulders.forEach(boulder => {
      if (boulder.boulderGrade) {
        boulderGradeMap.set(boulder.boulderGrade, (boulderGradeMap.get(boulder.boulderGrade) || 0) + 1);
      }
    });

    const boulderChartData = Array.from(boulderGradeMap.entries())
      .filter(([grade]) => grade && gradeOrder.includes(grade))
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade));

    // Top boulder grades
    const topBoulderGrades = Array.from(boulderGradeMap.entries())
      .filter(([grade]) => grade && gradeOrder.includes(grade))
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => gradeOrder.indexOf(b.grade) - gradeOrder.indexOf(a.grade))
      .slice(0, 5);

    return {
      bestBoulderGrade,
      recentBoulders,
      boulderChartData,
      topBoulderGrades,
      totalBoulders: boulders.length
    };
  }, [boulders]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-xl sm:text-2xl">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Panoramica delle tue scalate</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Totale Vie</p>
              <p className="text-xl sm:text-2xl font-semibold">{stats.totalClimbs}</p>
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
                {stats.bestLeadGrade || 'N/A'}
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
                {stats.topCrag?.[0] || 'N/A'}
              </p>
              {stats.topCrag?.[1] && (
                <p className="text-xs text-muted-foreground">
                  {stats.topCrag[1]} {stats.topCrag[1] === 1 ? 'via' : 'vie'}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Chart */}
        <Card className="p-4 sm:p-6">
          <h2 className="mb-4 text-lg sm:text-xl">Vie per Grado</h2>
          {stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.chartData}>
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

        {/* Recent Climbs */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl">Ultime Scalate</h2>
            <Link to="/vie" className="text-xs sm:text-sm text-primary hover:underline">
              Vedi tutte
            </Link>
          </div>
          {stats.recent.length > 0 ? (
            <div className="space-y-3">
              {stats.recent.map((climb) => (
                <div
                  key={climb.id}
                  className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{climb.routeName || 'Via sconosciuta'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs sm:text-sm text-muted-foreground truncate">{climb.routeCrag || 'N/A'}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground shrink-0">•</span>
                      <span className="text-xs sm:text-sm font-medium text-primary shrink-0">{climb.routeGrade || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs px-2 py-1 bg-accent/20 text-accent-foreground rounded whitespace-nowrap">
                      {climb.leadType === 'lead' ? 'Primo' : 'Secondo'}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(climb.date).toLocaleDateString('it-IT')}
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

        {/* Top Grades */}
        <Card className="p-4 sm:p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg sm:text-xl">Migliori Gradi (Vie)</h2>
          {stats.topGrades.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {stats.topGrades.map((item, index) => (
                <div
                  key={item.grade}
                  className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        index === 0 ? 'text-yellow-600' :
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

      {/* Boulder Section */}
      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-1">Statistiche Boulder</h2>
          <p className="text-sm text-muted-foreground">Panoramica dei tuoi boulder</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Boulder Chart */}
          <Card className="p-4 sm:p-6">
            <h2 className="mb-4 text-lg sm:text-xl">Boulder per Grado</h2>
            {boulderStats.boulderChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={boulderStats.boulderChartData}>
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
                  <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                Nessun boulder registrato
              </div>
            )}
          </Card>

          {/* Recent Boulders */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl">Ultimi Boulder</h2>
              <Link to="/boulder" className="text-xs sm:text-sm text-primary hover:underline">
                Vedi tutti
              </Link>
            </div>
            {boulderStats.recentBoulders.length > 0 ? (
              <div className="space-y-3">
                {boulderStats.recentBoulders.map((boulder) => (
                  <div
                    key={boulder.id}
                    className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {boulder.boulderName} - {boulder.problemNumber}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {boulder.attempts} {boulder.attempts === 1 ? 'tentativo' : 'tentativi'}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground shrink-0">•</span>
                        <span className="text-xs sm:text-sm font-medium text-primary shrink-0">{boulder.boulderGrade}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(boulder.date).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="w-10 sm:w-12 h-10 sm:h-12 mb-2 opacity-50" />
                <p className="text-sm sm:text-base">Nessun boulder recente</p>
                <Link to="/nuovo-boulder" className="text-xs sm:text-sm text-primary hover:underline mt-2">
                  Aggiungi il tuo primo boulder
                </Link>
              </div>
            )}
          </Card>

          {/* Top Boulder Grades */}
          <Card className="p-4 sm:p-6 lg:col-span-2">
            <h2 className="mb-4 text-lg sm:text-xl">Migliori Gradi (Boulder)</h2>
            {boulderStats.topBoulderGrades.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {boulderStats.topBoulderGrades.map((item, index) => (
                  <div
                    key={item.grade}
                    className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          index === 0 ? 'text-yellow-600' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-amber-700' :
                          'text-muted-foreground'
                        }`}
                      />
                      <span className="text-xl sm:text-2xl font-bold text-accent-foreground">{item.grade}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {item.count} {item.count === 1 ? 'boulder' : 'boulder'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
                Inizia ad aggiungere boulder per vedere le statistiche
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}