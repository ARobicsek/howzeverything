// src/components/restaurant/EditRestaurantForm.tsx
import React, { useCallback, useState } from 'react';
import { useRestaurants } from '../../hooks/useRestaurants';
import type { AddressFormData } from '../../types/address';
import type { Restaurant } from '../../types/restaurant';
import AddressInput from '../shared/AddressInput';

interface EditRestaurantFormProps {
  restaurant: Restaurant;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditRestaurantForm: React.FC<EditRestaurantFormProps> = ({ restaurant, onSuccess, onCancel }) => {
  const [name, setName] = useState(restaurant.name);
  const [addressData, setAddressData] = useState<AddressFormData>({
    fullAddress: restaurant.full_address || restaurant.address || '',
    address: restaurant.address || '',
    city: restaurant.city || '',
    state: restaurant.state || '',
    zip_code: restaurant.zip_code || '',
    country: restaurant.country || 'USA',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { updateRestaurant } = useRestaurants({ initialFetch: false });

  const handleAddressChange = useCallback((data: AddressFormData) => {
    setAddressData(data);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;
   
    setIsSaving(true);
    try {
      const success = await updateRestaurant(restaurant.id, {
        name: name.trim(),
        full_address: addressData.fullAddress,
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.zip_code,
        country: addressData.country,
      });

      if (success) {
        onSuccess();
      } else {
        alert("Failed to save changes. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save restaurant", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-modal flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-lg p-6 max-w-lg w-full border border-border animate-slide-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-heading text-textPrimary mt-0 mb-5">
          Edit Restaurant
        </h3>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="font-body block font-medium text-textSecondary mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-md bg-white text-text"
              disabled={isSaving}
              autoFocus
            />
          </div>
          <div className="mb-6">
            <AddressInput initialData={addressData} onAddressChange={handleAddressChange} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onCancel} disabled={isSaving} className="flex-1 px-4 py-3 rounded-md border-2 border-gray-300 text-text bg-white hover:bg-gray-100 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || isSaving} className="flex-1 px-4 py-3 rounded-md border-none text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRestaurantForm;