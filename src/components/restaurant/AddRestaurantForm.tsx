// src/components/restaurant/AddRestaurantForm.tsx
import React, { useState } from 'react';
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
      latitude: null,
      longitude: null,
      manually_added: true,
      dateAdded: new Date().toISOString(),
      geoapify_place_id: null,
      phone: null,
      website_url: null,
      rating: null,
      price_tier: null,
      category: null,
      opening_hours: null,
      created_by: null,
    };
    onSave(newRestaurantData);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 space-y-4">
      {error && <p className="text-danger text-center">{error}</p>}
      <div>
        <label className="text-sm text-textSecondary mb-1 block">
          Restaurant Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., The French Laundry"
          className="w-full p-3 border-2 border-gray-200 rounded-md bg-white text-text"
          autoFocus
        />
      </div>

      <AddressInput
        initialData={{}}
        onAddressChange={setAddressData}
        onNameExtracted={setName}
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-md border-2 border-gray-300 text-text bg-white hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-3 rounded-md border-none text-white bg-primary hover:bg-primary-dark transition-colors"
        >
          Save Restaurant
        </button>
      </div>
    </div>
  );
};

export default AddRestaurantForm;