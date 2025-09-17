export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  disabled: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  customClaims?: {
    admin?: boolean;
    premium?: boolean;
    role?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export interface AdminClaims {
  admin: boolean;
  role: 'admin' | 'user';
  permissions?: string[];
}
