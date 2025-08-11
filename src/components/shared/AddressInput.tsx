// src/components/shared/AddressInput.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { COLORS, SPACING, STYLES, TYPOGRAPHY, COMPONENT_STYLES } from '../../constants';
import type { AddressFormData } from '../../types/address';
import { parseAddress } from '../../utils/addressParser';
import { incrementGeoapifyCount, logGeoapifyCount } from '../../utils/apiCounter';

const InputField = ({ label, name, value, placeholder, onChange, onBlur }: { label: string; name: keyof AddressFormData; value: string; placeholder?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur: () => void; }) => (
  <div>
    <label style={COMPONENT_STYLES.addressInput.label as React.CSSProperties}>{label}</label>
    <input type="text" name={name} value={value || ''} onChange={onChange} onBlur={onBlur} placeholder={placeholder} style={STYLES.input} />
  </div>
);

interface AddressInputProps {
  initialData: Partial<AddressFormData>;
  onAddressChange: (data: AddressFormData) => void;
  onNameExtracted?: (name: string) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ initialData, onAddressChange, onNameExtracted }) => {
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
  const [showParsedFields, setShowParsedFields] = useState(!!(initialData.address || initialData.city || initialData.state));
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const suggestionsCache = useRef(new Map<string, any[]>());
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipSuggestionsEffect = useRef(false);

  const stableOnAddressChange = useCallback(onAddressChange, []);
  const syncWithParent = (dataToSync: AddressFormData) => stableOnAddressChange(dataToSync);

  const parseAndSync = (address: string) => {
    if (address.trim() === '') {
      setParseMessage(null);
      setShowParsedFields(false);
      const emptyData = { ...formData, fullAddress: '', address: '', city: '', state: '', zip_code: '', country: 'USA' };
      setFormData(emptyData);
      syncWithParent(emptyData);
      return;
    }
    setIsParsing(true);
    setParseMessage(null);
    const result = parseAddress(address);
    const finalData = { ...formData, fullAddress: address, ...(result.data || {}) };
    if (result.success) setParseMessage(null);
    else setParseMessage({ text: `${result.error || 'Could not parse address.'} Please fill in the information if you can.`, type: 'error' });
    setFormData(finalData);
    setShowParsedFields(true);
    syncWithParent(finalData);
    setIsParsing(false);
  };

  const handleSuggestionClick = (suggestion: any) => {
    skipSuggestionsEffect.current = true;
    setSuggestions([]);
    setIsFetchingSuggestions(false);
    const props = suggestion.properties;
    let extractedName: string | null = null;
    if (props.name && onNameExtracted) {
      const isNameJustLocation = (props.city && props.name.toLowerCase() === props.city.toLowerCase()) || (props.state && props.name.toLowerCase() === props.state.toLowerCase());
      if (!isNameJustLocation) {
        extractedName = props.name;
        onNameExtracted(props.name);
      }
    }
    let streetAddress = "";
    const structuredStreet = [props.housenumber, props.street].filter(Boolean).join(' ');
    if (structuredStreet) streetAddress = structuredStreet;
    else if (extractedName && props.address_line1 === extractedName && props.address_line2) streetAddress = props.address_line2;
    else if (props.address_line1 && props.address_line1 !== extractedName) streetAddress = props.address_line1;
    else if (props.address_line2) streetAddress = props.address_line2;
    const formDataUpdate: AddressFormData = {
      fullAddress: props.formatted,
      address: streetAddress.trim(),
      city: props.city || '',
      state: props.state || props.state_code || '',
      zip_code: props.postcode || '',
      country: props.country_code?.toUpperCase() || props.country || 'USA',
    };
    setFormData(formDataUpdate);
    syncWithParent(formDataUpdate);
    setShowParsedFields(true);
    setParseMessage({ text: "Address populated from selection.", type: 'success' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setSuggestions([]);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (skipSuggestionsEffect.current) { skipSuggestionsEffect.current = false; return; }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const trimmedQuery = formData.fullAddress.trim();
    if (trimmedQuery.length < 3) { setSuggestions([]); setIsFetchingSuggestions(false); return; }
    if (suggestionsCache.current.has(trimmedQuery)) { setSuggestions(suggestionsCache.current.get(trimmedQuery)!); return; }
    setIsFetchingSuggestions(true);
    debounceTimer.current = setTimeout(async () => {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') { setIsFetchingSuggestions(false); return; }
      try {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(trimmedQuery)}&apiKey=${apiKey}`;
        incrementGeoapifyCount();
        logGeoapifyCount();
        const response = await fetch(url);
        const data = await response.json();
        if (data.features) { setSuggestions(data.features); suggestionsCache.current.set(trimmedQuery, data.features); }
      } catch (error) { console.error("Error fetching address suggestions:", error); }
      finally { setIsFetchingSuggestions(false); }
    }, 600);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [formData.fullAddress]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    setParseMessage(null);
    syncWithParent(updatedFormData);
  };

  const handleFullAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({...prev, fullAddress: value}));
    if (value.trim() === '') { setShowParsedFields(false); setParseMessage(null); setSuggestions([]); }
  };

  return (
    <div ref={containerRef}>
      <div style={COMPONENT_STYLES.addressInput.container as React.CSSProperties}>
        <label style={COMPONENT_STYLES.addressInput.fullAddressLabel as React.CSSProperties}>Full Address</label>
        <textarea value={formData.fullAddress} onChange={handleFullAddressChange} onBlur={() => parseAndSync(formData.fullAddress)} placeholder="e.g., 160 Commonwealth Ave, Boston, MA 02116" style={COMPONENT_STYLES.addressInput.textarea as React.CSSProperties} rows={3} />
        {(isFetchingSuggestions || suggestions.length > 0) && (
          <div style={COMPONENT_STYLES.addressInput.suggestionsContainer as React.CSSProperties}>
            {isFetchingSuggestions && suggestions.length === 0 && <div style={COMPONENT_STYLES.addressInput.suggestionLoading as React.CSSProperties}>Searching...</div>}
            {suggestions.map((suggestion, index) => (
              <div key={index} onClick={() => handleSuggestionClick(suggestion)} style={COMPONENT_STYLES.addressInput.suggestionItem as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.gray100} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.white}>
                {suggestion.properties.formatted}
              </div>
            ))}
          </div>
        )}
        <div style={COMPONENT_STYLES.addressInput.messageContainer as React.CSSProperties}>
          {isParsing && <p style={COMPONENT_STYLES.addressInput.parsingMessage as React.CSSProperties}>Parsing...</p>}
          {parseMessage && <p style={{...COMPONENT_STYLES.addressInput.parseMessageText, color: parseMessage.type === 'error' ? COLORS.danger : COLORS.success}}>{parseMessage.text}</p>}
        </div>
      </div>
      {showParsedFields && (
        <div style={COMPONENT_STYLES.addressInput.parsedFieldsContainer as React.CSSProperties}>
          <p style={COMPONENT_STYLES.addressInput.parsedFieldsDescription as React.CSSProperties}>We've parsed the address below. You can edit any field if needed.</p>
          <div style={COMPONENT_STYLES.addressInput.fieldGroup as React.CSSProperties}>
            <InputField label="Street Address" name="address" value={formData.address} placeholder="e.g., 123 Main St" onChange={handleFieldChange} onBlur={() => syncWithParent(formData)} />
          </div>
          <div style={COMPONENT_STYLES.addressInput.grid as React.CSSProperties}>
            <InputField label="City" name="city" value={formData.city} placeholder="e.g., Seattle" onChange={handleFieldChange} onBlur={() => syncWithParent(formData)} />
            <InputField label="State" name="state" value={formData.state} placeholder="e.g., WA" onChange={handleFieldChange} onBlur={() => syncWithParent(formData)} />
          </div>
          <div style={COMPONENT_STYLES.addressInput.gridWithTopMargin as React.CSSProperties}>
            <InputField label="ZIP Code" name="zip_code" value={formData.zip_code} placeholder="e.g., 98101" onChange={handleFieldChange} onBlur={() => syncWithParent(formData)} />
            <InputField label="Country" name="country" value={formData.country} placeholder="e.g., USA" onChange={handleFieldChange} onBlur={() => syncWithParent(formData)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressInput;