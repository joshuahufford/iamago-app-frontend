import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { errorMessage, fieldErrors } from '@/api/client';

function axiosErrorWith(data: unknown, status = 400) {
  const error = new AxiosError('Request failed');
  error.response = {
    data,
    status,
    statusText: '',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('errorMessage', () => {
  it('uses the detail from the API error envelope', () => {
    const error = axiosErrorWith({ detail: 'Not found.', errors: {} }, 404);

    expect(errorMessage(error)).toBe('Not found.');
  });

  it('explains a missing response as an unreachable server', () => {
    expect(errorMessage(new AxiosError('Network Error'))).toContain('Cannot reach the server');
  });

  it('falls back for non-axios errors', () => {
    expect(errorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});

describe('fieldErrors', () => {
  it('flattens per-field message arrays into strings', () => {
    const error = axiosErrorWith({
      detail: 'Validation failed.',
      errors: { email: ['Already taken.', 'Try another.'], password: ['Too short.'] },
    });

    expect(fieldErrors(error)).toEqual({
      email: 'Already taken. Try another.',
      password: 'Too short.',
    });
  });

  it('returns nothing when there are no field errors', () => {
    expect(fieldErrors(axiosErrorWith({ detail: 'Nope.', errors: {} }))).toEqual({});
    expect(fieldErrors(new Error('boom'))).toEqual({});
  });
});
