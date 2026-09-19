import { api } from '@/api/client';
import type { Paginated, SavedEnquiry, SavedSearch } from '@/api/types';

export const patientsApi = {
  async searches(): Promise<Paginated<SavedSearch>> {
    const { data } = await api.get<Paginated<SavedSearch>>('/patients/searches/');
    return data;
  },

  async enquiries(): Promise<Paginated<SavedEnquiry>> {
    const { data } = await api.get<Paginated<SavedEnquiry>>('/patients/enquiries/');
    return data;
  },

  /**
   * Attach a search made before signing up. The claim token is the capability,
   * the same one that opens the results.
   */
  async claimSearch(id: string, token: string): Promise<SavedSearch> {
    const { data } = await api.post<SavedSearch>('/patients/searches/claim/', {
      id,
      token,
    });
    return data;
  },
};
