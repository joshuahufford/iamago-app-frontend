import { api } from '@/api/client';
import type {
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '@/api/types';

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login/', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>('/auth/register/', payload);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me/');
    return data;
  },

  async updateMe(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await api.patch<User>('/auth/me/', payload);
    return data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post('/auth/change-password/', payload);
  },
};
