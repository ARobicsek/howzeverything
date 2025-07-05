// src/utils/addressParser.ts
import { parseLocation } from 'parse-address';


// We'll treat the output as 'any' for flexibility, as CJS/ESM interop can be tricky with types.
const parseAddressLibrary = (text: string): any => parseLocation(text);


import type { AddressFormData, AddressParseResult, AddressValidationResult } from '../types/address';


export const parseAddress = (input: string): AddressParseResult => {
  if (!input || !input.trim()) {
    return { success: false, data: { fullAddress: input }, error: 'Address cannot be empty.' };
  }


  // Pre-process the input string: replace newlines with spaces and collapse multiple spaces.
  const cleanedInput = input.trim().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');


  try {
    const parsed = parseAddressLibrary(cleanedInput);
    if (!parsed) {
      throw new Error('Parser returned null or undefined');
    }


    // Reconstruct the full street address from its component parts.
    // 'parse-address' provides number, prefix, street, type, and suffix.
    const street = [parsed.number, parsed.prefix, parsed.street, parsed.type, parsed.suffix]
      .filter(Boolean)
      .join(' ');


    // Check for a minimally viable address.
    if (!street) {
      return { success: false, data: { fullAddress: input }, error: 'Could not parse a valid street address.' };
    }
   
    const resultData: Partial<AddressFormData> = {
      fullAddress: input, // Store the original raw input
      address: street,
      city: parsed.city || '',
      state: parsed.state || '',
      zip_code: parsed.zip || '',
      country: 'USA', // 'parse-address' is US-centric
    };


    // The parse is successful if we get a street and at least one other major component.
    const isSuccess = !!(street && (parsed.city || parsed.state || parsed.zip));


    return {
        success: isSuccess,
        data: resultData,
        error: isSuccess ? undefined : 'Partially parsed. Please complete the address fields.'
    };


  } catch (e: any) {
    console.error('Address parsing library failed:', e);
    return { success: false, data: { fullAddress: input }, error: 'The address parsing library encountered an internal error.' };
  }
};


export const validateParsedAddress = (formData: Partial<AddressFormData>): AddressValidationResult => {
  const errors: AddressValidationResult['errors'] = {};
  if (!formData.address?.trim()) errors.address = 'Street address is required.';
  if (!formData.city?.trim()) errors.city = 'City is required.';
  if (!formData.state?.trim()) errors.state = 'State is required.';
  // Note: 'parse-address' uses 'zip', which we map to 'zip_code'.
  if (formData.zip_code && !/^\d{5}(-\d{4})?$/.test(formData.zip_code)) {
    errors.zip_code = 'Invalid ZIP code format.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};


export const formatAddressForDisplay = (formData: Partial<AddressFormData>): string => {
  const { address, city, state, zip_code } = formData;
  const parts = [address, city, state].filter(Boolean).join(', ');
  return zip_code ? `${parts} ${zip_code}` : parts;
};