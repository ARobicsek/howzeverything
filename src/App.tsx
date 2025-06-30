// src/App.tsx - Production Version (Debug removed) - MODIFIED for restaurant sharing support
import React, { useEffect, useState } from 'react'
import { COLORS, FONTS } from './constants'
import { useAuth } from './hooks/useAuth'
import { useRestaurants } from './hooks/useRestaurants'


// Screens      
import AdminScreen from './AdminScreen'
import LoadingScreen from './components/LoadingScreen'
import HomeScreen from './HomeScreen'
import MenuScreen from './MenuScreen'
import ProfileScreen from './ProfileScreen'
import RatingsScreen from './RatingsScreen'
import RestaurantScreen from './RestaurantScreen'


// User components      
import LoginForm from './components/user/LoginForm'
import UserForm from './components/user/UserForm'


// Import types from BottomNavigation      
import type { AppScreenType, NavigableScreenType } from './components/navigation/BottomNavigation'


// ADDED: Import sharing utilities
import { clearSharedUrlParams, handleSharedContent, parseSharedUrl, SharedContent } from './utils/urlShareHandler'


// Create our own screen type that includes menu and admin      
type AppScreen = NavigableScreenType | 'menu' | 'admin'


interface MenuScreenState {      
  restaurantId: string      
  restaurantName: string      
}


const App: React.FC = () => {      
  const { user, profile, loading: authLoading, createProfile } = useAuth()      
  const { addToFavorites } = useRestaurants({ criterion: 'name', direction: 'asc' })
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home')      
  const [menuScreenState, setMenuScreenState] = useState<MenuScreenState | null>(null)      
  const [showLogin, setShowLogin] = useState(false)      
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  
  // State for handling shared content across login
  const [sharedContentToProcess, setSharedContentToProcess] = useState<SharedContent | null>(null);
  const [hasProcessedSharedContent, setHasProcessedSharedContent] = useState(false)


  // Check if user is admin
  const isAdmin = user?.email && ['admin@howzeverything.com', 'ari.robicsek@gmail.com'].includes(user.email)

  // Step 1: Capture shared content on initial app load, BEFORE any redirects.
  useEffect(() => {
    const capturedContent = parseSharedUrl();
    if (capturedContent) {
      console.log('Step 1: Captured shared content on app load:', capturedContent);
      setSharedContentToProcess(capturedContent);
    }
  }, []); // Empty dependency array ensures this runs only once.

  const navigateToMenu = (restaurantId: string) => {
    setMenuScreenState({ restaurantId, restaurantName: '' })
    setCurrentScreen('menu')
  }


  const navigateBackFromMenu = () => {      
    setMenuScreenState(null)      
    setCurrentScreen('restaurants')      
  }


  const handleNavigateToScreen = (screen: NavigableScreenType) => {      
    setCurrentScreen(screen)      
    if (screen !== 'restaurants') {      
      setMenuScreenState(null)      
    }      
  }


  const getCurrentAppScreen = (): AppScreenType => {      
    if (currentScreen === 'menu' || currentScreen === 'admin') {      
      return 'restaurants'      
    }      
    return currentScreen as AppScreenType      
  }

  // Step 3: Handle successful login. Just close the form, don't navigate.
  // The useEffect hooks will handle navigation based on app state.
  const handleLoginSuccess = () => {      
    setShowLogin(false);
  }

  // Step 2: Process shared content AFTER user is available.
  useEffect(() => {
    const processSharedContent = async () => {
      if (!user || !sharedContentToProcess || hasProcessedSharedContent) return
     
      console.log('Step 2: User is logged in, processing captured content:', sharedContentToProcess);
      
      // Mark as processing immediately to prevent re-runs for this session
      setHasProcessedSharedContent(true);

      const success = await handleSharedContent(
        sharedContentToProcess,
        addToFavorites,
        (restaurantId: string) => {
          setMenuScreenState({ restaurantId, restaurantName: '' });
          setCurrentScreen('menu');
        },
        (screen: string) => setCurrentScreen(screen as AppScreen)
      )
       
      if (success) {
        // Clear the URL parameters only after successful processing
        clearSharedUrlParams();
      }
    }

    processSharedContent()
  }, [user, sharedContentToProcess, hasProcessedSharedContent, addToFavorites]);


  // Reset shared content processing state when user logs out
  useEffect(() => {
    if (!user) {
      setHasProcessedSharedContent(false);
      setSharedContentToProcess(null);
    }
  }, [user]);


  // Create profile if needed - but only once per user and avoid race conditions      
  useEffect(() => {      
    if (!user || profile !== null || authLoading) {      
      return      
    }
    let isMounted = true      
    const timeoutId = setTimeout(async () => {      
      if (!isMounted || !user || profile !== null) { return }
      console.log('🚀 Creating initial profile for user:', user.email)      
      try {      
        const success = await createProfile({      
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',      
          bio: '',      
          location: '',      
          avatar_url: user.user_metadata?.avatar_url || ''      
        })      
        if (!success) { console.error('Failed to create initial profile') }      
      } catch (err) { console.error('Error creating initial profile:', err) }      
    }, 1000)
    return () => { isMounted = false; clearTimeout(timeoutId) }      
  }, [user?.id, profile, authLoading, createProfile]);


  // Step 4: Navigate to home ONLY if not processing a share link.
  useEffect(() => {      
    if (user && !authLoading) {      
      // If there's content to process, the share handler is in control of navigation. Do nothing.
      if (sharedContentToProcess && !hasProcessedSharedContent) {
        console.log('Step 4: Share content pending, suppressing navigation to home.');
        return;
      }
      // Otherwise, if we were on the login screen, navigate to home.
      if (showLogin) {      
        setCurrentScreen('home');
      }      
    }      
  }, [user, authLoading, sharedContentToProcess, hasProcessedSharedContent, showLogin]);


  // Show loading screen while auth is initializing      
  if (authLoading) {      
    return <LoadingScreen />      
  }


  // Show login screen if no user      
  if (!user) {      
    return (      
      <div style={{      
        minHeight: '100vh',      
        backgroundColor: COLORS.background,      
        position: 'relative'      
      }}>      
        <div style={{      
          display: 'flex',      
          flexDirection: 'column',      
          alignItems: 'center',      
          justifyContent: 'center',      
          padding: '20px',      
          minHeight: '100vh'      
        }}>      
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>      
            <img src="/logo.png" alt="Logo" style={{ maxWidth: '200px', height: 'auto', margin: '0 auto' }} />      
          </div>      
          <div style={{      
            backgroundColor: 'white',      
            borderRadius: '12px',      
            padding: '32px',      
            maxWidth: '400px',      
            width: '100%',      
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',      
            textAlign: 'center',      
            marginBottom: '24px'      
          }}>      
            <h2 style={{ ...FONTS.elegant, fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 24px 0' }}>      
              Sign in and start dishing      
            </h2>      
            <button      
              onClick={() => setShowLogin(true)}      
              style={{ ...FONTS.elegant, width: '100%', height: '50px', backgroundColor: COLORS.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', WebkitAppearance: 'none', WebkitTapHighlightColor: 'transparent' }}      
            >      
              Get Started      
            </button>      
          </div>      
          {showLogin && (      
            <LoginForm      
              onSuccess={handleLoginSuccess}      
              onCancel={() => setShowLogin(false)}      
            />      
          )}      
        </div>      
      </div>      
    )      
  }


  const renderCurrentScreen = () => {      
    switch (currentScreen) {      
      case 'home': return <HomeScreen onNavigateToScreen={handleNavigateToScreen} currentAppScreen={getCurrentAppScreen()} />
      case 'restaurants': return <RestaurantScreen onNavigateToScreen={handleNavigateToScreen} onNavigateToMenu={navigateToMenu} currentAppScreen={getCurrentAppScreen()} />
      case 'menu':      
        if (!menuScreenState) { setCurrentScreen('restaurants'); return null }      
        return <MenuScreen restaurantId={menuScreenState.restaurantId} onNavigateBack={navigateBackFromMenu} onNavigateToScreen={handleNavigateToScreen} currentAppScreen={getCurrentAppScreen()} />
      case 'ratings': return <RatingsScreen onNavigateToScreen={handleNavigateToScreen} currentAppScreen={getCurrentAppScreen()} />
      case 'profile': return <ProfileScreen onNavigateToScreen={handleNavigateToScreen} currentAppScreen={getCurrentAppScreen()} />
      case 'admin': return <AdminScreen user={user} />      
      default: return <HomeScreen onNavigateToScreen={handleNavigateToScreen} currentAppScreen={getCurrentAppScreen()} />
    }      
  }


  return (      
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, position: 'relative' }}>      
      {renderCurrentScreen()}
      {isAdmin && currentScreen !== 'admin' && (
        <button onClick={() => setCurrentScreen('admin')} style={{ position: 'fixed', top: '20px', right: '20px', padding: '10px 20px', backgroundColor: COLORS.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', zIndex: 1000 }}>
          Admin Panel
        </button>
      )}
      {currentScreen === 'admin' && (
        <button onClick={() => setCurrentScreen('home')} style={{ position: 'fixed', top: '20px', left: '20px', padding: '10px 20px', backgroundColor: COLORS.background, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', zIndex: 1000 }}>
          ← Back to App
        </button>
      )}
      {showProfileEdit && user && (      
        <UserForm onSuccess={() => setShowProfileEdit(false)} onCancel={() => setShowProfileEdit(false)} />      
      )}      
    </div>      
  )      
}


export default App