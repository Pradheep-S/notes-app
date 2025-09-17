import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, AuthContextType } from '../types/auth';

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
          
          // Get additional user data from Firestore if needed
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};

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

          // TEMPORARILY DISABLED: Admin check for initial setup
          // TODO: Re-enable this after setting up the first admin user
          /*
          if (!idTokenResult.claims.admin) {
            setError('Access denied. Admin privileges required.');
            await firebaseSignOut(auth);
            setUser(null);
          } else {
          */
            setUser(user);
            setError(null);
          /*
          }
          */
          
          // Show admin status
          if (idTokenResult.claims.admin) {
            console.log('✅ User has admin privileges');
          } else {
            console.log('⚠️ User does NOT have admin privileges yet');
            console.log('User UID:', firebaseUser.uid);
            console.log('User Email:', firebaseUser.email);
            console.log('Please set custom claims in Firebase Console:');
            console.log('{"admin": true, "role": "admin"}');
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
