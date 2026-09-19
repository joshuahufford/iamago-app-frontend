import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/api/client';
import { tokenStore } from '@/auth/tokens';
import { LoginPage } from '@/pages/LoginPage';
import { mockUser, renderWithProviders } from '@/test/utils';

describe('<LoginPage />', () => {
  beforeEach(() => {
    tokenStore.clear();
  });

  it('validates the email before calling the API', async () => {
    const post = vi.spyOn(api, 'post');
    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');
    await userEvent.type(screen.getByPlaceholderText(/your password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('stores the token pair on a successful sign in', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({
      data: { access: 'access-token', refresh: 'refresh-token', user: mockUser },
    });

    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), mockUser.email);
    await userEvent.type(screen.getByPlaceholderText(/your password/i), 'a-good-password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(tokenStore.access).toBe('access-token'));
    expect(tokenStore.refresh).toBe('refresh-token');
  });

  it('surfaces the API error message when credentials are rejected', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(
      Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        response: {
          status: 401,
          data: { detail: 'No active account found with the given credentials', errors: {} },
        },
      }),
    );

    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), mockUser.email);
    await userEvent.type(screen.getByPlaceholderText(/your password/i), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/no active account found/i)).toBeInTheDocument();
    expect(tokenStore.access).toBeNull();
  });
});
