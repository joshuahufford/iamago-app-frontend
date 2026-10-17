import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { api } from '@/api/client';
import { App } from '@/App';
import { mockRecommendationRequest, renderWithProviders } from '@/test/utils';

describe('<RecommendationsPage />', () => {
  it('opens a shared result with its claim token', async () => {
    const result = mockRecommendationRequest();
    vi.spyOn(api, 'get').mockImplementation((url: string, config?: { params?: unknown }) => {
      if (url === '/directory/recommendations/req-1/') {
        expect(config?.params).toEqual({ token: 'token-abc' });
        return Promise.resolve({ data: result });
      }
      return Promise.resolve({
        data: { google_maps_api_key: '', maps_enabled: false },
      });
    });

    renderWithProviders(<App />, { route: '/recommendations/req-1?token=token-abc' });

    expect(await screen.findByText('Maya Ellison')).toBeInTheDocument();
  });

  it('explains a link that is missing its token', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      data: { google_maps_api_key: '', maps_enabled: false },
    });

    renderWithProviders(<App />, { route: '/recommendations/req-1' });

    expect(
      await screen.findByText(/could not open those results/i),
    ).toBeInTheDocument();
  });

  it('explains a rejected token rather than rendering an empty page', async () => {
    vi.spyOn(api, 'get').mockImplementation((url: string) => {
      if (url === '/directory/recommendations/req-1/') {
        return Promise.reject(
          Object.assign(new Error('Request failed'), {
            isAxiosError: true,
            response: { status: 404, data: { detail: 'Not found.', errors: {} } },
          }),
        );
      }
      return Promise.resolve({
        data: { google_maps_api_key: '', maps_enabled: false },
      });
    });

    renderWithProviders(<App />, { route: '/recommendations/req-1?token=wrong' });

    expect(
      await screen.findByText(/could not open those results/i),
    ).toBeInTheDocument();
  });
});
