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

  // Load user profile from database
  const loadUserProfile = useCallback(async (userId: string) => {
    console.log('🔐 loadUserProfile: Starting for userId:', userId)
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('🔐 loadUserProfile: No profile exists yet for user')
          setProfile(null)
          return false // Profile doesn't exist
        }
        
        console.error('🔐 loadUserProfile: Error loading profile:', profileError)
        throw profileError
      }
      
      if (profileData) {
        console.log('🔐 loadUserProfile: Profile loaded successfully')
        setProfile(profileData)
        return true // Profile exists
      }
    } catch (err) {
      console.error('🔐 loadUserProfile: Exception:', err)
      setProfile(null)
    }
    
    return false
  }, [])

  // Initialize auth
  useEffect(() => {
    let isMounted = true
    
    console.log('🔐 useAuth: Initializing...')

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return
      
      if (error) {
        console.error('🔐 Initial session error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      console.log('🔐 Initial session:', session?.user?.email || 'No user')
      
      if (session?.user) {
        setSession(session)
        setUser(session.user)
        // Load profile
        loadUserProfile(session.user.id).finally(() => {
          if (isMounted) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      
      console.log('🔐 Auth event:', _event)
      
      if (session?.user) {
        setSession(session)
        setUser(session.user)
        setError(null)
        
        // Only load profile on significant events
        if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
          loadUserProfile(session.user.id)
        }
      } else {
        setSession(null)
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, []) // Empty deps, run once

  // Sign in
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return false
      }

      // Auth state change will handle the rest
      return !!data.user
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
      setLoading(false)
      return false
    }
  }, [])

  // Sign up
  const signUp = useCallback(async (email: string, password: string, fullName?: string): Promise<boolean> => {
    try {
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
        setError(signUpError.message)
        setLoading(false)
        return false
      }

      if (data.user && !data.user.email_confirmed_at) {
        setError('Please check your email and click the confirmation link to complete registration.')
      }

      return !!data.user
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
      setLoading(false)
      return false
    }
  }, [])

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      await supabaseSignOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out')
      throw err
    }
  }, [])

  // Create profile
  const createProfile = useCallback(async (profileData: Partial<DatabaseUser>): Promise<boolean> => {
    try {
      if (!user) {
        setError('No authenticated user found')
        return false
      }

      setError(null)
      
      // First check if profile already exists
      const profileExists = await loadUserProfile(user.id)
      if (profileExists) {
        console.log('🔐 createProfile: Profile already exists')
        return true
      }
      
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
        if (createError.code === '23505') {
          // Duplicate key - profile already exists
          await loadUserProfile(user.id)
          return true
        }
        
        setError(`Failed to create profile: ${createError.message}`)
        return false
      }

      setProfile(data)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
      return false
    }
  }, [user, loadUserProfile])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<DatabaseUser>): Promise<boolean> => {
    try {
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
        setError(`Failed to update profile: ${updateError.message}`)
        return false
      }

      setProfile(data)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return false
    }
  }, [user, profile])

  // Refresh profile
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }, [user, loadUserProfile])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

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
  }
}