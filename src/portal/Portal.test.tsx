import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/api/client';
import { App } from '@/App';
import { tokenStore } from '@/auth/tokens';
import { mockPractitioner, mockUser, renderWithProviders } from '@/test/utils';

const LISTING = mockPractitioner({ display_name: 'Maya Ellison', tier: 'partner' });

const STATS = {
  days: 30,
  since: '2026-08-20',
  impressions: 120,
  profile_views: 8,
  phone_reveals: 5,
  website_clicks: 11,
  clicks: 24,
  click_through_rate: 0.2,
  contact_requests: 6,
  new_contact_requests: 2,
  tier: 'partner' as const,
};

const ENQUIRY = {
  id: 'enq-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+1 512 555 0111',
  message: 'My back has hurt for months.',
  concerns: [],
  search_location: 'Austin, TX, USA',
  share_concerns: false,
  status: 'new' as const,
  practitioner_note: '',
  first_viewed_at: null,
  responded_at: null,
  created_at: '2026-09-18T10:00:00Z',
};

function mockPortal({ listingFails = false } = {}) {
  vi.spyOn(api, 'get').mockImplementation((url: string) => {
    if (url === '/auth/me/') return Promise.resolve({ data: mockUser });
    if (url === '/portal/me/') {
      return listingFails
        ? Promise.reject(
            Object.assign(new Error('Forbidden'), {
              isAxiosError: true,
              response: { status: 403, data: { detail: 'Not linked.', errors: {} } },
            }),
          )
        : Promise.resolve({ data: LISTING });
    }
    if (url === '/portal/stats/') return Promise.resolve({ data: STATS });
    if (url === '/portal/contact-requests/')
      return Promise.resolve({ data: { count: 1, next: null, previous: null, results: [ENQUIRY] } });
    if (url.startsWith('/portal/contact-requests/')) return Promise.resolve({ data: ENQUIRY });
    if (url === '/directory/modalities/' || url === '/directory/concerns/')
      return Promise.resolve({ data: [] });
    return Promise.resolve({ data: {} });
  });
}

describe('practitioner portal', () => {
  beforeEach(() => {
    tokenStore.set({ access: 'access-token', refresh: 'refresh-token' });
  });

  it('sends an anonymous visitor to sign in', async () => {
    tokenStore.clear();
    mockPortal();

    renderWithProviders(<App />, { route: '/portal' });

    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('explains itself to an account with no listing', async () => {
    mockPortal({ listingFails: true });

    renderWithProviders(<App />, { route: '/portal' });

    expect(
      await screen.findByText(/not linked to a practitioner listing/i),
    ).toBeInTheDocument();
  });

  it('shows the numbers a partner is paying for', async () => {
    mockPortal();

    renderWithProviders(<App />, { route: '/portal' });

    expect(await screen.findByText('120')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('20.0%')).toBeInTheDocument();
    expect(screen.getByText('2 new')).toBeInTheDocument();
  });

  it('badges the tier', async () => {
    mockPortal();

    renderWithProviders(<App />, { route: '/portal' });

    expect(await screen.findByText('Partner')).toBeInTheDocument();
  });

  it('lists enquiries', async () => {
    mockPortal();

    renderWithProviders(<App />, { route: '/portal/enquiries' });

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
  });

  it('says plainly when a patient withheld their concerns', async () => {
    const user = userEvent.setup();
    mockPortal();

    renderWithProviders(<App />, { route: '/portal/enquiries' });
    await user.click(await screen.findByText('Ada Lovelace'));

    expect(
      await screen.findByText(/chose not to share what they are seeking care for/i),
    ).toBeInTheDocument();
  });

  it('records a response', async () => {
    const user = userEvent.setup();
    mockPortal();
    const patch = vi.spyOn(api, 'patch').mockResolvedValue({
      data: { ...ENQUIRY, status: 'responded' },
    });

    renderWithProviders(<App />, { route: '/portal/enquiries' });
    await user.click(await screen.findByText('Ada Lovelace'));
    await user.click(await screen.findByRole('button', { name: /mark as responded/i }));

    await waitFor(() => expect(patch).toHaveBeenCalled());
    expect(patch.mock.calls[0][1]).toMatchObject({ status: 'responded' });
  });

  it('lets a practitioner edit their own listing', async () => {
    mockPortal();

    renderWithProviders(<App />, { route: '/portal/listing' });

    expect(await screen.findByDisplayValue('Maya Ellison')).toBeInTheDocument();
    // Tier and publication are iamago's to set, so they are not on this form.
    expect(screen.queryByLabelText(/tier/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/published/i)).not.toBeInTheDocument();
  });
});
