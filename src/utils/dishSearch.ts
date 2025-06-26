// src/utils/dishSearch.ts
import Fuse from 'fuse.js';
import { DishSearchResult, DishWithDetails } from '../hooks/useDishes';

// Food synonym dictionary for enhanced search
const FOOD_SYNONYMS: { [key: string]: string[] } = {
  // Coffee family
  'coffee': ['latte', 'cappuccino', 'espresso', 'americano', 'macchiato', 'mocha', 'caffè', 'cafe'],
  'latte': ['coffee', 'cappuccino', 'café latte', 'cafe latte'],
  'cappuccino': ['coffee', 'latte', 'capp', 'cap'],
  'espresso': ['coffee', 'shot', 'doppio'],
  'americano': ['coffee', 'long black'],
  'macchiato': ['coffee', 'caramel macchiato'],
  'mocha': ['coffee', 'chocolate coffee', 'café mocha'],
  
  // Pasta family
  'pasta': ['spaghetti', 'linguine', 'fettuccine', 'penne', 'rigatoni', 'noodles', 'tagliatelle', 'fusilli'],
  'spaghetti': ['pasta', 'noodles'],
  'linguine': ['pasta', 'noodles'],
  'fettuccine': ['pasta', 'noodles'],
  'penne': ['pasta'],
  'rigatoni': ['pasta'],
  'noodles': ['pasta', 'ramen', 'udon', 'lo mein', 'chow mein'],
  'udon': ['noodles', 'japanese noodles'],
  
  // Sandwich family
  'sandwich': ['sub', 'hoagie', 'grinder', 'hero', 'panini', 'wrap'],
  'sub': ['sandwich', 'submarine', 'hoagie'],
  'hoagie': ['sandwich', 'sub', 'hero'],
  'panini': ['sandwich', 'grilled sandwich'],
  'wrap': ['sandwich', 'burrito'],
  
  // Pizza family
  'pizza': ['pie', 'slice'],
  'pie': ['pizza'],
  
  // Burger family
  'burger': ['hamburger', 'cheeseburger', 'sandwich'],
  'hamburger': ['burger'],
  'cheeseburger': ['burger', 'hamburger'],
  
  // Chicken family
  'chicken': ['pollo', 'fowl', 'hen'],
  'wings': ['chicken wings', 'buffalo wings'],
  'tenders': ['chicken tenders', 'chicken strips', 'fingers'],
  
  // Beef family
  'beef': ['steak', 'meat'],
  'steak': ['beef', 'filet', 'ribeye', 'sirloin'],
  
  // Seafood family
  'fish': ['seafood', 'salmon', 'tuna', 'cod', 'halibut'],
  'shrimp': ['prawns', 'seafood'],
  'crab': ['seafood'],
  'lobster': ['seafood'],
  
  // Dessert family
  'cake': ['dessert', 'torte'],
  'ice cream': ['gelato', 'sorbet', 'frozen yogurt'],
  'gelato': ['ice cream'],
  'chocolate': ['cocoa', 'cacao'],
  
  // Bread family
  'bread': ['toast', 'baguette', 'roll', 'bun'],
  'toast': ['bread'],
  'bagel': ['bread', 'roll'],
  
  // Soup family
  'soup': ['bisque', 'chowder', 'broth', 'stew'],
  'bisque': ['soup'],
  'chowder': ['soup'],
  'stew': ['soup'],
  
  // Salad family
  'salad': ['greens', 'caesar', 'cobb'],
  'caesar': ['salad', 'caesar salad'],
  'cobb': ['salad', 'cobb salad'],
  
  // Rice family
  'rice': ['risotto', 'pilaf', 'fried rice'],
  'risotto': ['rice'],
  'pilaf': ['rice'],
  
  // Potato family
  'potato': ['potatoes', 'fries', 'chips', 'mash', 'baked potato'],
  'fries': ['french fries', 'potato', 'chips'],
  'chips': ['fries', 'potato chips'],
  
  // Mexican family
  'taco': ['tacos'],
  'burrito': ['wrap'],
  'quesadilla': ['cheese quesadilla'],
  'enchilada': ['enchiladas'],
  'nachos': ['chips'],
  
  // Asian family
  'sushi': ['sashimi', 'roll', 'maki'],
  'ramen': ['noodles', 'soup'],
  'pad thai': ['noodles', 'thai noodles'],
  'curry': ['thai curry', 'indian curry'],
  'fried rice': ['rice'],
  'lo mein': ['noodles'],
  'chow mein': ['noodles'],
  
  // Breakfast family
  'eggs': ['egg', 'omelette', 'scrambled'],
  'omelette': ['eggs', 'omelet'],
  'pancakes': ['pancake', 'flapjacks'],
  'waffles': ['waffle'],
  'french toast': ['toast', 'bread'],
  
  // Drink family
  'soda': ['pop', 'soft drink', 'cola', 'coke', 'pepsi'],
  'beer': ['lager', 'ale', 'ipa'],
  'wine': ['vino', 'merlot', 'chardonnay'],
  'juice': ['fresh juice', 'smoothie'],
  'smoothie': ['juice', 'shake'],
  'shake': ['milkshake', 'smoothie'],
  
  // Common misspellings and variations
  'cofee': ['coffee'],
  'coffe': ['coffee'],
  'caffe': ['coffee', 'café'],
  'cafe': ['coffee', 'café'],
  'spagetti': ['spaghetti'],
  'speghetti': ['spaghetti'],
  'sandwhich': ['sandwich'],
  'sandwitch': ['sandwich']
};

// Configuration for Fuse.js
const FUSE_OPTIONS = {
  // Controls fuzziness (0 = exact match, 1 = very fuzzy)
  threshold: 0.4,
  
  // Enable token-based search (handles word order differences)
  tokenize: true,
  matchAllTokens: false, // Don't require ALL tokens to match
  
  // Search in dish name
  keys: ['name'],
  
  // Return match scores and details
  includeScore: true,
  includeMatches: true,
  
  // Minimum character length to start search
  minMatchCharLength: 2,
  
  // Location settings for better performance
  location: 0,
  distance: 100,
  
  // Custom scoring settings
  shouldSort: true
};

/**
 * Expands a search term to include synonyms
 */
function expandSearchTermWithSynonyms(term: string): string[] {
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

/**
 * Enhanced search function using Fuse.js with synonym support
 */
export function enhancedDishSearch(
  dishes: DishWithDetails[],
  searchTerm: string,
  minScore: number = 0.1
): DishSearchResult[] {
  // Return empty results for very short terms
  if (!searchTerm.trim() || searchTerm.trim().length < 2) {
    return dishes.map(dish => ({
      ...dish,
      similarityScore: 100,
      isExactMatch: false,
      matchType: 'exact' as const
    }));
  }

  const term = searchTerm.toLowerCase().trim();
  const results: DishSearchResult[] = [];
  
  // Initialize Fuse with current dishes
  const fuse = new Fuse(dishes, FUSE_OPTIONS);
  
  // Expand search term with synonyms
  const expandedTerms = expandSearchTermWithSynonyms(term);
  
  // Track dishes we've already scored to avoid duplicates
  const scoredDishes = new Set<string>();
  
  // Search for each expanded term
  expandedTerms.forEach((searchTerm, index) => {
    const fuseResults = fuse.search(searchTerm);
    
    fuseResults.forEach(result => {
      const dish = result.item;
      
      // Skip if we've already scored this dish
      if (scoredDishes.has(dish.id)) {
        return;
      }
      
      scoredDishes.add(dish.id);
      
      const fuseScore = result.score || 0;
      const dishName = dish.name.toLowerCase();
      
      let finalScore = 0;
      let matchType: 'exact' | 'fuzzy' | 'partial' = 'fuzzy';
      let isExactMatch = false;
      
      // Exact match (highest priority)
      if (dishName === term) {
        finalScore = 100;
        matchType = 'exact';
        isExactMatch = true;
      }
      // Exact word/phrase match
      else if (dishName.includes(term) || term.includes(dishName)) {
        finalScore = 95;
        matchType = 'partial';
      }
      // Synonym match (high priority)
      else if (index === 0) {
        // Original term match via Fuse
        finalScore = Math.max(0, 90 - (fuseScore * 100));
        matchType = 'fuzzy';
      }
      else {
        // Synonym match
        finalScore = Math.max(0, 80 - (fuseScore * 100));
        matchType = 'fuzzy';
      }
      
      // Only include results above minimum score
      if (finalScore >= minScore * 100) {
        results.push({
          ...dish,
          similarityScore: Math.round(finalScore),
          isExactMatch,
          matchType
        });
      }
    });
  });
  
  // Remove duplicates and sort by score
  const uniqueResults = Array.from(
    new Map(results.map(item => [item.id, item])).values()
  );
  
  return uniqueResults.sort((a, b) => {
    // Exact matches first
    if (a.isExactMatch && !b.isExactMatch) return -1;
    if (!a.isExactMatch && b.isExactMatch) return 1;
    
    // Then by similarity score
    return (b.similarityScore || 0) - (a.similarityScore || 0);
  });
}

/**
 * Check for potential duplicate dishes when adding a new dish
 */
export function findSimilarDishes(
  dishes: DishWithDetails[],
  newDishName: string,
  threshold: number = 75
): DishSearchResult[] {
  const results = enhancedDishSearch(dishes, newDishName, 0.1);
  
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