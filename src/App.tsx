import React, { useState, useEffect } from 'react';

// Screen components
import HomeScreen from './HomeScreen';
import RestaurantScreen from './RestaurantScreen';
import MenuScreen from './MenuScreen';
import RatingsScreen from './RatingsScreen';
import ProfileScreen from './ProfileScreen';

// Types from BottomNavigation for consistency
import type { AppScreenType as GlobalAppScreenType, NavigableScreenType as GlobalNavigableScreenType } from './components/navigation/BottomNavigation';

// Define the App's screen type, which includes 'menu'
type AppScreen = GlobalAppScreenType; // 'home' | 'restaurants' | 'ratings' | 'profile' | 'menu'
type NavigableAppScreen = GlobalNavigableScreenType; // 'home' | 'restaurants' | 'ratings' | 'profile'


function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');

  useEffect(() => {
    console.log('App State: currentScreen changed to:', currentScreen, 'RestaurantID:', selectedRestaurantId);
  }, [currentScreen, selectedRestaurantId]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const screen = event.state?.screen || 'home';
      const restaurantId = event.state?.restaurantId;
      console.log('Browser back/forward - navigating to:', screen, 'restaurantId:', restaurantId);
      setCurrentScreen(screen);
      if (screen === 'menu' && restaurantId) {
        setSelectedRestaurantId(restaurantId);
      } else if (screen !== 'menu') {
        setSelectedRestaurantId('');
      }
    };

    window.addEventListener('popstate', handlePopState);

    const initialHash = window.location.hash;
    let initialStateResolved = false;
    if (initialHash) {
      if (initialHash.startsWith('#menu/')) {
        const restaurantIdFromHash = initialHash.substring('#menu/'.length);
        if (restaurantIdFromHash) {
          setSelectedRestaurantId(restaurantIdFromHash);
          setCurrentScreen('menu');
          window.history.replaceState({ screen: 'menu', restaurantId: restaurantIdFromHash }, '', initialHash);
          initialStateResolved = true;
        }
      } else {
        const screenFromHash = initialHash.substring(1) as AppScreen;
        if (['home', 'restaurants', 'ratings', 'profile'].includes(screenFromHash)) {
          setCurrentScreen(screenFromHash);
          window.history.replaceState({ screen: screenFromHash }, '', initialHash);
          initialStateResolved = true;
        }
      }
    }

    if (!initialStateResolved && (!window.history.state || window.history.state.screen !== currentScreen)) {
      const defaultScreen: AppScreen = 'home';
      window.history.replaceState({ screen: defaultScreen }, '', window.location.pathname);
      if (currentScreen !== defaultScreen) setCurrentScreen(defaultScreen);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // Empty dependency array for setup, currentScreen changes are handled by its own useEffect

  const navigateToScreen = (screen: NavigableAppScreen) => { // Parameter is NavigableAppScreen
    console.log('navigateToScreen (App.tsx) called with:', screen);
    setCurrentScreen(screen); // screen here is one of home, restaurants, ratings, profile
    setSelectedRestaurantId(''); // Clear restaurant ID when navigating to top-level screens

    if (screen !== 'home') {
      window.history.pushState({ screen }, '', `#${screen}`);
    } else {
      window.history.pushState({ screen: 'home' }, '', window.location.pathname);
    }
  };

  const navigateToMenu = (restaurantId: string) => {
    console.log('navigateToMenu (App.tsx) called with restaurantId:', restaurantId);
    setSelectedRestaurantId(restaurantId);
    setCurrentScreen('menu');
    window.history.pushState({ screen: 'menu', restaurantId }, '', `#menu/${restaurantId}`);
  };

  // Render different screens based on current screen
  if (currentScreen === 'home') {
    return <HomeScreen onNavigateToScreen={navigateToScreen} currentAppScreen={currentScreen} />;
  }
  if (currentScreen === 'restaurants') {
    return <RestaurantScreen
            // onNavigateHome={() => navigateToScreen('home')} // Already handled by onNavigateToScreen
            onNavigateToScreen={navigateToScreen}
            onNavigateToMenu={navigateToMenu}
            currentAppScreen={currentScreen}
          />;
  }
  if (currentScreen === 'menu') {
    if (!selectedRestaurantId) {
        console.warn("MenuScreen requested without ID, redirecting to restaurants.");
        setCurrentScreen('restaurants'); // This will trigger a re-render
        window.history.replaceState({ screen: 'restaurants' }, '', '#restaurants');
        return <RestaurantScreen onNavigateToScreen={navigateToScreen} onNavigateToMenu={navigateToMenu} currentAppScreen={'restaurants'} />;
    }
    return <MenuScreen
            restaurantId={selectedRestaurantId}
            onNavigateBack={() => navigateToScreen('restaurants')}
            onNavigateToScreen={navigateToScreen} // navigateToScreen expects NavigableAppScreen
            currentAppScreen={currentScreen}
          />;
  }
  if (currentScreen === 'ratings') {
    return <RatingsScreen onNavigateToScreen={navigateToScreen} currentAppScreen={currentScreen} />;
  }
  if (currentScreen === 'profile') {
    return <ProfileScreen onNavigateToScreen={navigateToScreen} currentAppScreen={currentScreen} />;
  }

  // Fallback, should ideally not be reached if logic is correct
  console.error("Reached fallback in App.tsx render, currentScreen:", currentScreen);
  return <HomeScreen onNavigateToScreen={navigateToScreen} currentAppScreen={'home'} />;
}

export default App;