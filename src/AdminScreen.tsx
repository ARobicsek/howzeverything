import { User } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { BORDERS, COLORS, SHADOWS, SPACING, STYLES, TYPOGRAPHY } from './constants'; // Added STYLES import
import { supabase } from './supabaseClient';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string; // Added country
  manually_added: boolean;
  created_at: string;
}

interface Dish {
  id: string;
  name: string;
  restaurant_id: string;
  restaurant_name?: string;
  created_at: string;
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

const AdminScreen: React.FC<AdminScreenProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes' | 'comments'>('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states for adding restaurant
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [newRestaurantAddress, setNewRestaurantAddress] = useState('');
  const [newRestaurantCity, setNewRestaurantCity] = useState('');
  const [newRestaurantState, setNewRestaurantState] = useState('');
  const [newRestaurantZip, setNewRestaurantZip] = useState('');
  const [newRestaurantCountry, setNewRestaurantCountry] = useState('United States'); // Default to USA
  
  // Edit states
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZip, setEditZip] = useState('');
  const [editCountry, setEditCountry] = useState('');

  // Check if user is admin (you may want to implement proper admin role checking)
  const isAdmin = user?.email && ['admin@howzeverything.com', 'ari.robicsek@gmail.com'].includes(user.email);

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
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setRestaurants(data || []);
      } else if (activeTab === 'dishes') {
        const { data, error } = await supabase
          .from('restaurant_dishes')
          .select(`
            *,
            restaurants (
              name
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setDishes(data?.map(d => ({
          ...d,
          restaurant_name: d.restaurants?.name
        })) || []);
      } else if (activeTab === 'comments') {
        const { data, error } = await supabase
          .from('dish_comments')
          .select(`
            *,
            restaurant_dishes (
              name,
              restaurants (
                name
              )
            ),
            users (
              username
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setComments(data?.map(c => ({
          ...c,
          dish_name: c.restaurant_dishes?.name,
          restaurant_name: c.restaurant_dishes?.restaurants?.name,
          username: c.users?.username
        })) || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addRestaurant = async () => {
    // Only name, address and city are strictly required for manual entry. State/Zip/Country can be optional.
    if (!newRestaurantName.trim() || !newRestaurantAddress.trim() || !newRestaurantCity.trim()) {
      setError('Please fill in Restaurant Name, Street Address, and City.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('restaurants')
        .insert({
          name: newRestaurantName.trim(),
          address: newRestaurantAddress.trim(),
          city: newRestaurantCity.trim(),
          state: newRestaurantState.trim() || null, // Optional
          zip_code: newRestaurantZip.trim() || null, // Optional
          country: newRestaurantCountry.trim() || null, // Optional
          manually_added: true,
          // Add empty coordinates for manually added restaurants
          latitude: 0,
          longitude: 0
        });

      if (error) throw error;

      // Clear form
      setNewRestaurantName('');
      setNewRestaurantAddress('');
      setNewRestaurantCity('');
      setNewRestaurantState('');
      setNewRestaurantZip('');
      setNewRestaurantCountry('United States'); // Reset to default
      
      // Reload data
      loadData();
    } catch (err) {
      console.error('Error adding restaurant:', err);
      setError('Failed to add restaurant');
    } finally {
      setLoading(false);
    }
  };

  const startEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurantId(restaurant.id);
    setEditName(restaurant.name);
    setEditAddress(restaurant.address);
    setEditCity(restaurant.city);
    setEditState(restaurant.state);
    setEditZip(restaurant.zip_code || '');
    setEditCountry(restaurant.country || '');
  };

  const updateRestaurant = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: editName.trim(),
          address: editAddress.trim(),
          city: editCity.trim(),
          state: editState.trim() || null, // Optional
          zip_code: editZip.trim() || null, // Optional
          country: editCountry.trim() || null, // Optional
        })
        .eq('id', id);

      if (error) throw error;

      setEditingRestaurantId(null);
      loadData();
    } catch (err) {
      console.error('Error updating restaurant:', err);
      setError('Failed to update restaurant');
    } finally {
      setLoading(false);
    }
  };

  const deleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This will also delete all associated dishes, ratings, and comments.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadData();
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      setError('Failed to delete restaurant');
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
      const { error } = await supabase
        .from('restaurant_dishes')
        .update({
          name: editName.trim()
        })
        .eq('id', id);

      if (error) throw error;

      setEditingDishId(null);
      loadData();
    } catch (err) {
      console.error('Error updating dish:', err);
      setError('Failed to update dish');
    } finally {
      setLoading(false);
    }
  };

  const deleteDish = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish? This will also delete all associated ratings and comments.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('restaurant_dishes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadData();
    } catch (err) {
      console.error('Error deleting dish:', err);
      setError('Failed to delete dish');
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('dish_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadData();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: SPACING[4], textAlign: 'center' }}>
        <h2 style={{ ...TYPOGRAPHY.h2, color: COLORS.error }}>Access Denied</h2>
        <p style={{ ...TYPOGRAPHY.body, marginTop: SPACING[2] }}>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: SPACING[4], maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ ...TYPOGRAPHY.h1, marginBottom: SPACING[6] }}>Admin Panel</h1>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: SPACING[2], 
        marginBottom: SPACING[6],
        borderBottom: `2px solid ${COLORS.border}`,
        paddingBottom: SPACING[2]
      }}>
        <button
          onClick={() => setActiveTab('restaurants')}
          style={{
            ...TYPOGRAPHY.button,
            padding: `${SPACING[2]} ${SPACING[4]}`,
            background: activeTab === 'restaurants' ? COLORS.primary : 'transparent',
            color: activeTab === 'restaurants' ? COLORS.white : COLORS.textPrimary,
            border: 'none',
            borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`,
            cursor: 'pointer'
          }}
        >
          Restaurants
        </button>
        <button
          onClick={() => setActiveTab('dishes')}
          style={{
            ...TYPOGRAPHY.button,
            padding: `${SPACING[2]} ${SPACING[4]}`,
            background: activeTab === 'dishes' ? COLORS.primary : 'transparent',
            color: activeTab === 'dishes' ? COLORS.white : COLORS.textPrimary,
            border: 'none',
            borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`,
            cursor: 'pointer'
          }}
        >
          Dishes
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          style={{
            ...TYPOGRAPHY.button,
            padding: `${SPACING[2]} ${SPACING[4]}`,
            background: activeTab === 'comments' ? COLORS.primary : 'transparent',
            color: activeTab === 'comments' ? COLORS.white : COLORS.textPrimary,
            border: 'none',
            borderRadius: `${BORDERS.radius.medium} ${BORDERS.radius.medium} 0 0`,
            cursor: 'pointer'
          }}
        >
          Comments
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          ...TYPOGRAPHY.body,
          color: COLORS.error,
          background: `${COLORS.error}10`,
          padding: SPACING[4],
          borderRadius: BORDERS.radius.medium,
          marginBottom: SPACING[4]
        }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: SPACING[6] }}>
          <p style={TYPOGRAPHY.body}>Loading...</p>
        </div>
      )}

      {/* Restaurants Tab */}
      {activeTab === 'restaurants' && !loading && (
        <div>
          {/* Add Restaurant Form */}
          <div style={{
            background: COLORS.surface,
            padding: SPACING[6],
            borderRadius: BORDERS.radius.large,
            marginBottom: SPACING[6],
            boxShadow: SHADOWS.small
          }}>
            <h2 style={{ ...TYPOGRAPHY.h2, marginBottom: SPACING[4] }}>Add New Restaurant</h2>
            <div style={{ display: 'grid', gap: SPACING[4] }}>
              <input
                type="text"
                placeholder="Restaurant Name *"
                value={newRestaurantName}
                onChange={(e) => setNewRestaurantName(e.target.value)}
                style={STYLES.input} // Use STYLES.input for consistent sizing
              />
              <input
                type="text"
                placeholder="Street Address *"
                value={newRestaurantAddress}
                onChange={(e) => setNewRestaurantAddress(e.target.value)}
                style={STYLES.input} // Use STYLES.input for consistent sizing
              />
              <input
                type="text"
                placeholder="City *"
                value={newRestaurantCity}
                onChange={(e) => setNewRestaurantCity(e.target.value)}
                style={STYLES.input} // Use STYLES.input for consistent sizing
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: SPACING[2] }}>
                <input
                  type="text"
                  placeholder="State (Optional)"
                  value={newRestaurantState}
                  onChange={(e) => setNewRestaurantState(e.target.value)}
                  style={STYLES.input} // Use STYLES.input for consistent sizing
                />
                <input
                  type="text"
                  placeholder="ZIP Code (Optional)"
                  value={newRestaurantZip}
                  onChange={(e) => setNewRestaurantZip(e.target.value)}
                  style={STYLES.input} // Use STYLES.input for consistent sizing
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={newRestaurantCountry}
                  onChange={(e) => setNewRestaurantCountry(e.target.value)}
                  style={STYLES.input} // Use STYLES.input for consistent sizing
                />
              </div>
              <button
                onClick={addRestaurant}
                disabled={loading}
                style={{
                  ...TYPOGRAPHY.button,
                  padding: SPACING[4],
                  background: COLORS.primary,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: BORDERS.radius.medium,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Add Restaurant
              </button>
            </div>
          </div>

          {/* Restaurant List */}
          <div style={{ display: 'grid', gap: SPACING[4] }}>
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                style={{
                  background: COLORS.surface,
                  padding: SPACING[4],
                  borderRadius: BORDERS.radius.medium,
                  boxShadow: SHADOWS.small
                }}
              >
                {editingRestaurantId === restaurant.id ? (
                  <div style={{ display: 'grid', gap: SPACING[2] }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={STYLES.input}
                    />
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      style={STYLES.input}
                    />
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      style={STYLES.input}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: SPACING[2] }}>
                      <input
                        type="text"
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                        style={STYLES.input}
                      />
                      <input
                        type="text"
                        value={editZip}
                        onChange={(e) => setEditZip(e.target.value)}
                        style={STYLES.input}
                      />
                      <input
                        type="text"
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        style={STYLES.input}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: SPACING[2] }}>
                      <button
                        onClick={() => updateRestaurant(restaurant.id)}
                        style={{
                          ...TYPOGRAPHY.button,
                          padding: `${SPACING[2]} ${SPACING[4]}`,
                          background: COLORS.primary,
                          color: COLORS.white,
                          border: 'none',
                          borderRadius: BORDERS.radius.small,
                          cursor: 'pointer'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingRestaurantId(null)}
                        style={{
                          ...TYPOGRAPHY.button,
                          padding: `${SPACING[2]} ${SPACING[4]}`,
                          background: COLORS.border,
                          color: COLORS.textPrimary,
                          border: 'none',
                          borderRadius: BORDERS.radius.small,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ ...TYPOGRAPHY.h3, marginBottom: SPACING[2] }}>
                      {restaurant.name}
                      {restaurant.manually_added && (
                        <span style={{
                          ...TYPOGRAPHY.caption,
                          color: COLORS.primary,
                          marginLeft: SPACING[2]
                        }}>
                          (Manually Added)
                        </span>
                      )}
                    </h3>
                    <p style={{ ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING[2] }}>
                      {restaurant.address}, {restaurant.city}, {restaurant.state && `${restaurant.state}, `}{restaurant.zip_code} {restaurant.country}
                    </p>
                    <div style={{ display: 'flex', gap: SPACING[2] }}>
                      <button
                        onClick={() => startEditRestaurant(restaurant)}
                        style={{
                          ...TYPOGRAPHY.button,
                          padding: `${SPACING[2]} ${SPACING[4]}`,
                          background: COLORS.primary,
                          color: COLORS.white,
                          border: 'none',
                          borderRadius: BORDERS.radius.small,
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRestaurant(restaurant.id)}
                        style={{
                          ...TYPOGRAPHY.button,
                          padding: `${SPACING[2]} ${SPACING[4]}`,
                          background: COLORS.error,
                          color: COLORS.white,
                          border: 'none',
                          borderRadius: BORDERS.radius.small,
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dishes Tab */}
      {activeTab === 'dishes' && !loading && (
        <div style={{ display: 'grid', gap: SPACING[4] }}>
          {dishes.map((dish) => (
            <div
              key={dish.id}
              style={{
                background: COLORS.surface,
                padding: SPACING[4],
                borderRadius: BORDERS.radius.medium,
                boxShadow: SHADOWS.small
              }}
            >
              {editingDishId === dish.id ? (
                <div style={{ display: 'grid', gap: SPACING[2] }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={STYLES.input}
                  />
                  <div style={{ display: 'flex', gap: SPACING[2] }}>
                    <button
                      onClick={() => updateDish(dish.id)}
                      style={{
                        ...TYPOGRAPHY.button,
                        padding: `${SPACING[2]} ${SPACING[4]}`,
                        background: COLORS.primary,
                        color: COLORS.white,
                        border: 'none',
                        borderRadius: BORDERS.radius.small,
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingDishId(null)}
                      style={{
                        ...TYPOGRAPHY.button,
                        padding: `${SPACING[2]} ${SPACING[4]}`,
                        background: COLORS.border,
                        color: COLORS.textPrimary,
                        border: 'none',
                        borderRadius: BORDERS.radius.small,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ ...TYPOGRAPHY.h3, marginBottom: SPACING[2] }}>{dish.name}</h3>
                  <p style={{ ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING[2] }}>
                    Restaurant: {dish.restaurant_name || 'Unknown'}
                  </p>
                  <div style={{ display: 'flex', gap: SPACING[2] }}>
                    <button
                      onClick={() => startEditDish(dish)}
                      style={{
                        ...TYPOGRAPHY.button,
                        padding: `${SPACING[2]} ${SPACING[4]}`,
                        background: COLORS.primary,
                        color: COLORS.white,
                        border: 'none',
                        borderRadius: BORDERS.radius.small,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteDish(dish.id)}
                      style={{
                        ...TYPOGRAPHY.button,
                        padding: `${SPACING[2]} ${SPACING[4]}`,
                        background: COLORS.error,
                        color: COLORS.white,
                        border: 'none',
                        borderRadius: BORDERS.radius.small,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && !loading && (
        <div style={{ display: 'grid', gap: SPACING[4] }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: COLORS.surface,
                padding: SPACING[4],
                borderRadius: BORDERS.radius.medium,
                boxShadow: SHADOWS.small
              }}
            >
              <p style={{ ...TYPOGRAPHY.body, marginBottom: SPACING[2] }}>
                "{comment.comment}"
              </p>
              <p style={{ ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING[2] }}>
                By: {comment.username || 'Unknown'} | 
                Dish: {comment.dish_name || 'Unknown'} | 
                Restaurant: {comment.restaurant_name || 'Unknown'}
              </p>
              <button
                onClick={() => deleteComment(comment.id)}
                style={{
                  ...TYPOGRAPHY.button,
                  padding: `${SPACING[2]} ${SPACING[4]}`,
                  background: COLORS.error,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: BORDERS.radius.small,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminScreen;