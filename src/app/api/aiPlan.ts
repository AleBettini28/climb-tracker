import { apiRequest, ApiError } from './client';
import { API_BASE_URL } from './config';

export interface AiTrainingPlanRequest {
  sex: string;
  weight_kg: number;
  height_cm: number;
  age: number;
  current_sessions_per_week: number;
  current_session_duration_hours: number;
  current_sessions_outdoor: number;
  current_sessions_boulder: number;
  current_sessions_lead: number;
  desired_sessions_per_week: number;
  desired_session_duration_hours: number;
  desired_sessions_outdoor: number;
  desired_sessions_boulder: number;
  desired_sessions_lead: number;
  highest_grade_boulder: string;
  highest_grade_lead: string;
  highest_flash_boulder: string;
  highest_flash_lead: string;
  consolidated_grade_boulder: string;
  consolidated_grade_lead: string;
  climbing_experience: string;
  stronger_aspects: string[];
  weaker_aspects: string[];
  max_pull_ups: number;
  trains_fingerboard: boolean;
  fingerboard_times_per_week?: number;
  main_limiter: string;
  fall_comfort: string;
  other_sports?: string;
  injuries?: string;
  strong_points: string;
  weak_points: string;
  main_goal: string;
  goal_blockers: string;
  additional_info?: string;
}

export interface AiTrainingPlanPhase {
  phase: string;
  duration: string;
  focus: string;
  details: string;
}

export interface AiTrainingPlanSession {
  name: string;
  type: string;
  duration_minutes: number;
  description: string;
  exercises: string[];
}

export interface AiTrainingPlanMetric {
  metric: string;
  current: string;
  target: string;
  notes: string;
}

export interface AiTrainingPlanResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  estimated_duration: string;
  timeline: AiTrainingPlanPhase[];
  weekly_structure: {
    overview: string;
    sessions: AiTrainingPlanSession[];
  };
  workout_guidelines: string;
  metrics_and_targets: AiTrainingPlanMetric[];
  injury_considerations: string;
  additional_advice: string;
}

async function downloadPdfBlob(plan: AiTrainingPlanResponse): Promise<void> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}/ai-plan/export-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(plan),
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    const message =
      typeof errorBody === 'object' &&
      errorBody !== null &&
      'error' in errorBody &&
      typeof (errorBody as { error: unknown }).error === 'string'
        ? (errorBody as { error: string }).error
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, errorBody);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'piano-ai-allenamento.pdf';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const aiPlanApi = {
  generate: async (body: AiTrainingPlanRequest): Promise<AiTrainingPlanResponse> => {
    return apiRequest<AiTrainingPlanResponse>('/ai-plan/generate', {
      method: 'POST',
      body,
    });
  },
  exportPdf: downloadPdfBlob,
};
