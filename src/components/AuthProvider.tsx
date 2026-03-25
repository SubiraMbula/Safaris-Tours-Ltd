import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { dbService } from '../services/db';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          // Fetch or create profile
          let userProfile = await dbService.getDocument<UserProfile>('users', firebaseUser.uid);
          
          const email = firebaseUser.email?.toLowerCase() || '';
          let assignedRole: UserProfile['role'] = 'sales';
          
          if (email === 'subbysav123@gmail.com') {
            assignedRole = 'admin';
          } else if (email === '2108335@students.kcau.ac.ke') {
            assignedRole = 'marketing_manager';
          } else if (email === 'savali.subira@gmail.com') {
            assignedRole = 'sales';
          }

          const specialEmails = ['subbysav123@gmail.com', '2108335@students.kcau.ac.ke', 'savali.subira@gmail.com'];

          if (!userProfile) {
            const newProfile: Omit<UserProfile, 'id'> = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              role: assignedRole,
              createdAt: new Date().toISOString()
            };
            await dbService.setDocument('users', firebaseUser.uid, newProfile);
            userProfile = { ...newProfile, id: firebaseUser.uid } as any;
          } else if (userProfile.role !== assignedRole && specialEmails.includes(email)) {
            // Force role update for demo purposes if email matches specific patterns
            await dbService.updateDocument('users', firebaseUser.uid, { role: assignedRole });
            userProfile.role = assignedRole;
          }
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (signingIn) return;
    
    setSigningIn(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      // Add custom parameters to force account selection if needed
      provider.setCustomParameters({ prompt: 'select_account' });
      
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('A sign-in request is already in progress. Please check your open windows.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in window was closed before completion. Please try again.');
      } else {
        setError(err.message || 'An unexpected error occurred during sign-in.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;
    await dbService.updateDocument('users', user.uid, updates);
    setProfile({ ...profile, ...updates });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout, updateProfile, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
