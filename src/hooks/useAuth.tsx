// src/hooks/useAuth.tsx  
import type { PostgrestSingleResponse, Session, User } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  supabase,
  signOut as supabaseSignOut,
  type DatabaseUser
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
  const loadingRef = useRef<string | null>(null)
  // @ts-ignore - Used via .current access
  const initializingRef = useRef(false)
  // @ts-ignore - Used via .current access  
  const profileLoadedRef = useRef<string | null>(null)

  // Load user profile from database with better race condition protection
  const loadUserProfile = useCallback(async (userId: string): Promise<boolean> => {  
    // Prevent duplicate loading  
    if (loadingRef.current === userId) {  
      console.log('🔐 loadUserProfile: Already loading for this user')  
      return false  
    }
    
    // Check if we already loaded this user's profile
    if (profileLoadedRef.current === userId && profile) {
      console.log('🔐 loadUserProfile: Profile already loaded for this user')
      return true
    }
     
    loadingRef.current = userId  
    console.log('🔐 loadUserProfile: Starting for userId:', userId)  
     
    try {  
      console.log('🔐 loadUserProfile: Creating query...')  
       
      // Direct query without timeout wrapper
      const result: PostgrestSingleResponse<DatabaseUser> = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
       
      console.log('🔐 loadUserProfile: Query completed', {  
        hasData: !!result.data,  
        errorCode: result.error?.code  
      })  
       
      if (result.error) {  
        if (result.error.code === 'PGRST116' || result.error.code === '406') {  
          console.log('🔐 loadUserProfile: No profile exists yet for user or 406 error')  
          setProfile(null)
          profileLoadedRef.current = null
          return false  
        }  
         
        if (result.error.code !== '406') {  
          console.error('🔐 loadUserProfile: Error loading profile:', result.error)  
        }  
        setProfile(null)
        profileLoadedRef.current = null
        return false  
      }  
       
      if (result.data) {  
        console.log('🔐 loadUserProfile: Profile loaded successfully')  
        setProfile(result.data)
        profileLoadedRef.current = userId
        return true  
      }  
       
      console.log('🔐 loadUserProfile: No profile data returned')  
      setProfile(null)
      profileLoadedRef.current = null
      return false  
    } catch (err: any) {  
      console.error('🔐 loadUserProfile: Exception caught:', err)  
      setProfile(null)
      profileLoadedRef.current = null
      return false  
    } finally {  
      loadingRef.current = null  
    }  
  }, [profile])

  // Initialize auth with better race condition protection
  useEffect(() => {  
    let isMounted = true  
     
    console.log('🔐 useAuth: Initializing...')

    const initializeAuth = async () => {  
      // Less aggressive check - only skip if actively initializing
      if (initializingRef.current) {
        console.log('🔐 useAuth: Already initializing, waiting...')
        return
      }
      
      initializingRef.current = true
      
      try {  
        console.log('🔐 useAuth: Getting session...')  
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()  
         
        if (!isMounted) return  
         
        if (sessionError) {  
          console.error('🔐 Initial session error:', sessionError)  
          setError(sessionError.message)  
          setLoading(false)  
          return  
        }

        console.log('🔐 Initial session:', session?.user?.email || 'No user')  
         
        if (session?.user) {  
          setSession(session)  
          setUser(session.user)  
           
          // Only load profile if we haven't already loaded it for this user
          if (profileLoadedRef.current !== session.user.id) {
            console.log('🔐 useAuth: Loading profile in background...')  
            loadUserProfile(session.user.id).then(success => {  
              console.log('🔐 useAuth: Profile load completed:', success)  
            }).catch(err => {  
              console.error('🔐 useAuth: Profile load error (non-blocking):', err)  
            })
          }
        }  
         
        if (isMounted) {  
          console.log('🔐 useAuth: Setting loading to false')  
          setLoading(false)  
        }  
      } catch (err: any) {  
        console.error('🔐 useAuth: Initialize error:', err)  
        if (isMounted) {  
          setError(err instanceof Error ? err.message : 'Failed to initialize auth')  
          setLoading(false)  
        }  
      } finally {
        initializingRef.current = false
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {  
      if (!isMounted) return  
       
      console.log('🔐 Auth event:', _event)  
       
      if (session?.user) {  
        setSession(session)  
        setUser(session.user)  
        setError(null)  
         
        // Only load profile on specific events and if not already loaded
        if ((_event === 'SIGNED_IN' || _event === 'USER_UPDATED') && 
            profileLoadedRef.current !== session.user.id) {  
          setTimeout(() => {  
            if (isMounted) {  
              loadUserProfile(session.user.id).catch(err => {  
                console.error('🔐 Profile load error on auth change:', err)  
              })  
            }  
          }, 500)  
        }  
      } else {  
        setSession(null)  
        setUser(null)  
        setProfile(null)
        profileLoadedRef.current = null
      }  
    })

    return () => {  
      isMounted = false  
      subscription.unsubscribe()  
    }  
  }, [loadUserProfile])

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

      setLoading(false)  
      return !!data.user  
    } catch (err: any) {  
      setError(err instanceof Error ? err.message : 'Failed to sign in')  
      setLoading(false)  
      return false  
    }  
  }, [])

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

      setLoading(false)  
      return !!data.user  
    } catch (err: any)      {  
      setError(err instanceof Error ? err.message : 'Failed to sign up')  
      setLoading(false)  
      return false  
    }  
  }, [])

  const signOut = useCallback(async (): Promise<void> => {  
    try {  
      setError(null)  
      await supabaseSignOut()  
    } catch (err: any) {  
      setError(err instanceof Error ? err.message : 'Failed to sign out')  
      throw err  
    }  
  }, [])

  const createProfile = useCallback(async (profileData: Partial<DatabaseUser>): Promise<boolean> => {  
    try {  
      if (!user) {  
        setError('No authenticated user found')  
        return false  
      }

      setError(null)  
       
      // Check if profile already exists (including in-memory check)
      if (profileLoadedRef.current === user.id && profile) {
        console.log('🔐 createProfile: Profile already exists in memory')
        return true
      }
      
      const profileExists = await loadUserProfile(user.id)  
      if (profileExists) {  
        console.log('🔐 createProfile: Profile already exists in database')  
        return true  
      }  
       
      console.log('🔐 createProfile: Creating new profile...')  
       
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
        .single()

      if (createError) {  
        if (createError.code === '23505' || createError.code === '406') {  
          console.log('🔐 createProfile: Profile already exists (conflict) - reloading')  
          await loadUserProfile(user.id)  
          return true  
        }  
         
        console.error('🔐 createProfile: Error:', createError)  
        setError(`Failed to create profile: ${createError.message}`)  
        return false  
      }

      console.log('🔐 createProfile: Profile created successfully')  
      setProfile(data)
      profileLoadedRef.current = user.id
      return true  
    } catch (err: any) {  
      console.error('🔐 createProfile: Exception:', err)  
      setError(err instanceof Error ? err.message : 'Failed to create profile')  
      return false  
    }  
  }, [user, loadUserProfile, profile])

  const updateProfile = useCallback(async (updates: Partial<DatabaseUser>): Promise<boolean> => {  
    try {  
      if (!user || !profile) {  
        setError('No authenticated user or profile found')  
        return false  
      }

      setError(null)

      const { data, error: updateError }: PostgrestSingleResponse<DatabaseUser> = await supabase  
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
    } catch (err: any) {  
      setError(err instanceof Error ? err.message : 'Failed to update profile')  
      return false  
    }  
  }, [user, profile])

  const refreshProfile = useCallback(async (): Promise<void> => {  
    if (user) {
      // Clear the loaded flag to force a fresh load
      profileLoadedRef.current = null
      await loadUserProfile(user.id)  
    }
  }, [user, loadUserProfile])

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