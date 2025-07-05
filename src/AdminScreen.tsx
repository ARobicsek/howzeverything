// src/AdminScreen.tsx
import { User } from '@supabase/supabase-js';
import React, { useCallback, useEffect, useState } from 'react';
import AddressInput from './components/shared/AddressInput';
import { BORDERS, COLORS, SHADOWS, SPACING, STYLES, TYPOGRAPHY } from './constants';
import { supabase } from './supabaseClient';
import type { AddressFormData } from './types/address';
import type { Restaurant } from './types/restaurant';




// Local interfaces for Admin screen data shapes
interface Dish {
  id: string;
  name: string;
  restaurant_id: string | null;
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
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes' | 'comments'>('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  // Form states for adding restaurant
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [newAddressData, setNewAddressData] = useState<AddressFormData>({
    fullAddress: '', address: '', city: '', state: '', zip_code: '', country: 'USA',
  });
  const [addressInputKey, setAddressInputKey] = useState(Date.now());




  // Edit states
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddressData, setEditAddressData] = useState<AddressFormData | null>(null);
  const [editAddressInputKey, setEditAddressInputKey] = useState(Date.now() + 1);




  const isAdmin = user?.email && ['admin@howzeverything.com', 'ari.robicsek@gmail.com'].includes(user.email);




  const handleNewAddressChange = useCallback((data: AddressFormData) => {
    setNewAddressData(data);
  }, []);
 
  const handleResetNewRestaurantForm = () => {
    setNewRestaurantName('');
    // You don't need to reset the data state here, as changing the key will force
    // the child to re-mount with its default empty state. But we will do it
    // just to be explicit.
    setNewAddressData({ fullAddress: '', address: '', city: '', state: '', zip_code: '', country: 'USA' });
    setError(null);
    // Change the key to a new unique value to force re-mount
    setAddressInputKey(Date.now());
  };




  const handleEditAddressChange = useCallback((data: AddressFormData) => {
    // No need to check for editingRestaurantId, the component won't be rendered anyway
    setEditAddressData(data);
  }, []);




  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [activeTab, isAdmin]);




  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'restaurants') {
        const { data, error } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setRestaurants(data as Restaurant[] || []);
      } else if (activeTab === 'dishes') {
        const { data, error } = await supabase.from('restaurant_dishes').select(`*, restaurants (name)`).order('created_at', { ascending: false });
        if (error) throw error;
        setDishes(data?.map(d => ({ ...d, restaurant_name: (d.restaurants as any)?.name })) || []);
      } else if (activeTab === 'comments') {
        const { data, error } = await supabase.from('dish_comments').select(`*, restaurant_dishes (name, restaurants (name)), users (full_name, email)`).order('created_at', { ascending: false });
        if (error) throw error;
        setComments(data?.map(c => ({ ...c, comment: c.comment_text, dish_name: (c.restaurant_dishes as any)?.name, restaurant_name: (c.restaurant_dishes as any)?.restaurants?.name, username: (c.users as any)?.full_name || (c.users as any)?.email })) || []);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };




  const addRestaurant = async () => {
    if (!newRestaurantName.trim() || !newAddressData.address.trim()) {
      setError('Please fill in at least the Restaurant Name and a parsable Address.');
      return;
    }
    setLoading(true);
    setError(null);




    let lat: number | null = null;
    let lon: number | null = null;
    if (newAddressData.fullAddress) {
        try {
            const coords = await geocodeAddress(newAddressData.fullAddress);
            if (coords) {
                lat = coords.lat;
                lon = coords.lon;
            } else {
                console.warn('Could not geocode address. Restaurant will be added without coordinates.');
            }
        } catch (geocodeErr) {
            console.error('Error during geocoding:', geocodeErr);
            setError('Error during geocoding. Restaurant will be added without coordinates.');
        }
    }




    try {
      const { error } = await supabase.from('restaurants').insert({
          name: newRestaurantName.trim(),
          manually_added: true,
          full_address: newAddressData.fullAddress,
          address: newAddressData.address,
          city: newAddressData.city,
          state: newAddressData.state || null,
          zip_code: newAddressData.zip_code || null,
          country: newAddressData.country || 'USA',
          latitude: lat,
          longitude: lon
        }).select().single();


      if (error) throw error;


      handleResetNewRestaurantForm();
      loadData();


    } catch (err: any) {
      console.error('Error adding restaurant:', err);
      setError(`Failed to add restaurant: ${err.message}`);
    } finally {
      setLoading(false);
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
    // Change key to ensure edit form gets fresh initial data
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
            } else {
                console.warn('Could not geocode updated address. Coordinates might be outdated.');
            }
        } catch (geocodeErr) {
            console.error('Error during geocoding:', geocodeErr);
            setError('Error during geocoding. Coordinates might be outdated.');
        }
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
          longitude: updatedLon
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
 
  const startEditDish = (dish: Dish) => {
    setEditingDishId(dish.id);
    setEditName(dish.name);
  };




  const updateDish = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('restaurant_dishes').update({ name: editName.trim() }).eq('id', id);
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
      {error && <div style={{...TYPOGRAPHY.body, color: COLORS.error, background: `${COLORS.error}10`, padding: SPACING[4], borderRadius: BORDERS.radius.medium, marginBottom: SPACING[4] }}>{error}</div>}
      {loading && <div style={{ textAlign: 'center', padding: SPACING[6] }}><p style={TYPOGRAPHY.body}>Loading...</p></div>}
     
      {activeTab === 'restaurants' && !loading && (
        <div>
          <div style={{ background: COLORS.surface, padding: SPACING[6], borderRadius: BORDERS.radius.large, marginBottom: SPACING[6], boxShadow: SHADOWS.small }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING[4] }}>
              <h2 style={{ ...TYPOGRAPHY.h2, margin: 0 }}>Add New Restaurant</h2>
              {(newRestaurantName || newAddressData.fullAddress) && (
                <button
                  onClick={handleResetNewRestaurantForm}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: COLORS.textSecondary,
                    transition: 'color 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.primary; e.currentTarget.style.transform = 'rotate(-90deg) scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textSecondary; e.currentTarget.style.transform = 'rotate(0deg) scale(1)'; }}
                  aria-label="Reset form"
                  title="Reset form"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                  </svg>
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gap: SPACING[4] }}>
              <input type="text" placeholder="Restaurant Name *" value={newRestaurantName} onChange={(e) => setNewRestaurantName(e.target.value)} style={STYLES.input} />
              <AddressInput
                key={addressInputKey}
                initialData={newAddressData}
                onAddressChange={handleNewAddressChange}
              />
              <button onClick={addRestaurant} disabled={loading} style={{ ...TYPOGRAPHY.button, padding: SPACING[4], background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.medium, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                Add Restaurant
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gap: SPACING[4] }}>
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} style={{ background: COLORS.surface, padding: SPACING[4], borderRadius: BORDERS.radius.medium, boxShadow: SHADOWS.small }}>
                {editingRestaurantId === restaurant.id && editAddressData ? (
                  <div style={{ display: 'grid', gap: SPACING[2] }}>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={STYLES.input} />
                    <AddressInput
                      key={editAddressInputKey}
                      initialData={editAddressData}
                      onAddressChange={handleEditAddressChange}
                    />
                    <div style={{ display: 'flex', gap: SPACING[2] }}>
                      <button onClick={() => updateRestaurant(restaurant.id)} style={{...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingRestaurantId(null)} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.border, color: COLORS.textPrimary, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ ...TYPOGRAPHY.h3, marginBottom: SPACING[2] }}>{restaurant.name} {restaurant.manually_added && <span style={{ ...TYPOGRAPHY.caption, color: COLORS.primary, marginLeft: SPACING[2] }}>(Manually Added)</span>}</h3>
                    <p style={{ ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING[2] }}>{restaurant.full_address || [restaurant.address, restaurant.city, restaurant.state, restaurant.zip_code, restaurant.country].filter(Boolean).join(', ')}</p>
                    <div style={{ display: 'flex', gap: SPACING[2] }}>
                      <button onClick={() => startEditRestaurant(restaurant)} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => deleteRestaurant(restaurant.id)} style={{ ...TYPOGRAPHY.button, padding: `${SPACING[2]} ${SPACING[4]}`, background: COLORS.error, color: COLORS.white, border: 'none', borderRadius: BORDERS.radius.small, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}




      {activeTab === 'dishes' && !loading && (
        <div style={{ display: 'grid', gap: SPACING[4] }}>
          {dishes.map((dish) => (
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
          ))}
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
    </div>
  );
};




export default AdminScreen;