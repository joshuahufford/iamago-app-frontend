import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AuthProvider } from '@/auth/AuthProvider';
import { theme } from '@/theme';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

/** Renders a component inside every provider the app relies on. */
export function renderWithProviders(ui: ReactElement, { route = '/', ...options }: Options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MantineProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>
            <AuthProvider>{children}</AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      </MantineProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export const mockUser = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'ada@example.com',
  first_name: 'Ada',
  last_name: 'Lovelace',
  full_name: 'Ada Lovelace',
  is_staff: false,
  date_joined: '2026-01-01T00:00:00Z',
  profile: {
    bio: '',
    avatar_url: '',
    timezone: 'UTC',
    theme: 'auto' as const,
  },
};

// --- Directory fixtures ---------------------------------------------------

import type {
  HealthConcern,
  Modality,
  Practitioner,
  Recommendation,
  RecommendationRequest,
} from '@/api/types';

export const mockModality = (overrides: Partial<Modality> = {}): Modality => ({
  id: 'mod-acupuncture',
  name: 'Acupuncture',
  slug: 'acupuncture',
  description: '',
  ...overrides,
});

export const mockConcern = (overrides: Partial<HealthConcern> = {}): HealthConcern => ({
  id: 'con-pain',
  name: 'Chronic pain',
  slug: 'chronic-pain',
  description: '',
  modalities: ['acupuncture'],
  ...overrides,
});

export const mockPractitioner = (
  overrides: Partial<Practitioner> = {},
): Practitioner => ({
  id: 'prac-1',
  display_name: 'Maya Ellison',
  credentials: 'LAc, DACM',
  practice_name: 'Still Point Acupuncture',
  bio: '',
  photo_url: '',
  website: 'https://example.com/maya',
  phone: '+1 512 555 0100',
  email: '',
  years_experience: 12,
  modalities: [mockModality()],
  concerns: [mockConcern()],
  address_line1: '',
  address_line2: '',
  city: 'Austin',
  region: 'TX',
  postal_code: '78704',
  country: 'US',
  latitude: 30.25,
  longitude: -97.75,
  offers_telehealth: true,
  accepting_new_patients: true,
  accepts_insurance: false,
  tier: 'partner',
  is_preferred: true,
  ...overrides,
});

export const mockRecommendation = (
  overrides: Partial<Recommendation> = {},
): Recommendation => ({
  rank: 1,
  score: 89.56,
  distance_km: 2.02,
  reasons: ['Treats 1 of your 1 concern', '2.0 km away', 'iamago partner'],
  practitioner: mockPractitioner(),
  ...overrides,
});

export const mockRecommendationRequest = (
  overrides: Partial<RecommendationRequest> = {},
): RecommendationRequest => ({
  id: 'req-1',
  claim_token: 'token-abc',
  concerns: [mockConcern()],
  modalities: [],
  location_label: 'Austin, TX, USA',
  latitude: 30.2672,
  longitude: -97.7431,
  radius_km: 40,
  include_telehealth: true,
  accepting_new_patients_only: false,
  created_at: '2026-09-19T00:00:00Z',
  recommendations: [mockRecommendation()],
  ...overrides,
});
