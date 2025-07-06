// src/components/restaurant/AddRestaurantForm.tsx
import React, { useCallback, useState } from 'react';
import { COLORS, FONTS, SPACING, STYLES } from '../../constants';
import type { AddressFormData } from '../../types/address';
import type { Restaurant } from '../../types/restaurant';
import AddressInput from '../shared/AddressInput';

interface AddRestaurantFormProps {
  initialRestaurantName?: string;
  onSave: (restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const AddRestaurantForm: React.FC<AddRestaurantFormProps> = ({
  initialRestaurantName = '',
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialRestaurantName);
  const [addressData, setAddressData] = useState<AddressFormData>({
    fullAddress: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
  });

  const handleAddressChange = useCallback((data: AddressFormData) => {
    setAddressData(data);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Restaurant name is required.');
      return;
    }

    const restaurantData: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> = {
      name: name.trim(),
      address: addressData.address,
      full_address: addressData.fullAddress,
      city: addressData.city || null,
      state: addressData.state || null,
      zip_code: addressData.zip_code || null,
      country: addressData.country || null,
      latitude: null,
      longitude: null,
      manually_added: true,
      geoapify_place_id: undefined,
    };

    onSave(restaurantData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4">
      <div>
        <label style={{...FONTS.body, display: 'block', fontWeight: 500, color: COLORS.textSecondary, marginBottom: SPACING[2] }}>
          Restaurant Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter restaurant name"
          style={STYLES.input}
          required
          autoFocus
        />
      </div>

      <AddressInput initialData={{}} onAddressChange={handleAddressChange} />
      
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          style={{ ...STYLES.addButton, flex: 1, opacity: !name.trim() ? 0.5 : 1 }}
          disabled={!name.trim()}
          onMouseEnter={(e) => { if (name.trim()) (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primaryHover; }}
          onMouseLeave={(e) => { if (name.trim()) (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.primary; }}
        >
          Add Restaurant
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ ...STYLES.secondaryButton, flex: 1 }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddRestaurantForm;