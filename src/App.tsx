// src/App.tsx
import React, { useState, useEffect } from 'react'
import { COLORS, FONTS } from './constants'
import { useAuth } from './hooks/useAuth'

// Screens - Fixed to match your actual file structure
import HomeScreen from './HomeScreen'
import RestaurantScreen from './RestaurantScreen'
import MenuScreen from './MenuScreen'
import RatingsScreen from './RatingsScreen'
import ProfileScreen from './ProfileScreen'
import LoadingScreen from './components/LoadingScreen'

// User components
import LoginForm from './components/user/LoginForm'
import UserForm from './components/user/UserForm'

// Import types from BottomNavigation to match your existing system
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
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)

  console.log('🚀 App State:', { 
    currentScreen, 
    menuScreenState, 
    authLoading, 
    isCreatingProfile,
    userEmail: user?.email,
    profileExists: !!profile 
  });

  const navigateToMenu = (restaurantId: string) => {
    console.log('🍕 navigateToMenu called with restaurantId:', restaurantId);
    setMenuScreenState({ restaurantId, restaurantName: '' })
    setCurrentScreen('menu')
    console.log('🍕 After setting state - currentScreen should be menu');
  }

  const navigateBackFromMenu = () => {
    console.log('🔙 navigateBackFromMenu called');
    setMenuScreenState(null)
    setCurrentScreen('restaurants')
  }

  const handleNavigateToScreen = (screen: NavigableScreenType) => {
    console.log('🧭 handleNavigateToScreen called with:', screen);
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

  useEffect(() => {
    const handleProfileCreation = async () => {
      // RE-DISABLED: Automatic profile creation is causing a loop/flicker
      // due to "duplicate key value violates unique constraint 'users_pkey'".
      // This means the app thinks a profile doesn't exist (profile state is null),
      // tries to create one, but a profile for that user ID already exists in DB.
      // The fetching of the existing profile in useAuth needs to be investigated.
      console.log('🚀 Profile creation: RE-DISABLED (flickering/duplicate key issue)')
      if (isCreatingProfile) setIsCreatingProfile(false); 
      return; // This disables the block below
      
      // Original logic (currently disabled by the return above):
      if (user && !profile && !authLoading && !isCreatingProfile) {
        // If 'user' is guaranteed non-null by the 'if' above, these should be safe.
        // Using non-null assertion '!' as a concession to a potentially over-cautious linter
        // for this currently disabled code block. Only do this if you are certain.
        console.log('🤔 Attempting to create profile for user:', user!.id); // Ln 87
        setIsCreatingProfile(true)
        try {
          const success = await createProfile({
            full_name: user!.user_metadata?.full_name || '', // Ln 92
            bio: '',
            location: '',
            avatar_url: user!.user_metadata?.avatar_url || '' // Ln 95
          })
          
          if (!success) {
            console.error('Failed to create user profile (as reported by createProfile function)')
          } else {
            console.log('✅ Profile creation reported success by createProfile function.');
          }
        } catch (error) {
          console.error('Profile creation error (exception caught):', error)
        } finally {
          setIsCreatingProfile(false)
        }
      }
    }

    handleProfileCreation()
  }, [user, profile, authLoading, createProfile, isCreatingProfile])

  if (authLoading || (isCreatingProfile && !profile)) { 
    console.log('⏳ Showing LoadingScreen because:', { authLoading, isCreatingProfile, profileExists: !!profile });
    return <LoadingScreen message={isCreatingProfile ? "Setting up your profile..." : undefined} />;
  }

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
    console.log('🎬 renderCurrentScreen called with currentScreen:', currentScreen);
    
    switch (currentScreen) {
      case 'home':
        console.log('🏠 Rendering HomeScreen');
        return (
          <HomeScreen 
            onNavigateToScreen={handleNavigateToScreen}
            currentAppScreen={getCurrentAppScreen()}
          />
        )
      case 'restaurants':
        console.log('🍽️ Rendering RestaurantScreen');
        return (
          <RestaurantScreen 
            onNavigateToScreen={handleNavigateToScreen}
            onNavigateToMenu={navigateToMenu}
            currentAppScreen={getCurrentAppScreen()}
          />
        )
      case 'menu':
        console.log('🍕 Menu case reached! menuScreenState:', menuScreenState);
        if (!menuScreenState) {
          console.log('❌ No menuScreenState! Redirecting to restaurants...');
          setCurrentScreen('restaurants')
          return null; 
        }
        console.log('✅ About to render MenuScreen with restaurantId:', menuScreenState.restaurantId);
        return (
          <MenuScreen
            restaurantId={menuScreenState.restaurantId}
            onNavigateBack={navigateBackFromMenu}
            onNavigateToScreen={handleNavigateToScreen}
            currentAppScreen={getCurrentAppScreen()}
          />
        )
      case 'ratings':
        console.log('⭐ Rendering RatingsScreen');
        return (
          <RatingsScreen 
            onNavigateToScreen={handleNavigateToScreen}
            currentAppScreen={getCurrentAppScreen()}
          />
        )
      case 'profile':
        console.log('👤 Rendering ProfileScreen');
        return (
          <ProfileScreen 
            onNavigateToScreen={handleNavigateToScreen}
            currentAppScreen={getCurrentAppScreen()}
          />
        )
      default:
        console.log('🏠 Default case: Rendering HomeScreen');
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