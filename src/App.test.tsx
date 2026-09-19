import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { api } from '@/api/client';
import { tokenStore } from '@/auth/tokens';
import { App } from '@/App';
import { mockConcern, mockUser, renderWithProviders } from '@/test/utils';

function mockDirectoryEndpoints() {
  vi.spyOn(api, 'get').mockImplementation((url: string) => {
    if (url === '/directory/concerns/') return Promise.resolve({ data: [mockConcern()] });
    if (url === '/directory/modalities/') return Promise.resolve({ data: [] });
    if (url === '/directory/map-config/')
      return Promise.resolve({ data: { google_maps_api_key: '', maps_enabled: false } });
    if (url === '/auth/me/') return Promise.resolve({ data: mockUser });
    return Promise.resolve({ data: {} });
  });
}

describe('routing', () => {
  it('serves the discovery flow at "/" with no account', async () => {
    mockDirectoryEndpoints();

    renderWithProviders(<App />, { route: '/' });

    expect(
      await screen.findByRole('heading', { name: /what brings you here/i }),
    ).toBeInTheDocument();
    // The whole point: no redirect to login -- the header offers sign in
    // rather than demanding it.
    expect(screen.getByRole('link', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('redirects an anonymous visitor away from the dashboard', async () => {
    mockDirectoryEndpoints();

    renderWithProviders(<App />, { route: '/dashboard' });

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();
  });

  it('renders the dashboard for an authenticated user', async () => {
    tokenStore.set({ access: 'access-token', refresh: 'refresh-token' });
    mockDirectoryEndpoints();

    renderWithProviders(<App />, { route: '/dashboard' });

    expect(
      await screen.findByRole('heading', { name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it('shows the not found page for an unknown route', async () => {
    mockDirectoryEndpoints();

    renderWithProviders(<App />, { route: '/does-not-exist' });

    expect(await screen.findByText('404')).toBeInTheDocument();
  });
});
