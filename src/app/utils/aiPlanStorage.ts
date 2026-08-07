import { AiTrainingPlanResponse } from '../api/aiPlan';
import {
  AiPlanFallComfort,
  AiPlanLimiter,
  AiPlanSex,
  AiPlanStyleAspect,
} from '../types/aiPlan';

const STORAGE_KEY = 'climb-tracker:ai-training-plan';

export interface AiPlanFormSnapshot {
  sex: AiPlanSex | '';
  weightKg: string;
  heightCm: string;
  age: string;
  currentSessionsPerWeek: string;
  currentSessionDurationHours: string;
  currentSessionsOutdoor: string;
  currentSessionsBoulder: string;
  currentSessionsLead: string;
  desiredSessionsPerWeek: string;
  desiredSessionDurationHours: string;
  desiredSessionsOutdoor: string;
  desiredSessionsBoulder: string;
  desiredSessionsLead: string;
  highestGradeBoulder: string;
  highestGradeLead: string;
  highestFlashBoulder: string;
  highestFlashLead: string;
  consolidatedGradeBoulder: string;
  consolidatedGradeLead: string;
  climbingExperience: string;
  strongerAspects: AiPlanStyleAspect[];
  weakerAspects: AiPlanStyleAspect[];
  maxPullUps: string;
  trainsFingerboard: '' | 'yes' | 'no';
  fingerboardTimesPerWeek: string;
  mainLimiter: AiPlanLimiter | '';
  fallComfort: AiPlanFallComfort | '';
  otherSports: string;
  injuries: string;
  strongPoints: string;
  weakPoints: string;
  mainGoal: string;
  goalBlockers: string;
  additionalInfo: string;
}

export interface SavedAiPlan {
  plan: AiTrainingPlanResponse;
  form: AiPlanFormSnapshot;
  savedAt: string;
}

export const EMPTY_AI_PLAN_FORM: AiPlanFormSnapshot = {
  sex: '',
  weightKg: '',
  heightCm: '',
  age: '',
  currentSessionsPerWeek: '3',
  currentSessionDurationHours: '1.5',
  currentSessionsOutdoor: '1',
  currentSessionsBoulder: '2',
  currentSessionsLead: '1',
  desiredSessionsPerWeek: '4',
  desiredSessionDurationHours: '1.5',
  desiredSessionsOutdoor: '1',
  desiredSessionsBoulder: '2',
  desiredSessionsLead: '2',
  highestGradeBoulder: '',
  highestGradeLead: '',
  highestFlashBoulder: '',
  highestFlashLead: '',
  consolidatedGradeBoulder: '',
  consolidatedGradeLead: '',
  climbingExperience: '',
  strongerAspects: [],
  weakerAspects: [],
  maxPullUps: '',
  trainsFingerboard: '',
  fingerboardTimesPerWeek: '',
  mainLimiter: '',
  fallComfort: '',
  otherSports: '',
  injuries: '',
  strongPoints: '',
  weakPoints: '',
  mainGoal: '',
  goalBlockers: '',
  additionalInfo: '',
};

type LegacyFormFields = Partial<AiPlanFormSnapshot> & {
  sessionsPerWeek?: string;
  sessionDurationHours?: string;
  sessionsOutdoor?: string;
  sessionsBoulder?: string;
  sessionsLead?: string;
};

function normalizeForm(raw: LegacyFormFields): AiPlanFormSnapshot {
  const merged: AiPlanFormSnapshot = {
    ...EMPTY_AI_PLAN_FORM,
    ...raw,
    currentSessionsPerWeek:
      raw.currentSessionsPerWeek ?? raw.sessionsPerWeek ?? EMPTY_AI_PLAN_FORM.currentSessionsPerWeek,
    currentSessionDurationHours:
      raw.currentSessionDurationHours
      ?? raw.sessionDurationHours
      ?? EMPTY_AI_PLAN_FORM.currentSessionDurationHours,
    currentSessionsOutdoor:
      raw.currentSessionsOutdoor ?? raw.sessionsOutdoor ?? EMPTY_AI_PLAN_FORM.currentSessionsOutdoor,
    currentSessionsBoulder:
      raw.currentSessionsBoulder ?? raw.sessionsBoulder ?? EMPTY_AI_PLAN_FORM.currentSessionsBoulder,
    currentSessionsLead:
      raw.currentSessionsLead ?? raw.sessionsLead ?? EMPTY_AI_PLAN_FORM.currentSessionsLead,
    desiredSessionsPerWeek:
      raw.desiredSessionsPerWeek ?? raw.sessionsPerWeek ?? EMPTY_AI_PLAN_FORM.desiredSessionsPerWeek,
    desiredSessionDurationHours:
      raw.desiredSessionDurationHours
      ?? raw.sessionDurationHours
      ?? EMPTY_AI_PLAN_FORM.desiredSessionDurationHours,
    desiredSessionsOutdoor:
      raw.desiredSessionsOutdoor ?? raw.sessionsOutdoor ?? EMPTY_AI_PLAN_FORM.desiredSessionsOutdoor,
    desiredSessionsBoulder:
      raw.desiredSessionsBoulder ?? raw.sessionsBoulder ?? EMPTY_AI_PLAN_FORM.desiredSessionsBoulder,
    desiredSessionsLead:
      raw.desiredSessionsLead ?? raw.sessionsLead ?? EMPTY_AI_PLAN_FORM.desiredSessionsLead,
  };

  const stronger = merged.strongerAspects ?? [];
  return {
    ...merged,
    strongerAspects: stronger,
    weakerAspects: (merged.weakerAspects ?? []).filter((item) => !stronger.includes(item)),
  };
}

export function saveAiPlan(plan: AiTrainingPlanResponse, form: AiPlanFormSnapshot): void {
  const payload: SavedAiPlan = {
    plan,
    form,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadAiPlan(): SavedAiPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedAiPlan;
    if (!parsed?.plan || !parsed?.form) return null;
    return {
      ...parsed,
      form: normalizeForm(parsed.form as LegacyFormFields),
    };
  } catch {
    return null;
  }
}

export function clearAiPlan(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatSavedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
