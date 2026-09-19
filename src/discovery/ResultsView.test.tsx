import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { api } from '@/api/client';
import { ResultsView } from '@/discovery/ResultsView';
import {
  mockPractitioner,
  mockRecommendation,
  mockRecommendationRequest,
  renderWithProviders,
} from '@/test/utils';

function mockMapConfig(key = '') {
  vi.spyOn(api, 'get').mockResolvedValue({
    data: { google_maps_api_key: key, maps_enabled: Boolean(key) },
  });
}

const THREE = [
  mockRecommendation({
    rank: 1,
    practitioner: mockPractitioner({ id: 'p1', display_name: 'Maya Ellison', tier: 'partner' }),
  }),
  mockRecommendation({
    rank: 2,
    reasons: ['Treats 1 of your 2 concerns'],
    practitioner: mockPractitioner({
      id: 'p2',
      display_name: 'Ravi Chandrasekar',
      tier: 'verified',
      is_preferred: true,
    }),
  }),
  mockRecommendation({
    rank: 3,
    reasons: ['12.0 km away'],
    practitioner: mockPractitioner({
      id: 'p3',
      display_name: 'Corey Whitfield',
      tier: 'standard',
      is_preferred: false,
    }),
  }),
];

describe('<ResultsView />', () => {
  it('renders every recommendation it is given', async () => {
    mockMapConfig();

    renderWithProviders(
      <ResultsView result={mockRecommendationRequest({ recommendations: THREE })} />,
    );

    expect(await screen.findByText('Maya Ellison')).toBeInTheDocument();
    expect(screen.getByText('Ravi Chandrasekar')).toBeInTheDocument();
    expect(screen.getByText('Corey Whitfield')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your top 3 matches/i })).toBeInTheDocument();
  });

  it('badges partner and verified practitioners but not standard ones', async () => {
    mockMapConfig();

    renderWithProviders(
      <ResultsView result={mockRecommendationRequest({ recommendations: THREE })} />,
    );

    expect(await screen.findByText('Partner')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.queryByText('Standard')).not.toBeInTheDocument();
  });

  it('shows the reasons behind each match', async () => {
    mockMapConfig();

    renderWithProviders(
      <ResultsView result={mockRecommendationRequest({ recommendations: THREE })} />,
    );

    expect(await screen.findByText('Treats 1 of your 1 concern')).toBeInTheDocument();
    expect(screen.getByText('Treats 1 of your 2 concerns')).toBeInTheDocument();
  });

  it('falls back to a list-only view when no Maps key is configured', async () => {
    mockMapConfig('');

    renderWithProviders(
      <ResultsView result={mockRecommendationRequest({ recommendations: THREE })} />,
    );

    expect(await screen.findByText('Map view unavailable')).toBeInTheDocument();
    // The results themselves must still be there.
    expect(screen.getByText('Maya Ellison')).toBeInTheDocument();
  });

  it('explains an empty result instead of showing a blank page', async () => {
    mockMapConfig();

    renderWithProviders(
      <ResultsView result={mockRecommendationRequest({ recommendations: [] })} />,
    );

    expect(
      await screen.findByRole('heading', { name: /no matches near/i }),
    ).toBeInTheDocument();
  });

  it('carries the medical disclaimer', async () => {
    mockMapConfig();

    renderWithProviders(
      <ResultsView result={mockRecommendationRequest({ recommendations: THREE })} />,
    );

    expect(
      await screen.findByText(/does not provide medical advice/i),
    ).toBeInTheDocument();
  });
});
