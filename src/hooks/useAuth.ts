import { useCallback, useState } from 'react';
import { appLogin } from '@apps-in-toss/framework';
import { useAppStore } from '../store';
import { authService } from '../services/auth';

export function useAuth() {
  const { user, setUser } = useAppStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = useCallback(async () => {
    setIsLoggingIn(true);
    try {
      const { authorizationCode, referrer } = await appLogin();
      const userData = await authService.exchangeToken(authorizationCode, referrer);
      setUser(userData);
      return userData;
    } finally {
      setIsLoggingIn(false);
    }
  }, [setUser]);

  return { user, login, isLoggingIn };
}
