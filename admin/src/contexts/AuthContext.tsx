import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, AuthContextType } from '../types/auth';
import { withRetry } from '../utils/network';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.customClaims?.admin === true;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get the user's ID token to access custom claims
          const idTokenResult = await firebaseUser.getIdTokenResult();
          
          // Try to get additional user data from Firestore with retry logic
          let userData: any = {};
          try {
            userData = await withRetry(async () => {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              return userDoc.exists() ? userDoc.data() : {};
            });
          } catch (firestoreError) {
            console.warn('Firestore access failed after retries, continuing without user data:', firestoreError);
            // Continue without Firestore data
          }

          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || userData.displayName,
            photoURL: firebaseUser.photoURL || userData.photoURL,
            emailVerified: firebaseUser.emailVerified,
            disabled: false,
            metadata: {
              creationTime: firebaseUser.metadata.creationTime,
              lastSignInTime: firebaseUser.metadata.lastSignInTime,
            },
            customClaims: {
              admin: idTokenResult.claims.admin as boolean,
              premium: idTokenResult.claims.premium as boolean,
              role: idTokenResult.claims.role as string,
            },
          };

          // Check if user has admin privileges
          if (!idTokenResult.claims.admin) {
            setError('Access denied. Admin privileges required.');
            await firebaseSignOut(auth);
            setUser(null);
          } else {
            setUser(user);
            setError(null);
            console.log('✅ User has admin privileges');
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication error occurred');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAdmin,
    signIn,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
