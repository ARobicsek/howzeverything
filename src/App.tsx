// src/App.tsx - REFACTORED for Tailwind CSS
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Location, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
            if (authLoading || hasProcessed) return;
            const pathname = location.pathname;
            const isDirectRestaurantUrl = pathname.match(/^\/restaurants\/[a-zA-Z0-9-]+$/);
            if (isDirectRestaurantUrl) return;
            if (!user) return;
           
            const sharedContent = parseSharedUrl();
            if (sharedContent) {
                const success = await handleSharedContent(
                    sharedContent,
                    (restaurantId: string, dishId?: string) => {
                        let path = `/restaurants/${restaurantId}`;
                        if (dishId) path += `?dish=${dishId}`;
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
    if (loading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
};

const getScreenMaxWidth = (pathname: string): string => {
    const screenKey = pathname.split('/').filter(Boolean)[0] || 'home';
    const screenMaxWidthMap: Record<string, string> = {
        menu: 'none',
        restaurants: 'max-w-3xl', // 768px
        findRestaurant: 'none',
        ratings: 'none',
        profile: 'max-w-md', // 370px -> use max-w-md (768px) for now, can be more specific if needed
        discovery: 'none',
        home: 'max-w-7xl', // 1280px
        about: 'max-w-3xl', // 768px
        admin: 'max-w-7xl', // 1280px
    };
    return screenMaxWidthMap[screenKey] || 'max-w-7xl';
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
            try {
                await createProfile({
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                    bio: '', location: '', avatar_url: user.user_metadata?.avatar_url || '',
                });
            } catch (err) { console.error('Error creating initial profile:', err); }
        }, 1000);
        return () => { isMounted = false; clearTimeout(timeoutId) };
    }, [user, profile, authLoading, createProfile]);
   
    const handleToggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const isAdmin = !!(user?.email && ['admin@howzeverything.com', 'ari.robicsek@gmail.com'].includes(user.email));

    const isFullBleed = ['/', '/home', '/find-restaurant', '/discover', '/about', '/ratings'].includes(location.pathname);
    const screenMaxWidth = getScreenMaxWidth(location.pathname);

    return (
        <div className={`min-h-screen bg-background font-sans ${isFullBleed ? '' : 'pt-16'}`}>
            <TopNavigation onToggleMenu={handleToggleMenu} />
            <NavigationModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} isAdmin={isAdmin} />
            <SharedContentHandler />
            <div className={`mx-auto ${isFullBleed ? '' : 'px-4'}`}>
                <div className={`mx-auto ${screenMaxWidth}`}>
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

    if (user) return <Navigate to="/home" replace />;

    const handleLoginSuccess = () => {
        const state = location.state as { from?: Location };
        const from = state?.from;
        if (from && from.pathname.startsWith('/restaurants/')) {
            navigate(from, { replace: true });
        } else {
            navigate('/home', { replace: true });
        }
    };

    return (
      <div className="min-h-screen bg-background relative font-sans">
        <div className="flex flex-col items-center justify-center p-5 min-h-screen">
          <div className="text-center mb-10">
            <img src="/logo.png" alt="Logo" className="max-w-[200px] h-auto mx-auto" />
          </div>
          <div className="bg-white rounded-large p-8 max-w-md w-full shadow-md text-center">
            <h2 className="text-xl font-semibold text-text mb-6">
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
  if (authLoading) return <LoadingScreen />;
  return (
    <LocationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthFlow />} />
          <Route path="/*" element={<ProtectedRoute><AppRoutes /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </LocationProvider>
  );
};

export default App;