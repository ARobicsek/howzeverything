// src/App.tsx - REFACTORED for UI Redesign with React Router
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Location, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { COLORS, FONTS, LAYOUT_CONFIG } from './constants';
import { useAuth } from './hooks/useAuth';
// Screens
import AboutScreen from './AboutScreen';
import AdminScreen from './AdminScreen';
import LoadingScreen from './components/LoadingScreen';
import DiscoveryScreen from './DiscoveryScreen';
import FindRestaurantScreen from './FindRestaurantScreen';
import HomeScreen from './HomeScreen';
import MenuScreen from './MenuScreen';
import ProfileScreen from './ProfileScreen';
import RatingsScreen from './RatingsScreen';
import RestaurantScreen from './RestaurantScreen';
// User components
import LoginForm from './components/user/LoginForm';
import UserForm from './components/user/UserForm';
// New Navigation
import NavigationModal from './components/navigation/NavigationModal';
import TopNavigation from './components/navigation/TopNavigation';
// ADDED: Import sharing utilities
import { LocationProvider } from './hooks/useLocationService';
import { clearSharedUrlParams, handleSharedContent, parseSharedUrl } from './utils/urlShareHandler';


// Enhanced SharedContentHandler with proper URL handling
const SharedContentHandler: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [hasProcessed, setHasProcessed] = useState(false);
   
    useEffect(() => {
        const process = async () => {
            // Don't process if we're still loading auth or have already processed
            if (authLoading || hasProcessed) return;
           
            // CRITICAL: Don't process direct restaurant URLs
            // These should be handled by normal React Router, not shared content processor
            const pathname = location.pathname;
            const isDirectRestaurantUrl = pathname.match(/^\/restaurants\/[a-zA-Z0-9-]+$/);
            if (isDirectRestaurantUrl) {
                return;
            }
           
            // Only process if user is logged in
            if (!user) return;
           
            const sharedContent = parseSharedUrl();
            if (sharedContent) {
                const success = await handleSharedContent(
                    sharedContent,
                    (restaurantId: string, dishId?: string) => {
                        let path = `/restaurants/${restaurantId}`;
                        if (dishId) {
                            path += `?dish=${dishId}`;
                        }
                        navigate(path, { replace: true });
                    },
                    (screen: string) => navigate(`/${screen}`, { replace: true })
                );
                if (success) {
                    clearSharedUrlParams();
                    setHasProcessed(true);
                }
            }
        };
       
        process();
    }, [user, authLoading, navigate, hasProcessed, location.pathname]);
   
    return null;
};


const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return <LoadingScreen />;
    }
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
};


const getScreenConfig = (pathname: string) => {
    // Add ratings to the a full-bleed screens
    if (['/', '/home', '/find-restaurant', '/discover', '/about', '/ratings'].includes(pathname)) {
        const screenKey = pathname === '/' ? 'home' : pathname.split('/')[1] as keyof typeof LAYOUT_CONFIG.SCREEN_MAX_WIDTHS;
        return { isFullBleed: true, hasStickyHeader: false, maxWidth: LAYOUT_CONFIG.SCREEN_MAX_WIDTHS[screenKey] };
    }
    const pathSegments = pathname.split('/').filter(Boolean);
    let screenKey: string;
    let hasStickyHeader = false;


    if (pathSegments[0] === 'restaurants' && pathSegments.length > 1) {
        screenKey = 'menu'; // This is the MenuScreen
        hasStickyHeader = true; // MenuScreen has its own sticky header
    } else {
        screenKey = pathSegments[0] || 'home';
    }


    const maxWidth = LAYOUT_CONFIG.SCREEN_MAX_WIDTHS[screenKey] || LAYOUT_CONFIG.APP_CONTAINER.maxWidth;
    return { isFullBleed: false, hasStickyHeader, maxWidth };
};


const AppRoutes: React.FC = () => {
    const { user, profile, loading: authLoading, createProfile } = useAuth();
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
   
    useEffect(() => {
        if (!user || profile !== null || authLoading) return;
        let isMounted = true;
        const timeoutId = setTimeout(async () => {
            if (!isMounted || !user || profile !== null) return;
            console.log('🚀 Creating initial profile for user:', user.email);
            try {
                await createProfile({
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                    bio: '',
                    location: '',
                    avatar_url: user.user_metadata?.avatar_url || '',
                });
            } catch (err) {
                console.error('Error creating initial profile:', err);
            }
        }, 1000);
        return () => { isMounted = false; clearTimeout(timeoutId) };
    }, [user, profile, authLoading, createProfile]);
   
    const handleToggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const isAdmin = !!(user?.email && ['admin@howzeverything.com', 'ari.robicsek@gmail.com'].includes(user.email));
    const screenConfig = getScreenConfig(location.pathname);


    const isHomeScreen = location.pathname === '/' || location.pathname === '/home';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: isHomeScreen ? COLORS.navBarDark : COLORS.background, paddingTop: screenConfig.isFullBleed ? 0 : LAYOUT_CONFIG.APP_CONTAINER.paddingTop }}>
            <TopNavigation onToggleMenu={handleToggleMenu} />
            <NavigationModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} isAdmin={isAdmin} />
            <SharedContentHandler />
            <div style={{
                // --- THIS IS THE FIX ---
                // This value was LAYOUT_CONFIG.APP_CONTAINER.maxWidth ('448px'), which capped the width of everything.
                // It's now set to a larger value to allow inner content to define its own width.
                maxWidth: screenConfig.isFullBleed ? 'none' : '1280px',
                margin: '0 auto',
                paddingLeft: screenConfig.isFullBleed ? 0 : LAYOUT_CONFIG.APP_CONTAINER.padding,
                paddingRight: screenConfig.isFullBleed ? 0 : LAYOUT_CONFIG.APP_CONTAINER.padding,
            }}>
                <div style={{
                    maxWidth: screenConfig.maxWidth,
                    margin: '0 auto',
                }}>
                    <Routes>
                        <Route path="/home" element={<HomeScreen />} />
                        <Route path="/find-restaurant" element={<FindRestaurantScreen />} />
                        <Route path="/restaurants" element={<RestaurantScreen />} />
                        <Route path="/restaurants/:restaurantId" element={<MenuScreen />} />
                        <Route path="/ratings" element={<RatingsScreen />} />
                        <Route path="/profile" element={<ProfileScreen onEditProfile={() => setShowProfileEdit(true)} />} />
                        <Route path="/discover" element={<DiscoveryScreen />} />
                        <Route path="/about" element={<AboutScreen />} />
                        {isAdmin && <Route path="/admin" element={<AdminScreen user={user} />} />}
                        <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                </div>
            </div>
            {showProfileEdit && user && (
                <UserForm onSuccess={() => setShowProfileEdit(false)} onCancel={() => setShowProfileEdit(false)} />
            )}
        </div>
    );
}


const AuthFlow: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // If the user is already logged in, redirect them away from the login page.
    if (user) {
        return <Navigate to="/home" replace />;
    }

    const handleLoginSuccess = () => {
        const state = location.state as { from?: Location };
        const from = state?.from;

        // **THE FIX**: Check that 'from' exists before accessing its properties.
        if (from && from.pathname.startsWith('/restaurants/')) {
            // If the user was trying to access a shared link, send them there after login.
            navigate(from, { replace: true });
        } else {
            // For all other cases (e.g., after signing out from /profile or /ratings),
            // navigate to the home page as a default landing spot.
            navigate('/home', { replace: true });
        }
    };

    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <img src="/logo.png" alt="Logo" style={{ maxWidth: '200px', height: 'auto', margin: '0 auto' }} />
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <h2 style={{ ...FONTS.elegant, fontSize: '20px', fontWeight: '600', color: COLORS.text, margin: '0 0 24px 0' }}>
                Sign in and start dishing
            </h2>
            <LoginForm onSuccess={handleLoginSuccess} onCancel={() => {}} />
          </div>
        </div>
      </div>
    );
};


const App: React.FC = () => {
  const { loading: authLoading } = useAuth();
  if (authLoading) {
    return <LoadingScreen />;
  }
  return (
    <LocationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthFlow />} />
          <Route path="/*" element={
              <ProtectedRoute>
                  <AppRoutes />
              </ProtectedRoute>
          }/>
        </Routes>
      </BrowserRouter>
    </LocationProvider>
  );
};


export default App;