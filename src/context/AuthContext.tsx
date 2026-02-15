import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

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
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mapUser = async (authUser: SupabaseUser): Promise<AppUser> => {
  try {
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

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('Error getting session', error.message);
        setLoading(false);
        return;
      }
      if (data.session && data.session.user) {
        const mapped = await mapUser(data.session.user);
        setUser(mapped);
      }
      setLoading(false);
    };

    init();

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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: origin,
      },
    });
    if (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    loading,
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

