import { describe, expect, it } from 'vitest';

import { tokenStore } from '@/auth/tokens';

describe('tokenStore', () => {
  it('round-trips a token pair', () => {
    tokenStore.set({ access: 'a-token', refresh: 'r-token' });

    expect(tokenStore.access).toBe('a-token');
    expect(tokenStore.refresh).toBe('r-token');
  });

  it('replaces only the access token', () => {
    tokenStore.set({ access: 'a-token', refresh: 'r-token' });
    tokenStore.setAccess('new-access');

    expect(tokenStore.access).toBe('new-access');
    expect(tokenStore.refresh).toBe('r-token');
  });

  it('clears both tokens', () => {
    tokenStore.set({ access: 'a-token', refresh: 'r-token' });
    tokenStore.clear();

    expect(tokenStore.access).toBeNull();
    expect(tokenStore.refresh).toBeNull();
  });
});
