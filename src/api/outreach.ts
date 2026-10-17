import { api } from '@/api/client';
import type { ContactRequestAck, ContactRequestPayload } from '@/api/types';

export const outreachApi = {
  async requestContact(payload: ContactRequestPayload): Promise<ContactRequestAck> {
    const { data } = await api.post<ContactRequestAck>(
      '/outreach/contact-requests/',
      payload,
    );
    return data;
  },

  /** Mail a visitor their own matches. The claim token is what authorises it. */
  async emailMatches(requestId: string, token: string, email: string): Promise<void> {
    await api.post(`/outreach/recommendations/${requestId}/email/`, { token, email });
  },
};
