// src/utils/addressParser.ts
import addressit from 'addressit';
import { parseLocation as parseUSAddress } from 'parse-address';
import type { AddressFormData, AddressParseResult, AddressValidationResult } from '../types/address';
import { COUNTRY_IDENTIFIERS, COUNTRY_PATTERNS, detectCountry, validateUSParseResults } from './countryDetection';

// Helper function for international parsing
function parseWithInternationalParser(
  cleanedInput: string,
  detectedCountry: string,
  originalInput: string
): AddressParseResult {
  try {
    let addressToParse = cleanedInput;
    const countryKey = detectedCountry as keyof typeof COUNTRY_IDENTIFIERS;
    const pattern = COUNTRY_IDENTIFIERS[countryKey];

    // --- NEW LOGIC: Surgically remove ONLY the country name ---
    if (pattern) {
      const globalPattern = new RegExp(pattern.source, 'gi');
      addressToParse = cleanedInput.replace(globalPattern, '');
     
      // Clean up leftover commas and whitespace that might result from the replace
      addressToParse = addressToParse.replace(/, ,/g, ',').replace(/\s,/, ',').replace(/,+/g, ',').trim().replace(/,$/, '').trim();
      console.log(`Simplified address for parsing: "${addressToParse}"`);
    }

    const internationalResult = addressit(addressToParse);
    console.log('Raw international parser result:', internationalResult);
   
    if (!internationalResult || !internationalResult.street) {
      throw new Error('International parser could not identify a street.');
    }
   
    const street = [internationalResult.number, internationalResult.street]
      .filter(Boolean)
      .join(' ');

    // --- START: "Parse & Enhance" logic ---
    let city = internationalResult.city || '';
    let state = internationalResult.state || '';
    let postalCode = internationalResult.postalcode || '';

    // Enhance: Extract from regions array if primary fields are missing
    if ((!city || !postalCode || !state) && internationalResult.regions && internationalResult.regions.length > 0) {
      console.log('Enhancing international parse from regions:', internationalResult.regions);
      let remainingText = internationalResult.regions.join(' ');
      
      const countryPatternKey = detectedCountry as keyof typeof COUNTRY_PATTERNS;
      const patterns = COUNTRY_PATTERNS[countryPatternKey];
      
      // 1. Extract postal code first, as it's often the most unique pattern
      if (patterns?.postalCode && !postalCode) {
        const postalMatch = remainingText.match(patterns.postalCode);
        if (postalMatch?.[0]) {
          postalCode = postalMatch[0].trim();
          remainingText = remainingText.replace(postalMatch[0], '').trim();
        }
      }

      // 2. Extract state/province (if applicable for the country)
      const statePattern = (patterns as any).state;
      if (statePattern && !state) {
        const stateMatch = remainingText.match(statePattern);
        if (stateMatch?.[0]) {
            state = stateMatch[0].trim().toUpperCase();
            remainingText = remainingText.replace(stateMatch[0], '').trim();
        }
      }
      
      // 3. The remainder is the city
      if (!city && remainingText) {
        // Clean up any remaining commas or extra whitespace from the ends
        city = remainingText.replace(/^,|,$/g, '').trim();
      }
    }
    // --- END: "Parse & Enhance" logic ---

    const resultData: Partial<AddressFormData> = {
      fullAddress: originalInput,
      address: street,
      city: city,
      state: state,
      zip_code: postalCode,
      // Manually set the country from our reliable detection logic
      country: detectedCountry || internationalResult.country || '',
    };
   
    const isSuccess = !!(street && city);

    return {
      success: isSuccess,
      data: resultData,
      error: isSuccess ? undefined : 'Partially parsed. Please complete the address fields.'
    };

  } catch (e: any) {
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
 
  // STEP 1: Detect country
  const detectedCountry = detectCountry(cleanedInput);
 
  // STEP 2: Route to appropriate parser
  if (detectedCountry !== 'USA') {
    console.log(`Detected ${detectedCountry} address, using international parser directly`);
    return parseWithInternationalParser(cleanedInput, detectedCountry, input);
  }
 
  // STEP 3: For USA (or uncertain), try US parser first
  try {
    const usResult = parseUSAddress(cleanedInput);
   
    if (usResult && usResult.street && usResult.city && usResult.state) {
      // STEP 4: Validate US parser results
      if (validateUSParseResults(usResult)) {
        console.log('Using US-optimized parser - validation passed');
        const street = [usResult.number, usResult.prefix, usResult.street, usResult.type, usResult.suffix]
          .filter(Boolean)
          .join(' ');
       
        return {
          success: true,
          data: {
            fullAddress: input,
            address: street,
            city: usResult.city || '',
            state: usResult.state || '',
            zip_code: usResult.zip || '',
            country: 'USA',
          },
        };
      } else {
        console.log('US parser validation failed, falling back to international parser');
      }
    }
  } catch (e) {
    console.warn('US-optimized parser failed:', e);
  }
 
  // STEP 5: Fall back to international parser
  return parseWithInternationalParser(cleanedInput, detectedCountry, input);
};

export const validateParsedAddress = (formData: Partial<AddressFormData>): AddressValidationResult => {
  const errors: AddressValidationResult['errors'] = {};
  if (!formData.address?.trim()) errors.address = 'Street address is required.';
  if (!formData.city?.trim()) errors.city = 'City is required.';
  // state and zip are not universally required
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const formatAddressForDisplay = (formData: Partial<AddressFormData>): string => {
  const { address, city, state, zip_code } = formData;
  const parts = [address, city, state].filter(Boolean).join(', ');
  return zip_code ? `${parts} ${zip_code}` : parts;
};