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
import { clearSharedUrlParams, handleSharedContent, parseSharedUrl } from './utils/urlShareHandler'

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
  const [hasProcessedSharedContent, setHasProcessedSharedContent] = useState(false)

  // Check if user is admin
  const isAdmin = user?.email && ['admin@howzeverything.com', 'ari.robicsek@gmail.com'].includes(user.email)

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

  const handleLoginSuccess = () => {      
    setShowLogin(false)      
    // The useEffect hooks below will now handle navigation correctly.
  }

  // This effect handles the logic FOR a shared link.
  useEffect(() => {
    const processSharedContent = async () => {
      // It must have a user and not have been processed yet.
      if (!user || hasProcessedSharedContent) return
      
      const sharedContent = parseSharedUrl()
      if (sharedContent) {
        console.log('Processing shared content for logged-in user:', sharedContent)
        
        const success = await handleSharedContent(
          sharedContent,
          addToFavorites,
          (restaurantId: string) => {
            setMenuScreenState({ restaurantId, restaurantName: '' })
            setCurrentScreen('menu')
          },
          (screen: string) => setCurrentScreen(screen as AppScreen)
        )
        
        if (success) {
          clearSharedUrlParams()
          setHasProcessedSharedContent(true)
        }
      }
    }

    processSharedContent()
  }, [user, addToFavorites, hasProcessedSharedContent])

  // This effect handles navigation to home AFTER login, but ONLY if there's no share link.
  useEffect(() => {      
    if (user && !authLoading) {      
      const sharedContent = parseSharedUrl();
      
      // If a share link exists, do nothing and let the other effect handle it.
      if (sharedContent) {
        return;
      }
      
      // If NO share link, then proceed with normal navigation to home.
      if (currentScreen === 'profile' || showLogin) {      
        setCurrentScreen('home')      
      }      
    }      
  }, [user, authLoading, currentScreen, showLogin]);

  // Reset shared content processing state when user logs out
  useEffect(() => {
    if (!user) {
      setHasProcessedSharedContent(false)
    }
  }, [user])

  // Create profile if needed
  useEffect(() => {      
    if (!user || profile !== null || authLoading) { return }
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

  if (authLoading) {      
    return <LoadingScreen />      
  }

  if (!user) {      
    return (      
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, position: 'relative' }}>      
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', minHeight: '100vh' }}>      
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>      
            <img src="/logo.png" alt="Logo" style={{ maxWidth: '200px', height: 'auto', margin: '0 auto' }} />      
          </div>      
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center', marginBottom: '24px' }}>      
            <h2 style={{ ...FONTS.elegant, fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 24px 0' }}>      
              Sign in and start dishing      
            </h2>      
            <button onClick={() => setShowLogin(true)} style={{ ...FONTS.elegant, width: '100%', height: '50px', backgroundColor: COLORS.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', WebkitAppearance: 'none', WebkitTapHighlightColor: 'transparent' }}>      
              Get Started      
            </button>      
          </div>      
          {showLogin && (      
            <LoginForm onSuccess={handleLoginSuccess} onCancel={() => setShowLogin(false)} />      
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