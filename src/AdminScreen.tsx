// src/AdminScreen.tsx
import { User } from '@supabase/supabase-js';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DuplicateDishModal from './components/DuplicateDishModal';
import DuplicateRestaurantModal from './components/restaurant/DuplicateRestaurantModal';
import AddressInput from './components/shared/AddressInput';
import { COLORS, SCREEN_STYLES, SPACING, STYLES, TYPOGRAPHY, STYLE_FUNCTIONS } from './constants';
import { DishSearchResult, DishWithDetails } from './hooks/useDishes';
import { supabase } from './supabaseClient';
import type { AddressFormData } from './types/address';
import type { Restaurant } from './types/restaurant';
import { findSimilarDishes } from './utils/dishSearch';

// Simplified local interface for the admin dish list
interface AdminDish {
  id: string;
  name: string;
  restaurant_name?: string;
  created_at: string | null;
}
interface RawAdminDish {
    id: string;
    name: string;
    created_at: string;
    restaurants?: {
        name: string;
    };
}
interface RawComment {
    id: string;
    comment_text: string;
    created_at: string;
    dish_id: string | null;
    restaurant_dishes?: {
        name: string;
        restaurant_id: string;
        restaurants?: {
            name: string;
        };
    };
    user_id: string;
    users?: {
        full_name: string | null;
        email: string | null;
    };
    is_hidden: boolean;
}
interface Comment {
  id: string;
  comment: string;
  created_at: string;
  dish_id: string;
  dish_name?: string;
  restaurant_name?: string;
  restaurant_id?: string;
  user_id: string;
  username?: string;
  is_hidden: boolean;
}
interface AdminScreenProps {
  user: User | null;
}
interface GeocodedCoordinates {
  lat: number;
  lon: number;
}
// User activity interface for analytics
interface UserActivity {
  userId: string;
  fullName: string | null;
  email: string | null;
  restaurantsViewed: number;
  restaurantsAdded: number;
  dishesRated: number;
  dishesCommented: number;
  dishesAdded: number;
}

const geocodeAddress = async (address: string): Promise<GeocodedCoordinates | null> => {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.warn('Geoapify API key is missing. Geocoding aborted.');
    return null;
  }
  if (!address.trim()) {
    console.warn('Address is empty, cannot geocode.');
    return null;
  }
  try {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&limit=1&apiKey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geoapify geocoding failed with status: ${response.status} - ${await response.text()}`);
    }
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const properties = data.features[0].properties;
      return {
        lat: properties.lat,
        lon: properties.lon
      };
    }
    return null;
  } catch (err) {
    console.error('Error geocoding address:', err);
    return null;
  }
};

const PaginationControls: React.FC<{
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    loading: boolean;
}> = ({ currentPage, totalItems, itemsPerPage, onPageChange, loading }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
        <div style={SCREEN_STYLES.admin.paginationContainer}>
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1 || loading}
                style={STYLE_FUNCTIONS.getPaginationButtonStyle(currentPage === 1 || loading)}
            >
                First
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                style={STYLE_FUNCTIONS.getPaginationButtonStyle(currentPage === 1 || loading)}
            >
                Previous
            </button>
            <span style={SCREEN_STYLES.admin.paginationText}>
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                style={STYLE_FUNCTIONS.getPaginationButtonStyle(currentPage === totalPages || loading)}
            >
                Next
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages || loading}
                style={STYLE_FUNCTIONS.getPaginationButtonStyle(currentPage === totalPages || loading)}
            >
                Last
            </button>
        </div>
    );
};

const AdminScreen: React.FC<AdminScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes' | 'comments' | 'analytics'>('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<AdminDish[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurantSearchTerm, setRestaurantSearchTerm] = useState('');
  const [dishSearchTerm, setDishSearchTerm] = useState('');
  const [commentRestaurantSearch, setCommentRestaurantSearch] = useState('');
  const [commentDishSearch, setCommentDishSearch] = useState('');
  // Pagination
  const ITEMS_PER_PAGE = 20;
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [restaurantTotal, setRestaurantTotal] = useState(0);
  const [dishPage, setDishPage] = useState(1);
  const [dishTotal, setDishTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [newAddressData, setNewAddressData] = useState<AddressFormData>({
    fullAddress: '', address: '', city: '', state: '', zip_code: '', country: 'USA',
  });
  const [addressInputKey, setAddressInputKey] = useState(Date.now());
  const [similarRestaurants, setSimilarRestaurants] = useState<Restaurant[]>([]);
  const [newRestaurantData, setNewRestaurantData] = useState<Omit<Restaurant, 'id' | 'created_at' | 'updated_at' | 'dateAdded'> | null>(null);
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddressData, setEditAddressData] = useState<AddressFormData | null>(null);
  const [editAddressInputKey, setEditAddressInputKey] = useState(Date.now() + 1);
  const [newDishName, setNewDishName] = useState('');
  const [similarDishesForModal, setSimilarDishesForModal] = useState<DishSearchResult[]>([]);
  const [dishDataForModal, setDishDataForModal] = useState<{name: string, restaurantId: string} | null>(null);
  const isAdmin = user?.email && ['admin@howzeverything.com', 'ari.robicsek@gmail.com'].includes(user.email);
  // Analytics State
  const [analyticsStartDate, setAnalyticsStartDate] = useState(() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return date.toISOString().split('T')[0];
  });
  const [analyticsEndDate, setAnalyticsEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rawAnalyticsData, setRawAnalyticsData] = useState<UserActivity[]>([]);
  const [sortedAnalyticsData, setSortedAnalyticsData] = useState<UserActivity[]>([]);
  const [analyticsSort, setAnalyticsSort] = useState<{key: keyof UserActivity, direction: 'asc' | 'desc'}>({ key: 'fullName', direction: 'asc' });
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // --- NEW STATE for "Dishes for Restaurant" view ---
  const [viewingDishesForRestaurant, setViewingDishesForRestaurant] = useState<Restaurant | null>(null);
  const [restaurantSpecificDishes, setRestaurantSpecificDishes] = useState<AdminDish[]>([]);
  const [loadingRestaurantSpecificDishes, setLoadingRestaurantSpecificDishes] = useState(false);
  const [showAddDishFormForRestaurant, setShowAddDishFormForRestaurant] = useState(false);

  const handleNewAddressChange = useCallback((data: AddressFormData) => {
    setNewAddressData(data);
  }, []);
  const handleResetNewRestaurantForm = () => {
    setNewRestaurantName('');
    setNewAddressData({ fullAddress: '', address: '', city: '', state: '', zip_code: '', country: 'USA' });
    setError(null);
    setAddressInputKey(Date.now());
  };
  const handleEditAddressChange = useCallback((data: AddressFormData) => {
    setEditAddressData(data);
  }, []);
  // Reset page to 1 on search
  useEffect(() => { setRestaurantPage(1); }, [restaurantSearchTerm]);
  useEffect(() => { setDishPage(1); }, [dishSearchTerm]);
  useEffect(() => { setCommentPage(1); }, [commentRestaurantSearch, commentDishSearch]);
 
  // --- Data fetching for main admin tabs ---
  useEffect(() => {
    if (!isAdmin || activeTab === 'analytics' || viewingDishesForRestaurant) {
        return;
    }
    const loadData = async () => {
      console.time(`AdminScreen-loadData-${activeTab}`);
      setLoading(true);
      setError(null);
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
              throw new Error("Authentication session not found. Please log in again.");
          }

          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY!,
                  'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                  dataType: activeTab,
                  page: activeTab === 'restaurants' ? restaurantPage : (activeTab === 'dishes' ? dishPage : commentPage),
                  limit: ITEMS_PER_PAGE,
                  restaurantSearchTerm,
                  dishSearchTerm,
                  commentRestaurantSearch,
                  commentDishSearch
              }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Request failed with status ${response.status}`);
          }

          const { data, count } = await response.json();

          if (activeTab === 'restaurants') {
              setRestaurants(data || []);
              setRestaurantTotal(count || 0);
          } else if (activeTab === 'dishes') {
              const formattedDishes = data?.map((d: RawAdminDish) => ({
                  id: d.id,
                  name: d.name,
                  created_at: d.created_at,
                  restaurant_name: d.restaurants?.name
              })) || [];
              setDishes(formattedDishes);
              setDishTotal(count || 0);
          } else if (activeTab === 'comments') {
              const formattedComments = data?.map((c: RawComment) => ({
                  id: c.id,
                  comment: c.comment_text,
                  created_at: c.created_at,
                  dish_id: c.dish_id || '',
                  dish_name: c.restaurant_dishes?.name,
                  restaurant_id: c.restaurant_dishes?.restaurant_id,
                  restaurant_name: c.restaurant_dishes?.restaurants?.name,
                  user_id: c.user_id,
                  username: c.users?.full_name || c.users?.email,
                  is_hidden: c.is_hidden ?? false,
              })) || [];
              setComments(formattedComments);
              setCommentTotal(count || 0);
          }

      } catch (err) {
        console.error('Error loading admin data:', err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
        console.timeEnd(`AdminScreen-loadData-${activeTab}`);
      }
    };
    const isSearching = (activeTab === 'restaurants' && restaurantSearchTerm) || (activeTab === 'dishes' && dishSearchTerm) || (activeTab === 'comments' && (commentDishSearch || commentRestaurantSearch));
    const timer = setTimeout(() => {
      loadData();
    }, isSearching ? 500 : 0);
    return () => clearTimeout(timer);
  }, [
      isAdmin,
      activeTab,
      restaurantSearchTerm,
      dishSearchTerm,
      commentRestaurantSearch,
      commentDishSearch,
      restaurantPage,
      dishPage,
      commentPage,
      viewingDishesForRestaurant
  ]);

  // --- NEW: Fetch dishes for a specific restaurant ---
  useEffect(() => {
    if (viewingDishesForRestaurant) {
        const fetchDishesForRestaurant = async () => {
            setLoadingRestaurantSpecificDishes(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('restaurant_dishes')
                    .select('id, name, created_at')
                    .eq('restaurant_id', viewingDishesForRestaurant.id)
                    .order('name', { ascending: true });

                if (error) throw error;
                
                const dishesWithRestaurant = data.map(d => ({ ...d, restaurant_name: viewingDishesForRestaurant.name }));
                setRestaurantSpecificDishes(dishesWithRestaurant);
            } catch (err) {
                setError(`Failed to load dishes for ${viewingDishesForRestaurant.name}: ${err instanceof Error ? err.message : String(err)}`);
                setRestaurantSpecificDishes([]);
            } finally {
                setLoadingRestaurantSpecificDishes(false);
            }
        };
        fetchDishesForRestaurant();
    }
  }, [viewingDishesForRestaurant]);


  const createNewRestaurant = async (data: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'| 'dateAdded'>) => {
    setLoading(true);
    setError(null);
    let lat: number | null = null;
    let lon: number | null = null;
    if (data.full_address) {
        try {
            const coords = await geocodeAddress(data.full_address);
            if (coords) {
                lat = coords.lat;
                lon = coords.lon;
            }
        } catch (geocodeErr) { console.error('Error during geocoding:', geocodeErr); }
    }
    try {
      const { error } = await supabase.from('restaurants').insert({
          ...data,
          manually_added: true,
          latitude: lat,
          longitude: lon,
          dateAdded: new Date().toISOString(),
          created_by: user?.id,
        }).select().single();
      if (error) throw error;
      handleResetNewRestaurantForm();
      setSimilarRestaurants([]);
      setNewRestaurantData(null);
      // Trigger a refetch by changing a dependency of the main useEffect
      setActiveTab('restaurants');
      setRestaurantPage(1);
    } catch (err) {
      console.error('Error adding restaurant:', err);
      setError(`Failed to add restaurant: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  const findSimilarRestaurantsAdmin = async (name: string, city?: string | null) => {
    let query = supabase
        .from('restaurants')
        .select('*')
        .ilike('name', `%${name.trim().replace(/[%_]/g, '\\$&')}%`);
    if (city) {
        query = query.ilike('city', `%${city.trim().replace(/[%_]/g, '\\$&')}%`);
    }
    const { data, error } = await query;
    if (error) {
        console.error('Error finding similar restaurants:', error);
        return [];
    }
    return data || [];
  };
  const handleAttemptAddRestaurant = async () => {
    if (!newRestaurantName.trim()) {
      setError('Restaurant Name cannot be empty.');
      return;
    }
    setError(null);
    try {
      const restaurantData = {
          name: newRestaurantName.trim(),
          full_address: newAddressData.fullAddress,
          address: newAddressData.address,
          city: newAddressData.city,
          state: newAddressData.state || null,
          zip_code: newAddressData.zip_code || null,
          country: newAddressData.country || 'USA',
          category: null,
          created_by: user?.id || null,
          geoapify_place_id: null,
          latitude: null,
          longitude: null,
          manually_added: true,
          opening_hours: null,
          phone: null,
          price_tier: null,
          rating: null,
          website_url: null,
      };
      const similar = await findSimilarRestaurantsAdmin(restaurantData.name, restaurantData.city);
      if (similar.length > 0) {
        setNewRestaurantData(restaurantData);
        setSimilarRestaurants(similar);
      } else {
        await createNewRestaurant(restaurantData);
      }
    } catch (err) {
        console.error("Error during add restaurant attempt:", err);
        setError(`An unexpected error occurred while checking for duplicates: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  const startEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurantId(restaurant.id);
    setEditName(restaurant.name);
    setEditAddressData({
      fullAddress: restaurant.full_address || [restaurant.address, restaurant.city, restaurant.state, restaurant.zip_code, restaurant.country].filter(Boolean).join(', '),
      address: restaurant.address || '',
      city: restaurant.city || '',
      state: restaurant.state || '',
      zip_code: restaurant.zip_code || '',
      country: restaurant.country || 'USA',
    });
    setEditAddressInputKey(Date.now());
  };
  const updateRestaurant = async (id: string) => {
    if (!editAddressData) return;
    setLoading(true);
    setError(null);
    const currentRestaurant = restaurants.find(r => r.id === id);
    let updatedLat: number | null = currentRestaurant?.latitude || null;
    let updatedLon: number | null = currentRestaurant?.longitude || null;
    const originalFullAddress = currentRestaurant?.full_address || [currentRestaurant?.address, currentRestaurant?.city, currentRestaurant?.state, currentRestaurant?.zip_code, currentRestaurant?.country].filter(Boolean).join(', ');
    const addressChanged = editAddressData.fullAddress !== originalFullAddress;
    if (addressChanged && editAddressData.fullAddress) {
        try {
            const coords = await geocodeAddress(editAddressData.fullAddress);
            if (coords) {
                updatedLat = coords.lat;
                updatedLon = coords.lon;
            }
        } catch (geocodeErr) { console.error('Error during geocoding:', geocodeErr); }
    }
    try {
      const { error } = await supabase.from('restaurants').update({
          name: editName.trim(),
          full_address: editAddressData.fullAddress,
          address: editAddressData.address,
          city: editAddressData.city,
          state: editAddressData.state || null,
          zip_code: editAddressData.zip_code || null,
          country: editAddressData.country || 'USA',
          latitude: updatedLat,
          longitude: updatedLon,
          dateAdded: new Date().toISOString(),
        }).eq('id', id);
      if (error) throw error;
      setEditingRestaurantId(null);
      setEditAddressData(null);
      setRestaurantPage(restaurantPage); // Trigger refetch
    } catch (err) {
      console.error('Error updating restaurant:', err);
      setError(`Failed to update restaurant: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  const deleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure? This deletes the restaurant, its dishes, ratings, and comments.')) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.rpc('delete_restaurant_and_children', { p_restaurant_id: id });
      if (error) throw error;
      setRestaurantPage(1); // Force refetch from page 1
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      if (err instanceof Error && (err.message.includes('404') || err.message.includes('does not exist'))) {
        setError("Database Error: The 'delete_restaurant_and_children' function is missing. Please contact support.");
      } else {
        setError('Failed to delete restaurant. It may have related data that prevents deletion.');
      }
    } finally {
      setLoading(false);
    }
  };
  const startEditDish = (dish: AdminDish) => {
    setEditingDishId(dish.id);
    setEditName(dish.name);
  };
  const updateDish = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('restaurant_dishes').update({ name: editName.trim(), updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setEditingDishId(null);
      setDishPage(dishPage); // Trigger refetch
    } catch (err) {
      console.error('Error updating dish:', err);
      setError(`Failed to update dish: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  const createNewDish = async (name: string, restaurantId: string, successCallback?: (newDish: AdminDish) => void) => {
    if (!name.trim() || !user) {
        setError('Dish name cannot be empty.');
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const { data: newDishData, error: insertError } = await supabase
            .from('restaurant_dishes')
            .insert({ name: name.trim(), restaurant_id: restaurantId, created_by: user.id })
            .select('id, name, created_at')
            .single();

        if (insertError) throw insertError;
        
        setNewDishName('');
        setSimilarDishesForModal([]);
        setDishDataForModal(null);
        
        if (successCallback && newDishData) {
            successCallback(newDishData);
        } else {
            alert('Dish added successfully!');
        }
    } catch (err) {
        console.error('Error adding dish:', err);
        setError(`Failed to add dish: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        setLoading(false);
    }
  };
  const handleAttemptAddDish = async (restaurantId: string, successCallback?: (newDish: AdminDish) => void) => {
    const name = newDishName.trim();
    if (!name) {
        setError("Dish name can't be empty.");
        return;
    }
    setError(null);
    try {
      // For simplicity in admin, we'll use a simpler check than on the main app
      const { data: existingDishes, error: dishError } = await supabase
        .from('restaurant_dishes')
        .select('id, name')
        .eq('restaurant_id', restaurantId);

      if (dishError) {
          setError('Could not check for existing dishes.');
          return;
      }

      // FIX: Construct a full DishWithDetails object to satisfy the type
      const dishesToSearch: DishWithDetails[] = (existingDishes || []).map(d => ({
        id: d.id,
        name: d.name,
        restaurant_id: restaurantId,
        description: null,
        category: null,
        is_active: true,
        created_by: null,
        verified_by_restaurant: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        comments: [],
        ratings: [],
        photos: [],
        total_ratings: 0,
        average_rating: 0,
        dateAdded: new Date().toISOString(),
      }));

      const similar = findSimilarDishes(dishesToSearch, name, 75);

      if (similar.length > 0) {
          setDishDataForModal({ name, restaurantId });
          setSimilarDishesForModal(similar);
      } else {
          await createNewDish(name, restaurantId, successCallback);
      }
    } catch (err) {
        console.error("Error during add dish attempt:", err);
        setError(`An unexpected error occurred while checking for duplicate dishes: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  // MODIFIED: Optimistic delete for "All Dishes" tab
  const deleteDish = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish and all its ratings/comments?')) return;
    
    const originalDishes = [...dishes];
    const originalTotal = dishTotal;

    // Optimistically update UI
    setDishes(prevDishes => prevDishes.filter(dish => dish.id !== id));
    setDishTotal(prevTotal => (prevTotal > 0 ? prevTotal - 1 : 0));
    setError(null);

    try {
      const { error } = await supabase.from('restaurant_dishes').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting dish:', err);
      setError(`Failed to delete dish. Reverting changes. Error: ${err instanceof Error ? err.message : String(err)}`);
      // Revert UI on failure
      setDishes(originalDishes);
      setDishTotal(originalTotal);
    }
  };
  const deleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('dish_comments').delete().eq('id', id);
      if (error) throw error;
      setCommentPage(commentPage); // Force refetch
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(`Failed to delete comment: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  const toggleCommentVisibility = async (commentId: string, isHidden: boolean) => {
    setLoading(true);
    setError(null);
    try {
        const { error } = await supabase
            .from('dish_comments')
            .update({
                is_hidden: !isHidden,
                hidden_at: !isHidden ? new Date().toISOString() : null,
                hidden_by: !isHidden ? user?.id : null,
            })
            .eq('id', commentId);
        if (error) throw error;
        // Update local state to avoid a full refetch
        setComments(prevComments =>
            prevComments.map(c =>
                c.id === commentId ? { ...c, is_hidden: !isHidden } : c
            )
        );
    } catch (err) {
        console.error('Error updating comment visibility:', err);
        setError(`Failed to update comment: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        setLoading(false);
    }
  };
  const handleAnalyticsSort = (key: keyof UserActivity) => {
    setAnalyticsSort(prevSort => {
        if (prevSort.key === key) {
            return { key, direction: prevSort.direction === 'asc' ? 'desc' : 'asc' };
        }
        const defaultDirection = ['fullName', 'email'].includes(key) ? 'asc' : 'desc';
        return { key, direction: defaultDirection };
    });
  };
  useEffect(() => {
    const sorted = [...rawAnalyticsData].sort((a, b) => {
        const { key, direction } = analyticsSort;
        const valA = a[key];
        const valB = b[key];
        let comparison = 0;
        // Place null/undefined values at the bottom
        if (valA == null && valB != null) return 1;
        if (valA != null && valB == null) return -1;
        if (valA == null && valB == null) return 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
        } else {
            // Safely convert to string for comparison
            comparison = String(valA).localeCompare(String(valB));
        }
        return direction === 'asc' ? comparison : -comparison;
    });
    setSortedAnalyticsData(sorted);
  }, [rawAnalyticsData, analyticsSort]);
  const fetchAnalyticsData = async () => {
    setIsAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
        const startDate = `${analyticsStartDate} 00:00:00+00`;
        const endDate = `${analyticsEndDate} 23:59:59+00`;
        const { data: users, error: usersError } = await supabase.from('users').select('id, full_name, email');
        if (usersError) throw usersError;
        if (!users) {
            setRawAnalyticsData([]);
            return;
        }
        const userActivityMap = new Map<string, UserActivity>();
        users.forEach(user => {
            userActivityMap.set(user.id, {
                userId: user.id,
                fullName: user.full_name,
                email: user.email,
                restaurantsViewed: 0,
                restaurantsAdded: 0,
                dishesRated: 0,
                dishesCommented: 0,
                dishesAdded: 0,
            });
        });
        const [
            viewsRes,
            addsRes,
            ratingsRes,
            commentsRes,
            dishAddsRes
        ] = await Promise.all([
            supabase.from('user_restaurant_visits').select('user_id').gte('visited_at', startDate).lte('visited_at', endDate),
            supabase.from('restaurants').select('created_by').gte('created_at', startDate).lte('created_at', endDate).not('created_by', 'is', null),
            supabase.from('dish_ratings').select('user_id').gte('created_at', startDate).lte('created_at', endDate),
            supabase.from('dish_comments').select('user_id').gte('created_at', startDate).lte('created_at', endDate),
            supabase.from('restaurant_dishes').select('created_by').gte('created_at', startDate).lte('created_at', endDate).not('created_by', 'is', null)
        ]);
        if (viewsRes.error) throw viewsRes.error;
        viewsRes.data?.forEach(item => {
            if (item.user_id) {
                const activity = userActivityMap.get(item.user_id);
                if (activity) activity.restaurantsViewed++;
            }
        });
        if (addsRes.error) throw addsRes.error;
        addsRes.data?.forEach(item => {
            if (item.created_by) {
                const activity = userActivityMap.get(item.created_by);
                if (activity) activity.restaurantsAdded++;
            }
        });
        if (ratingsRes.error) throw ratingsRes.error;
        ratingsRes.data?.forEach(item => {
            if (item.user_id) {
                const activity = userActivityMap.get(item.user_id);
                if (activity) activity.dishesRated++;
            }
        });
        if (commentsRes.error) throw commentsRes.error;
        commentsRes.data?.forEach(item => {
            if (item.user_id) {
                const activity = userActivityMap.get(item.user_id);
                if (activity) activity.dishesCommented++;
            }
        });
        if (dishAddsRes.error) throw dishAddsRes.error;
        dishAddsRes.data?.forEach(item => {
            if (item.created_by) {
                const activity = userActivityMap.get(item.created_by);
                if (activity) activity.dishesAdded++;
            }
        });
        setRawAnalyticsData(Array.from(userActivityMap.values()));
    } catch(err) {
        setAnalyticsError(`Failed to load analytics: ${err instanceof Error ? err.message : String(err)}`);
        console.error(err);
    } finally {
        setIsAnalyticsLoading(false);
    }
  };

  // --- NEW handlers for the "Dishes for Restaurant" view ---
  const updateDishInRestaurantView = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('restaurant_dishes').update({ name: editName.trim(), updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setRestaurantSpecificDishes(prev => prev.map(d =>
        d.id === id ? { ...d, name: editName.trim() } : d
      ));
      setEditingDishId(null);
    } catch (err) {
      console.error('Error updating dish:', err);
      setError(`Failed to update dish: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  const deleteDishFromRestaurantView = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;
    const originalDishes = [...restaurantSpecificDishes];
    setRestaurantSpecificDishes(prevDishes => prevDishes.filter(dish => dish.id !== id));
    setError(null);
    try {
      const { error } = await supabase.from('restaurant_dishes').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting dish:', err);
      setError(`Failed to delete dish. Reverting changes. Error: ${err instanceof Error ? err.message : String(err)}`);
      setRestaurantSpecificDishes(originalDishes);
    }
  };

  if (!isAdmin) {
    return (
      <div style={SCREEN_STYLES.admin.accessDeniedContainer}>
        <h2 style={SCREEN_STYLES.admin.accessDeniedTitle}>Access Denied</h2>
        <p style={SCREEN_STYLES.admin.accessDeniedText}>You do not have permission to access this page.</p>
      </div>
    );
  }
  const SortableHeader: React.FC<{
    title: string;
    sortKey: keyof UserActivity;
    align?: 'left' | 'center' | 'right';
  }> = ({ title, sortKey, align = 'left' }) => {
    const isSorting = analyticsSort.key === sortKey;
    const directionIcon = analyticsSort.direction === 'asc' ? ' ▲' : ' ▼';
    return (
        <th style={STYLE_FUNCTIONS.getSortableHeaderStyle(align)} onClick={() => handleAnalyticsSort(sortKey)}>
            {title}{isSorting && directionIcon}
        </th>
    );
  };
  // --- NEW: Render "Dishes for Restaurant" view if a restaurant is selected ---
  if (viewingDishesForRestaurant) {
    return (
        <div style={SCREEN_STYLES.admin.container}>
            <button
                onClick={() => setViewingDishesForRestaurant(null)}
                style={SCREEN_STYLES.admin.backButton}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                Back to All Restaurants
            </button>
            <h1 style={SCREEN_STYLES.admin.titleWithMargin}>Dishes for {viewingDishesForRestaurant.name}</h1>

            {error && <div style={SCREEN_STYLES.admin.errorContainer} onClick={() => setError(null)}><strong>Error:</strong> {error} (click to dismiss)</div>}
            
            {showAddDishFormForRestaurant ? (
                <div style={SCREEN_STYLES.admin.section}>
                    <h2 style={SCREEN_STYLES.admin.sectionTitle}>Add New Dish</h2>
                    <div style={SCREEN_STYLES.admin.formGrid}>
                        <input
                            type="text"
                            placeholder="New Dish Name *"
                            value={newDishName}
                            onChange={(e) => setNewDishName(e.target.value)}
                            style={STYLES.input}
                        />
                         <div style={SCREEN_STYLES.admin.flexEnd}>
                             <button onClick={() => setShowAddDishFormForRestaurant(false)} style={{...SCREEN_STYLES.admin.button, background: COLORS.border, color: COLORS.textPrimary }}>Cancel</button>
                             <button
                                 onClick={() => handleAttemptAddDish(viewingDishesForRestaurant.id, (newDish) => {
                                     const newAdminDish: AdminDish = { ...newDish, restaurant_name: viewingDishesForRestaurant.name };
                                     setRestaurantSpecificDishes(prev => [...prev, newAdminDish].sort((a,b) => a.name.localeCompare(b.name)));
                                     setShowAddDishFormForRestaurant(false);
                                 })}
                                 disabled={loading}
                                 style={{ ...SCREEN_STYLES.admin.button, background: COLORS.primary, color: COLORS.white }}
                             >
                                 Add
                             </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: SPACING[6] }}>
                    <button onClick={() => setShowAddDishFormForRestaurant(true)} style={SCREEN_STYLES.admin.fullWidthPrimaryButton}>Add New Dish</button>
                </div>
            )}


            <h2 style={SCREEN_STYLES.admin.h2WithMargin}>Existing Dishes ({restaurantSpecificDishes.length})</h2>
            {loadingRestaurantSpecificDishes ? (
                <p style={TYPOGRAPHY.body}>Loading dishes...</p>
            ) : (
                <div style={SCREEN_STYLES.admin.formGrid}>
                    {restaurantSpecificDishes.length > 0 ? restaurantSpecificDishes.map((dish) => (
                        <div key={dish.id} style={SCREEN_STYLES.admin.itemCard}>
                        {editingDishId === dish.id ? (
                            <div style={SCREEN_STYLES.admin.formGrid}>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={STYLES.input}/>
                                <div style={SCREEN_STYLES.admin.itemCardActions}>
                                    <button onClick={() => updateDishInRestaurantView(dish.id)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.primary, color: COLORS.white }}>Save</button>
                                    <button onClick={() => setEditingDishId(null)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.border, color: COLORS.textPrimary }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 style={SCREEN_STYLES.admin.itemCardTitle}>{dish.name}</h3>
                                <div style={SCREEN_STYLES.admin.itemCardActions}>
                                    <button onClick={() => startEditDish(dish)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.primary, color: COLORS.white }}>Edit</button>
                                    <button onClick={() => deleteDishFromRestaurantView(dish.id)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.error, color: COLORS.white }}>Delete</button>
                                </div>
                            </div>
                        )}
                        </div>
                    )) : (
                        <p style={TYPOGRAPHY.body}>No dishes found for this restaurant.</p>
                    )}
                </div>
            )}
        </div>
    );
  }

  return (
    <div style={SCREEN_STYLES.admin.container}>
      <h1 style={SCREEN_STYLES.admin.title}>Admin Panel</h1>
      <div style={SCREEN_STYLES.admin.tabsContainer}>
        <button onClick={() => setActiveTab('restaurants')} style={STYLE_FUNCTIONS.getTabButtonStyle(activeTab === 'restaurants')}>Restaurants</button>
        <button onClick={() => setActiveTab('dishes')} style={STYLE_FUNCTIONS.getTabButtonStyle(activeTab === 'dishes')}>Dishes</button>
        <button onClick={() => setActiveTab('comments')} style={STYLE_FUNCTIONS.getTabButtonStyle(activeTab === 'comments')}>Comments</button>
        <button onClick={() => setActiveTab('analytics')} style={STYLE_FUNCTIONS.getTabButtonStyle(activeTab === 'analytics')}>Analytics</button>
      </div>
      {error && <div style={SCREEN_STYLES.admin.errorContainer} onClick={() => setError(null)}><strong>Error:</strong> {error} (click to dismiss)</div>}
      {activeTab === 'restaurants' && (
        <div>
          <div style={SCREEN_STYLES.admin.section}>
            <div style={SCREEN_STYLES.admin.sectionHeader}>
              <h2 style={SCREEN_STYLES.admin.sectionTitle}>Add New Restaurant</h2>
              {(newRestaurantName || newAddressData.fullAddress) && (
                <button onClick={handleResetNewRestaurantForm} style={SCREEN_STYLES.admin.resetButton} onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.primary; e.currentTarget.style.transform = 'rotate(-90deg) scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textSecondary; e.currentTarget.style.transform = 'rotate(0deg) scale(1)'; }} aria-label="Reset form" title="Reset form" >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
                </button>
              )}
            </div>
            <div style={SCREEN_STYLES.admin.formGrid}>
              <input type="text" placeholder="Restaurant Name *" value={newRestaurantName} onChange={(e) => setNewRestaurantName(e.target.value)} style={STYLES.input} />
              <AddressInput key={addressInputKey} initialData={newAddressData} onAddressChange={handleNewAddressChange} />
              <button onClick={handleAttemptAddRestaurant} disabled={loading} style={STYLE_FUNCTIONS.getAddRestaurantButtonStyle(loading)}>Add Restaurant</button>
            </div>
          </div>
          <div style={{ marginBottom: SPACING[4] }}>
            <h2 style={SCREEN_STYLES.admin.h2WithMargin}>Existing Restaurants ({!loading ? restaurantTotal : '...'})</h2>
            <div style={SCREEN_STYLES.admin.relativeContainer}>
              <input type="text" placeholder="Search by name, city, or address..." value={restaurantSearchTerm} onChange={(e) => setRestaurantSearchTerm(e.target.value)} style={STYLES.input} />
              {restaurantSearchTerm && (
                <button onClick={() => setRestaurantSearchTerm('')} style={SCREEN_STYLES.admin.clearSearchButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41l5.59 5.59L5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              )}
            </div>
          </div>
          {loading && activeTab === 'restaurants' && <p style={TYPOGRAPHY.body}>Loading...</p>}
          {!loading && (
            <>
              <div style={SCREEN_STYLES.admin.formGrid}>
                {restaurants.length > 0 ? restaurants.map((restaurant) => {
                    const createdAt = new Date(restaurant.created_at);
                    const updatedAt = new Date(restaurant.dateAdded || restaurant.created_at);
                    const wasUpdated = updatedAt.getTime() - createdAt.getTime() > 60000;
                    return (
                      <div key={restaurant.id} style={SCREEN_STYLES.admin.itemCard}>
                        {editingRestaurantId === restaurant.id && editAddressData ? (
                          <div style={SCREEN_STYLES.admin.formGrid}>
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={STYLES.input} />
                            <AddressInput key={editAddressInputKey} initialData={editAddressData} onAddressChange={handleEditAddressChange} />
                            <div style={SCREEN_STYLES.admin.itemCardActions}>
                              <button onClick={() => updateRestaurant(restaurant.id)} style={{...SCREEN_STYLES.admin.button, background: COLORS.primary, color: COLORS.white }}>Save</button>
                              <button onClick={() => setEditingRestaurantId(null)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.border, color: COLORS.textPrimary }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 style={{ ...SCREEN_STYLES.admin.itemCardTitle, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/restaurants/${restaurant.id}`)}>{restaurant.name} {restaurant.manually_added && <span style={SCREEN_STYLES.admin.manuallyAddedBadge}>(Manually Added)</span>}</h3>
                            <p style={SCREEN_STYLES.admin.itemCardSubtitle}>{restaurant.full_address || [restaurant.address, restaurant.city, restaurant.state, restaurant.zip_code, restaurant.country].filter(Boolean).join(', ')}</p>
                            <p style={SCREEN_STYLES.admin.itemCardSubtitleWithMargin}>Added: {createdAt.toLocaleDateString()} {wasUpdated && `• Updated: ${updatedAt.toLocaleDateString()}`}</p>
                            <div style={SCREEN_STYLES.admin.flexBetweenWrap}>
                                <div style={SCREEN_STYLES.admin.itemCardActions}>
                                  <button onClick={() => startEditRestaurant(restaurant)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.primary, color: COLORS.white }}>Edit</button>
                                  <button onClick={() => deleteRestaurant(restaurant.id)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.error, color: COLORS.white }}>Delete</button>
                                </div>
                                <button onClick={() => setViewingDishesForRestaurant(restaurant)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.success, color: COLORS.white }}>See Dishes</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                  <p style={TYPOGRAPHY.body}>No restaurants found matching your criteria.</p>
                )}
              </div>
              <PaginationControls currentPage={restaurantPage} totalItems={restaurantTotal} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setRestaurantPage} loading={loading} />
            </>
          )}
        </div>
      )}
      {activeTab === 'dishes' && (
        <div>
            <div style={{ marginBottom: SPACING[4] }}>
                <h2 style={SCREEN_STYLES.admin.h2WithMargin}>All Dishes ({!loading ? dishTotal : '...'})</h2>
                <div style={SCREEN_STYLES.admin.relativeContainer}>
                  <input type="text" placeholder="Search by dish name..." value={dishSearchTerm} onChange={(e) => setDishSearchTerm(e.target.value)} style={STYLES.input} />
                  {dishSearchTerm && (
                    <button onClick={() => setDishSearchTerm('')} style={SCREEN_STYLES.admin.clearSearchButton}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41l5.59 5.59L5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  )}
                </div>
            </div>
            {loading ? (
                <p style={TYPOGRAPHY.body}>Loading...</p>
            ) : (
                <>
                  <div style={SCREEN_STYLES.admin.formGrid}>
                      {dishes.length > 0 ? dishes.map((dish) => (
                          <div key={dish.id} style={SCREEN_STYLES.admin.itemCard}>
                          {editingDishId === dish.id ? (
                              <div style={SCREEN_STYLES.admin.formGrid}>
                              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={STYLES.input}/>
                              <div style={SCREEN_STYLES.admin.itemCardActions}>
                                  <button onClick={() => updateDish(dish.id)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.primary, color: COLORS.white }}>Save</button>
                                  <button onClick={() => setEditingDishId(null)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.border, color: COLORS.textPrimary }}>Cancel</button>
                              </div>
                              </div>
                          ) : (
                              <div>
                              <h3 style={SCREEN_STYLES.admin.itemCardTitle}>{dish.name}</h3>
                              <p style={SCREEN_STYLES.admin.itemCardSubtitle}>Restaurant: {dish.restaurant_name || 'Unknown'}</p>
                              <div style={SCREEN_STYLES.admin.itemCardActions}>
                                  <button onClick={() => startEditDish(dish)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.primary, color: COLORS.white }}>Edit</button>
                                  <button onClick={() => deleteDish(dish.id)} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.error, color: COLORS.white }}>Delete</button>
                              </div>
                              </div>
                          )}
                          </div>
                      )) : (
                          <p style={TYPOGRAPHY.body}>No dishes found matching your criteria.</p>
                      )}
                  </div>
                  <PaginationControls currentPage={dishPage} totalItems={dishTotal} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setDishPage} loading={loading} />
                </>
            )}
        </div>
      )}
      {activeTab === 'comments' && (
        <>
            <h2 style={SCREEN_STYLES.admin.h2WithMargin}>All Comments ({!loading ? commentTotal : '...'})</h2>
            <div style={SCREEN_STYLES.admin.gridTwoColumn}>
                <div style={SCREEN_STYLES.admin.relativeContainer}>
                    <input type="text" placeholder="Filter by Restaurant Name..." value={commentRestaurantSearch} onChange={(e) => setCommentRestaurantSearch(e.target.value)} style={STYLES.input} />
                    {commentRestaurantSearch && <button onClick={() => setCommentRestaurantSearch('')} style={SCREEN_STYLES.admin.clearSearchButton}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41l5.59 5.59L5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>}
                </div>
                <div style={SCREEN_STYLES.admin.relativeContainer}>
                    <input type="text" placeholder="Filter by Dish Name..." value={commentDishSearch} onChange={(e) => setCommentDishSearch(e.target.value)} style={STYLES.input} />
                    {commentDishSearch && <button onClick={() => setCommentDishSearch('')} style={SCREEN_STYLES.admin.clearSearchButton}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41l5.59 5.59L5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>}
                </div>
            </div>
            {loading ? ( <p style={TYPOGRAPHY.body}>Loading...</p>) : (
                <>
                <div style={SCREEN_STYLES.admin.formGrid}>
                    {comments.map((comment) => (
                    <div key={comment.id} style={STYLE_FUNCTIONS.getCommentItemStyle(comment.is_hidden)}>
                        <p style={{ ...TYPOGRAPHY.body, marginBottom: SPACING[2] }}>"{comment.comment}"</p>
                        <p style={SCREEN_STYLES.admin.itemCardSubtitle}>
                            By: {comment.username || 'Unknown'} | Dish: <span style={SCREEN_STYLES.admin.link} onClick={() => comment.restaurant_id && navigate(`/restaurants/${comment.restaurant_id}?dish=${comment.dish_id}`)}>{comment.dish_name || 'Unknown'}</span> | Restaurant: <span style={SCREEN_STYLES.admin.link} onClick={() => comment.restaurant_id && navigate(`/restaurants/${comment.restaurant_id}`)}>{comment.restaurant_name || 'Unknown'}</span>
                        </p>
                        <div style={SCREEN_STYLES.admin.flexGapCenter}>
                            <button onClick={() => deleteComment(comment.id)} disabled={loading} style={{ ...SCREEN_STYLES.admin.button, background: COLORS.error, color: COLORS.white }}>Delete</button>
                            <button onClick={() => toggleCommentVisibility(comment.id, comment.is_hidden)} disabled={loading} style={STYLE_FUNCTIONS.getToggleCommentVisibilityButtonStyle(comment.is_hidden)}>
                                {comment.is_hidden ? 'Unhide' : 'Hide'}
                            </button>
                            {comment.is_hidden && <span style={SCREEN_STYLES.admin.hiddenCommentBadge}>HIDDEN</span>}
                        </div>
                    </div>
                    ))}
                </div>
                <PaginationControls currentPage={commentPage} totalItems={commentTotal} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCommentPage} loading={loading} />
                </>
            )}
        </>
      )}
      {activeTab === 'analytics' && (
          <div>
              <h2 style={SCREEN_STYLES.admin.h2WithMargin}>User Activity Analytics</h2>
              <div style={SCREEN_STYLES.admin.analyticsDateFilterContainer}>
                  <div>
                      <label htmlFor="start-date" style={SCREEN_STYLES.admin.analyticsDateLabel}>Start Date</label>
                      <input id="start-date" type="date" value={analyticsStartDate} onChange={e => setAnalyticsStartDate(e.target.value)} style={SCREEN_STYLES.admin.analyticsDateInput} />
                  </div>
                  <div>
                      <label htmlFor="end-date" style={SCREEN_STYLES.admin.analyticsDateLabel}>End Date</label>
                      <input id="end-date" type="date" value={analyticsEndDate} onChange={e => setAnalyticsEndDate(e.target.value)} style={SCREEN_STYLES.admin.analyticsDateInput} />
                  </div>
                  <button onClick={fetchAnalyticsData} disabled={isAnalyticsLoading} style={STYLE_FUNCTIONS.getFetchAnalyticsButtonStyle(isAnalyticsLoading)}>
                      {isAnalyticsLoading ? 'Loading...' : 'Fetch Activity'}
                  </button>
              </div>
              {analyticsError && <div style={SCREEN_STYLES.admin.errorContainer}>{analyticsError}</div>}
              {isAnalyticsLoading && <p>Loading analytics data...</p>}
              {!isAnalyticsLoading && sortedAnalyticsData.length > 0 && (
                  <div style={SCREEN_STYLES.admin.analyticsTableContainer}>
                      <table style={SCREEN_STYLES.admin.analyticsTable}>
                          <thead>
                              <tr style={SCREEN_STYLES.admin.analyticsTableHeaderRow}>
                                  <SortableHeader title="Full Name" sortKey="fullName" />
                                  <SortableHeader title="Email" sortKey="email" />
                                  <SortableHeader title="Restaurants Viewed" sortKey="restaurantsViewed" align="center" />
                                  <SortableHeader title="Restaurants Added" sortKey="restaurantsAdded" align="center" />
                                  <SortableHeader title="Dishes Rated" sortKey="dishesRated" align="center" />
                                  <SortableHeader title="Dishes Commented" sortKey="dishesCommented" align="center" />
                                  <SortableHeader title="Dishes Added" sortKey="dishesAdded" align="center" />
                              </tr>
                          </thead>
                          <tbody>
                              {sortedAnalyticsData.map(user => (
                                  <tr key={user.userId} style={SCREEN_STYLES.admin.analyticsTableRow}>
                                      <td style={SCREEN_STYLES.admin.analyticsTableCellName}>{user.fullName || <span style={{color: COLORS.textSecondary}}>N/A</span>}</td>
                                      <td style={SCREEN_STYLES.admin.tableCell}>{user.email}</td>
                                      <td style={SCREEN_STYLES.admin.analyticsTableCellCentered}>{user.restaurantsViewed}</td>
                                      <td style={SCREEN_STYLES.admin.analyticsTableCellCentered}>{user.restaurantsAdded}</td>
                                      <td style={SCREEN_STYLES.admin.analyticsTableCellCentered}>{user.dishesRated}</td>
                                      <td style={SCREEN_STYLES.admin.analyticsTableCellCentered}>{user.dishesCommented}</td>
                                      <td style={SCREEN_STYLES.admin.analyticsTableCellCentered}>{user.dishesAdded}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
              {!isAnalyticsLoading && sortedAnalyticsData.length === 0 && !analyticsError && (
                <div style={SCREEN_STYLES.admin.analyticsEmptyStateContainer}>
                    <p style={TYPOGRAPHY.body}>No data to display.</p>
                    <p style={SCREEN_STYLES.admin.analyticsEmptyStateSubtext}>Select a date range and click "Fetch Activity" to load user data.</p>
                </div>
              )}
          </div>
      )}
      <DuplicateRestaurantModal
        isOpen={similarRestaurants.length > 0}
        newRestaurantName={newRestaurantData?.name || ''}
        similarRestaurants={similarRestaurants}
        onCreateNew={() => newRestaurantData && createNewRestaurant(newRestaurantData)}
        onUseExisting={(restaurant) => {
            navigate(`/restaurants/${restaurant.id}`);
            setSimilarRestaurants([]);
            setNewRestaurantData(null);
        }}
        onCancel={() => {
            setSimilarRestaurants([]);
            setNewRestaurantData(null);
        }}
      />
      <DuplicateDishModal
        isOpen={similarDishesForModal.length > 0}
        newDishName={dishDataForModal?.name || ''}
        similarDishes={similarDishesForModal}
        onCreateNew={() => {
            if (dishDataForModal && viewingDishesForRestaurant) {
                // FIX: Use type assertion to explicitly tell TypeScript this is a Restaurant type
                const restaurantName = (viewingDishesForRestaurant as Restaurant).name;
                createNewDish(dishDataForModal.name, dishDataForModal.restaurantId, (newDish: AdminDish) => {
                    const newAdminDish: AdminDish = { ...newDish, restaurant_name: restaurantName };
                    setRestaurantSpecificDishes(prev => [...prev, newAdminDish].sort((a,b) => a.name.localeCompare(b.name)));
                });
            } else if (dishDataForModal) {
                createNewDish(dishDataForModal.name, dishDataForModal.restaurantId, () => setDishPage(1));
            }
        }}
        onUseExisting={(dish) => {
            alert(`Please use the existing dish "${dish.name}". No new dish was created.`);
            setSimilarDishesForModal([]);
            setDishDataForModal(null);
        }}
        onCancel={() => {
            setSimilarDishesForModal([]);
            setDishDataForModal(null);
        }}
      />
    </div>
  );
};
export default AdminScreen;