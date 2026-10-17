import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/api/client';
import { HomePage } from '@/pages/HomePage';
import {
  mockConcern,
  mockModality,
  mockRecommendationRequest,
  renderWithProviders,
} from '@/test/utils';

const CONCERNS = [
  mockConcern({ id: 'con-pain', name: 'Chronic pain' }),
  mockConcern({ id: 'con-sleep', name: 'Sleep problems', slug: 'sleep' }),
];
const MODALITIES = [
  mockModality({ id: 'mod-acu', name: 'Acupuncture' }),
  mockModality({ id: 'mod-chiro', name: 'Chiropractic', slug: 'chiropractic' }),
];

// HomePage navigates on success; spying on it is how the shareable result URL
// gets asserted without standing up the whole router.
const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}));

function mockDirectory() {
  navigate.mockClear();
  vi.spyOn(api, 'get').mockImplementation((url: string) => {
    if (url === '/directory/concerns/') return Promise.resolve({ data: CONCERNS });
    if (url === '/directory/modalities/') return Promise.resolve({ data: MODALITIES });
    return Promise.resolve({ data: { google_maps_api_key: '', maps_enabled: false } });
  });
}

describe('<HomePage />', () => {
  beforeEach(mockDirectory);

  it('leads with the first question as the page heading, not a pitch', async () => {
    renderWithProviders(<HomePage />);

    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/what brings you here/i);
  });

  it('shows the directory\'s real coverage instead of benefit claims', async () => {
    renderWithProviders(<HomePage />);

    // The modality names come from the API, so this is something a visitor can
    // check rather than a claim about matching, badging or maps.
    expect(await screen.findByText(/Acupuncture · Chiropractic/)).toBeInTheDocument();
    expect(screen.queryByText(/clearly badged/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/on a map before you reach out/i)).not.toBeInTheDocument();
  });

  it('reports progress through the three questions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    await screen.findByRole('checkbox', { name: 'Chronic pain' });
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      'Question 1 of 3',
    );

    await user.click(screen.getByRole('checkbox', { name: 'Chronic pain' }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() =>
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuetext',
        'Question 2 of 3',
      ),
    );
  });

  it('runs the whole flow anonymously and lands on a shareable result', async () => {
    const user = userEvent.setup();
    const post = vi
      .spyOn(api, 'post')
      .mockResolvedValue({ data: mockRecommendationRequest() });

    renderWithProviders(<HomePage />);

    await user.click(await screen.findByRole('checkbox', { name: 'Chronic pain' }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(await screen.findByRole('button', { name: /skip/i }));
    await user.type(await screen.findByLabelText('Location'), 'Austin');
    await user.click(screen.getByRole('button', { name: /find my matches/i }));

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    expect(post.mock.calls[0][0]).toBe('/directory/recommendations/');
    expect(post.mock.calls[0][1]).toMatchObject({
      concerns: ['con-pain'],
      location_label: 'Austin',
    });

    // The result has to stand on its own URL, token and all, so it can be
    // bookmarked or passed to someone else.
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(
        '/recommendations/req-1?token=token-abc',
        expect.anything(),
      ),
    );
    expect(await screen.findByText(/Still Point Acupuncture/)).toBeInTheDocument();
  });

  it('asks for an email when the daily allowance is spent', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'get').mockImplementation((url: string) => {
      if (url === '/directory/concerns/') return Promise.resolve({ data: [mockConcern()] });
      return Promise.resolve({ data: [] });
    });
    vi.spyOn(api, 'post').mockRejectedValue(
      Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        response: {
          status: 429,
          data: { detail: 'Out of free searches.', errors: {}, code: 'email_required' },
        },
      }),
    );

    renderWithProviders(<HomePage />);

    const chip = await screen.findByRole('checkbox', { name: 'Chronic pain' });
    await user.click(chip);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(await screen.findByRole('button', { name: /skip|continue/i }));
    await user.type(await screen.findByLabelText('Location'), 'Austin');
    await user.click(screen.getByRole('button', { name: /find my matches/i }));

    // The gate only appears after the limit is hit, never before.
    expect(await screen.findByLabelText(/your email/i)).toBeInTheDocument();
  });
});
