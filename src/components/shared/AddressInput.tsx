// src/components/shared/AddressInput.tsx
import React, { useCallback, useState } from 'react';
import { COLORS, FONTS, SPACING, STYLES, TYPOGRAPHY } from '../../constants';
import type { AddressFormData } from '../../types/address';
import { parseAddress } from '../../utils/addressParser';

// --- Step 1: Define InputField OUTSIDE the main component ---
// This ensures it has a stable identity across renders and won't cause focus loss.
const InputField = ({
  label,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
}: {
  label: string;
  name: keyof AddressFormData;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}) => (
  <div>
    <label style={{...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING[1], display: 'block'}}>
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value || ''}
      onChange={onChange}
      onBlur={onBlur} // Sync with parent when focus is lost
      placeholder={placeholder}
      style={STYLES.input}
    />
  </div>
);


interface AddressInputProps {
  initialData: Partial<AddressFormData>;
  onAddressChange: (data: AddressFormData) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ initialData, onAddressChange }) => {
  const [formData, setFormData] = useState<AddressFormData>({
    fullAddress: initialData.fullAddress || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    zip_code: initialData.zip_code || '',
    country: initialData.country || 'USA',
  });
 
  const [isParsing, setIsParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  
  const [showParsedFields, setShowParsedFields] = useState(
    !!(initialData.address || initialData.city || initialData.state)
  );
  
  // Memoize the parent callback so it's stable.
  const stableOnAddressChange = useCallback(onAddressChange, []);

  const syncWithParent = () => {
    stableOnAddressChange(formData);
  };

  const handleParseAndSync = () => {
    if (formData.fullAddress.trim() === '') {
      setParseMessage(null);
      setShowParsedFields(false);
      const emptyData = { ...formData, address: '', city: '', state: '', zip_code: '' };
      setFormData(emptyData);
      stableOnAddressChange(emptyData); // Sync the now-empty state with the parent
      return;
    }

    setIsParsing(true);
    setParseMessage(null);
    const result = parseAddress(formData.fullAddress);
    
    const finalData = { ...formData, ...(result.data || {}) };
    
    if (result.success) {
      setParseMessage(null);
    } else {
      setParseMessage({ text: result.error || 'Could not parse address.', type: 'error' });
    }
    
    setFormData(finalData);
    setShowParsedFields(true);
    stableOnAddressChange(finalData); // Sync the final, parsed data with the parent.
    setIsParsing(false);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setParseMessage(null);
  };

  const handleFullAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({...prev, fullAddress: value}));
    if (value.trim() === '') {
        setShowParsedFields(false);
        setParseMessage(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: SPACING[2] }}>
        <label style={{...FONTS.body, display: 'block', fontWeight: TYPOGRAPHY.medium, color: COLORS.textSecondary, marginBottom: SPACING[2]}}>
          Full Address
        </label>
        <textarea
          value={formData.fullAddress}
          onChange={handleFullAddressChange}
          onBlur={handleParseAndSync} // Parse AND sync on blur
          placeholder="e.g., 160 Commonwealth Ave, Boston, MA 02116"
          style={{ ...STYLES.input, minHeight: '80px', resize: 'vertical' }}
          rows={3}
        />
        <div style={{minHeight: '20px', paddingTop: SPACING[1]}}>
          {isParsing && <p style={{...TYPOGRAPHY.caption, color: COLORS.primary}}>Parsing...</p>}
          {parseMessage && <p style={{...TYPOGRAPHY.caption, color: parseMessage.type === 'error' ? COLORS.danger : COLORS.success}}>{parseMessage.text}</p>}
        </div>
      </div>
     
      {showParsedFields && (
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: SPACING[3], marginTop: SPACING[2] }}>
          <p style={{ ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 0, marginBottom: SPACING[3]}}>
            We've parsed the address below. You can edit any field if needed.
          </p>
          <div style={{ marginBottom: SPACING[3] }}>
            <InputField 
              label="Street Address" 
              name="address" 
              value={formData.address} 
              placeholder="e.g., 123 Main St"
              onChange={handleFieldChange}
              onBlur={syncWithParent}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING[3] }}>
            <InputField 
              label="City" 
              name="city" 
              value={formData.city} 
              placeholder="e.g., Seattle"
              onChange={handleFieldChange}
              onBlur={syncWithParent}
            />
            <InputField 
              label="State" 
              name="state" 
              value={formData.state} 
              placeholder="e.g., WA"
              onChange={handleFieldChange}
              onBlur={syncWithParent}
            />
          </div>
          <div style={{marginTop: SPACING[3]}}>
            <InputField 
              label="ZIP Code" 
              name="zip_code" 
              value={formData.zip_code} 
              placeholder="e.g., 98101"
              onChange={handleFieldChange}
              onBlur={syncWithParent}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressInput;