import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { api } from '@/api/client';
import { tokenStore } from '@/auth/tokens';
import { SaveSearchButton } from '@/discovery/SaveSearchButton';
import { mockUser, renderWithProviders } from '@/test/utils';

function mockSaved(results: { id: string }[] = []) {
  vi.spyOn(api, 'get').mockImplementation((url: string) => {
    if (url === '/auth/me/') return Promise.resolve({ data: mockUser });
    return Promise.resolve({
      data: { count: results.length, next: null, previous: null, results },
    });
  });
}

describe('<SaveSearchButton />', () => {
  it('offers nothing to a signed-out visitor', async () => {
    tokenStore.clear();
    mockSaved();

    renderWithProviders(<SaveSearchButton searchId="req-1" token="token-abc" />);

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /save to my account/i })).not.toBeInTheDocument(),
    );
  });

  it('offers to save an unclaimed search to a signed-in account', async () => {
    tokenStore.set({ access: 'a', refresh: 'r' });
    mockSaved();

    renderWithProviders(<SaveSearchButton searchId="req-1" token="token-abc" />);

    expect(
      await screen.findByRole('button', { name: /save to my account/i }),
    ).toBeInTheDocument();
  });

  it('claims with the token that opened the results', async () => {
    const user = userEvent.setup();
    tokenStore.set({ access: 'a', refresh: 'r' });
    mockSaved();
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 'req-1' } });

    renderWithProviders(<SaveSearchButton searchId="req-1" token="token-abc" />);
    await user.click(await screen.findByRole('button', { name: /save to my account/i }));

    await waitFor(() => expect(post).toHaveBeenCalled());
    expect(post.mock.calls[0][1]).toEqual({ id: 'req-1', token: 'token-abc' });
    expect(await screen.findByText(/saved to your account/i)).toBeInTheDocument();
  });

  it('says nothing to do when the search is already theirs', async () => {
    tokenStore.set({ access: 'a', refresh: 'r' });
    mockSaved([{ id: 'req-1' }]);

    renderWithProviders(<SaveSearchButton searchId="req-1" token="token-abc" />);

    expect(await screen.findByText(/saved to your account/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /save to my account/i }),
    ).not.toBeInTheDocument();
  });

  it('reports a search that belongs to someone else', async () => {
    const user = userEvent.setup();
    tokenStore.set({ access: 'a', refresh: 'r' });
    mockSaved();
    vi.spyOn(api, 'post').mockRejectedValue(
      Object.assign(new Error('Conflict'), {
        isAxiosError: true,
        response: { status: 409, data: { detail: 'Already saved.', errors: {} } },
      }),
    );

    renderWithProviders(<SaveSearchButton searchId="req-1" token="token-abc" />);
    await user.click(await screen.findByRole('button', { name: /save to my account/i }));

    expect(
      await screen.findByText(/already saved to another account/i),
    ).toBeInTheDocument();
  });
});
