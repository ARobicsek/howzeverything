// src/utils/dishSearch.ts
import Fuse from 'fuse.js';
import { DishSearchResult, DishWithDetails } from '../hooks/useDishes';








// Hierarchical category system
const FOOD_CATEGORIES = {
  'beverages': {
    'hot beverages': ['coffee', 'tea', 'hot chocolate', 'chai', 'matcha'],
    'cold beverages': ['soda', 'juice', 'smoothie', 'iced tea', 'lemonade'],
    'alcoholic': ['beer', 'wine', 'cocktail', 'martini', 'margarita'],
    'specialty drinks': ['bubble tea', 'boba', 'kombucha', 'milkshake']
  },
  'appetizers': {
    'starters': ['appetizer', 'starter', 'antipasto', "hors d'oeuvre", 'small plate'],
    'dips': ['hummus', 'guacamole', 'salsa', 'queso', 'spinach dip'],
    'finger foods': ['wings', 'nachos', 'bruschetta', 'crostini', 'calamari']
  },
  'mains': {
    'proteins': ['chicken', 'beef', 'pork', 'fish', 'seafood', 'tofu'],
    'preparations': ['grilled', 'fried', 'baked', 'roasted', 'steamed'],
    'dishes': ['pasta', 'pizza', 'burger', 'sandwich', 'steak', 'curry']
  },
  'desserts': {
    'cakes': ['cake', 'cupcake', 'cheesecake', 'tiramisu', 'torte'],
    'frozen': ['ice cream', 'gelato', 'sorbet', 'frozen yogurt', 'popsicle'],
    'pastries': ['pie', 'tart', 'pastry', 'croissant', 'donut', 'doughnut'],
    'sweets': ['cookie', 'brownie', 'chocolate', 'candy', 'fudge']
  },
  'bakery': {
    'breads': ['bread', 'baguette', 'ciabatta', 'sourdough', 'rye', 'pumpernickel', 'challah', 'brioche', 'focaccia'],
    'rolls': ['bagel', 'bialy', 'roll', 'bun', 'kaiser roll', 'dinner roll', 'pretzel'],
    'pastries': ['croissant', 'danish', 'pain au chocolat', 'turnover', 'strudel', 'palmier'],
    'sweet bakery': ['muffin', 'scone', 'coffee cake', 'cinnamon roll', 'sticky bun', 'bear claw'],
    'flatbreads': ['pita', 'naan', 'tortilla', 'lavash', 'matzo']
  }
};








// Enhanced synonym dictionary with categories
const FOOD_SYNONYMS: { [key: string]: string[] } = {
  // Beverages (added as synonym)
  'beverage': ['drink', 'beverages', 'drinks', 'refreshment'],
  'beverages': ['beverage', 'drinks', 'refreshments'],
  'drink': ['beverage', 'drinks', 'refreshment', 'beverages'],
  'drinks': ['drink', 'beverage', 'beverages', 'refreshments'],
  // Coffee family (expanded)
  'coffee': ['latte', 'cappuccino', 'espresso', 'americano', 'macchiato', 'mocha', 'caffè', 'cafe', 'java', 'joe', 'brew'],
  'latte': ['coffee', 'cappuccino', 'café latte', 'cafe latte', 'flat white'],
  'cappuccino': ['coffee', 'latte', 'capp', 'cap', 'cappucino'],
  'espresso': ['coffee', 'shot', 'doppio', 'ristretto', 'lungo'],
  'americano': ['coffee', 'long black', 'café americano'],
  'macchiato': ['coffee', 'caramel macchiato', 'espresso macchiato'],
  'mocha': ['coffee', 'chocolate coffee', 'café mocha', 'mochaccino'],
  'cold brew': ['iced coffee', 'cold coffee', 'coffee'],
  'iced coffee': ['cold brew', 'cold coffee', 'coffee'],
  // Tea family
  'tea': ['chai', 'green tea', 'black tea', 'herbal tea', 'iced tea'],
  'chai': ['tea', 'chai tea', 'masala chai', 'spiced tea'],
  'matcha': ['green tea', 'tea', 'japanese tea'],
  'bubble tea': ['boba', 'pearl milk tea', 'tapioca tea', 'boba tea'],
  'boba': ['bubble tea', 'pearl milk tea', 'tapioca tea'],
  // Pasta family (expanded)
  'pasta': ['spaghetti', 'linguine', 'fettuccine', 'penne', 'rigatoni', 'noodles', 'tagliatelle', 'fusilli', 'macaroni', 'lasagna', 'ravioli', 'tortellini', 'gnocchi', 'orzo', 'angel hair', 'bucatini', 'cavatappi'],
  'spaghetti': ['pasta', 'noodles', 'spag'],
  'mac and cheese': ['macaroni and cheese', 'mac n cheese', 'mac & cheese', 'pasta', 'macaroni'],
  'mac n cheese': ['macaroni and cheese', 'mac and cheese', 'mac & cheese'],
  'lasagna': ['lasagne', 'pasta'],
  'ravioli': ['pasta', 'filled pasta', 'stuffed pasta'],
  'gnocchi': ['pasta', 'potato pasta', 'dumplings'],
  // Sandwich family (expanded)
  'sandwich': ['sub', 'hoagie', 'grinder', 'hero', 'panini', 'wrap', 'sammy', 'sando', 'sambo'],
  'sub': ['sandwich', 'submarine', 'hoagie', 'grinder', 'hero', "po'boy", 'spukie', 'torpedo'],
  'hoagie': ['sandwich', 'sub', 'hero', 'grinder'],
  'panini': ['sandwich', 'grilled sandwich', 'pressed sandwich', 'toasted sandwich'],
  'wrap': ['sandwich', 'burrito', 'rolled sandwich'],
  'blt': ['bacon lettuce tomato', 'sandwich'],
  'pb&j': ['peanut butter and jelly', 'pbj', 'sandwich'],
  'club': ['club sandwich', 'sandwich'],
  // Pizza family
  'pizza': ['pie', 'slice', 'za'],
  'calzone': ['pizza', 'folded pizza', 'pizza pocket'],
  'flatbread': ['pizza', 'thin crust'],
  // Burger family (expanded)
  'burger': ['hamburger', 'cheeseburger', 'sandwich', 'patty'],
  'hamburger': ['burger', 'hamburg'],
  'cheeseburger': ['burger', 'hamburger', 'cheese burger'],
  'veggie burger': ['vegetarian burger', 'plant burger', 'beyond burger', 'impossible burger'],
  'turkey burger': ['burger', 'poultry burger'],
  // Chicken family (expanded)
  'chicken': ['pollo', 'fowl', 'hen', 'chick', 'chx'],
  'wings': ['chicken wings', 'buffalo wings', 'hot wings', 'bbq wings'],
  'tenders': ['chicken tenders', 'chicken strips', 'fingers', 'chicken fingers', 'tendies'],
  'nuggets': ['chicken nuggets', 'nugs', 'mcnuggets'],
  'rotisserie': ['roasted chicken', 'roast chicken', 'chicken'],
  // Beef family (expanded)
  'beef': ['steak', 'meat', 'cow'],
  'steak': ['beef', 'filet', 'ribeye', 'sirloin', 'strip', 't-bone', 'porterhouse'],
  'brisket': ['beef', 'bbq beef', 'smoked beef'],
  'prime rib': ['beef', 'rib roast', 'standing rib roast'],
  // Seafood family (expanded)
  'fish': ['seafood', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'bass', 'trout', 'mahi'],
  'shrimp': ['prawns', 'seafood', 'scampi'],
  'crab': ['seafood', 'crabmeat', 'crab cake'],
  'lobster': ['seafood', 'langostino'],
  'calamari': ['squid', 'seafood', 'fried squid'],
  'oysters': ['seafood', 'raw bar', 'shellfish'],
  'sushi': ['sashimi', 'roll', 'maki', 'nigiri', 'japanese', 'raw fish'],
  'poke': ['raw fish', 'poke bowl', 'hawaiian'],
  // Baked goods and desserts family (expanded)
  'cake': ['dessert', 'torte', 'gateau','cupcake'],
  'ice cream': ['gelato', 'sorbet', 'frozen yogurt', 'froyo', 'dessert'],
  'gelato': ['ice cream', 'italian ice cream'],
  'pie': ['dessert', 'tart'],
  'cookie': ['biscuit', 'dessert', 'cookies'],
  'brownie': ['dessert', 'chocolate dessert', 'brownies','cake'],
  'donut': ['doughnut', 'dessert', 'pastry'],
  'cupcake': ['cake', 'dessert', 'fairy cake'],
  'bread': ['toast','loaf', 'baguette', 'ciabatta', 'sourdough', 'rye', 'pumpernickel', 'challah', 'brioche', 'focaccia','ciabatta','bagel','bialy', 'pita', 'lavash'],
  // Breakfast family (expanded)
  'eggs': ['egg', 'omelette', 'scrambled', 'fried egg', 'poached', 'benedict'],
  'omelette': ['eggs', 'omelet', 'frittata'],
  'pancakes': ['pancake', 'flapjacks', 'hotcakes', 'griddlecakes'],
  'waffles': ['waffle', 'belgian waffle'],
  'french toast': ['toast', 'bread', 'pain perdu'],
  'bacon': ['pork', 'breakfast meat', 'rashers'],
  'sausage': ['breakfast sausage', 'links', 'patties'],
  'cereal': ['breakfast', 'granola', 'muesli'],
  'oatmeal': ['porridge', 'oats', 'breakfast'],
  'bagel': ['bread', 'roll'],
  // Asian cuisine (expanded)
  'ramen': ['noodles', 'soup', 'japanese noodles', 'noodle soup'],
  'pho': ['vietnamese soup', 'noodle soup', 'soup'],
  'pad thai': ['thai noodles', 'noodles', 'stir fry'],
  'lo mein': ['noodles', 'chinese noodles', 'stir fry noodles'],
  'chow mein': ['noodles', 'chinese noodles', 'crispy noodles'],
  'fried rice': ['rice', 'chinese rice', 'yangzhou rice'],
  'dim sum': ['dumplings', 'chinese', 'yum cha'],
  'dumplings': ['potstickers', 'gyoza', 'wontons', 'pierogi', 'momo'],
  'spring roll': ['egg roll', 'lumpia', 'vietnamese roll'],
  // Mexican/Latin (expanded)
  'taco': ['tacos', 'soft taco', 'hard taco'],
  'burrito': ['wrap', 'burrito bowl'],
  'quesadilla': ['cheese quesadilla', 'mexican grilled cheese'],
  'enchilada': ['enchiladas', 'rolled tortilla'],
  'fajitas': ['fajita', 'sizzling platter'],
  'nachos': ['chips', 'loaded nachos', 'cheese chips'],
  'guacamole': ['guac', 'avocado dip', 'dip'],
  'salsa': ['sauce', 'dip', 'pico de gallo'],
  'tamale': ['tamales', 'mexican'],
  // Italian (expanded)
  'risotto': ['rice', 'italian rice', 'creamy rice'],
  'carbonara': ['pasta', 'spaghetti carbonara', 'bacon pasta'],
  'alfredo': ['pasta', 'fettuccine alfredo', 'cream pasta'],
  'marinara': ['tomato sauce', 'pasta sauce', 'red sauce'],
  'pesto': ['basil sauce', 'pasta sauce', 'green sauce'],
  'bruschetta': ['appetizer', 'italian bread', 'antipasto'],
  // Indian/South Asian
  'curry': ['indian', 'masala', 'gravy'],
  'tikka masala': ['curry', 'chicken tikka masala', 'indian'],
  'tandoori': ['indian', 'grilled', 'clay oven'],
  'naan': ['bread', 'indian bread', 'flatbread'],
  'samosa': ['indian', 'appetizer', 'fried pastry'],
  'biryani': ['rice', 'indian rice', 'spiced rice'],
  'dal': ['lentils', 'indian', 'daal', 'dhal'],
  // Drinks (expanded)
  'soda': ['pop', 'soft drink', 'cola', 'coke', 'pepsi', 'fizzy drink', 'carbonated'],
  'juice': ['fresh juice', 'fruit juice'],
  'smoothie': ['juice', 'shake', 'blended drink'],
  'milkshake': ['shake', 'dessert drink', 'thick shake'],
  'lemonade': ['lemon drink', 'citrus drink', 'summer drink'],
  'beer': ['lager', 'ale', 'ipa', 'stout', 'pilsner', 'brew'],
  'wine': ['vino', 'red wine', 'white wine', 'rosé'],
  'cocktail': ['mixed drink', 'alcoholic beverage', 'drink'],
  // Cooking methods
  'grilled': ['bbq', 'barbecue', 'char-grilled', 'flame-grilled', 'broiled'],
  'fried': ['deep-fried', 'pan-fried', 'sautéed', 'crispy', 'battered'],
  'baked': ['oven-baked', 'roasted', 'oven-roasted'],
  'steamed': ['steam-cooked', 'healthy', 'light'],
  'smoked': ['barbecue', 'bbq', 'wood-smoked'],
  // Common abbreviations and misspellings
  'bbq': ['barbecue', 'barbeque', 'bar-b-q', 'grilled'],
  'w/': ['with'],
  'w/o': ['without'],
  'n': ['and', '&'],
  'ur': ['your'],
  '2': ['to', 'two'],
  '4': ['for', 'four']
};








// Cuisine-based groupings
const CUISINE_FAMILIES = {
  'italian': ['pasta', 'pizza', 'risotto', 'lasagna', 'carbonara', 'marinara', 'pesto', 'bruschetta', 'panini', 'calzone', 'tiramisu', 'gelato', 'cappuccino', 'espresso'],
  'mexican': ['taco', 'burrito', 'enchilada', 'quesadilla', 'nachos', 'fajitas', 'tamale', 'salsa', 'guacamole', 'churros', 'margarita'],
  'japanese': ['sushi', 'ramen', 'tempura', 'teriyaki', 'udon', 'bento', 'miso', 'edamame', 'gyoza', 'sake', 'matcha'],
  'chinese': ['lo mein', 'fried rice', 'dim sum', 'kung pao', 'sweet and sour', 'wonton', 'spring roll', 'general tso', 'orange chicken', 'fortune cookie'],
  'indian': ['curry', 'tikka masala', 'naan', 'biryani', 'samosa', 'dal', 'tandoori', 'paneer', 'lassi', 'chai'],
  'thai': ['pad thai', 'tom yum', 'green curry', 'papaya salad', 'satay', 'massaman', 'sticky rice', 'mango sticky rice'],
  'american': ['burger', 'hot dog', 'bbq', 'fried chicken', 'mac and cheese', 'apple pie', 'buffalo wings', 'clam chowder', 'lobster roll'],
  'french': ['croissant', 'quiche', 'crepe', 'baguette', 'coq au vin', 'ratatouille', 'bouillabaisse', 'crème brûlée', 'macaron', 'pain au chocolat', 'brioche', 'eclair', 'profiterole'],
  'mediterranean': ['hummus', 'falafel', 'gyro', 'kebab', 'tzatziki', 'baklava', 'moussaka', 'dolma', 'pita', 'tabbouleh'],
  'korean': ['kimchi', 'bulgogi', 'bibimbap', 'korean bbq', 'japchae', 'tteokbokki', 'soju', 'banchan'],
  'jewish': ['bagel', 'lox', 'challah', 'matzo', 'bialy', 'knish', 'babka', 'rugelach', 'brisket', 'pastrami'],
  'german': ['bratwurst', 'sauerkraut', 'schnitzel', 'pretzel', 'pumpernickel', 'strudel', 'sauerbraten', 'spätzle', 'beer']
};








// Meal time categories
const MEAL_TIMES = {
  'breakfast': ['eggs', 'pancakes', 'waffles', 'french toast', 'cereal', 'oatmeal', 'bacon', 'sausage', 'toast', 'bagel', 'muffin', 'croissant', 'yogurt', 'granola', 'smoothie bowl', 'danish', 'scone', 'coffee cake', 'cinnamon roll', 'bialy'],
  'brunch': ['eggs benedict', 'mimosa', 'bloody mary', 'quiche', 'frittata', 'avocado toast', 'pancakes', 'french toast'],
  'lunch': ['sandwich', 'salad', 'soup', 'wrap', 'panini', 'burger', 'pizza slice', 'bowl'],
  'dinner': ['steak', 'pasta', 'roast', 'casserole', 'curry', 'stir fry', 'grilled fish', 'lasagna'],
  'dessert': ['cake', 'ice cream', 'pie', 'cookies', 'tiramisu', 'cheesecake', 'brownie', 'pudding'],
  'snack': ['chips', 'popcorn', 'nuts', 'fruit', 'cheese', 'crackers', 'granola bar', 'trail mix'],
  'appetizer': ['wings', 'nachos', 'bruschetta', 'spring rolls', 'calamari', 'cheese sticks', 'spinach dip']
};




// --- THE FIX: Pre-compute the expensive reverse lookup ONCE at module load time. ---
// This moves the slow calculation from every search (runtime) to a single time when the app starts.
const REVERSE_FOOD_SYNONYMS = new Map<string, string>();
Object.entries(FOOD_SYNONYMS).forEach(([key, synonyms]) => {
  const normalizedKey = normalizeText(key);
  synonyms.forEach(synonym => {
    const normalizedSynonym = normalizeText(synonym);
    // Give priority to the original key if it's also listed as a synonym elsewhere.
    if (!REVERSE_FOOD_SYNONYMS.has(normalizedSynonym)) {
      REVERSE_FOOD_SYNONYMS.set(normalizedSynonym, normalizedKey);
    }
  });
});
// --- LOGIC HARDENING: Ensure all primary keys map to themselves to prevent being overwritten. ---
Object.keys(FOOD_SYNONYMS).forEach(key => {
  const normalizedKey = normalizeText(key);
  REVERSE_FOOD_SYNONYMS.set(normalizedKey, normalizedKey);
});








// Helper function to normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove special characters but keep spaces
    .replace(/[^\w\s]/g, ' ')
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ')
    // Handle common number replacements
    .replace(/\b7up\b/g, 'seven up')
    .replace(/\ba1\b/g, 'a one')
    // Remove possessives
    .replace(/'s\b/g, 's')
    .replace(/s'\b/g, 's');
}








// Helper function to handle plurals
function generatePlurals(term: string): string[] {
  const forms = [term];
  // Simple plural rules
  if (term.endsWith('s') || term.endsWith('x') || term.endsWith('z') ||
      term.endsWith('sh') || term.endsWith('ch')) {
    forms.push(term + 'es');
  } else if (term.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(term[term.length - 2])) {
    forms.push(term.slice(0, -1) + 'ies');
  } else if (!term.endsWith('s')) {
    forms.push(term + 's');
  }
  // Handle reverse (singular from plural)
  if (term.endsWith('ies')) {
    forms.push(term.slice(0, -3) + 'y');
  } else if (term.endsWith('es')) {
    forms.push(term.slice(0, -2));
  } else if (term.endsWith('s') && !term.endsWith('ss')) {
    forms.push(term.slice(0, -1));
  }
  return [...new Set(forms)];
}








// Helper function to expand search with compound word handling
function expandCompoundWords(term: string): string[] {
  const expanded = [term];
  const words = term.split(' ');
  // Handle "X and Y" -> "X Y", "X & Y", "X n Y"
  if (words.includes('and')) {
    expanded.push(term.replace(/ and /g, ' '));
    expanded.push(term.replace(/ and /g, ' & '));
    expanded.push(term.replace(/ and /g, ' n '));
  }
  // Handle "X & Y" -> "X and Y", "X Y"
  if (term.includes('&')) {
    expanded.push(term.replace(/&/g, 'and'));
    expanded.push(term.replace(/&/g, ''));
  }
  // Handle "X n Y" -> "X and Y", "X & Y"
  if (words.includes('n')) {
    expanded.push(term.replace(/ n /g, ' and '));
    expanded.push(term.replace(/ n /g, ' & '));
  }
  return [...new Set(expanded)];
}








/**
 * Expands a search term to include synonyms
 * EXPORTED FOR BACKWARD COMPATIBILITY - use getAllRelatedTerms for enhanced functionality
 */
export function expandSearchTermWithSynonyms(term: string): string[] {
  const lowerTerm = term.toLowerCase().trim();
  const expandedTerms = [lowerTerm];
  // Look for exact synonyms
  if (FOOD_SYNONYMS[lowerTerm]) {
    expandedTerms.push(...FOOD_SYNONYMS[lowerTerm]);
  }
  // Look for partial matches in synonym keys and values
  Object.entries(FOOD_SYNONYMS).forEach(([key, synonyms]) => {
    // If the term is a synonym of something, add the main term
    if (synonyms.includes(lowerTerm) && !expandedTerms.includes(key)) {
      expandedTerms.push(key);
    }
    // If the term partially matches a key or synonym, add them
    if (key.includes(lowerTerm) || lowerTerm.includes(key)) {
      if (!expandedTerms.includes(key)) {
        expandedTerms.push(key);
      }
    }
    synonyms.forEach(synonym => {
      if (synonym.includes(lowerTerm) || lowerTerm.includes(synonym)) {
        if (!expandedTerms.includes(synonym)) {
          expandedTerms.push(synonym);
        }
      }
    });
  });
  return expandedTerms;
}








// Enhanced function to get all related terms including categories
export function getAllRelatedTerms(term: string): string[] {
  const normalizedTerm = normalizeText(term);
  const relatedTerms = new Set<string>([normalizedTerm]);
  // Add plural/singular forms
  generatePlurals(normalizedTerm).forEach(form => relatedTerms.add(form));
  // Add compound word variations
  expandCompoundWords(normalizedTerm).forEach(form => relatedTerms.add(normalizeText(form)));
  // Direct synonym lookup
  if (FOOD_SYNONYMS[normalizedTerm]) {
    FOOD_SYNONYMS[normalizedTerm].forEach(syn => {
      relatedTerms.add(normalizeText(syn));
    });
  }
  // --- THE FIX: Replace the slow, iterative reverse lookup with a fast, pre-computed map lookup. ---
  const mainTerm = REVERSE_FOOD_SYNONYMS.get(normalizedTerm);
  if (mainTerm) {
    relatedTerms.add(mainTerm);
    // Also add all other synonyms of that main term for completeness
    if (FOOD_SYNONYMS[mainTerm]) {
      FOOD_SYNONYMS[mainTerm].forEach(syn => relatedTerms.add(normalizeText(syn)));
    }
  }
  return Array.from(relatedTerms);
}








// Enhanced configuration for Fuse.js
const FUSE_OPTIONS = {
  threshold: 0.4, // Slightly more lenient for fuzzy matches
  keys: ['name'],
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
  useExtendedSearch: false
};








/**
 * Enhanced search function using Fuse.js with all improvements
 */
export function enhancedDishSearch(
  dishes: DishWithDetails[],
  searchTerm: string,
  minScore: number = 10
): DishSearchResult[] {
  console.log('[DishSearch] Starting search for:', searchTerm, 'with', dishes.length, 'dishes');
  // Return all dishes for empty search
  if (!searchTerm.trim() || searchTerm.trim().length < 2) {
    return dishes.map(dish => ({
      ...dish,
      similarityScore: 100,
      isExactMatch: false,
      matchType: 'exact' as const
    }));
  }


  const startTime = performance.now();
  const normalizedSearch = normalizeText(searchTerm);
  const results = new Map<string, DishSearchResult>();
  // First, check if this is a category search
  const isCategorySearch = checkCategorySearch(normalizedSearch);
  if (isCategorySearch) {
    console.log('[DishSearch] Category search detected for:', normalizedSearch);
    // For category searches, match dishes that belong to the category
    const categoryMatches = findDishesInCategory(dishes, normalizedSearch);
    categoryMatches.forEach(match => {
      results.set(match.id, match);
    });
  }
  // Get related terms for standard search
  const expandedTerms = getAllRelatedTerms(searchTerm);
  const expandedTermsSet = new Set(expandedTerms.map(term => normalizeText(term)));
  const originalTermWords = normalizeText(searchTerm).split(' ');
  console.log('[DishSearch] Expanded terms:', expandedTerms.slice(0, 10), '...');


  dishes.forEach(dish => {
    const dishName = normalizeText(dish.name);
    const dishWords = dishName.split(' ');


    let score = 0;
    let matchType: 'exact' | 'partial' | 'fuzzy' = 'fuzzy';


    // Tier 1: Exact match on original term
    if (dishName === normalizedSearch) {
      score = 100;
      matchType = 'exact';
    }
    // Tier 2: Exact match on a synonym/related term
    else if (expandedTermsSet.has(dishName)) {
      score = 95;
      matchType = 'exact';
    }
    else {
      let wordMatch = false;
      let isOriginalWordMatch = false;
      // Tier 3: Word-based matching
      for (const word of dishWords) {
        if (expandedTermsSet.has(word)) {
          wordMatch = true;
          if (originalTermWords.includes(word)) {
            isOriginalWordMatch = true;
            break; // Found best possible word match, no need to check further
          }
        }
      }


      if (isOriginalWordMatch) {
        score = 90;
        matchType = 'partial';
      } else if (wordMatch) {
        score = 80;
        matchType = 'partial';
      }
      // Tier 4: Substring matching (only if no better match was found)
      else if (dishName.includes(normalizedSearch)) {
        score = 70;
        matchType = 'fuzzy';
      }
    }
    // Add to results if score is high enough, overwriting if a better score for the same dish is found
    if (score >= minScore) {
      const existing = results.get(dish.id);
      if (!existing || score > (existing.similarityScore || 0)) {
        results.set(dish.id, {
          ...dish,
          similarityScore: score,
          isExactMatch: score >= 95,
          matchType: matchType,
        });
      }
    }
  });
  // For performance, only use Fuse for fuzzy matching if we don't have enough good results.
  if (results.size < 10) {
    // Get IDs of dishes we already scored to avoid re-processing
    const matchedDishIds = new Set(Array.from(results.keys()));
    const dishesForFuse = dishes.filter(d => !matchedDishIds.has(d.id));


    if (dishesForFuse.length > 0) {
        const fuse = new Fuse(dishesForFuse, FUSE_OPTIONS);
        const fuseResults = fuse.search(searchTerm);
        fuseResults.slice(0, 10).forEach(result => {
          // Fuse score is 0 for perfect match, 1 for mismatch.
          // We convert it to our 0-100 scale, making it lower priority.
          const finalScore = Math.max(0, 60 - ((result.score || 0) * 100));
          if (finalScore >= minScore) {
              const existing = results.get(result.item.id);
              if (!existing || finalScore > (existing.similarityScore || 0)) {
                  results.set(result.item.id, {
                      ...result.item,
                      similarityScore: Math.round(finalScore),
                      isExactMatch: false,
                      matchType: 'fuzzy' as const
                  });
              }
          }
        });
    }
  }
  const endTime = performance.now();
  console.log(`[DishSearch] Search completed in ${(endTime - startTime).toFixed(2)}ms, found ${results.size} results`);
  // Convert to array and sort
  return Array.from(results.values()).sort((a, b) => {
    // Exact matches first
    if (a.isExactMatch && !b.isExactMatch) return -1;
    if (!a.isExactMatch && b.isExactMatch) return 1;
    // Then by match type
    const typeOrder = { 'exact': 0, 'partial': 1, 'fuzzy': 2 };
    const typeCompare = typeOrder[a.matchType || 'fuzzy'] - typeOrder[b.matchType || 'fuzzy'];
    if (typeCompare !== 0) return typeCompare;
    // Finally by similarity score
    return (b.similarityScore || 0) - (a.similarityScore || 0);
  });
}








/**
 * Check if the search term is a category
 */
function checkCategorySearch(term: string): boolean {
  const normalizedTerm = normalizeText(term);
  // Special check for drink/beverage terms
  if (['drink', 'drinks', 'beverage', 'beverages'].includes(normalizedTerm)) {
    return true;
  }
  // Also check plural/singular forms
  const termVariations = generatePlurals(normalizedTerm);
  for (const variant of termVariations) {
    // Check main categories
    if (Object.keys(FOOD_CATEGORIES).some(cat => normalizeText(cat) === variant)) {
      return true;
    }
    // Check subcategories
    for (const mainCat of Object.values(FOOD_CATEGORIES)) {
      if (Object.keys(mainCat).some(subCat => normalizeText(subCat) === variant)) {
        return true;
      }
    }
    // Check meal times
    if (Object.keys(MEAL_TIMES).some(meal => normalizeText(meal) === variant)) {
      return true;
    }
    // Check cuisines
    if (Object.keys(CUISINE_FAMILIES).some(cuisine => normalizeText(cuisine) === variant)) {
      return true;
    }
  }
  return false;
}








/**
 * Find dishes that belong to a category
 */
function findDishesInCategory(dishes: DishWithDetails[], category: string): DishSearchResult[] {
  const normalizedCategory = normalizeText(category);
  const categoryVariations = generatePlurals(normalizedCategory);
  const categoryDishes: DishSearchResult[] = [];
  // Special handling for drink/beverage searches
  if (['drink', 'drinks', 'beverage', 'beverages'].includes(normalizedCategory)) {
    console.log('[DishSearch] Special beverage category search');
    dishes.forEach(dish => {
      const dishName = normalizeText(dish.name);
      const dishWords = dishName.split(' ');
      let isInCategory = false;
      let categoryScore = 70;
      // Check against all beverage-related items
      const beverageItems = [
        ...FOOD_CATEGORIES.beverages['hot beverages'],
        ...FOOD_CATEGORIES.beverages['cold beverages'],
        ...FOOD_CATEGORIES.beverages['alcoholic'],
        ...FOOD_CATEGORIES.beverages['specialty drinks']
      ];
      beverageItems.forEach(item => {
        const normalizedItem = normalizeText(item);
        if (dishName.includes(normalizedItem) || dishWords.some(word => word === normalizedItem)) {
          isInCategory = true;
          categoryScore = 85;
        }
      });
      // Also check common drink words
      const drinkWords = ['coffee', 'tea', 'latte', 'cappuccino', 'espresso', 'soda', 'juice', 'smoothie', 'shake', 'water', 'lemonade', 'beer', 'wine', 'cocktail', 'mocktail'];
      drinkWords.forEach(drinkWord => {
        if (dishWords.some(word => word === drinkWord || word.includes(drinkWord))) {
          isInCategory = true;
          categoryScore = Math.max(categoryScore, 80);
        }
      });
      if (isInCategory) {
        categoryDishes.push({
          ...dish,
          similarityScore: categoryScore,
          isExactMatch: false,
          matchType: 'fuzzy' as const
        });
      }
    });
    return categoryDishes;
  }
  // Standard category search for other categories
  dishes.forEach(dish => {
    const dishName = normalizeText(dish.name);
    const dishWords = dishName.split(' ');
    let isInCategory = false;
    let categoryScore = 70; // Base score for category matches
    for (const categoryVariant of categoryVariations) {
      // Check if dish is in any food category
      Object.entries(FOOD_CATEGORIES).forEach(([mainCat, subCats]) => {
        if (normalizeText(mainCat) === categoryVariant) {
          // Check if dish matches any item in subcategories
          Object.values(subCats).forEach(items => {
            items.forEach(item => {
              const normalizedItem = normalizeText(item);
              // Check full dish name contains item
              if (dishName.includes(normalizedItem)) {
                isInCategory = true;
                categoryScore = 90;
              }
              // Check if any word in dish matches item
              if (dishWords.some(word => word === normalizedItem || generatePlurals(normalizedItem).includes(word))) {
                isInCategory = true;
                categoryScore = Math.max(categoryScore, 85);
              }
            });
          });
        }
        // Check subcategories
        Object.entries(subCats).forEach(([subCat, items]) => {
          if (normalizeText(subCat) === categoryVariant) {
            items.forEach(item => {
              const normalizedItem = normalizeText(item);
              if (dishName.includes(normalizedItem)) {
                isInCategory = true;
                categoryScore = 95;
              }
              if (dishWords.some(word => word === normalizedItem || generatePlurals(normalizedItem).includes(word))) {
                isInCategory = true;
                categoryScore = Math.max(categoryScore, 90);
              }
            });
          }
        });
      });
      // Check meal times
      Object.entries(MEAL_TIMES).forEach(([meal, items]) => {
        if (normalizeText(meal) === categoryVariant) {
          items.forEach(item => {
            const normalizedItem = normalizeText(item);
            if (dishName.includes(normalizedItem)) {
              isInCategory = true;
              categoryScore = 90;
            }
            if (dishWords.some(word => word === normalizedItem || generatePlurals(normalizedItem).includes(word))) {
              isInCategory = true;
              categoryScore = Math.max(categoryScore, 85);
            }
          });
        }
      });
      // Check cuisines
      Object.entries(CUISINE_FAMILIES).forEach(([cuisine, items]) => {
        if (normalizeText(cuisine) === categoryVariant) {
          items.forEach(item => {
            const normalizedItem = normalizeText(item);
            if (dishName.includes(normalizedItem)) {
              isInCategory = true;
              categoryScore = 90;
            }
            if (dishWords.some(word => word === normalizedItem || generatePlurals(normalizedItem).includes(word))) {
              isInCategory = true;
              categoryScore = Math.max(categoryScore, 85);
            }
          });
        }
      });
      // Check if dish name contains category-related terms via synonyms
      const categoryRelatedTerms = FOOD_SYNONYMS[categoryVariant] || [];
      categoryRelatedTerms.forEach(term => {
        const normalizedTerm = normalizeText(term);
        if (dishName.includes(normalizedTerm)) {
          isInCategory = true;
          categoryScore = Math.max(categoryScore, 80);
        }
        if (dishWords.some(word => word === normalizedTerm)) {
          isInCategory = true;
          categoryScore = Math.max(categoryScore, 85);
        }
      });
    }
    if (isInCategory) {
      categoryDishes.push({
        ...dish,
        similarityScore: categoryScore,
        isExactMatch: false,
        matchType: 'fuzzy' as const
      });
    }
  });
  return categoryDishes;
}








/**
 * Check for potential duplicate dishes when adding a new dish
 */
export function findSimilarDishes(
  dishes: DishWithDetails[],
  newDishName: string,
  threshold: number = 75
): DishSearchResult[] {
  const results = enhancedDishSearch(dishes, newDishName, 0);
  return results.filter(dish =>
    (dish.similarityScore || 0) >= threshold
  );
}








/**
 * Get a readable similarity description for the user
 */
export function getSimilarityDescription(score: number): string {
  if (score >= 95) return "Very similar";
  if (score >= 85) return "Similar";
  if (score >= 75) return "Somewhat similar";
  return "Possibly related";
}








/**
 * Debug function to test search functionality
 */
export function debugSearchTest(dishes: DishWithDetails[], searchTerm: string): void {
  console.log(`\n=== DEBUG SEARCH TEST: "${searchTerm}" ===`);
  // Test synonym expansion
  const synonyms = expandSearchTermWithSynonyms(searchTerm);
  console.log('Synonyms found:', synonyms);
  // Test enhanced search
  const results = enhancedDishSearch(dishes, searchTerm);
  console.log(`Found ${results.length} results:`);
  results.slice(0, 5).forEach((result, i) => {
    console.log(`${i + 1}. "${result.name}" - Score: ${result.similarityScore}, Type: ${result.matchType}`);
  });
  // Check if it's a category
  const isCategory = checkCategorySearch(normalizeText(searchTerm));
  console.log('Is category search?', isCategory);
  if (isCategory) {
    const categoryResults = findDishesInCategory(dishes, searchTerm);
    console.log(`Category matches: ${categoryResults.length}`);
  }
  console.log('=== END DEBUG ===\n');
}








/**
 * Performance wrapper for debugging slow searches
 */
export function performanceWrappedSearch(
  dishes: DishWithDetails[],
  searchTerm: string,
  minScore?: number
): DishSearchResult[] {
  console.log(`[PERF] Starting search for "${searchTerm}" at`, new Date().toISOString());
  const start = performance.now();
  try {
    const results = enhancedDishSearch(dishes, searchTerm, minScore);
    const end = performance.now();
    console.log(`[PERF] Search completed in ${(end - start).toFixed(2)}ms, returned ${results.length} results`);
    if (end - start > 100) {
      console.warn(`[PERF] Search took longer than 100ms! Check for performance issues.`);
    }
    return results;
  } catch (error) {
    console.error('[PERF] Search error:', error);
    throw error;
  }
}