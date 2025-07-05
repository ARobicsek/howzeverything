// src/types/address.ts
/**
 * The interface for our structured address data, used for form state.
 * This aligns with the 'restaurants' table schema.
 */
export interface AddressFormData {
  fullAddress: string; // The raw, single-field input from the user
  address: string;     // Parsed street address
  city: string;
  state: string;
  zip_code: string;
  country: string;
}


/**
 * The result from our custom parsing utility.
 */
export interface AddressParseResult {
  success: boolean;
  data: Partial<AddressFormData> | null;
  error?: string;
}


/**
 * The validation result for the address form data.
 */
export interface AddressValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof Omit<AddressFormData, 'fullAddress' | 'country'>, string>>;
}