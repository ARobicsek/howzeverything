// src/AdminScreen.tsx
import { User } from '@supabase/supabase-js';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DuplicateDishModal from './components/DuplicateDishModal';
import DuplicateRestaurantModal from './components/restaurant/DuplicateRestaurantModal';
import AddressInput from './components/shared/AddressInput';
import { BORDERS, COLORS, SHADOWS, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { DishSearchResult, DishWithDetails } from './hooks/useDishes';
import { supabase } from './supabaseClient';
import type { AddressFormData } from './types/address';
import type { Restaurant } from './types/restaurant';
import { findSimilarDishes, getAllRelatedTerms } from './utils/dishSearch';
// Simplified local interface for the admin dish list
interface AdminDish {
  id: string;
  name: string;
  restaurant_name?: string;
  created_at: string | null;
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: SPACING[2], marginTop: SPACING[4], flexWrap: 'wrap' }}>
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1 || loading}
                style={{...TYPOGRAPHY.button, ...STYLES.sortButtonDefault, cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer'}}
            >
                First
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                style={{...TYPOGRAPHY.button, ...STYLES.sortButtonDefault, cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer'}}
            >
                Previous
            </button>
            <span style={{...TYPOGRAPHY.body, padding: `0 ${SPACING[2]}`}}>
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                style={{...TYPOGRAPHY.button, ...STYLES.sortButtonDefault, cursor: (currentPage === totalPages || loading) ? 'not-allowed' : 'pointer'}}
            >
                Next
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages || loading}
                style={{...TYPOGRAPHY.button, ...STYLES.sortButtonDefault, cursor: (currentPage === totalPages || loading) ? 'not-allowed' : 'pointer'}}
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
  const [addingDishToRestaurantId, setAddingDishToRestaurantId] = useState<string | null>(null);
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
  // --- THE FIX: Refactored data fetching logic ---
  useEffect(() => {
    if (!isAdmin || activeTab === 'analytics') {
        return;
    }
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'restaurants') {
          const from = (restaurantPage - 1) * ITEMS_PER_PAGE;
          const to = from + ITEMS_PER_PAGE - 1;
          const term = restaurantSearchTerm.trim();
          let query = supabase.from('restaurants').select('*', { count: 'exact' });
          if (term) {
            query = query.or(`name.ilike.%${term}%,city.ilike.%${term}%,full_address.ilike.%${term}%`);
          }
          const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
          if (error) throw error;
          setRestaurants(data as Restaurant[] || []);
          setRestaurantTotal(count || 0);
        } else if (activeTab === 'dishes') {
          const from = (dishPage - 1) * ITEMS_PER_PAGE;
          const to = from + ITEMS_PER_PAGE - 1;
          const term = dishSearchTerm.trim();
          let query = supabase.from('restaurant_dishes').select(`id, name, created_at, restaurants (name)`, { count: 'exact' });
          if (term.length >= 2) {
              const expandedTerms = getAllRelatedTerms(term).slice(0, 10);
              const orFilter = expandedTerms.map((t: string) => `name.ilike.%${t.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`).join(',');
              query = query.or(orFilter);
          }
          const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
          if (error) throw error;
          setDishes(data?.map(d => ({ id: d.id, name: d.name, created_at: d.created_at, restaurant_name: (d.restaurants as any)?.name })) || []);
          setDishTotal(count || 0);
        } else if (activeTab === 'comments') {
          const from = (commentPage - 1) * ITEMS_PER_PAGE;
          const to = from + ITEMS_PER_PAGE - 1;
          let query = supabase
              .from('dish_comments')
              .select(`
                  *,
                  restaurant_dishes!inner(name, restaurant_id, restaurants!inner(name)),
                  users!dish_comments_user_id_fkey(full_name, email)
              `, { count: 'exact' });
          const restaurantTerm = commentRestaurantSearch.trim();
          const dishTerm = commentDishSearch.trim();
          const foreignTableFilters: string[] = [];
          if (restaurantTerm) {
            foreignTableFilters.push(`restaurants.name.ilike.%${restaurantTerm}%`);
          }
          if (dishTerm.length >= 2) {
            const expandedTerms = getAllRelatedTerms(dishTerm).slice(0, 10);
            const dishOrFilter = expandedTerms.map(t => `name.ilike.%${t.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`).join(',');
            if (expandedTerms.length > 0) {
              foreignTableFilters.push(`or(${dishOrFilter})`);
            }
          }
          // --- THE FIX: Build a single filter string and apply it to avoid TS error and runtime bug ---
          if (foreignTableFilters.length > 0) {
            const filterString = foreignTableFilters.length > 1
                ? `and(${foreignTableFilters.join(',')})`
                : foreignTableFilters[0];
            query = query.or(filterString, { foreignTable: 'restaurant_dishes' });
          }
          const { data, error, count } = await query
              .order('created_at', { ascending: false })
              .range(from, to);
          if (error) throw error;
          setComments(data?.map(c => {
              const dishInfo = c.restaurant_dishes as any;
              return {
                  id: c.id,
                  comment: c.comment_text,
                  created_at: c.created_at,
                  dish_id: c.dish_id || '',
                  dish_name: dishInfo?.name,
                  restaurant_id: dishInfo?.restaurant_id,
                  restaurant_name: dishInfo?.restaurants?.name,
                  user_id: c.user_id,
                  username: (c.users as any)?.full_name || (c.users as any)?.email,
                  is_hidden: c.is_hidden ?? false,
              };
          }) || []);
          setCommentTotal(count || 0);
        }
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
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
      commentPage
  ]);
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
    } catch (err: any) {
      console.error('Error adding restaurant:', err);
      setError(`Failed to add restaurant: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const findSimilarRestaurantsAdmin = async (name: string, city?: string | null) => {
    let query = supabase
        .from('restaurants')
        .select('*')
        .ilike('name', `%${name.trim()}%`);
    if (city) {
        query = query.ilike('city', `%${city.trim()}%`);
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
    } catch (err: any) {
        console.error("Error during add restaurant attempt:", err);
        setError(`An unexpected error occurred while checking for duplicates: ${err.message}`);
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
    } catch (err: any) {
      console.error('Error updating restaurant:', err);
      setError(`Failed to update restaurant: ${err.message}`);
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
    } catch (err: any) {
      console.error('Error deleting restaurant:', err);
      if (err.message && (err.message.includes('404') || err.message.includes('does not exist'))) {
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
    } catch (err: any) {
      console.error('Error updating dish:', err);
      setError(`Failed to update dish: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const createNewDish = async (name: string, restaurantId: string) => {
    if (!name.trim() || !user) {
        setError('Dish name cannot be empty.');
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const { error: insertError } = await supabase
            .from('restaurant_dishes')
            .insert({ name: name.trim(), restaurant_id: restaurantId, created_by: user.id });
        if (insertError) throw insertError;
        setNewDishName('');
        setAddingDishToRestaurantId(null);
        setSimilarDishesForModal([]);
        setDishDataForModal(null);
        alert('Dish added successfully!');
    } catch (err: any) {
        console.error('Error adding dish:', err);
        setError(`Failed to add dish: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };
  const handleAttemptAddDish = async (restaurantId: string) => {
    const name = newDishName.trim();
    if (!name) {
        setError("Dish name can't be empty.");
        return;
    }
    setError(null);
    try {
      const { data: restaurantDishesRaw, error: dishError } = await supabase
          .from('restaurant_dishes')
          .select('*, dish_comments(*), dish_ratings(*), dish_photos(*)')
          .eq('restaurant_id', restaurantId);
      if (dishError) {
          setError('Could not check for existing dishes.');
          return;
      }
      const dishesToSearch: DishWithDetails[] = (restaurantDishesRaw || []).map(d => {
        const ratings = (d as any).dish_ratings || [];
        const total_ratings = ratings.length;
        const average_rating = total_ratings > 0
            ? ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / total_ratings
            : 0;
        return {
          id: d.id,
          restaurant_id: d.restaurant_id || '',
          name: d.name || '',
          description: d.description,
          category: d.category,
          is_active: d.is_active ?? true,
          created_by: d.created_by,
          verified_by_restaurant: d.verified_by_restaurant ?? false,
          created_at: d.created_at || new Date().toISOString(),
          updated_at: d.updated_at || new Date().toISOString(),
          comments: (d as any).dish_comments || [],
          ratings: ratings,
          photos: (d as any).dish_photos || [],
          total_ratings: total_ratings,
          average_rating: Math.round(average_rating * 10) / 10,
          dateAdded: d.created_at || new Date().toISOString(),
        };
      });
      const similar = findSimilarDishes(dishesToSearch, name, 75);
      if (similar.length > 0) {
          setDishDataForModal({ name, restaurantId });
          setSimilarDishesForModal(similar);
      } else {
          await createNewDish(name, restaurantId);
      }
    } catch (err: any) {
        console.error("Error during add dish attempt:", err);
        setError(`An unexpected error occurred while checking for duplicate dishes: ${err.message}`);
    }
  };
  const deleteDish = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish and all its ratings/comments?')) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('restaurant_dishes').delete().eq('id', id);
      if (error) throw error;
      setDishPage(1); // Force refetch
    } catch (err: any) {
      console.error('Error deleting dish:', err);
      setError(`Failed to delete dish: ${err.message}`);
    } finally {
      setLoading(false);
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
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(`Failed to delete comment: ${err.message}`);
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
    } catch (err: any) {
        console.error('Error updating comment visibility:', err);
        setError(`Failed to update comment: ${err.message}`);
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
    } catch(err: any) {
        setAnalyticsError(`Failed to load analytics: ${err.message}`);
        console.error(err);
    } finally {
        setIsAnalyticsLoading(false);
    }
  };
  if (!isAdmin) {
    return (
      <div style={{ padding: SPACING[4], textAlign: 'center' }}>
        <h2 style={{ ...TYPOGRAPHY.h2, color: COLORS.error }}>Access Denied</h2>
        <p style={{ ...TYPOGRAPHY.body, marginTop: SPACING[2] }}>You do not have permission to access this page.</p>
      </div>
    );
  }
  const tableHeaderStyle: React.CSSProperties = {
    ...TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.semibold,
    padding: SPACING[3],
    textAlign: 'left',
    borderBottom: `2px solid ${COLORS.border}`
  };
  const SortableHeader: React.FC<{
    title: string;
    sortKey: keyof UserActivity;
    align?: 'left' | 'center' | 'right';
  }> = ({ title, sortKey, align = 'left' }) => {
    const isSorting = analyticsSort.key === sortKey;
    const directionIcon = analyticsSort.direction === 'asc' ? ' ▲' : ' ▼';
    return (
        <th style={{...tableHeaderStyle, cursor: 'pointer', whiteSpace: 'nowrap', textAlign: align}} onClick={() => handleAnalyticsSort(sortKey)}>
            {title}{isSorting && directionIcon}
        </th>
    );
  };
  const tableCellStyle: React.CSSProperties = {
    ...TYPOGRAPHY.body,
    padding: SPACING[3],
  };
  const linkStyle: React.CSSProperties = {
    color: COLORS.primary,
    textDecoration: 'underline',
    cursor: 'pointer'
  };
  return (
    <div style={{ padding: SPACING[4], maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ ...TYPOGRAPHY.h1, marginBottom: SPACING[6] }}>Admin Panel</h1>
      <div style={{ display: 'flex', gap: SPACING[2], marginBottom: SPACING[6], borderBottom: `2px solid ${COLORS.border}`, paddingBottom: SPACING[2], flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('restaurants')} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: activeTab === 'restaurants' ? COLORS.primary : 'transparent', color: activeTab === 'restaurants' ? COLORS.white : COLORS.textPrimary, border: 'none', borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`, cursor: 'pointer' }}>Restaurants</button>
        <button onClick={() => setActiveTab('dishes')} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: activeTab === 'dishes' ? COLORS.primary : 'transparent', color: activeTab === 'dishes' ? COLORS.white : COLORS.textPrimary, border: 'none', borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`, cursor: 'pointer' }}>Dishes</button>
        <button onClick={() => setActiveTab('comments')} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: activeTab === 'comments' ? COLORS.primary : 'transparent', color: activeTab === 'comments' ? COLORS.white : COLORS.textPrimary, border: 'none', borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`, cursor: 'pointer' }}>Comments</button>
        <button onClick={() => setActiveTab('analytics')} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: activeTab === 'analytics' ? COLORS.primary : 'transparent', color: activeTab === 'analytics' ? COLORS.white : COLORS.textPrimary, border: 'none', borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`, cursor: 'pointer' }}>Analytics</button>
      </div>
      {error && <div style={{...TYPOGRAPHY.body, color: COLORS.error, background: `${COLORS.error}10`, padding: SPACING[4], borderRadius: BORDERS.radius.medium, marginBottom: SPACING[4], cursor: 'pointer' }} onClick={() => setError(null)}><strong>Error:</strong> {error} (click to dismiss)</div>}
      {activeTab === 'restaurants' && (
        <div>
          <div style={{ background: COLORS.surface, padding: SPACING[6], borderRadius: BORDERS.radius.large, marginBottom: SPACING[6], boxShadow: SHADOWS.small }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING[4] }}>
              <h2 style={{ ...TYPOGRAPHY.h2, margin: 0 }}>Add New Restaurant</h2>
              {(newRestaurantName || newAddressData.fullAddress) && (
                <button onClick={handleResetNewRestaurantForm} style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', color: COLORS.textSecondary, transition: 'color 0.2s ease, transform 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.primary; e.currentTarget.style.transform = 'rotate(-90deg) scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textSecondary; e.currentTarget.style.transform = 'rotate(0deg) scale(1)'; }} aria-label="Reset form" title="Reset form" >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gap: SPACING[4] }}>
              <input type="text" placeholder="Restaurant Name *" value={newRestaurantName} onChange={(e) => setNewRestaurantName(e.target.value)} style={STYLES.input} />
              <AddressInput key={addressInputKey} initialData={newAddressData} onAddressChange={handleNewAddressChange} />
              <button onClick={handleAttemptAddRestaurant} disabled={loading} style={{ ...TYPOGRAPHY.button, padding: SPACING[4], background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.medium, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>Add Restaurant</button>
            </div>
          </div>
          <div style={{ marginBottom: SPACING[4] }}>
            <h2 style={{ ...TYPOGRAPHY.h2, marginBottom: SPACING[4] }}>Existing Restaurants ({!loading ? restaurantTotal : '...'})</h2>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Search by name, city, or address..." value={restaurantSearchTerm} onChange={(e) => setRestaurantSearchTerm(e.target.value)} style={STYLES.input} />
              {restaurantSearchTerm && (
                <button onClick={() => setRestaurantSearchTerm('')} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: COLORS.textSecondary }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41l5.59 5.59L5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              )}
            </div>
          </div>
          {loading && activeTab === 'restaurants' && <p style={TYPOGRAPHY.body}>Loading...</p>}
          {!loading && (
            <>
              <div style={{ display: 'grid', gap: SPACING[4] }}>
                {restaurants.length > 0 ? restaurants.map((restaurant) => {
                    const createdAt = new Date(restaurant.created_at);
                    const updatedAt = new Date(restaurant.dateAdded || restaurant.created_at);
                    const wasUpdated = updatedAt.getTime() - createdAt.getTime() > 60000;
                    return (
                      <div key={restaurant.id} style={{ background: COLORS.surface, padding: SPACING[4], borderRadius: BORDERS.radius.medium, boxShadow: SHADOWS.small }}>
                        {editingRestaurantId === restaurant.id && editAddressData ? (
                          <div style={{ display: 'grid', gap: SPACING[2] }}>
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={STYLES.input} />
                            <AddressInput key={editAddressInputKey} initialData={editAddressData} onAddressChange={handleEditAddressChange} />
                            <div style={{ display: 'flex', gap: SPACING[2] }}>
                              <button onClick={() => updateRestaurant(restaurant.id)} style={{...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Save</button>
                              <button onClick={() => setEditingRestaurantId(null)} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.border, color: COLORS.textPrimary, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 style={{ ...TYPOGRAPHY.h3, marginBottom: SPACING[2], cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/restaurants/${restaurant.id}`)}>{restaurant.name} {restaurant.manually_added && <span style={{ ...TYPOGRAPHY.caption, color: COLORS.primary, marginLeft: SPACING[2] }}>(Manually Added)</span>}</h3>
                            <p style={{ ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING[2] }}>{restaurant.full_address || [restaurant.address, restaurant.city, restaurant.state, restaurant.zip_code, restaurant.country].filter(Boolean).join(', ')}</p>
                            <p style={{ ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING[4], fontSize: '0.75rem' }}>Added: {createdAt.toLocaleDateString()} {wasUpdated && `• Updated: ${updatedAt.toLocaleDateString()}`}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SPACING[2], flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', gap: SPACING[2] }}>
                                  <button onClick={() => startEditRestaurant(restaurant)} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Edit</button>
                                  <button onClick={() => deleteRestaurant(restaurant.id)} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.error, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Delete</button>
                                </div>
                                <button onClick={() => { setAddingDishToRestaurantId(restaurant.id); setNewDishName(''); }} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.success, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Add Dish</button>
                            </div>
                            {addingDishToRestaurantId === restaurant.id && (
                                <div style={{ marginTop: SPACING[4], borderTop: `1px solid ${COLORS.border}`, paddingTop: SPACING[4] }}>
                                  <h4 style={{ ...TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.semibold, marginBottom: SPACING[2] }}>Add new dish to {restaurant.name}</h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[2] }}>
                                      <input type="text" placeholder="New Dish Name" value={newDishName} onChange={(e) => setNewDishName(e.target.value)} style={STYLES.input}/>
                                      <div style={{ display: 'flex', gap: SPACING[2], justifyContent: 'flex-end' }}>
                                          <button onClick={() => setAddingDishToRestaurantId(null)} style={{...TYPOGRAPHY.button, background: COLORS.border, color: COLORS.textPrimary, border: 'none', borderRadius: BORDERS.radius.small, padding: `${SPACING[2]} ${SPACING[4]}` }}>Cancel</button>
                                          <button onClick={() => handleAttemptAddDish(restaurant.id)} disabled={loading} style={{...TYPOGRAPHY.button, background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, padding: `${SPACING[2]} ${SPACING[4]}` }}>Add</button>
                                      </div>
                                  </div>
                                </div>
                            )}
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
                <h2 style={{ ...TYPOGRAPHY.h2, marginBottom: SPACING[4] }}>All Dishes ({!loading ? dishTotal : '...'})</h2>
                <div style={{ position: 'relative' }}>
                  <input type="text" placeholder="Search by dish name..." value={dishSearchTerm} onChange={(e) => setDishSearchTerm(e.target.value)} style={STYLES.input} />
                  {dishSearchTerm && (
                    <button onClick={() => setDishSearchTerm('')} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: COLORS.textSecondary }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41l5.59 5.59L5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  )}
                </div>
            </div>
            {loading ? (
                <p style={TYPOGRAPHY.body}>Loading...</p>
            ) : (
                <>
                  <div style={{ display: 'grid', gap: SPACING[4] }}>
                      {dishes.length > 0 ? dishes.map((dish) => (
                          <div key={dish.id} style={{ background: COLORS.surface, padding: SPACING[4], borderRadius: BORDERS.radius.medium, boxShadow: SHADOWS.small }}>
                          {editingDishId === dish.id ? (
                              <div style={{ display: 'grid', gap: SPACING[2] }}>
                              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={STYLES.input}/>
                              <div style={{ display: 'flex', gap: SPACING[2] }}>
                                  <button onClick={() => updateDish(dish.id)} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Save</button>
                                  <button onClick={() => setEditingDishId(null)} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.border, color: COLORS.textPrimary, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Cancel</button>
                              </div>
                              </div>
                          ) : (
                              <div>
                              <h3 style={{ ...TYPOGRAPHY.h3, marginBottom: SPACING[2] }}>{dish.name}</h3>
                              <p style={{ ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING[2] }}>Restaurant: {dish.restaurant_name || 'Unknown'}</p>
                              <div style={{ display: 'flex', gap: SPACING[2] }}>
                                  <button onClick={() => startEditDish(dish)} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Edit</button>
                                  <button onClick={() => deleteDish(dish.id)} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.error, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Delete</button>
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
            <h2 style={{ ...TYPOGRAPHY.h2, marginBottom: SPACING[4] }}>All Comments ({!loading ? commentTotal : '...'})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING[4], marginBottom: SPACING[4] }}>
                <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="Filter by Restaurant Name..." value={commentRestaurantSearch} onChange={(e) => setCommentRestaurantSearch(e.target.value)} style={STYLES.input} />
                    {commentRestaurantSearch && <button onClick={() => setCommentRestaurantSearch('')} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: COLORS.textSecondary }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41l5.59 5.59L5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>}
                </div>
                <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="Filter by Dish Name..." value={commentDishSearch} onChange={(e) => setCommentDishSearch(e.target.value)} style={STYLES.input} />
                    {commentDishSearch && <button onClick={() => setCommentDishSearch('')} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: COLORS.textSecondary }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41l5.59 5.59L5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>}
                </div>
            </div>
            {loading ? ( <p style={TYPOGRAPHY.body}>Loading...</p>) : (
                <>
                <div style={{ display: 'grid', gap: SPACING[4] }}>
                    {comments.map((comment) => (
                    <div key={comment.id} style={{ background: comment.is_hidden ? COLORS.gray100 : COLORS.surface, padding: SPACING[4], borderRadius: BORDERS.radius.medium, boxShadow: SHADOWS.small, opacity: comment.is_hidden ? 0.7 : 1 }}>
                        <p style={{ ...TYPOGRAPHY.body, marginBottom: SPACING[2] }}>"{comment.comment}"</p>
                        <p style={{ ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING[2] }}>
                            By: {comment.username || 'Unknown'} | Dish: <span style={linkStyle} onClick={() => comment.restaurant_id && navigate(`/restaurants/${comment.restaurant_id}?dish=${comment.dish_id}`)}>{comment.dish_name || 'Unknown'}</span> | Restaurant: <span style={linkStyle} onClick={() => comment.restaurant_id && navigate(`/restaurants/${comment.restaurant_id}`)}>{comment.restaurant_name || 'Unknown'}</span>
                        </p>
                        <div style={{display: 'flex', gap: SPACING[2], alignItems: 'center'}}>
                            <button onClick={() => deleteComment(comment.id)} disabled={loading} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.error, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Delete</button>
                            <button onClick={() => toggleCommentVisibility(comment.id, comment.is_hidden)} disabled={loading} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: comment.is_hidden ? COLORS.success : COLORS.warning, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>
                                {comment.is_hidden ? 'Unhide' : 'Hide'}
                            </button>
                            {comment.is_hidden && <span style={{...TYPOGRAPHY.caption, color: COLORS.error, fontWeight: 'bold'}}>HIDDEN</span>}
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
              <h2 style={{ ...TYPOGRAPHY.h2, marginBottom: SPACING[4] }}>User Activity Analytics</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACING[4], alignItems: 'center', background: COLORS.surface, padding: SPACING[4], borderRadius: BORDERS.radius.medium, marginBottom: SPACING[6] }}>
                  <div>
                      <label htmlFor="start-date" style={{...TYPOGRAPHY.caption, display: 'block', marginBottom: SPACING[1]}}>Start Date</label>
                      <input id="start-date" type="date" value={analyticsStartDate} onChange={e => setAnalyticsStartDate(e.target.value)} style={{...STYLES.input, width: 'auto'}} />
                  </div>
                  <div>
                      <label htmlFor="end-date" style={{...TYPOGRAPHY.caption, display: 'block', marginBottom: SPACING[1]}}>End Date</label>
                      <input id="end-date" type="date" value={analyticsEndDate} onChange={e => setAnalyticsEndDate(e.target.value)} style={{...STYLES.input, width: 'auto'}} />
                  </div>
                  <button onClick={fetchAnalyticsData} disabled={isAnalyticsLoading} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[3]} ${SPACING[4]}`, background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.medium, cursor: isAnalyticsLoading ? 'not-allowed' : 'pointer', alignSelf: 'flex-end', opacity: isAnalyticsLoading ? 0.6 : 1 }}>
                      {isAnalyticsLoading ? 'Loading...' : 'Fetch Activity'}
                  </button>
              </div>
              {analyticsError && <div style={{...TYPOGRAPHY.body, color: COLORS.error, background: `${COLORS.error}10`, padding: SPACING[4], borderRadius: BORDERS.radius.medium, marginBottom: SPACING[4]}}>{analyticsError}</div>}
              {isAnalyticsLoading && <p>Loading analytics data...</p>}
              {!isAnalyticsLoading && sortedAnalyticsData.length > 0 && (
                  <div style={{ overflowX: 'auto', background: COLORS.surface, borderRadius: BORDERS.radius.medium, padding: SPACING[2] }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                          <thead>
                              <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
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
                                  <tr key={user.userId} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                                      <td style={{...tableCellStyle, fontWeight: TYPOGRAPHY.medium}}>{user.fullName || <span style={{color: COLORS.textSecondary}}>N/A</span>}</td>
                                      <td style={tableCellStyle}>{user.email}</td>
                                      <td style={{...tableCellStyle, textAlign: 'center'}}>{user.restaurantsViewed}</td>
                                      <td style={{...tableCellStyle, textAlign: 'center'}}>{user.restaurantsAdded}</td>
                                      <td style={{...tableCellStyle, textAlign: 'center'}}>{user.dishesRated}</td>
                                      <td style={{...tableCellStyle, textAlign: 'center'}}>{user.dishesCommented}</td>
                                      <td style={{...tableCellStyle, textAlign: 'center'}}>{user.dishesAdded}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
              {!isAnalyticsLoading && sortedAnalyticsData.length === 0 && !analyticsError && (
                <div style={{ textAlign: 'center', padding: SPACING[8], background: COLORS.surface, borderRadius: BORDERS.radius.medium }}>
                    <p style={TYPOGRAPHY.body}>No data to display.</p>
                    <p style={{...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: SPACING[2]}}>Select a date range and click "Fetch Activity" to load user data.</p>
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
            if (dishDataForModal) {
                createNewDish(dishDataForModal.name, dishDataForModal.restaurantId);
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