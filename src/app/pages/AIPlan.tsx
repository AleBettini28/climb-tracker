import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
  ArrowLeft,
  Sparkles,
  Target,
  Dumbbell,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  CalendarDays,
  FileDown,
  Trash2,
} from 'lucide-react';
import { aiPlanApi, AiTrainingPlanResponse } from '../api';
import { CLIMBING_GRADES } from '../types/route';
import { BOULDER_GRADES } from '../types/boulderArea';
import {
  AI_PLAN_FALL_COMFORT,
  AI_PLAN_FALL_COMFORT_LABELS,
  AI_PLAN_LIMITERS,
  AI_PLAN_LIMITER_LABELS,
  AI_PLAN_STYLE_ASPECTS,
  AI_PLAN_STYLE_LABELS,
  AiPlanFallComfort,
  AiPlanLimiter,
  AiPlanStyleAspect,
} from '../types/aiPlan';
import { ApiError } from '../api/client';
import {
  clearAiPlan,
  EMPTY_AI_PLAN_FORM,
  formatSavedAt,
  loadAiPlan,
  saveAiPlan,
  type AiPlanFormSnapshot,
} from '../utils/aiPlanStorage';
import { cn } from '../components/ui/utils';

type Step = 'intro' | 'form' | 'result';

type PlanFormState = AiPlanFormSnapshot;

const emptyForm: PlanFormState = EMPTY_AI_PLAN_FORM;

function GradeSelect({
  value,
  onChange,
  grades,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  grades: readonly string[];
  placeholder: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {grades.map((grade) => (
          <SelectItem key={grade} value={grade}>
            {grade}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MultiSelectChips({
  options,
  selected,
  onChange,
}: {
  options: readonly { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            className={cn(
              'px-3 py-1.5 rounded-md border text-sm transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-input',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function AIPlan() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('intro');
  const [form, setForm] = useState<PlanFormState>(emptyForm);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [plan, setPlan] = useState<AiTrainingPlanResponse | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadAiPlan();
    if (!saved) return;
    setPlan(saved.plan);
    setForm(saved.form);
    setSavedAt(saved.savedAt);
  }, []);

  const updateField = <K extends keyof PlanFormState>(key: K, value: PlanFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = (): string | null => {
    if (!form.sessionsPerWeek || Number(form.sessionsPerWeek) < 1) {
      return 'Indica quante sessioni fai a settimana';
    }
    if (!form.sessionDurationHours || Number(form.sessionDurationHours) <= 0) {
      return 'Indica la durata delle sessioni in ore';
    }
    if (!form.highestGradeBoulder || !form.highestGradeLead) {
      return 'Indica i gradi massimi boulder e lead';
    }
    if (!form.highestFlashBoulder || !form.highestFlashLead) {
      return 'Indica i gradi massimi flash boulder e lead';
    }
    if (!form.consolidatedGradeBoulder || !form.consolidatedGradeLead) {
      return 'Indica i gradi consolidati boulder e lead';
    }
    if (!form.climbingExperience.trim()) {
      return 'Indica da quanto tempo arrampichi';
    }
    if (form.strongerAspects.length === 0) {
      return 'Seleziona almeno un aspetto in cui ti senti più forte';
    }
    if (form.weakerAspects.length === 0) {
      return 'Seleziona almeno un aspetto in cui ti senti più debole';
    }
    if (!form.maxPullUps || Number(form.maxPullUps) < 0) {
      return 'Indica il massimo di trazioni';
    }
    if (!form.trainsFingerboard) {
      return 'Indica se ti alleni con la trave';
    }
    if (
      form.trainsFingerboard === 'yes' &&
      (!form.fingerboardTimesPerWeek || Number(form.fingerboardTimesPerWeek) < 1)
    ) {
      return 'Indica quante volte a settimana usi la trave';
    }
    if (!form.mainLimiter) {
      return 'Seleziona cosa ti limita di più';
    }
    if (!form.fallComfort) {
      return 'Indica quanto ti senti a tuo agio nelle cadute';
    }
    if (!form.strongPoints.trim() || !form.weakPoints.trim()) {
      return 'Compila punti di forza e punti deboli';
    }
    if (!form.mainGoal.trim()) {
      return "Descrivi l'obiettivo principale";
    }
    if (!form.goalBlockers.trim()) {
      return 'Spiega perché pensi di non raggiungere ancora il tuo obiettivo';
    }
    return null;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await aiPlanApi.generate({
        sessions_per_week: Number(form.sessionsPerWeek),
        session_duration_hours: Number(form.sessionDurationHours),
        sessions_outdoor: Number(form.sessionsOutdoor || 0),
        sessions_boulder: Number(form.sessionsBoulder || 0),
        sessions_lead: Number(form.sessionsLead || 0),
        highest_grade_boulder: form.highestGradeBoulder,
        highest_grade_lead: form.highestGradeLead,
        highest_flash_boulder: form.highestFlashBoulder,
        highest_flash_lead: form.highestFlashLead,
        consolidated_grade_boulder: form.consolidatedGradeBoulder,
        consolidated_grade_lead: form.consolidatedGradeLead,
        climbing_experience: form.climbingExperience.trim(),
        stronger_aspects: form.strongerAspects.map((value) => AI_PLAN_STYLE_LABELS[value]),
        weaker_aspects: form.weakerAspects.map((value) => AI_PLAN_STYLE_LABELS[value]),
        max_pull_ups: Number(form.maxPullUps),
        trains_fingerboard: form.trainsFingerboard === 'yes',
        fingerboard_times_per_week:
          form.trainsFingerboard === 'yes'
            ? Number(form.fingerboardTimesPerWeek)
            : undefined,
        main_limiter: AI_PLAN_LIMITER_LABELS[form.mainLimiter as AiPlanLimiter],
        fall_comfort: AI_PLAN_FALL_COMFORT_LABELS[form.fallComfort as AiPlanFallComfort],
        other_sports: form.otherSports.trim() || undefined,
        injuries: form.injuries.trim() || undefined,
        strong_points: form.strongPoints.trim(),
        weak_points: form.weakPoints.trim(),
        main_goal: form.mainGoal.trim(),
        goal_blockers: form.goalBlockers.trim(),
        additional_info: form.additionalInfo.trim() || undefined,
      });

      setPlan(response);
      saveAiPlan(response, form);
      setSavedAt(new Date().toISOString());
      setStep('result');
      toast.success('Piano generato e salvato!');
    } catch (error) {
      console.error('Error generating AI plan:', error);
      const message =
        error instanceof ApiError
          ? error.message
          : 'Errore durante la generazione del piano AI';
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenSavedPlan = () => {
    const saved = loadAiPlan();
    if (!saved) {
      toast.error('Nessun piano salvato trovato');
      return;
    }
    setPlan(saved.plan);
    setForm(saved.form);
    setSavedAt(saved.savedAt);
    setStep('result');
  };

  const handleReset = () => {
    setStep('intro');
  };

  const handleClearSaved = () => {
    clearAiPlan();
    setPlan(null);
    setForm(emptyForm);
    setSavedAt(null);
    setStep('intro');
    toast.success('Piano salvato eliminato');
  };

  const handleExportPdf = async () => {
    if (!plan) return;
    setIsExportingPdf(true);
    try {
      await aiPlanApi.exportPdf(plan);
      toast.success('PDF scaricato');
    } catch (error) {
      console.error('Error exporting AI plan PDF:', error);
      const message =
        error instanceof ApiError
          ? error.message
          : 'Errore durante l\'export del PDF';
      toast.error(message);
    } finally {
      setIsExportingPdf(false);
    }
  };

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

        {step === 'intro' && (
          <div className="space-y-4">
            <Card className="p-8 sm:p-12 text-center">
              <div className="p-4 bg-gradient-to-br from-primary/15 to-accent/15 rounded-full w-fit mx-auto mb-5">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Crea il tuo percorso personalizzato</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                Compila un breve profilo su volume, gradi, punti di forza e obiettivo.
                Gemini analizzerà i dati e costruirà un piano con fasi, tempi stimati e workout concreti.
              </p>
              <Button size="lg" onClick={() => setStep('form')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Inizia il tuo piano
              </Button>
            </Card>

            {plan && savedAt && (
              <Card className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Ultimo piano salvato</h3>
                    <p className="text-sm text-muted-foreground">
                      Salvato il {formatSavedAt(savedAt)}. Puoi riaprirlo o esportarlo in PDF.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <Button variant="outline" onClick={handleOpenSavedPlan}>
                      Apri piano
                    </Button>
                    <Button variant="outline" onClick={handleClearSaved}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Elimina
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleGenerate} className="space-y-6">
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">Volume di allenamento</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionsPerWeek">Sessioni a settimana</Label>
                  <Input
                    id="sessionsPerWeek"
                    type="number"
                    min={1}
                    max={14}
                    value={form.sessionsPerWeek}
                    onChange={(e) => updateField('sessionsPerWeek', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionDurationHours">Durata sessione (ore)</Label>
                  <Input
                    id="sessionDurationHours"
                    type="number"
                    min={0.5}
                    max={8}
                    step={0.5}
                    value={form.sessionDurationHours}
                    onChange={(e) => updateField('sessionDurationHours', e.target.value)}
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-1">
                Quante di queste sessioni sono outdoor, boulder o lead?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionsOutdoor">Outdoor</Label>
                  <Input
                    id="sessionsOutdoor"
                    type="number"
                    min={0}
                    value={form.sessionsOutdoor}
                    onChange={(e) => updateField('sessionsOutdoor', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionsBoulder">Boulder</Label>
                  <Input
                    id="sessionsBoulder"
                    type="number"
                    min={0}
                    value={form.sessionsBoulder}
                    onChange={(e) => updateField('sessionsBoulder', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionsLead">Lead / Vie</Label>
                  <Input
                    id="sessionsLead"
                    type="number"
                    min={0}
                    value={form.sessionsLead}
                    onChange={(e) => updateField('sessionsLead', e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">Gradi</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Grado massimo boulder</Label>
                  <GradeSelect
                    value={form.highestGradeBoulder}
                    onChange={(v) => updateField('highestGradeBoulder', v)}
                    grades={BOULDER_GRADES}
                    placeholder="Seleziona grado"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grado massimo lead</Label>
                  <GradeSelect
                    value={form.highestGradeLead}
                    onChange={(v) => updateField('highestGradeLead', v)}
                    grades={CLIMBING_GRADES}
                    placeholder="Seleziona grado"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Flash massimo boulder</Label>
                  <GradeSelect
                    value={form.highestFlashBoulder}
                    onChange={(v) => updateField('highestFlashBoulder', v)}
                    grades={BOULDER_GRADES}
                    placeholder="Seleziona grado"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Flash massimo lead</Label>
                  <GradeSelect
                    value={form.highestFlashLead}
                    onChange={(v) => updateField('highestFlashLead', v)}
                    grades={CLIMBING_GRADES}
                    placeholder="Seleziona grado"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grado consolidato boulder</Label>
                  <GradeSelect
                    value={form.consolidatedGradeBoulder}
                    onChange={(v) => updateField('consolidatedGradeBoulder', v)}
                    grades={BOULDER_GRADES}
                    placeholder="1-2 prove tipiche"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grado consolidato lead</Label>
                  <GradeSelect
                    value={form.consolidatedGradeLead}
                    onChange={(v) => updateField('consolidatedGradeLead', v)}
                    grades={CLIMBING_GRADES}
                    placeholder="1-2 prove tipiche"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Il grado consolidato è quello che chiudi di solito con 1–2 prove.
              </p>
            </Card>

            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">Profilo climber</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="climbingExperience">Da quanto tempo arrampichi?</Label>
                  <Input
                    id="climbingExperience"
                    placeholder="es. 3 anni, 8 mesi…"
                    value={form.climbingExperience}
                    onChange={(e) => updateField('climbingExperience', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPullUps">Max trazioni</Label>
                  <Input
                    id="maxPullUps"
                    type="number"
                    min={0}
                    max={100}
                    value={form.maxPullUps}
                    onChange={(e) => updateField('maxPullUps', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dove ti senti più forte?</Label>
                <MultiSelectChips
                  options={AI_PLAN_STYLE_ASPECTS}
                  selected={form.strongerAspects}
                  onChange={(next) => updateField('strongerAspects', next as AiPlanStyleAspect[])}
                />
              </div>

              <div className="space-y-2">
                <Label>Dove ti senti più debole?</Label>
                <MultiSelectChips
                  options={AI_PLAN_STYLE_ASPECTS}
                  selected={form.weakerAspects}
                  onChange={(next) => updateField('weakerAspects', next as AiPlanStyleAspect[])}
                />
              </div>

              <div className="space-y-3">
                <Label>Ti alleni con la trave (fingerboard)?</Label>
                <RadioGroup
                  value={form.trainsFingerboard}
                  onValueChange={(value) => {
                    updateField('trainsFingerboard', value as '' | 'yes' | 'no');
                    if (value === 'no') {
                      updateField('fingerboardTimesPerWeek', '');
                    }
                  }}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="fingerboard-yes" />
                    <Label htmlFor="fingerboard-yes" className="font-normal cursor-pointer">
                      Sì
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="fingerboard-no" />
                    <Label htmlFor="fingerboard-no" className="font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {form.trainsFingerboard === 'yes' && (
                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="fingerboardTimesPerWeek">Quante volte a settimana?</Label>
                    <Input
                      id="fingerboardTimesPerWeek"
                      type="number"
                      min={1}
                      max={14}
                      value={form.fingerboardTimesPerWeek}
                      onChange={(e) => updateField('fingerboardTimesPerWeek', e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Cosa ti limita di più?</Label>
                <Select
                  value={form.mainLimiter || undefined}
                  onValueChange={(value) => updateField('mainLimiter', value as AiPlanLimiter)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona il limitatore principale" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PLAN_LIMITERS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Ti senti a tuo agio nelle cadute?</Label>
                <RadioGroup
                  value={form.fallComfort}
                  onValueChange={(value) => updateField('fallComfort', value as AiPlanFallComfort)}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                  {AI_PLAN_FALL_COMFORT.map((item) => (
                    <div key={item.value} className="flex items-center gap-2">
                      <RadioGroupItem value={item.value} id={`fall-${item.value}`} />
                      <Label htmlFor={`fall-${item.value}`} className="font-normal cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherSports">Altri sport</Label>
                <Textarea
                  id="otherSports"
                  placeholder="es. corsa 2x settimana, palestra, yoga…"
                  value={form.otherSports}
                  onChange={(e) => updateField('otherSports', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="injuries">Infortuni (opzionale)</Label>
                <Textarea
                  id="injuries"
                  placeholder="es. tendinite spalla destra, dito medio…"
                  value={form.injuries}
                  onChange={(e) => updateField('injuries', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strongPoints">Punti di forza</Label>
                <Textarea
                  id="strongPoints"
                  placeholder="es. forza delle dita, mentalità, tecnica di piedi…"
                  value={form.strongPoints}
                  onChange={(e) => updateField('strongPoints', e.target.value)}
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weakPoints">Punti deboli</Label>
                <Textarea
                  id="weakPoints"
                  placeholder="es. resistenza, flessibilità, paura del volo…"
                  value={form.weakPoints}
                  onChange={(e) => updateField('weakPoints', e.target.value)}
                  rows={2}
                  required
                />
              </div>
            </Card>

            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">Obiettivo principale</h2>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mainGoal">Cosa vuoi raggiungere?</Label>
                <Textarea
                  id="mainGoal"
                  placeholder="es. flashare 7A boulder outdoor entro 6 mesi, consolidare il 6c+ in lead…"
                  value={form.mainGoal}
                  onChange={(e) => updateField('mainGoal', e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalBlockers">
                  Perché pensi di non raggiungere ancora il tuo obiettivo?
                </Label>
                <Textarea
                  id="goalBlockers"
                  placeholder="es. poco volume outdoor, recupero insufficiente, paura di spingere…"
                  value={form.goalBlockers}
                  onChange={(e) => updateField('goalBlockers', e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Altre informazioni utili (opzionale)</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Qualsiasi dettaglio che possa aiutare l'AI a personalizzare meglio il piano…"
                  value={form.additionalInfo}
                  onChange={(e) => updateField('additionalInfo', e.target.value)}
                  rows={3}
                />
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                onClick={() => setStep('intro')}
                disabled={isGenerating}
              >
                Annulla
              </Button>
              <Button type="submit" className="sm:flex-1" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generazione in corso…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Genera piano AI
                  </>
                )}
              </Button>
            </div>

            {isGenerating && (
              <p className="text-center text-sm text-muted-foreground">
                L'analisi può richiedere fino a un minuto: Gemini sta costruendo un percorso dettagliato.
              </p>
            )}
          </form>
        )}

        {step === 'result' && plan && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <Button variant="outline" onClick={() => setStep('form')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Modifica profilo
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Torna all'inizio
              </Button>
              <Button onClick={handleExportPdf} disabled={isExportingPdf}>
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Export…
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Esporta PDF
                  </>
                )}
              </Button>
            </div>

            {savedAt && (
              <p className="text-xs text-muted-foreground">
                Piano salvato nel browser · {formatSavedAt(savedAt)}
              </p>
            )}

            <Card className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-lg">Analisi del profilo</h2>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{plan.summary}</p>
              {plan.estimated_duration && (
                <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Tempo stimato</p>
                    <p className="text-sm font-medium">{plan.estimated_duration}</p>
                  </div>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h2 className="font-semibold">Punti di forza</h2>
                </div>
                <ul className="space-y-2">
                  {(plan.strengths ?? []).map((item, i) => (
                    <li key={i} className="text-sm leading-relaxed flex gap-2">
                      <span className="text-emerald-600 mt-1 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h2 className="font-semibold">Punti deboli</h2>
                </div>
                <ul className="space-y-2">
                  {(plan.weaknesses ?? []).map((item, i) => (
                    <li key={i} className="text-sm leading-relaxed flex gap-2">
                      <span className="text-amber-600 mt-1 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {plan.timeline?.length > 0 && (
              <Card className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold text-lg">Percorso a fasi</h2>
                </div>
                <div className="space-y-4">
                  {plan.timeline.map((phase, i) => (
                    <div
                      key={i}
                      className="relative pl-5 border-l-2 border-primary/25 pb-1 last:pb-0"
                    >
                      <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-primary" />
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                        <h3 className="font-medium text-sm">{phase.phase}</h3>
                        <span className="text-xs text-muted-foreground">{phase.duration}</span>
                      </div>
                      <p className="text-xs font-medium text-primary mb-1.5">{phase.focus}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {phase.details}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {plan.weekly_structure && (
              <Card className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold text-lg">Struttura settimanale</h2>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {plan.weekly_structure.overview}
                </p>
                <div className="space-y-3">
                  {(plan.weekly_structure.sessions ?? []).map((session, i) => (
                    <div key={i} className="rounded-lg border p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-medium text-sm">{session.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-0.5 rounded-md bg-muted">{session.type}</span>
                          {session.duration_minutes != null && (
                            <span>{session.duration_minutes} min</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {session.description}
                      </p>
                      {session.exercises?.length > 0 && (
                        <ul className="space-y-1 pt-1">
                          {session.exercises.map((ex, j) => (
                            <li key={j} className="text-sm flex gap-2">
                              <span className="text-primary mt-0.5 shrink-0">→</span>
                              <span>{ex}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {plan.metrics_and_targets?.length > 0 && (
              <Card className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold text-lg">Metriche e target</h2>
                </div>
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="pb-2 pr-3 font-medium">Metrica</th>
                        <th className="pb-2 pr-3 font-medium">Attuale</th>
                        <th className="pb-2 pr-3 font-medium">Target</th>
                        <th className="pb-2 font-medium">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.metrics_and_targets.map((m, i) => (
                        <tr key={i} className="border-b border-border/60 last:border-0 align-top">
                          <td className="py-2.5 pr-3 font-medium">{m.metric}</td>
                          <td className="py-2.5 pr-3 text-muted-foreground">{m.current}</td>
                          <td className="py-2.5 pr-3 text-primary font-medium">{m.target}</td>
                          <td className="py-2.5 text-muted-foreground">{m.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {plan.workout_guidelines && (
              <Card className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold text-lg">Cosa fare nei workout</h2>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{plan.workout_guidelines}</p>
              </Card>
            )}

            {plan.injury_considerations && (
              <Card className="p-5 sm:p-6 space-y-3 border-amber-200/60">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h2 className="font-semibold text-lg">Considerazioni sugli infortuni</h2>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{plan.injury_considerations}</p>
              </Card>
            )}

            {plan.additional_advice && (
              <Card className="p-5 sm:p-6 space-y-3">
                <h2 className="font-semibold text-lg">Consigli aggiuntivi</h2>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{plan.additional_advice}</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
