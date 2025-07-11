// src/components/restaurant/AddRestaurantForm.tsx
import React, { useState } from 'react';
import { COLORS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';
import type { AddressFormData } from '../../types/address';
import type { Restaurant } from '../../types/restaurant';
import AddressInput from '../shared/AddressInput';


interface AddRestaurantFormProps {
  initialName?: string;
  onSave: (data: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}


const AddRestaurantForm: React.FC<AddRestaurantFormProps> = ({
  initialName = '',
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialName);
  const [addressData, setAddressData] = useState<AddressFormData>({
    fullAddress: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
  });
  const [error, setError] = useState('');


  const handleSave = () => {
    if (!name.trim()) {
      setError('Restaurant name is required.');
      return;
    }
    setError('');


    const newRestaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> = {
      name: name.trim(),
      address: addressData.address || null,
      full_address: addressData.fullAddress || null,
      city: addressData.city || null,
      state: addressData.state || null,
      zip_code: addressData.zip_code || null,
      country: addressData.country || null,
      latitude: null, // Will be geocoded in the hook
      longitude: null, // Will be geocoded in the hook
      manually_added: true,
      dateAdded: new Date().toISOString(),
      // --- FIX: geoapify_place_id should be null, not undefined ---
      geoapify_place_id: null,
      phone: null,
      website_url: null,
      rating: null,
      price_tier: null,
      category: null,
      opening_hours: null,
      created_by: null, // This will be set by the hook/service
    };
    onSave(newRestaurantData);
  };


  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 space-y-4">
      {error && <p style={{ color: COLORS.danger, textAlign: 'center' }}>{error}</p>}
      <div>
        <label style={{...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING[1], display: 'block'}}>
          Restaurant Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., The French Laundry"
          style={STYLES.input}
          autoFocus
        />
      </div>


      <AddressInput initialData={{}} onAddressChange={setAddressData} />


      <div style={{ display: 'flex', gap: SPACING[3], marginTop: SPACING[4] }}>
        <button
          onClick={onCancel}
          style={{ ...STYLES.secondaryButton, flex: 1, borderColor: COLORS.gray300, color: COLORS.text }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{ ...STYLES.primaryButton, flex: 1, border: 'none', backgroundColor: COLORS.primary }}
        >
          Save Restaurant
        </button>
      </div>
    </div>
  );
};


export default AddRestaurantForm;