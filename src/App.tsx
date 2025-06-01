// src/App.tsx
import React, { useState, useEffect } from 'react'
import { COLORS, FONTS } from './constants'
import { useAuth } from './hooks/useAuth'

// Screens
import HomeScreen from './HomeScreen'
import RestaurantScreen from './RestaurantScreen'
import MenuScreen from './MenuScreen'
import RatingsScreen from './RatingsScreen'
import ProfileScreen from './ProfileScreen'
import LoadingScreen from './components/LoadingScreen'

// User components
import LoginForm from './components/user/LoginForm'
import UserForm from './components/user/UserForm'

// Import types from BottomNavigation
import type { NavigableScreenType, AppScreenType } from './components/navigation/BottomNavigation'

// Create our own screen type that includes menu
type AppScreen = NavigableScreenType | 'menu'

interface MenuScreenState {
  restaurantId: string
  restaurantName: string
}

const App: React.FC = () => {
  const { user, profile, loading: authLoading, createProfile } = useAuth()
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home')
  const [menuScreenState, setMenuScreenState] = useState<MenuScreenState | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)

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
    if (currentScreen === 'menu') {
      return 'restaurants'
    }
    return currentScreen as AppScreenType
  }

  // Create profile if needed - but only once per user
  useEffect(() => {
    if (!user || profile || authLoading) {
      return
    }

    // User exists but no profile - create one
    const createInitialProfile = async () => {
      console.log('🚀 Creating initial profile for user:', user.email)
      
      await createProfile({
        full_name: user.user_metadata?.full_name || '',
        bio: '',
        location: '',
        avatar_url: user.user_metadata?.avatar_url || ''
      })
    }

    createInitialProfile()
  }, [user?.id]) // Only depend on user id

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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{
              maxWidth: '200px',
              height: 'auto',
              margin: '0 auto'
            }}
          />
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
          <h2 style={{
            ...FONTS.elegant,
            fontSize: '20px',
            fontWeight: '600',
            color: COLORS.text,
            margin: '0 0 24px 0'
          }}>
            Sign in and start to dish
          </h2>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              ...FONTS.elegant,
              width: '100%',
              height: '50px',
              backgroundColor: COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            Get Started
          </button>
        </div>
        {showLogin && (
          <LoginForm
            onSuccess={() => setShowLogin(false)}
            onCancel={() => setShowLogin(false)}
          />
        )}
      </div>
    )
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onNavigateToScreen={handleNavigateToScreen}
            currentAppScreen={getCurrentAppScreen()}
          />
        )
      case 'restaurants':
        return (
          <RestaurantScreen 
            onNavigateToScreen={handleNavigateToScreen}
            onNavigateToMenu={navigateToMenu}
            currentAppScreen={getCurrentAppScreen()}
          />
        )
      case 'menu':
        if (!menuScreenState) {
          setCurrentScreen('restaurants')
          return null
        }
        return (
          <MenuScreen
            restaurantId={menuScreenState.restaurantId}
            onNavigateBack={navigateBackFromMenu}
            onNavigateToScreen={handleNavigateToScreen}
            currentAppScreen={getCurrentAppScreen()}
          />
        )
      case 'ratings':
        return (
          <RatingsScreen 
            onNavigateToScreen={handleNavigateToScreen}
            currentAppScreen={getCurrentAppScreen()}
          />
        )
      case 'profile':
        return (
          <ProfileScreen 
            onNavigateToScreen={handleNavigateToScreen}
            currentAppScreen={getCurrentAppScreen()}
          />
        )
      default:
        return (
          <HomeScreen 
            onNavigateToScreen={handleNavigateToScreen}
            currentAppScreen={getCurrentAppScreen()}
          />
        )
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.background
    }}>
      {renderCurrentScreen()}
      {showProfileEdit && user && ( 
        <UserForm
          onSuccess={() => setShowProfileEdit(false)}
          onCancel={() => setShowProfileEdit(false)}
        />
      )}
    </div>
  )
}

export default App