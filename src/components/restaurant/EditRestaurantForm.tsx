// src/components/restaurant/EditRestaurantForm.tsx
import React, { useState } from 'react';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';
import type { Restaurant } from '../../types/restaurant';

interface EditRestaurantFormProps {
  restaurant: Restaurant;
  onSave: (restaurantId: string, updatedData: Partial<Pick<Restaurant, 'name' | 'address'>>) => Promise<void>;
  onCancel: () => void;
}

const EditRestaurantForm: React.FC<EditRestaurantFormProps> = ({ restaurant, onSave, onCancel }) => {
  const [name, setName] = useState(restaurant.name);
  const [address, setAddress] = useState(restaurant.address || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(restaurant.id, {
        name: name.trim(),
        address: address.trim(),
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
    <div style={STYLES.modalOverlay}>
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
            <label style={{...FONTS.body, display: 'block', fontWeight: TYPOGRAPHY.medium, color: COLORS.textSecondary, marginBottom: SPACING[2]}}>Address</label>
            <input
              type="text"
              placeholder='Optional street address'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={STYLES.input}
              disabled={isSaving}
            />
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