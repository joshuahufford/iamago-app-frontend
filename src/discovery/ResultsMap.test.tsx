import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ResultsMap } from '@/discovery/ResultsMap';
import { mockPractitioner, mockRecommendation, renderWithProviders } from '@/test/utils';

const CENTER = { lat: 30.2672, lng: -97.7431 };
const PINS = [
  mockRecommendation({ rank: 1, practitioner: mockPractitioner({ id: 'p1' }) }),
  mockRecommendation({
    rank: 2,
    practitioner: mockPractitioner({ id: 'p2', latitude: 30.28, longitude: -97.72 }),
  }),
];

describe('<ResultsMap />', () => {
  it('falls back to an explanation when no key is configured', () => {
    renderWithProviders(
      <ResultsMap
        apiKey=""
        recommendations={PINS}
        center={CENTER}
        activeId={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText('Map view unavailable')).toBeInTheDocument();
    expect(screen.getByText(/2 matches/)).toBeInTheDocument();
  });

  it('counts a single match in the singular', () => {
    renderWithProviders(
      <ResultsMap
        apiKey=""
        recommendations={[PINS[0]]}
        center={CENTER}
        activeId={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText(/your match plotted here/)).toBeInTheDocument();
  });

  it('ignores practitioners with no coordinates when counting pins', () => {
    const noCoords = mockRecommendation({
      practitioner: mockPractitioner({ id: 'p3', latitude: null, longitude: null }),
    });

    renderWithProviders(
      <ResultsMap
        apiKey=""
        recommendations={[...PINS, noCoords]}
        center={CENTER}
        activeId={null}
        onSelect={vi.fn()}
      />,
    );

    // Three recommendations, but only two can be placed on a map.
    expect(screen.getByText(/2 matches/)).toBeInTheDocument();
  });

  it('loads the Google Maps API with the configured key', async () => {
    renderWithProviders(
      <ResultsMap
        apiKey="browser-key-123"
        recommendations={PINS}
        center={CENTER}
        activeId={null}
        onSelect={vi.fn()}
      />,
    );

    // The real map cannot render in jsdom, but the loader must at least be
    // wired up with the key we served from the backend.
    await waitFor(() => {
      const script = document.querySelector<HTMLScriptElement>(
        'script[src*="maps.googleapis.com"]',
      );
      expect(script).not.toBeNull();
      expect(script?.src).toContain('key=browser-key-123');
    });

    expect(screen.queryByText('Map view unavailable')).not.toBeInTheDocument();
  });
});
