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
import { findSimilarDishes } from './utils/dishSearch';




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
  user_id: string;
  username?: string;
}




interface AdminScreenProps {
  user: User | null;
}




interface GeocodedCoordinates {
  lat: number;
  lon: number;
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




const AdminScreen: React.FC<AdminScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes' | 'comments'>('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<AdminDish[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const [restaurantSearchTerm, setRestaurantSearchTerm] = useState('');
  const [dishSearchTerm, setDishSearchTerm] = useState('');




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




  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'restaurants') {
        const term = restaurantSearchTerm.trim();
        let query = supabase.from('restaurants').select('*');
        if (term) {
          query = query.or(`name.ilike.%${term}%,city.ilike.%${term}%,full_address.ilike.%${term}%`);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        setRestaurants(data as Restaurant[] || []);
      } else if (activeTab === 'dishes') {
        const term = dishSearchTerm.trim();
        let query = supabase.from('restaurant_dishes').select(`id, name, created_at, restaurants (name)`);
        if (term) {
            query = query.ilike('name', `%${term}%`);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        setDishes(data?.map(d => ({ id: d.id, name: d.name, created_at: d.created_at, restaurant_name: (d.restaurants as any)?.name })) || []);
      } else if (activeTab === 'comments') {
        const { data, error } = await supabase.from('dish_comments').select(`*, restaurant_dishes (name, restaurants (name)), users!dish_comments_user_id_fkey (full_name, email)`).order('created_at', { ascending: false });
        if (error) throw error;
        setComments(data?.map(c => ({ ...c, comment: c.comment_text, dish_name: (c.restaurant_dishes as any)?.name, restaurant_name: (c.restaurant_dishes as any)?.restaurants?.name, username: (c.users as any)?.full_name || (c.users as any)?.email })) || []);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, restaurantSearchTerm, dishSearchTerm]);




  useEffect(() => {
    if (isAdmin) {
      const isSearching = (activeTab === 'restaurants' && restaurantSearchTerm) || (activeTab === 'dishes' && dishSearchTerm);
      const timer = setTimeout(() => {
        loadData();
      }, isSearching ? 500 : 0);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, loadData]);




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
      await loadData();
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
    if (!newAddressData.fullAddress.trim()) {
        setError('Address cannot be empty.');
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
          // Add missing nullable properties to satisfy the type
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
      loadData();
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
      loadData();
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
      loadData();
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
      loadData();
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
      loadData();
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(`Failed to delete comment: ${err.message}`);
    } finally {
      setLoading(false);
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




  return (
    <div style={{ padding: SPACING[4], maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ ...TYPOGRAPHY.h1, marginBottom: SPACING[6] }}>Admin Panel</h1>
      <div style={{ display: 'flex', gap: SPACING[2], marginBottom: SPACING[6], borderBottom: `2px solid ${COLORS.border}`, paddingBottom: SPACING[2] }}>
        <button onClick={() => setActiveTab('restaurants')} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: activeTab === 'restaurants' ? COLORS.primary : 'transparent', color: activeTab === 'restaurants' ? COLORS.white : COLORS.textPrimary, border: 'none', borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`, cursor: 'pointer' }}>Restaurants</button>
        <button onClick={() => setActiveTab('dishes')} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: activeTab === 'dishes' ? COLORS.primary : 'transparent', color: activeTab === 'dishes' ? COLORS.white : COLORS.textPrimary, border: 'none', borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`, cursor: 'pointer' }}>Dishes</button>
        <button onClick={() => setActiveTab('comments')} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: activeTab === 'comments' ? COLORS.primary : 'transparent', color: activeTab === 'comments' ? COLORS.white : COLORS.textPrimary, border: 'none', borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`, cursor: 'pointer' }}>Comments</button>
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
            <h2 style={{ ...TYPOGRAPHY.h2, marginBottom: SPACING[4] }}>Existing Restaurants ({!loading ? restaurants.length : '...'})</h2>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Search by name, city, or address..." value={restaurantSearchTerm} onChange={(e) => setRestaurantSearchTerm(e.target.value)} style={STYLES.input} disabled={loading}/>
              {restaurantSearchTerm && (
                <button onClick={() => setRestaurantSearchTerm('')} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: COLORS.textSecondary }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41l5.59 5.59L5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              )}
            </div>
          </div>
          {loading && activeTab === 'restaurants' && <p style={TYPOGRAPHY.body}>Loading...</p>}
          {!loading && (
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
          )}
        </div>
      )}




      {activeTab === 'dishes' && (
        <div>
            <div style={{ marginBottom: SPACING[4] }}>
                <h2 style={{ ...TYPOGRAPHY.h2, marginBottom: SPACING[4] }}>All Dishes ({!loading ? dishes.length : '...'})</h2>
                <input type="text" placeholder="Search by dish name..." value={dishSearchTerm} onChange={(e) => setDishSearchTerm(e.target.value)} style={STYLES.input} />
            </div>
            {loading ? (
                <p style={TYPOGRAPHY.body}>Loading...</p>
            ) : (
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
            )}
        </div>
      )}




      {activeTab === 'comments' && !loading && (
        <div style={{ display: 'grid', gap: SPACING[4] }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ background: COLORS.surface, padding: SPACING[4], borderRadius: BORDERS.radius.medium, boxShadow: SHADOWS.small }}>
              <p style={{ ...TYPOGRAPHY.body, marginBottom: SPACING[2] }}>"{comment.comment}"</p>
              <p style={{ ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING[2] }}>By: {comment.username || 'Unknown'} | Dish: {comment.dish_name || 'Unknown'} | Restaurant: {comment.restaurant_name || 'Unknown'}</p>
              <button onClick={() => deleteComment(comment.id)} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.error, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
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