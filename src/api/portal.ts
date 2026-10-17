import { api } from '@/api/client';
import type {
  Paginated,
  PortalContactRequest,
  PortalListingUpdate,
  PortalStats,
  Practitioner,
} from '@/api/types';

export const portalApi = {
  async listing(): Promise<Practitioner> {
    const { data } = await api.get<Practitioner>('/portal/me/');
    return data;
  },

  async updateListing(payload: PortalListingUpdate): Promise<Practitioner> {
    const { data } = await api.patch<Practitioner>('/portal/me/', payload);
    return data;
  },

  async stats(days = 30): Promise<PortalStats> {
    const { data } = await api.get<PortalStats>('/portal/stats/', { params: { days } });
    return data;
  },

  async contactRequests(status?: string): Promise<Paginated<PortalContactRequest>> {
    const { data } = await api.get<Paginated<PortalContactRequest>>(
      '/portal/contact-requests/',
      { params: status ? { status } : undefined },
    );
    return data;
  },

  /** Opening an enquiry is recorded server-side, so this is not a free read. */
  async contactRequest(id: string): Promise<PortalContactRequest> {
    const { data } = await api.get<PortalContactRequest>(
      `/portal/contact-requests/${id}/`,
    );
    return data;
  },

  async updateContactRequest(
    id: string,
    payload: { status?: string; practitioner_note?: string },
  ): Promise<PortalContactRequest> {
    const { data } = await api.patch<PortalContactRequest>(
      `/portal/contact-requests/${id}/`,
      payload,
    );
    return data;
  },
};
