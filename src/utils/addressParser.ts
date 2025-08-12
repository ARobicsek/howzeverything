// src/utils/addressParser.ts
import { parseLocation as parseUSAddress } from 'parse-address';
import type { AddressFormData, AddressParseResult, AddressValidationResult } from '../types/address';
import { COUNTRY_IDENTIFIERS, COUNTRY_PATTERNS, US_STATE_NAME_TO_ABBR, detectCountry, validateUSParseResults } from './countryDetection';


// This new parser works by splitting the address into parts and parsing from the end inwards.
// This is more robust than string subtraction for complex international addresses.
function parseWithManualSubtraction(
  cleanedInput: string,
  detectedCountry: string,
  originalInput: string
): AddressParseResult {
  try {
    let workString = cleanedInput;
    const countryKey = detectedCountry as keyof typeof COUNTRY_IDENTIFIERS;
    const countryIdentifierPattern = COUNTRY_IDENTIFIERS[countryKey];


    // 1. Remove the country name itself to prevent it being parsed as a city, etc.
    if (countryIdentifierPattern) {
      workString = workString.replace(new RegExp(countryIdentifierPattern.source, 'gi'), '').trim();
    }


    let postalCode = '';
    let state = '';
    let city = '';


    const patterns = COUNTRY_PATTERNS[detectedCountry as keyof typeof COUNTRY_PATTERNS];
    const parts = workString.split(',').map(p => p.trim()).filter(Boolean);


    // 2. Check the last part for a state/province.
    if (parts.length > 0 && patterns && patterns.state) {
      const statePattern = patterns.state;
      const lastPart = parts[parts.length - 1];
      const stateMatch = lastPart.match(statePattern);


      // Ensure the match is the *entire* last part to avoid matching a city name (e.g., "Victoria")
      if (stateMatch && stateMatch[0].trim().length === lastPart.length) {
        state = stateMatch[0].toUpperCase().replace(/\./g, '');
        parts.pop(); // Remove state from parts.
      }
    }


    // 3. Check the new last part for postal code. It might be combined with the city.
    if (parts.length > 0 && patterns && patterns.postalCode) {
      const cityAndZipPart = parts[parts.length - 1];
      const postalMatch = cityAndZipPart.match(patterns.postalCode);
      if (postalMatch && postalMatch[0]) {
        postalCode = postalMatch[0];
        // The rest of this part is the city.
        city = cityAndZipPart.replace(patterns.postalCode, '').trim();
        parts.pop(); // Remove the city/zip part.
      }
    }


    // 4. If the city wasn't found with the zip, the current last part must be the city.
    if (!city && parts.length > 0) {
      city = parts.pop() || '';
    }


    // 5. Everything else is the street.
    const street = parts.join(', ');


    if (!street) {
      throw new Error('Parser could not construct a street address.');
    }


    const resultData: Partial<AddressFormData> = {
      fullAddress: originalInput,
      address: street,
      city,
      state,
      zip_code: postalCode,
      country: detectedCountry,
    };
   
    const isSuccess = !!(street && (city || postalCode));


    return {
      success: isSuccess,
      data: resultData,
      error: isSuccess ? undefined : 'Partially parsed. Please complete the address fields.'
    };
  } catch (e: unknown) {
    console.error('International address parsing failed:', e);
    return {
      success: false,
      data: { fullAddress: originalInput, country: detectedCountry },
      error: 'Could not parse address automatically. Please fill in the fields manually.'
    };
  }
}






export const parseAddress = (input: string): AddressParseResult => {
  if (!input || !input.trim()) {
    return { success: false, data: { fullAddress: input }, error: 'Address cannot be empty.' };
  }


  const cleanedInput = input.trim().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');
 
  const detectedCountry = detectCountry(cleanedInput);
 
  if (detectedCountry !== 'USA') {
    console.log(`Detected ${detectedCountry} address, using manual subtraction parser`);
    return parseWithManualSubtraction(cleanedInput, detectedCountry, input);
  }
 
  try {
    const usResult = parseUSAddress(cleanedInput);
   
    if (usResult && usResult.street && usResult.city && usResult.state) {
      if (validateUSParseResults(usResult)) {
        console.log('Using US-optimized parser - validation passed');
        const street = [usResult.number, usResult.prefix, usResult.street, usResult.type, usResult.suffix]
          .filter(Boolean)
          .join(' ');
       
        // --- NEW: Standardize state to abbreviation ---
        let finalState = usResult.state || '';
        const lowerState = finalState.toLowerCase();
        if (US_STATE_NAME_TO_ABBR[lowerState]) {
          finalState = US_STATE_NAME_TO_ABBR[lowerState];
        }


        return {
          success: true,
          data: {
            fullAddress: input,
            address: street,
            city: usResult.city || '',
            state: finalState.toUpperCase(), // Use the standardized state
            zip_code: usResult.zip || '',
            country: 'USA',
          },
        };
      } else {
        console.log('US parser validation failed, falling back to international parser');
        // Fallback to the robust manual parser instead of the old one
        return parseWithManualSubtraction(cleanedInput, 'USA', input);
      }
    }
  } catch (e) {
    console.warn('US-optimized parser failed:', e);
  }
 
  // Final fallback for any other case
  return parseWithManualSubtraction(cleanedInput, 'USA', input);
};


export const validateParsedAddress = (formData: Partial<AddressFormData>): AddressValidationResult => {
  const errors: AddressValidationResult['errors'] = {};
  if (!formData.address?.trim()) errors.address = 'Street address is required.';
  if (!formData.city?.trim()) errors.city = 'City is required.';
  return { isValid: Object.keys(errors).length === 0, errors };
};


export const formatAddressForDisplay = (formData: Partial<AddressFormData>): string => {
  const { address, city, state, zip_code } = formData;
  const parts = [address, city, state].filter(Boolean).join(', ');
  return zip_code ? `${parts} ${zip_code}` : parts;
};