// src/components/restaurant/AddRestaurantForm.tsx
import React, { useCallback, useState } from 'react';
import { COLORS, FONTS, SPACING, STYLES } from '../../constants';
import type { AddressFormData } from '../../types/address';
import AddressInput from '../shared/AddressInput';


interface AddRestaurantFormProps {
  show: boolean;
  onToggleShow: () => void;
  onSubmit: (data: { name: string } & Partial<AddressFormData>) => Promise<void>;
}


const AddRestaurantForm: React.FC<AddRestaurantFormProps> = ({
  show,
  onToggleShow,
  onSubmit
}) => {
  const [restaurantName, setRestaurantName] = useState('');
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


  const clearForm = () => {
    setRestaurantName('');
    setAddressData({
      fullAddress: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'USA',
    });
  }


  const handleSubmit = async () => {
    if (restaurantName.trim()) {
      await onSubmit({
        name: restaurantName,
        ...addressData
      });
      clearForm();
      // Assuming onToggleShow is called by the parent if form needs to hide after submit
    }
  };


  const handleCancel = () => {
    clearForm();
    onToggleShow();
  };


  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
      {!show ? (
        <div className="flex justify-center">
          <button
            onClick={onToggleShow}
            className="transition-all duration-300 transform hover:scale-105 focus:outline-none w-full"
            style={STYLES.addButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
          >
            + Add New Restaurant
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label style={{...FONTS.elegant, color: COLORS.text, marginBottom: SPACING[2], display: 'block'}}>Restaurant Name</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Enter restaurant name..."
              className="px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50 w-full"
              style={{
                background: 'white',
                fontSize: '1rem',
                ...FONTS.elegant,
                color: COLORS.text
              }}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && restaurantName.trim()) handleSubmit();
              }}
            />
          </div>
          <div>
            <AddressInput initialData={addressData} onAddressChange={handleAddressChange} />
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={!restaurantName.trim()}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
              style={{
                ...STYLES.addButton,
                backgroundColor: !restaurantName.trim() ? COLORS.gray300 : COLORS.primary
              }}
              onMouseEnter={(e) => {
                if (restaurantName.trim()) e.currentTarget.style.backgroundColor = COLORS.primaryHover;
              }}
              onMouseLeave={(e) => {
                if (restaurantName.trim()) e.currentTarget.style.backgroundColor = COLORS.primary;
              }}
            >
              Save Restaurant
            </button>
            <button
              onClick={handleCancel}
              className="py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
              style={{ ...STYLES.secondaryButton, backgroundColor: COLORS.white, color: COLORS.text }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export default AddRestaurantForm;