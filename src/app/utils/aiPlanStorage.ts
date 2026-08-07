import { AiTrainingPlanResponse } from '../api/aiPlan';
import {
  AiPlanFallComfort,
  AiPlanLimiter,
  AiPlanStyleAspect,
} from '../types/aiPlan';

const STORAGE_KEY = 'climb-tracker:ai-training-plan';

export interface AiPlanFormSnapshot {
  sessionsPerWeek: string;
  sessionDurationHours: string;
  sessionsOutdoor: string;
  sessionsBoulder: string;
  sessionsLead: string;
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
  sessionsPerWeek: '3',
  sessionDurationHours: '1.5',
  sessionsOutdoor: '1',
  sessionsBoulder: '2',
  sessionsLead: '1',
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
      form: { ...EMPTY_AI_PLAN_FORM, ...parsed.form },
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
