// Missing RatingsScreen component
// This goes in src/RatingsScreen.tsx

import React, { useState, useEffect } from 'react';
import BottomNavigation from './components/navigation/BottomNavigation';
import type { NavigableScreenType, AppScreenType } from './components/navigation/BottomNavigation';
import { COLORS, FONTS, STYLES } from './constants';
import { supabase } from './supabaseClient';
import LoadingScreen from './components/LoadingScreen';

interface RatingsScreenProps {
  onNavigateToScreen: (screen: NavigableScreenType) => void;
  currentAppScreen: AppScreenType;
}

interface UserRating {
  id: string;
  rating: number;
  notes?: string;
  date_tried: string;
  created_at: string;
  dish: {
    id: string;
    name: string;
    restaurant: {
      id: string;
      name: string;
    };
  };
}

const RatingsScreen: React.FC<RatingsScreenProps> = ({ onNavigateToScreen, currentAppScreen }) => {
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRatings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('You must be logged in to view your ratings');
          setIsLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('dish_ratings')
          .select(`
            id,
            rating,
            notes,
            date_tried,
            created_at,
            dish_id,
            restaurant_dishes!dish_ratings_dish_id_fkey (
              id,
              name,
              restaurant_id,
              restaurants!restaurant_dishes_restaurant_id_fkey (
                id,
                name
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Transform the data to match our interface
        const transformedRatings: UserRating[] = (data || []).map((rating: any) => ({
          id: rating.id,
          rating: rating.rating,
          notes: rating.notes,
          date_tried: rating.date_tried,
          created_at: rating.created_at,
          dish: {
            id: rating.restaurant_dishes?.id || rating.dish_id,
            name: rating.restaurant_dishes?.name || 'Unknown Dish',
            restaurant: {
              id: rating.restaurant_dishes?.restaurants?.id || '',
              name: rating.restaurant_dishes?.restaurants?.name || 'Unknown Restaurant'
            }
          }
        }));

        setUserRatings(transformedRatings);
      } catch (err: any) {
        console.error('Error fetching user ratings:', err);
        setError(`Failed to load your ratings: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRatings();
  }, []);

  const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex gap-px">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: star <= rating ? COLORS.star : COLORS.starEmpty,
            fontSize: '1rem',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  const RatingCard: React.FC<{ rating: UserRating }> = ({ rating }) => (
    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 style={{
            ...FONTS.elegant,
            fontWeight: '500',
            color: COLORS.text,
            fontSize: '1.1rem',
            marginBottom: '4px'
          }}>
            {rating.dish.name}
          </h3>
          <p style={{
            ...FONTS.elegant,
            color: COLORS.text,
            opacity: 0.7,
            fontSize: '0.9rem',
            marginBottom: '8px'
          }}>
            at {rating.dish.restaurant.name}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StarRating rating={rating.rating} />
          <span style={{
            ...FONTS.elegant,
            color: COLORS.text,
            opacity: 0.6,
            fontSize: '0.8rem'
          }}>
            {new Date(rating.date_tried).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {rating.notes && (
        <div className="bg-white/5 p-3 rounded-lg">
          <p style={{
            ...FONTS.elegant,
            color: COLORS.text,
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
            {rating.notes}
          </p>
        </div>
      )}
    </div>
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10 w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-xl text-center flex-1 tracking-wide" style={{ ...FONTS.elegant, color: COLORS.text }}>
            My Ratings
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4" style={{ paddingBottom: STYLES.mainContentPadding }}>
        <div className="max-w-md mx-auto space-y-4">
          {error && (
            <div className="bg-red-500/20 p-3 rounded-lg text-center">
              <p style={{ color: COLORS.danger, ...FONTS.elegant }}>{error}</p>
            </div>
          )}

          {userRatings.length > 0 ? (
            <>
              <div className="text-center mb-6">
                <p style={{
                  ...FONTS.elegant,
                  color: COLORS.text,
                  opacity: 0.8,
                  fontSize: '0.9rem'
                }}>
                  You've rated {userRatings.length} dish{userRatings.length !== 1 ? 'es' : ''}
                </p>
              </div>
              
              <div className="space-y-4">
                {userRatings.map((rating) => (
                  <RatingCard key={rating.id} rating={rating} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <p style={{
                ...FONTS.elegant,
                color: COLORS.text,
                fontSize: '18px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                No ratings yet
              </p>
              <p style={{
                ...FONTS.elegant,
                color: COLORS.text,
                opacity: 0.7,
                marginBottom: '16px'
              }}>
                Start rating dishes to see them here!
              </p>
              <button
                onClick={() => onNavigateToScreen('restaurants')}
                style={{
                  ...FONTS.elegant,
                  backgroundColor: COLORS.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Find Restaurants
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation onNav={onNavigateToScreen} activeScreenValue={currentAppScreen} />
    </div>
  );
};

export default RatingsScreen;