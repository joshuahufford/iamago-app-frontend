import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { api } from '@/api/client';
import { DashboardPage } from '@/pages/DashboardPage';
import { mockConcern, renderWithProviders } from '@/test/utils';

const SEARCH = {
  id: 'req-1',
  claim_token: 'token-abc',
  location_label: 'Austin, TX, USA',
  radius_miles: 25,
  concerns: [mockConcern()],
  modalities: [],
  result_count: 2,
  practitioner_names: ['Maya Ellison', 'Ravi Chandrasekar'],
  created_at: '2026-09-18T10:00:00Z',
};

const ENQUIRY = {
  id: 'enq-1',
  practitioner_id: 'prac-1',
  practitioner_name: 'Maya Ellison',
  status: 'viewed' as const,
  share_concerns: true,
  consent_text: 'I agree that iamago may share my name, contact details and…',
  message: 'My back has hurt for months.',
  first_viewed_at: '2026-09-18T12:00:00Z',
  responded_at: null,
  created_at: '2026-09-18T11:00:00Z',
};

function mockPatient({ searches = [SEARCH], enquiries = [ENQUIRY] } = {}) {
  vi.spyOn(api, 'get').mockImplementation((url: string) => {
    const rows = url === '/patients/searches/' ? searches : enquiries;
    return Promise.resolve({
      data: { count: rows.length, next: null, previous: null, results: rows },
    });
  });
}

describe('<DashboardPage />', () => {
  it('lists past searches with what was asked and who came back', async () => {
    mockPatient();

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Austin, TX, USA')).toBeInTheDocument();
    expect(screen.getByText('within 25 miles')).toBeInTheDocument();
    expect(screen.getByText('Chronic pain')).toBeInTheDocument();
    expect(screen.getByText('Maya Ellison · Ravi Chandrasekar')).toBeInTheDocument();
  });

  it('links a past search back to its results, token and all', async () => {
    mockPatient();

    renderWithProviders(<DashboardPage />);

    const link = await screen.findByRole('link', { name: /view/i });
    expect(link).toHaveAttribute('href', '/recommendations/req-1?token=token-abc');
  });

  it('shows enquiries and how far along they are', async () => {
    const user = userEvent.setup();
    mockPatient();

    renderWithProviders(<DashboardPage />);
    await user.click(await screen.findByRole('tab', { name: /practitioners i contacted/i }));

    expect(await screen.findByText('Maya Ellison')).toBeInTheDocument();
    expect(screen.getByText('Seen by them')).toBeInTheDocument();
  });

  it('tells the patient what they shared', async () => {
    const user = userEvent.setup();
    mockPatient();

    renderWithProviders(<DashboardPage />);
    await user.click(await screen.findByRole('tab', { name: /practitioners i contacted/i }));

    expect(
      await screen.findByText(/your contact details and the concerns you selected/i),
    ).toBeInTheDocument();
  });

  it('says so plainly when only contact details were shared', async () => {
    const user = userEvent.setup();
    mockPatient({ enquiries: [{ ...ENQUIRY, share_concerns: false }] });

    renderWithProviders(<DashboardPage />);
    await user.click(await screen.findByRole('tab', { name: /practitioners i contacted/i }));

    expect(await screen.findByText(/you shared: your contact details$/i)).toBeInTheDocument();
  });

  it('explains an empty account rather than showing a blank page', async () => {
    mockPatient({ searches: [], enquiries: [] });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/no saved searches yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start a search/i })).toBeInTheDocument();
  });

  it('offers no link for a search that matched nobody', async () => {
    mockPatient({ searches: [{ ...SEARCH, result_count: 0, practitioner_names: [] }] });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/no matches at the time/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^view$/i })).not.toBeInTheDocument();
  });
});
