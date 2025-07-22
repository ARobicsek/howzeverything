// supabase/functions/dish-search/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- TYPE DEFINITIONS ---
interface DishSearchResultWithRestaurant {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
  created_by: string | null;
  verified_by_restaurant: boolean;
  total_ratings: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
  restaurant: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  // other relations
}

// --- SEARCH UTILITIES (Complete version from src/utils/dishSearch.ts) ---
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
const FOOD_SYNONYMS: { [key: string]: string[] } = {
  'beverage': ['drink', 'beverages', 'drinks', 'refreshment'],
  'coffee': ['latte', 'cappuccino', 'espresso', 'americano', 'macchiato', 'mocha'],
  'pasta': ['spaghetti', 'linguine', 'fettuccine', 'penne', 'rigatoni', 'noodles'],
  'sandwich': ['sub', 'hoagie', 'grinder', 'hero', 'panini', 'wrap'],
  'burger': ['hamburger', 'cheeseburger', 'sandwich', 'patty'],
  'chicken': ['pollo', 'fowl'],
  'beef': ['steak', 'meat'],
  'fish': ['seafood', 'salmon', 'tuna'],
  'cake': ['dessert', 'torte', 'cupcake'],
  'pie': ['dessert', 'tart'],
  'ice cream': ['gelato', 'sorbet', 'frozen yogurt', 'froyo'],
  'bread': ['toast', 'loaf', 'baguette', 'ciabatta', 'sourdough', 'rye', 'pumpernickel', 'challah', 'brioche', 'focaccia', 'bagel', 'bialy', 'pita', 'lavash', 'croissant'],
  'toast': ['bread'],
  'baguette': ['bread', 'french'],
  'croissant': ['bread', 'pastry', 'french'],
  'bbq': ['barbecue', 'barbeque', 'grilled'],
};
const CUISINE_FAMILIES = {
  'italian': ['pasta', 'pizza', 'risotto', 'lasagna', 'gelato', 'espresso'],
  'mexican': ['taco', 'burrito', 'enchilada', 'quesadilla', 'nachos', 'fajitas'],
  'japanese': ['sushi', 'ramen', 'tempura', 'teriyaki', 'udon', 'matcha'],
  'chinese': ['lo mein', 'fried rice', 'dim sum', 'wonton', 'spring roll'],
  'indian': ['curry', 'tikka masala', 'naan', 'biryani', 'samosa', 'chai'],
  'french': ['croissant', 'quiche', 'crepe', 'baguette', 'macaron', 'pain au chocolat', 'brioche'],
};
const MEAL_TIMES = {
  'breakfast': ['eggs', 'pancakes', 'waffles', 'french toast', 'cereal', 'bacon', 'sausage', 'bagel', 'croissant'],
  'lunch': ['sandwich', 'salad', 'soup', 'wrap', 'panini', 'burger'],
  'dinner': ['steak', 'pasta', 'roast', 'curry', 'stir fry'],
  'dessert': ['cake', 'ice cream', 'pie', 'cookies', 'brownie'],
  'appetizer': ['wings', 'nachos', 'bruschetta', 'spring rolls', 'calamari'],
};

const REVERSE_FOOD_SYNONYMS = new Map<string, string>();
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
}
Object.entries(FOOD_SYNONYMS).forEach(([key, synonyms]) => {
  const normalizedKey = normalizeText(key);
  synonyms.forEach(synonym => {
    const normalizedSynonym = normalizeText(synonym);
    if (!REVERSE_FOOD_SYNONYMS.has(normalizedSynonym)) {
      REVERSE_FOOD_SYNONYMS.set(normalizedSynonym, normalizedKey);
    }
  });
});
Object.keys(FOOD_SYNONYMS).forEach(key => {
  const normalizedKey = normalizeText(key);
  REVERSE_FOOD_SYNONYMS.set(normalizedKey, normalizedKey);
});

function generatePlurals(term: string): string[] {
  const forms = [term];
  if (term.endsWith('s') || term.endsWith('sh') || term.endsWith('ch')) {
    forms.push(term + 'es');
  } else if (term.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(term[term.length - 2])) {
    forms.push(term.slice(0, -1) + 'ies');
  } else if (!term.endsWith('s')) {
    forms.push(term + 's');
  }
  return [...new Set(forms)];
}

function getAllRelatedTerms(term: string): string[] {
  const normalizedTerm = normalizeText(term);
  const relatedTerms = new Set<string>([normalizedTerm]);
  generatePlurals(normalizedTerm).forEach(form => relatedTerms.add(form));
  if (Object.prototype.hasOwnProperty.call(FOOD_SYNONYMS, normalizedTerm)) {
    FOOD_SYNONYMS[normalizedTerm].forEach(syn => relatedTerms.add(normalizeText(syn)));
  }
  const mainTerm = REVERSE_FOOD_SYNONYMS.get(normalizedTerm);
  if (mainTerm) {
    relatedTerms.add(mainTerm);
    if (Object.prototype.hasOwnProperty.call(FOOD_SYNONYMS, mainTerm)) {
      FOOD_SYNONYMS[mainTerm].forEach(syn => relatedTerms.add(normalizeText(syn)));
    }
  }
  return Array.from(relatedTerms);
}

function checkCategorySearch(term: string): boolean {
  const normalizedTerm = normalizeText(term);
  const termVariations = generatePlurals(normalizedTerm);
  for (const variant of termVariations) {
    if (Object.keys(CUISINE_FAMILIES).some(cuisine => normalizeText(cuisine) === variant)) return true;
    if (Object.keys(MEAL_TIMES).some(meal => normalizeText(meal) === variant)) return true;
    if (Object.keys(FOOD_CATEGORIES).some(cat => normalizeText(cat) === variant)) return true;
  }
  return false;
}

function getCategoryTerms(category: string): string[] {
    const normalizedCategory = normalizeText(category);
    const terms = new Set<string>();
    const categoryVariations = generatePlurals(normalizedCategory);
    const addItems = (items: string[]) => items.forEach(item => terms.add(normalizeText(item)));
    for (const categoryVariant of categoryVariations) {
        const cuisineKey = Object.keys(CUISINE_FAMILIES).find(key => normalizeText(key) === categoryVariant) as keyof typeof CUISINE_FAMILIES;
        if (cuisineKey) addItems(CUISINE_FAMILIES[cuisineKey]);
        const mealKey = Object.keys(MEAL_TIMES).find(key => normalizeText(key) === categoryVariant) as keyof typeof MEAL_TIMES;
        if (mealKey) addItems(MEAL_TIMES[mealKey]);
        const mainCatKey = Object.keys(FOOD_CATEGORIES).find(key => normalizeText(key) === categoryVariant) as keyof typeof FOOD_CATEGORIES;
        if (mainCatKey) {
            Object.values(FOOD_CATEGORIES[mainCatKey]).forEach(subItems => addItems(subItems as string[]));
        }
    }
    return Array.from(terms);
}

const supabaseAdminClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchTerm, minRating } = await req.json();

    const processRawDishes = (rawData: any[]) => {
      return (rawData || []).map((d: any) => {
        if (!d || !d.restaurants || !d.id) return null;
        
        const { dish_ratings, dish_photos, dish_comments, restaurants, ...dishData } = d;

        const ratings = dish_ratings || [];
        const photos = dish_photos || [];
        const comments = dish_comments || [];

        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
          ? ratings.reduce((sum: number, r: { rating: number; }) => sum + r.rating, 0) / totalRatings 
          : 0;

        return {
          ...dishData,
          restaurant: restaurants,
          ratings: ratings,
          comments: comments,
          photos: photos.map((p: any) => ({
            ...p,
            url: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/dish-photos/${p.storage_path}`
          })),
          total_ratings: totalRatings,
          average_rating: Math.round(averageRating * 10) / 10,
          dateAdded: d.created_at,
        };
      }).filter(Boolean);
    };
    
    let query = supabaseAdminClient
      .from('restaurant_dishes')
      .select(`
        *, 
        restaurants!inner(id, name, latitude, longitude), 
        dish_ratings(*), 
        dish_photos(*),
        dish_comments(*)
      `)
      .eq('is_active', true)
      .not('restaurants.latitude', 'is', null);

    const term = searchTerm?.trim();
    if (term && term.length > 1) {
      const allSearchTerms = new Set<string>();
      const isCategory = checkCategorySearch(term);
      const synonymTerms = getAllRelatedTerms(term);
      synonymTerms.forEach(t => allSearchTerms.add(t));
      if (isCategory) {
        const categoryTerms = getCategoryTerms(term);
        categoryTerms.forEach(t => allSearchTerms.add(t));
      }
      const finalSearchTerms = Array.from(allSearchTerms).slice(0, 100);
      if (finalSearchTerms.length > 0) {
        const orFilter = finalSearchTerms
            .map((t: string) => `name.ilike.%${t.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`)
            .join(',');
        query = query.or(orFilter);
      }
    }

    if (minRating && minRating > 0) {
      query = query.gte('average_rating', minRating);
    }

    query = query.order('average_rating', { ascending: false }).limit(200);

    const { data, error } = await query;
    if (error) throw error;
    
    const results = processRawDishes(data || []);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('[EDGE FUNCTION ERROR]', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})