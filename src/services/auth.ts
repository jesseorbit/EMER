import { api } from './api';
import type { User } from '../types';

export const authService = {
  async exchangeToken(
    authorizationCode: string,
    referrer: 'DEFAULT' | 'SANDBOX',
  ): Promise<User> {
    const result = await api.post<{ user: User; accessToken: string }>(
      '/auth/token',
      { authorizationCode, referrer },
    );
    api.setToken(result.accessToken);
    return result.user;
  },
};
