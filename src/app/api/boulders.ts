import { apiRequest } from './client';

export interface BoulderDetailResponseExtended {
  id: string;
  name: string;
  number_of_routes: number;
  max_grade: string;
  boulder_area_name: string;
  boulder_area_id: string;
  latitude: number;
  longitude: number;
}

export interface BoulderCreateUpdateRequest {
  name: string;
}

export interface BoulderRouteDetailResponse {
  id: string;
  route_name: string;
  route_description: string;
  grade: string;
  is_sent: boolean;
}

export const bouldersApi = {
  getOne: async (id: string): Promise<BoulderDetailResponseExtended> => {
    const data = await apiRequest<BoulderDetailResponseExtended>(`/boulders/one/${id}`);
    return data;
  },
  deleteOneBoulder: async (boulderId: string): Promise<null> => {
    const data = await apiRequest<null>(`/boulders/one/${boulderId}/delete`, { method: "DELETE"});
    return data;
  },
  createOneBoulder: async (userId: string, boulderAreaId: string, body: BoulderCreateUpdateRequest): Promise<null> => {
    const data = await apiRequest<null>(`/boulders/create-one/${userId}/${boulderAreaId}`, {body: body, method: "POST"});
    return data;
  },
  getOneRoutes: async (id: string, userId: string): Promise<BoulderRouteDetailResponse[]> => {
    const data = await apiRequest<BoulderRouteDetailResponse[]>(`/boulders/one/${id}/routes/${userId}`);
    return data;
  },
  getOneRoutesPublic: async (id: string): Promise<BoulderRouteDetailResponse[]> => {
    const data = await apiRequest<BoulderRouteDetailResponse[]>(`/boulders/one/${id}/routes/public`);
    return data;
  },
};
