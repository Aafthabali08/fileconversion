import { useAuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useAuthContext();

  const isAuthenticated = !!context.user;
  const userDisplayName = context.user?.displayName || context.user?.email || 'User';
  const userPhotoURL = context.user?.photoURL || null;

  return {
    ...context,
    isAuthenticated,
    userDisplayName,
    userPhotoURL
  };
}
