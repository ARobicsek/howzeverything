// src/contexts/AuthContext.tsx
import type { PostgrestSingleResponse, Session, User } from '@supabase/supabase-js';
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import {
    supabase,
    signOut as supabaseSignOut,
    type DatabaseUser
} from '../supabaseClient';
interface AuthState {
  user: User | null;
  profile: DatabaseUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}
interface AuthActions {
  signIn: (email: string, password:string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<DatabaseUser>) => Promise<boolean>;
  createProfile: (profileData: Partial<DatabaseUser>) => Promise<boolean>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}
export type UseAuthReturn = AuthState & AuthActions;
const AuthContext = createContext<UseAuthReturn | null>(null);
function useAuthLogic(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DatabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<string | null>(null);
  const profileLoadedRef = useRef<string | null>(null);
  const loadUserProfile = useCallback(async (userId: string): Promise<boolean> => {
    if (loadingRef.current === userId) {
      console.log('🔐 AuthContext: loadUserProfile: Already loading for this user');
      return false;
    }
    if (profileLoadedRef.current === userId && profile) {
      console.log('🔐 AuthContext: loadUserProfile: Profile already loaded for this user');
      return true;
    }
    loadingRef.current = userId;
    console.log('🔐 AuthContext: loadUserProfile: Starting for userId:', userId);
    try {
      console.log('🔐 AuthContext: loadUserProfile: Creating query...');
      const result: PostgrestSingleResponse<DatabaseUser> = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      console.log('🔐 AuthContext: loadUserProfile: Query completed', {
        hasData: !!result.data,
        errorCode: result.error?.code
      });
      if (result.error) {
        if (result.error.code === 'PGRST116' || result.error.code === '406') {
          console.log('🔐 AuthContext: loadUserProfile: No profile exists yet for user or 406 error');
          setProfile(null);
          profileLoadedRef.current = null;
          return false;
        }
        if (result.error.code !== '406') {
          console.error('🔐 AuthContext: loadUserProfile: Error loading profile:', result.error);
        }
        setProfile(null);
        profileLoadedRef.current = null;
        return false;
      }
      if (result.data) {
        console.log('🔐 AuthContext: loadUserProfile: Profile loaded successfully');
        setProfile(result.data);
        profileLoadedRef.current = userId;
        return true;
      }
      console.log('🔐 AuthContext: loadUserProfile: No profile data returned');
      setProfile(null);
      profileLoadedRef.current = null;
      return false;
    } catch (err: any) {
      console.error('🔐 AuthContext: loadUserProfile: Exception caught:', err);
      setProfile(null);
      profileLoadedRef.current = null;
      return false;
    } finally {
      loadingRef.current = null;
    }
  }, []); // <-- THE FIX: Removed `profile` from the dependency array
  useEffect(() => {
    let isMounted = true;
    // setLoading(true) is the default state, so no need to set it again.
    // We will now only set it to false after the initial session is handled.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      console.log('[AUTH] Session state change:', {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
        tokenExpiresIn: session?.expires_at ? `${Math.round((new Date(session.expires_at * 1000).getTime() - Date.now()) / 1000)}s` : 'N/A',
        timestamp: new Date().toISOString()
      });
      console.log('🔐 Auth event:', _event);
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        setError(null);
        if ((_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || _event === 'INITIAL_SESSION') &&
            profileLoadedRef.current !== session.user.id) {
          loadUserProfile(session.user.id).catch(err => {
            console.error('🔐 Profile load error on auth change:', err);
          });
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        profileLoadedRef.current = null;
      }
      // **THE FIX**: Only set loading to false after the initial session has been retrieved.
      // This ensures the app shows a loading screen until we know for sure if a user is logged in.
      if (_event === 'INITIAL_SESSION') {
        if (isMounted) {
          console.log('🔐 AuthContext: Initial session processed. Auth is ready.');
          setLoading(false);
        }
      }
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);
  // --- THE FIX: Add a listener to proactively refresh the session on window focus ---
  useEffect(() => {
    const handleFocus = async () => {
        console.log('🔐 [Auth] Window focused, proactively checking session...');
        console.time('proactive-focus-refresh');
        const { error } = await supabase.auth.getSession();
        console.timeEnd('proactive-focus-refresh');
        if (error) {
            console.error('🔐 [Auth] Error on focus-triggered session refresh:', error.message);
        } else {
            console.log('🔐 [Auth] Session checked on focus.');
        }
    };
    window.addEventListener('focus', handleFocus);
    return () => {
        window.removeEventListener('focus', handleFocus);
    };
  }, []);
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return false;
      }
      setLoading(false);
      return !!data.user;
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setLoading(false);
      return false;
    }
  }, []);
  const signUp = useCallback(async (email: string, password: string, fullName?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName || ''
          }
        }
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return false;
      }
      if (data.user && !data.user.email_confirmed_at) {
        setError('Please check your email and click the confirmation link to complete registration.');
      }
      setLoading(false);
      return !!data.user;
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      setLoading(false);
      return false;
    }
  }, []);
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await supabaseSignOut();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      throw err;
    }
  }, []);
  const createProfile = useCallback(async (profileData: Partial<DatabaseUser>): Promise<boolean> => {
    try {
      if (!user) {
        setError('No authenticated user found');
        return false;
      }
      setError(null);
      if (profileLoadedRef.current === user.id && profile) {
        console.log('🔐 AuthContext: createProfile: Profile already exists in memory');
        return true;
      }
      const profileExists = await loadUserProfile(user.id);
      if (profileExists) {
        console.log('🔐 AuthContext: createProfile: Profile already exists in database');
        return true;
      }
      console.log('🔐 AuthContext: createProfile: Creating new profile...');
      const { data, error: createError }: PostgrestSingleResponse<DatabaseUser> = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: profileData.full_name || user.user_metadata?.full_name || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          avatar_url: profileData.avatar_url || '',
          is_admin: false
        })
        .select()
        .single();
      if (createError) {
        if (createError.code === '23505' || createError.code === '406') {
          console.log('🔐 AuthContext: createProfile: Profile already exists (conflict) - reloading');
          await loadUserProfile(user.id);
          return true;
        }
        console.error('🔐 AuthContext: createProfile: Error:', createError);
        setError(`Failed to create profile: ${createError.message}`);
        return false;
      }
      console.log('🔐 AuthContext: createProfile: Profile created successfully');
      setProfile(data);
      profileLoadedRef.current = user.id;
      return true;
    } catch (err: any) {
      console.error('🔐 AuthContext: createProfile: Exception:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      return false;
    }
  }, [user, loadUserProfile, profile]);
  const updateProfile = useCallback(async (updates: Partial<DatabaseUser>): Promise<boolean> => {
    try {
      if (!user || !profile) {
        setError('No authenticated user or profile found');
        return false;
      }
      setError(null);
      const { data, error: updateError }: PostgrestSingleResponse<DatabaseUser> = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
      if (updateError) {
        setError(`Failed to update profile: ${updateError.message}`);
        return false;
      }
      setProfile(data);
      return true;
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  }, [user, profile]);
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (user) {
      profileLoadedRef.current = null;
      await loadUserProfile(user.id);
    }
  }, [user, loadUserProfile]);
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  return {
    user,
    profile,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    createProfile,
    clearError,
    refreshProfile
  };
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthLogic();
  useEffect(() => {
    console.log('🔐 AuthContext: Provider initialized');
    return () => console.log('🔐 AuthContext: Provider cleanup');
  }, []);
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}
export { AuthContext };
