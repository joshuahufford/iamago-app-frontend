import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { api } from '@/api/client';
import { tokenStore } from '@/auth/tokens';
import { App } from '@/App';
import { mockUser, renderWithProviders } from '@/test/utils';

describe('routing', () => {
  it('redirects an anonymous visitor from the dashboard to login', async () => {
    renderWithProviders(<App />, { route: '/' });

    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders the dashboard for an authenticated user', async () => {
    tokenStore.set({ access: 'access-token', refresh: 'refresh-token' });
    vi.spyOn(api, 'get').mockImplementation((url: string) =>
      url === '/auth/me/'
        ? Promise.resolve({ data: mockUser })
        : Promise.resolve({ data: { status: 'ok', database: 'ok' } }),
    );

    renderWithProviders(<App />, { route: '/' });

    expect(
      await screen.findByRole('heading', { name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it('shows the not found page for an unknown authenticated route', async () => {
    tokenStore.set({ access: 'access-token', refresh: 'refresh-token' });
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockUser });

    renderWithProviders(<App />, { route: '/does-not-exist' });

    expect(await screen.findByText('404')).toBeInTheDocument();
  });
});
