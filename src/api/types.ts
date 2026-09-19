export interface Profile {
  bio: string;
  avatar_url: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_staff: boolean;
  date_joined: string;
  profile: Profile;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface LoginResponse extends TokenPair {
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  profile?: Partial<Profile>;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

/** The error envelope every DRF failure is normalised into by the backend. */
export interface ApiErrorBody {
  detail: string;
  errors: Record<string, string[] | string>;
}

/** Paginated list response shape used by DRF's PageNumberPagination. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- Directory ------------------------------------------------------------

export type PractitionerTier = 'partner' | 'verified' | 'standard';

export interface Modality {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface HealthConcern {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Slugs of the modalities typically used for this concern. */
  modalities: string[];
}

export interface Practitioner {
  id: string;
  display_name: string;
  credentials: string;
  practice_name: string;
  bio: string;
  photo_url: string;
  website: string;
  phone: string;
  email: string;
  years_experience: number | null;
  modalities: Modality[];
  concerns: HealthConcern[];
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  offers_telehealth: boolean;
  accepting_new_patients: boolean;
  accepts_insurance: boolean;
  tier: PractitionerTier;
  is_preferred: boolean;
}

export interface Recommendation {
  rank: number;
  score: number;
  distance_km: number | null;
  reasons: string[];
  practitioner: Practitioner;
}

export interface RecommendationRequest {
  id: string;
  claim_token: string;
  concerns: HealthConcern[];
  modalities: Modality[];
  location_label: string;
  latitude: number | null;
  longitude: number | null;
  radius_km: number;
  include_telehealth: boolean;
  accepting_new_patients_only: boolean;
  created_at: string;
  recommendations: Recommendation[];
}

export interface RecommendationPayload {
  concerns: string[];
  modalities: string[];
  location_label?: string;
  latitude?: number | null;
  longitude?: number | null;
  radius_km?: number;
  include_telehealth?: boolean;
  accepting_new_patients_only?: boolean;
}

export interface MapConfig {
  google_maps_api_key: string;
  maps_enabled: boolean;
}
