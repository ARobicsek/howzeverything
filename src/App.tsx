// src/App.tsx - REFACTORED for UI Redesign with React Router
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';


import { COLORS, FONTS } from './constants';
import { useAuth } from './hooks/useAuth';
import { useRestaurants } from './hooks/useRestaurants';


// Screens
import AboutScreen from './AboutScreen'; // Will be added in the next phase
import AdminScreen from './AdminScreen';
import LoadingScreen from './components/LoadingScreen';
import DiscoveryScreen from './DiscoveryScreen'; // Will be added in the next phase
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
import { clearSharedUrlParams, handleSharedContent, parseSharedUrl } from './utils/urlShareHandler';


// This component will handle the shared content logic within the router context
const SharedContentHandler: React.FC = () => {
    const { user } = useAuth();
    const { addToFavorites } = useRestaurants({ criterion: 'name', direction: 'asc' });
    const navigate = useNavigate();
    const [hasProcessed, setHasProcessed] = useState(false);


    useEffect(() => {
        const process = async () => {
            if (!user || hasProcessed) return;


            const sharedContent = parseSharedUrl();
            if (sharedContent) {
                console.log('Processing shared content for logged-in user:', sharedContent);


                const success = await handleSharedContent(
                    sharedContent,
                    addToFavorites,
                    (restaurantId: string, dishId?: string) => {
                        let path = `/restaurants/${restaurantId}`;
                        if (dishId) {
                            path += `?dish=${dishId}`;
                        }
                        navigate(path);
                    },
                    (screen: string) => navigate(`/${screen}`)
                );


                if (success) {
                    clearSharedUrlParams();
                    setHasProcessed(true);
                }
            }
        };


        process();
    }, [user, addToFavorites, navigate, hasProcessed]);
   
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


const AppRoutes: React.FC = () => {
    const { user, profile, loading: authLoading, createProfile } = useAuth();
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
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


    const isAdmin = user?.email && ['admin@howzeverything.com', 'ari.robicsek@gmail.com'].includes(user.email);
   
    return (
        <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, position: 'relative', paddingTop: '60px' }}>
            <TopNavigation onToggleMenu={handleToggleMenu} />
            <NavigationModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <SharedContentHandler />


            <main>
                <Routes>
                    <Route path="/home" element={<HomeScreen />} />
                    <Route path="/restaurants" element={<RestaurantScreen />} />
                    <Route path="/restaurants/:restaurantId" element={<MenuScreen />} />
                    <Route path="/ratings" element={<RatingsScreen />} />
                    <Route path="/profile" element={<ProfileScreen onEditProfile={() => setShowProfileEdit(true)} />} />
                    <Route path="/discover" element={<DiscoveryScreen />} />
                    <Route path="/about" element={<AboutScreen />} />
                   
                    {isAdmin && <Route path="/admin" element={<AdminScreen user={user} />} />}
                   
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </main>
           
            {isAdmin && (
                <button
                    onClick={() => navigate(location.pathname === '/admin' ? '/home' : '/admin')}
                    style={{ position: 'fixed', top: '70px', right: '20px', padding: '10px 20px', backgroundColor: COLORS.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', zIndex: 1000 }}>
                    {location.pathname === '/admin' ? '← Back to App' : 'Admin Panel'}
                </button>
            )}


            {showProfileEdit && user && (
                <UserForm onSuccess={() => setShowProfileEdit(false)} onCancel={() => setShowProfileEdit(false)} />
            )}
        </div>
    );
}


const AuthFlow: React.FC = () => {
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        // Per requirement, always redirect to the homepage after a successful login.
        // The SharedContentHandler will take care of any URL-based redirection from there.
        navigate('/home', { replace: true });
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
            <LoginForm onSuccess={handleLoginSuccess} onCancel={() => { /* No action on cancel */ }} />      
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
  );
};


export default App;