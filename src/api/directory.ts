import { api } from '@/api/client';
import type {
  HealthConcern,
  MapConfig,
  Modality,
  Practitioner,
  RecommendationPayload,
  RecommendationRequest,
} from '@/api/types';

export const directoryApi = {
  async concerns(): Promise<HealthConcern[]> {
    const { data } = await api.get<HealthConcern[]>('/directory/concerns/');
    return data;
  },

  async modalities(): Promise<Modality[]> {
    const { data } = await api.get<Modality[]>('/directory/modalities/');
    return data;
  },

  async recommend(payload: RecommendationPayload): Promise<RecommendationRequest> {
    const { data } = await api.post<RecommendationRequest>(
      '/directory/recommendations/',
      payload,
    );
    return data;
  },

  async getRecommendation(id: string, token: string): Promise<RecommendationRequest> {
    const { data } = await api.get<RecommendationRequest>(
      `/directory/recommendations/${id}/`,
      { params: { token } },
    );
    return data;
  },

  async practitioner(id: string): Promise<Practitioner> {
    const { data } = await api.get<Practitioner>(`/directory/practitioners/${id}/`);
    return data;
  },

  async mapConfig(): Promise<MapConfig> {
    const { data } = await api.get<MapConfig>('/directory/map-config/');
    return data;
  },
};
