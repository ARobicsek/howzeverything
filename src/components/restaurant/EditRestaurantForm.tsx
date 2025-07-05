// src/components/restaurant/EditRestaurantForm.tsx
import React, { useCallback, useState } from 'react';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';
import type { AddressFormData } from '../../types/address';
import type { Restaurant } from '../../types/restaurant';
import AddressInput from '../shared/AddressInput';


interface EditRestaurantFormProps {
  restaurant: Restaurant;
  onSave: (restaurantId: string, updatedData: Partial<Restaurant>) => Promise<void>;
  onCancel: () => void;
}


const EditRestaurantForm: React.FC<EditRestaurantFormProps> = ({ restaurant, onSave, onCancel }) => {
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


  const handleAddressChange = useCallback((data: AddressFormData) => {
    setAddressData(data);
  }, []);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;
   
    setIsSaving(true);
    try {
      await onSave(restaurant.id, {
        name: name.trim(),
        ...addressData,
      });
    } catch (error) {
      console.error("Failed to save restaurant", error);
      // Optionally show an error to the user via an alert or toast
    } finally {
      // onSave should handle closing the modal on success
      setIsSaving(false);
    }
  };


  return (
    <div style={STYLES.modalOverlay} onClick={onCancel}>
      <div style={{ ...STYLES.modal, maxWidth: '500px', border: `1px solid ${COLORS.border}` }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ ...TYPOGRAPHY.h3, color: COLORS.textPrimary, marginTop: 0, marginBottom: SPACING[5] }}>
          Edit Restaurant
        </h3>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: SPACING[4] }}>
            <label style={{...FONTS.body, display: 'block', fontWeight: TYPOGRAPHY.medium, color: COLORS.textSecondary, marginBottom: SPACING[2]}}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={STYLES.input}
              disabled={isSaving}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: SPACING[6] }}>
            <AddressInput initialData={addressData} onAddressChange={handleAddressChange} />
          </div>
          <div style={{ display: 'flex', gap: SPACING[3], justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} disabled={isSaving} style={{...STYLES.secondaryButton, flex: 1}}>
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || isSaving} style={{...STYLES.primaryButton, flex: 1}}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default EditRestaurantForm;