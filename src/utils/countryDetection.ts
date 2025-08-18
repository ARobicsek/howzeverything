// src/utils/countryDetection.ts

interface CountryPattern {
  postalCode: RegExp;
  state?: RegExp;
  terms: RegExp;
}

export const COUNTRY_PATTERNS: Record<string, CountryPattern> = { // Added export here
  UK: {
    // UK postcodes: SW1A 1AA, W1U 5JX, etc.
    postalCode: /\b[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}\b/i,
    // Common UK address terms
    terms: /\b(london|manchester|birmingham|glasgow|liverpool|leeds|sheffield|edinburgh|bristol|cardiff|leicester|coventry|nottingham|newcastle|belfast|portsmouth|southampton|wolverhampton|plymouth|reading|united kingdom|england|scotland|wales|northern ireland|britain)\b/i
  },
 
  CANADA: {
    // Canadian postal codes: K1A 0B1
    postalCode: /\b[A-Z][0-9][A-Z]\s*[0-9][A-Z][0-9]\b/i,
    // NEW: Canadian province and territory abbreviations
    state: /\b(ON|QC|NS|NB|MB|BC|PE|SK|AB|NL|NT|YT|NU)\b/i,
    // Provinces and major cities
    terms: /\b(toronto|montreal|vancouver|calgary|ottawa|edmonton|winnipeg|quebec|hamilton|kitchener|london|victoria|halifax|oshawa|windsor|saskatoon|regina|sherbrooke|barrie|ontario|british columbia|alberta|manitoba|saskatchewan|nova scotia|newfoundland|new brunswick|prince edward island|canada)\b/i
  },
 
  ISRAEL: {
    // Israeli postal codes: 7 digits
    postalCode: /\b[0-9]{7}\b/,
    // Cities and country identifiers
    terms: /\b(tel aviv|jerusalem|haifa|netanya|ashdod|rishon lezion|petah tikva|beer sheva|holon|bnei brak|ramat gan|rehovot|bat yam|herzliya|kfar saba|hadera|modiin|nazareth|ramla|raanana|israel|il|yafo|jaffa)\b/i
  },
 
  AUSTRALIA: {
    // Australian postcodes: 4 digits
    postalCode: /\b[0-9]{4}\b/,
    // NEW: Australian state and territory abbreviations
    state: /\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b/i,
    // States and cities
    terms: /\b(sydney|melbourne|brisbane|perth|adelaide|gold coast|newcastle|canberra|wollongong|geelong|hobart|townsville|cairns|toowoomba|darwin|ballarat|bendigo|launceston|australia|new south wales|victoria|queensland|western australia|south australia|tasmania)\b/i
  },
 
  GERMANY: {
    // German postcodes: 5 digits (conflicts with US - will need context)
    postalCode: /\b[0-9]{5}\b/,
    // Cities and country
    terms: /\b(berlin|hamburg|munich|münchen|cologne|köln|frankfurt|stuttgart|düsseldorf|dortmund|essen|leipzig|bremen|dresden|hanover|hannover|nuremberg|nürnberg|duisburg|bochum|wuppertal|bielefeld|bonn|münster|karlsruhe|mannheim|augsburg|wiesbaden|ilmenau|germany|deutschland)\b/i
  },
 
  FRANCE: {
    // French postcodes: 5 digits (conflicts with US - will need context)
    postalCode: /\b[0-9]{5}\b/,
    // Cities and country
    terms: /\b(paris|marseille|lyon|toulouse|nice|nantes|strasbourg|montpellier|bordeaux|lille|rennes|reims|le havre|saint-étienne|toulon|grenoble|dijon|angers|nîmes|villeurbanne|clermont-ferrand|le mans|aix-en-provence|brest|limoges|tours|amiens|bréal-sous-montfort|saint-maur-des-fossés|france)\b/i
  },
 
  ITALY: {
    // Italian postcodes: 5 digits (conflicts with US - will need context)
    postalCode: /\b[0-9]{5}\b/,
    // Cities and country
    terms: /\b(rome|roma|milan|milano|naples|napoli|turin|torino|palermo|genoa|genova|bologna|florence|firenze|bari|catania|venice|venezia|verona|messina|padua|padova|trieste|brescia|parma|modena|reggio calabria|reggio emilia|perugia|livorno|ravenna|italy|italia)\b/i
  },
 
  MEXICO: {
    // Mexican postcodes: 5 digits (conflicts with US - will need context)
    postalCode: /\b[0-9]{5}\b/,
    // NEW: Mexican state abbreviations
    state: /\b(B\.C\.S|S\.L\.P|Q\. Roo|B\.C|N\.L|Ags|Camp|CDMX|Chih|Chis|Coah|Col|Dgo|Gto|Gro|Hgo|Jal|Méx|Mich|Mor|Nay|Oax|Pue|Qro|Sin|Son|Tab|Tamps|Tlax|Ver|Yuc|Zac)\b\.?/i,
    // Cities and country
    terms: /\b(mexico city|ciudad de méxico|cdmx|guadalajara|monterrey|puebla|tijuana|león|juárez|ciudad juarez|zapopan|mérida|merida|san luis potosí|san luis potosi|aguascalientes|hermosillo|saltillo|mexicali|culiacán|culiacan|querétaro|queretaro|morelia|chihuahua|durango|toluca|mazatlán|camargo|oaxaca|mexico|méxico)\b/i
  },
 
  INDIA: {
    // Indian postcodes: 6 digits (XXXXXX or XXX XXX)
    postalCode: /\b[0-9]{6}\b|\b[0-9]{3}\s[0-9]{3}\b/i,
    // Cities, states, and country identifiers
    terms: /\b(mumbai|bombay|delhi|new delhi|bangalore|bengaluru|hyderabad|chennai|madras|kolkata|calcutta|pune|ahmedabad|surat|jaipur|lucknow|kanpur|nagpur|indore|bhopal|visakhapatnam|vizag|patna|vadodara|ghaziabad|ludhiana|agra|nashik|faridabad|meerut|rajkot|kalyan|vasai|varanasi|benares|srinagar|aurangabad|dhanbad|amritsar|navi mumbai|allahabad|prayagraj|ranchi|howrah|coimbatore|jabalpur|gwalior|vijayawada|jodhpur|raipur|kota|guwahati|chandigarh|solapur|hubli|dharwad|bareilly|moradabad|gurgaon|gurugram|aligarh|jalandhar|tiruchirappalli|trichy|bhubaneswar|salem|warangal|guntur|bikaner|noida|jamshedpur|bhilai|cuttack|firozabad|kochi|cochin|maharashtra|delhi|karnataka|tamil nadu|west bengal|gujarat|rajasthan|uttar pradesh|madhya pradesh|andhra pradesh|bihar|telangana|haryana|assam|odisha|kerala|jharkhand|punjab|india|bharat)\b/i
  }
};


// --- NEW: A specific list of only country names for cleaning strings ---
export const COUNTRY_IDENTIFIERS = {
    UK: /\b(united kingdom|uk|england|scotland|wales|northern ireland|britain|gb)\b/i,
    CANADA: /\b(canada|ca)\b/i,
    ISRAEL: /\b(israel|il)\b/i,
    AUSTRALIA: /\b(australia|au)\b/i,
    GERMANY: /\b(germany|deutschland|de)\b/i,
    FRANCE: /\b(france|fr)\b/i,
    ITALY: /\b(italy|italia|it)\b/i,
    MEXICO: /\b(mexico|méxico|mx)\b/i,
    INDIA: /\b(india|in|bharat)\b/i,
};


const US_PATTERNS = {
  // US state abbreviations (comprehensive list)
  stateAbbr: /\b(AL|AK|AZ|AR|CA|CO|CT|DE|DC|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/,
  // US ZIP or ZIP+4
  zipCode: /\b[0-9]{5}(-[0-9]{4})?\b/,
  // Common US terms and state names
  terms: /\b(united states|usa|america|washington|new york|los angeles|chicago|houston|philadelphia|phoenix|san antonio|san diego|dallas|san jose|austin|jacksonville|san francisco|columbus|charlotte|fort worth|detroit|el paso|memphis|seattle|denver|boston|nashville|baltimore|oklahoma city|louisville|portland|las vegas|milwaukee|albuquerque|tucson|fresno|sacramento|kansas city|long beach|mesa|atlanta|colorado springs|virginia beach|raleigh|omaha|miami|oakland|minneapolis|tulsa|wichita|new orleans)\b/i
};


// Valid US state abbreviations for validation
const VALID_US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM',
  'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA',
  'WV', 'WI', 'WY'
];

// NEW: Map for standardizing full state names to abbreviations
export const US_STATE_NAME_TO_ABBR: { [key: string]: string } = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'district of columbia': 'DC',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL',
  'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA',
  'maine': 'ME', 'maryland': 'MD', 'massachusetts': 'MA', 'michigan': 'MI',
  'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT',
  'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
  'ohio': 'OH', 'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA',
  'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA',
  'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
};


export function detectCountry(address: string): string {
  // Clean the address for analysis
  const cleanAddress = address.trim();
  const upperAddress = cleanAddress.toUpperCase();
 
  // Initialize scores
  const scores: Record<string, number> = {
    USA: 0, UK: 0, CANADA: 0, ISRAEL: 0, AUSTRALIA: 0, GERMANY: 0, FRANCE: 0, ITALY: 0, MEXICO: 0, INDIA: 0
  };
 
  // Check for unique postal code patterns (strong indicators)
  if (COUNTRY_PATTERNS.UK.postalCode.test(cleanAddress)) { scores.UK += 10; }
  if (COUNTRY_PATTERNS.CANADA.postalCode.test(cleanAddress)) { scores.CANADA += 10; }
 
  const sixDigitMatch = cleanAddress.match(COUNTRY_PATTERNS.INDIA.postalCode);
  if (sixDigitMatch) {
    if (COUNTRY_PATTERNS.INDIA.terms.test(cleanAddress)) {
      scores.INDIA += 10;
    } else if (cleanAddress.trim().endsWith(sixDigitMatch[0])) {
      scores.INDIA += 5;
    }
  }
 
  const sevenDigitMatch = cleanAddress.match(COUNTRY_PATTERNS.ISRAEL.postalCode);
  if (sevenDigitMatch) {
    const surroundingText = cleanAddress.substring(
      Math.max(0, cleanAddress.indexOf(sevenDigitMatch[0]) - 20),
      Math.min(cleanAddress.length, cleanAddress.indexOf(sevenDigitMatch[0]) + sevenDigitMatch[0].length + 20)
    );
    if (surroundingText.match(/[0-9]{7}(\s*(israel|il))?\s*$/i)) {
      scores.ISRAEL += 8;
    }
  }
 
  const fourDigitMatch = cleanAddress.match(COUNTRY_PATTERNS.AUSTRALIA.postalCode);
  if (fourDigitMatch && COUNTRY_PATTERNS.AUSTRALIA.terms.test(cleanAddress)) {
    scores.AUSTRALIA += 5;
  }
 
  // Check for country/city terms
  Object.entries(COUNTRY_PATTERNS).forEach(([country, patterns]) => {
    if (patterns.terms.test(cleanAddress)) {
      // MODIFIED: Increased score to 10 to outweigh ambiguous US state abbreviations
      scores[country as keyof typeof scores] += 10;
    }
  });
 
  // Check for US patterns
  const stateAbbrMatch = upperAddress.match(US_PATTERNS.stateAbbr);
  if (stateAbbrMatch && upperAddress.indexOf(stateAbbrMatch[0]) > 10) {
    scores.USA += 8;
  }
  if (US_PATTERNS.terms.test(cleanAddress)) {
    scores.USA += 5;
  }
 
  // Special handling for 5-digit postal codes
  const fiveDigitMatch = cleanAddress.match(/\b[0-9]{5}\b/);
  if (fiveDigitMatch && !sevenDigitMatch) {
    const hasEuropeanTerms = COUNTRY_PATTERNS.FRANCE.terms.test(cleanAddress) || COUNTRY_PATTERNS.GERMANY.terms.test(cleanAddress) || COUNTRY_PATTERNS.ITALY.terms.test(cleanAddress);
    const hasMexicanTerms = COUNTRY_PATTERNS.MEXICO.terms.test(cleanAddress);
    if (!hasEuropeanTerms && !hasMexicanTerms) {
      scores.USA += 3;
    }
  }
 
  // Find the highest scoring country
  let maxScore = 0;
  let detectedCountry = 'USA'; // Default
 
  Object.entries(scores).forEach(([country, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedCountry = country;
    }
  });
 
  console.log('Country detection scores:', scores);
  console.log('Detected country:', detectedCountry);
 
  return detectedCountry;
}


export function validateUSParseResults(usResult: { state?: string; street?: string; city?: string; zip?: string }): boolean {
  if (usResult.state && !VALID_US_STATES.includes(usResult.state.toUpperCase()) && !US_STATE_NAME_TO_ABBR[usResult.state.toLowerCase()]) {
    console.log('Invalid US state detected:', usResult.state);
    return false;
  }
 
  // MODIFIED: Exclude the state from this check to prevent collisions like WA (Washington vs. Western Australia)
  const parsedComponents = [usResult.street, usResult.city, usResult.zip].filter(Boolean).join(' ');
  for (const [country, patterns] of Object.entries(COUNTRY_PATTERNS)) {
    // We are more lenient with Australia due to the 'WA' collision.
    // A US address is much more likely than an Australian one for our users.
    if (country === 'AUSTRALIA' && usResult.state === 'WA') {
      continue;
    }
    if (country !== 'USA' && patterns.terms.test(parsedComponents)) {
      console.log('International terms found in parsed result:', country);
      return false;
    }
  }
 
  if (usResult.state && /^[A-Z][0-9][A-Z0-9]?$/.test(usResult.state)) {
    console.log('State looks like UK postcode format:', usResult.state);
    return false;
  }
 
  return true;
}