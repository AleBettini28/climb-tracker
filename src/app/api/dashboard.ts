import { apiRequest } from './client';
import { ClimbDetailExtendedResponse } from './routes';
import { CragDetailResponse } from './crags';

export interface GradeCount {
  grade: string;
  count: number;
}

export interface DashboardStatsResponse {
  best_grade: string | null;
  total_climbs: number;
  best_crag: CragDetailResponse | null;
  best_crag_climb_count: number | null;
  climbs_by_grade: GradeCount[];
  recent_climbs: ClimbDetailExtendedResponse[];
  top_grades: GradeCount[];
}

export const dashboardApi = {
  getStats: async (userId: string): Promise<DashboardStatsResponse> => {
    return apiRequest<DashboardStatsResponse>(`/dashboard/stats/${userId}`);
  },
};
