import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabaseClient';

export type Role = 'owner' | 'admin' | 'manager' | 'user';

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: Role;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mapUser = async (authUser: SupabaseUser): Promise<AppUser> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('role, full_name, avatar_url')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      console.warn('Error loading profile', error.message);
    }

    let role: Role = 'user';
    let name: string | undefined;
    let avatarUrl: string | undefined;

    if (data) {
      if (data.role && typeof data.role === 'string') {
        role = data.role as Role;
      }
      if (data.full_name && typeof data.full_name === 'string') {
        name = data.full_name;
      }
      if (data.avatar_url && typeof data.avatar_url === 'string') {
        avatarUrl = data.avatar_url;
      }
    }

    if (!name && authUser.user_metadata && typeof authUser.user_metadata.full_name === 'string') {
      name = authUser.user_metadata.full_name;
    }

    if (!avatarUrl && authUser.user_metadata && typeof authUser.user_metadata.avatar_url === 'string') {
      avatarUrl = authUser.user_metadata.avatar_url;
    }

    return {
      id: authUser.id,
      email: authUser.email ?? '',
      name,
      avatarUrl,
      role,
    };
  } catch (e) {
    console.warn('Unexpected error mapping user', e);
    return {
      id: authUser.id,
      email: authUser.email ?? '',
      name: undefined,
      avatarUrl: undefined,
      role: 'user',
    };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const run = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('Error getting session', sessionError.message);
          setLoading(false);
          return;
        }
        if (data.session && data.session.user) {
          const mapped = await mapUser(data.session.user);
          setUser(mapped);
        }
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session && session.user) {
            const mapped = await mapUser(session.user);
            setUser(mapped);
          } else {
            setUser(null);
          }
        });
        unsubscribe = () => subscription.unsubscribe();
        setLoading(false);
      } catch (e: any) {
        console.warn('Auth initialization failed', e);
        setError(e.message ?? 'Authentication is not configured');
        setLoading(false);
      }
    };

    run();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const supabase = getSupabaseClient();
      const origin = window.location.origin;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: origin,
        },
      });
      if (authError) {
        throw authError;
      }
    } catch (e: any) {
      setError(e.message ?? 'Unable to sign in with Google');
      throw e;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        throw authError;
      }
    } catch (e: any) {
      setError(e.message ?? 'Unable to sign in');
      throw e;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error: signupError } = await supabase.auth.signUp({ email, password });
      if (signupError) {
        throw signupError;
      }
    } catch (e: any) {
      setError(e.message ?? 'Unable to create account');
      throw e;
    }
  };

  const signOut = async () => {
    try {
      const supabase = getSupabaseClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      setUser(null);
    } catch (e: any) {
      setError(e.message ?? 'Unable to sign out');
      throw e;
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
