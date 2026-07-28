import { apiRequest } from './client';

export interface BoulderAreaDetailResponse {
  id: string;
  name: string;
  description: string;
  city?: string;
  country?: string;
  map_image_url?: string;
  number_of_boulders: number;
  added_by: string;
  latitude: number;
  longitude: number;
  max_grade: string;
}

export interface BoulderAreaCreateUpdateRequest {
  name: string;
  description: string;
  city?: string;
  country?: string;
  map_image_url?: string;
  added_by: string;
  latitude: number;
  longitude: number;
}

export interface BoulderDetailResponse {
  id: string;
  name: string;
  number_of_routes: number;
  max_grade: string;
}

export const boulderAreasApi = {
  list: async (): Promise<BoulderAreaDetailResponse[]> => {
    const data = await apiRequest<BoulderAreaDetailResponse[]>('/boulder-areas/list');
    return data.sort((a, b) => b.number_of_boulders - a.number_of_boulders);
  },
  getOne: async (id: string): Promise<BoulderAreaDetailResponse> => {
    const data = await apiRequest<BoulderAreaDetailResponse>(`/boulder-areas/one/${id}`);
    return data;
  },
  getOneBoulders: async (id: string): Promise<BoulderDetailResponse[]> => {
    const data = await apiRequest<BoulderDetailResponse[]>(`/boulder-areas/one/${id}/boulders`);
    return data;
  },
  createOneBoulderArea: async (body: BoulderAreaCreateUpdateRequest): Promise<null> => {
      const data = await apiRequest<null>(`/boulder-areas/create/one`, {body: body, method: "POST"});
      return data;
  },
  updateOneBoulderArea: async (body: BoulderAreaCreateUpdateRequest, id: string): Promise<null> => {
      const data = await apiRequest<null>(`/boulder-areas/update/${id}`, {body: body, method: "PUT"});
      return data;
  },
  deleteOneBoulderArea: async (id: string): Promise<null> => {
      const data = await apiRequest<null>(`/boulder-areas/one/${id}/delete`, { method: "DELETE"});
      return data;
  },
};
