import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const handleError = (err: any) => {
    console.error("Auth Error:", err);
    let message = 'An error occurred during authentication.';
    if (err.code) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          message = 'Email is already in use.';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Invalid email or password.';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters.';
          break;
      }
    }
    setError(message);
    throw err;
  };

  const signInWithEmail = async (email: string, password: string) => {
    clearError();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      handleError(err);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    clearError();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      handleError(err);
    }
  };

  const signInWithGoogle = async () => {
    clearError();
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      handleError(err);
    }
  };

  const signOut = async () => {
    clearError();
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
