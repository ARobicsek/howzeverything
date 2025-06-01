// src/hooks/useAuth.tsx
import { useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { 
  supabase, 
  type DatabaseUser,
  signOut as supabaseSignOut 
} from '../supabaseClient'

interface AuthState {
  user: User | null
  profile: DatabaseUser | null
  session: Session | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, fullName?: string) => Promise<boolean>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<DatabaseUser>) => Promise<boolean>
  createProfile: (profileData: Partial<DatabaseUser>) => Promise<boolean>
  clearError: () => void
  refreshProfile: () => Promise<void>
}

export type UseAuthReturn = AuthState & AuthActions

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<DatabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // DEBUG: Log auth state changes
  console.log('🔐 useAuth State:', { 
    user: user?.email, 
    profile: profile?.full_name, 
    loading, 
    error,
    hasSession: !!session
  });

  // Initialize auth state and set up listener
  useEffect(() => {
    let mounted = true
    console.log('🔐 useAuth: Initializing auth...')

    const initializeAuth = async () => {
      try {
        console.log('🔐 useAuth: Getting initial session...')
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('🔐 Session error:', sessionError)
          setError(sessionError.message)
          if (mounted) setLoading(false)
          return
        }

        console.log('🔐 useAuth: Initial session:', initialSession?.user?.email || 'No user')

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          
          // If we have a user, get their profile
          if (initialSession?.user) {
            console.log('🔐 useAuth: Loading user profile for:', initialSession.user.email)
            try {
              await loadUserProfile(initialSession.user.id)
            } catch (profileError) {
              console.error('🔐 Initial auth: Profile loading failed:', profileError)
            }
          }
          
          console.log('🔐 useAuth: Initial auth setup complete, setting loading to false')
          setLoading(false)
        }
      } catch (err) {
        console.error('🔐 Auth initialization error:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize authentication')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email)
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setError(null)
          
          if (session?.user) {
            console.log('🔐 Auth change: Loading profile for:', session.user.email)
            try {
              await loadUserProfile(session.user.id)
            } catch (profileError) {
              console.error('🔐 Auth change: Profile loading failed:', profileError)
            }
          } else {
            console.log('🔐 Auth change: No user, clearing profile')
            setProfile(null)
          }
          
          console.log('🔐 Auth change: Setting loading to false (always)')
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('🔐 useAuth: Cleaning up auth listener')
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    console.log('🔐 loadUserProfile: Starting for userId:', userId)
    
    // TEMPORARY: Skip profile loading to bypass RLS issues
    console.log('🔐 loadUserProfile: SKIPPING profile loading (RLS issue)')
    setProfile(null)
    console.log('🔐 loadUserProfile: Function complete (skipped)')
    return
  }

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 signIn: Starting for:', email)
      setLoading(true)
      setError(null)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (signInError) {
        console.log('🔐 signIn: Error:', signInError.message)
        setError(signInError.message)
        return false
      }

      if (data.user) {
        console.log('🔐 signIn: Successful for:', data.user.email)
        return true
      }

      return false
    } catch (err) {
      console.error('🔐 signIn: Exception:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign in')
      return false
    } finally {
      console.log('🔐 signIn: Setting loading to false')
      setLoading(false)
    }
  }, [])

  // Sign up with email, password, and optional full name
  const signUp = useCallback(async (email: string, password: string, fullName?: string): Promise<boolean> => {
    try {
      console.log('🔐 signUp: Starting for:', email)
      setLoading(true)
      setError(null)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName || ''
          }
        }
      })

      if (signUpError) {
        console.log('🔐 signUp: Error:', signUpError.message)
        setError(signUpError.message)
        return false
      }

      if (data.user) {
        console.log('🔐 signUp: Successful for:', data.user.email)
        
        // Create user profile if the user was created (not just email confirmation pending)
        if (!data.user.email_confirmed_at) {
          setError('Please check your email and click the confirmation link to complete registration.')
        }
        
        return true
      }

      return false
    } catch (err) {
      console.error('🔐 signUp: Exception:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign up')
      return false
    } finally {
      console.log('🔐 signUp: Setting loading to false')
      setLoading(false)
    }
  }, [])

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      console.log('🔐 signOut: Starting')
      setError(null)
      await supabaseSignOut()
      console.log('🔐 signOut: Successful')
    } catch (err) {
      console.error('🔐 signOut: Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign out')
      throw err
    }
  }, [])

  // Create user profile (called after successful sign up)
  const createProfile = useCallback(async (profileData: Partial<DatabaseUser>): Promise<boolean> => {
    try {
      console.log('🔐 createProfile: Starting for:', user?.email)
      if (!user) {
        setError('No authenticated user found')
        return false
      }

      setError(null)
      
      const { data, error: createError } = await supabase
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
        .single()

      if (createError) {
        console.log('🔐 createProfile: Error:', createError.message)
        setError(`Failed to create profile: ${createError.message}`)
        return false
      }

      setProfile(data)
      console.log('🔐 createProfile: Successful for:', data.full_name)
      return true
    } catch (err) {
      console.error('🔐 createProfile: Exception:', err)
      setError(err instanceof Error ? err.message : 'Failed to create profile')
      return false
    }
  }, [user])

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<DatabaseUser>): Promise<boolean> => {
    try {
      console.log('🔐 updateProfile: Starting for:', user?.email)
      if (!user || !profile) {
        setError('No authenticated user or profile found')
        return false
      }

      setError(null)

      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        console.log('🔐 updateProfile: Error:', updateError.message)
        setError(`Failed to update profile: ${updateError.message}`)
        return false
      }

      setProfile(data)
      console.log('🔐 updateProfile: Successful')
      return true
    } catch (err) {
      console.error('🔐 updateProfile: Exception:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return false
    }
  }, [user, profile])

  // Refresh profile from database
  const refreshProfile = useCallback(async (): Promise<void> => {
    console.log('🔐 refreshProfile: Starting for:', user?.email)
    if (user) {
      await loadUserProfile(user.id)
    }
  }, [user])

  // Clear error state
  const clearError = useCallback(() => {
    console.log('🔐 clearError: Clearing error')
    setError(null)
  }, [])

  return {
    // State
    user,
    profile,
    session,
    loading,
    error,
    
    // Actions
    signIn,
    signUp,
    signOut,
    updateProfile,
    createProfile,
    clearError,
    refreshProfile
  }
}