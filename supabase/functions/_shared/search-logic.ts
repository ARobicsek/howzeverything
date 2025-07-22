// supabase/functions/_shared/search-logic.ts

// --- DICTIONARIES ---
export const FOOD_CATEGORIES = {
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
export const FOOD_SYNONYMS: { [key: string]: string[] } = {
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
export const CUISINE_FAMILIES = {
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
export const MEAL_TIMES = {
  'breakfast': ['eggs', 'pancakes', 'waffles', 'french toast', 'cereal', 'oatmeal', 'bacon', 'sausage', 'toast', 'bagel', 'muffin', 'croissant', 'yogurt', 'granola', 'smoothie bowl', 'danish', 'scone', 'coffee cake', 'cinnamon roll', 'bialy'],
  'brunch': ['eggs benedict', 'mimosa', 'bloody mary', 'quiche', 'frittata', 'avocado toast', 'pancakes', 'french toast'],
  'lunch': ['sandwich', 'salad', 'soup', 'wrap', 'panini', 'burger', 'pizza slice', 'bowl'],
  'dinner': ['steak', 'pasta', 'roast', 'casserole', 'curry', 'stir fry', 'grilled fish', 'lasagna'],
  'dessert': ['cake', 'ice cream', 'pie', 'cookies', 'tiramisu', 'cheesecake', 'brownie', 'pudding'],
  'snack': ['chips', 'popcorn', 'nuts', 'fruit', 'cheese', 'crackers', 'granola bar', 'trail mix'],
  'appetizer': ['wings', 'nachos', 'bruschetta', 'spring rolls', 'calamari', 'cheese sticks', 'spinach dip']
};


// --- HELPER FUNCTIONS ---
const REVERSE_FOOD_SYNONYMS = new Map<string, string>();

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
}

// Pre-compute the reverse lookup map
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

export function getAllRelatedTerms(term: string): string[] {
  const normalizedTerm = normalizeText(term);
  const relatedTerms = new Set<string>([normalizedTerm]);
  generatePlurals(normalizedTerm).forEach(form => relatedTerms.add(form));
  // Direct synonym lookup
  if (FOOD_SYNONYMS[normalizedTerm]) {
    FOOD_SYNONYMS[normalizedTerm].forEach(syn => relatedTerms.add(normalizeText(syn)));
  }
  // Reverse synonym lookup
  const mainTerm = REVERSE_FOOD_SYNONYMS.get(normalizedTerm);
  if (mainTerm) {
    relatedTerms.add(mainTerm);
    if (FOOD_SYNONYMS[mainTerm]) {
      FOOD_SYNONYMS[mainTerm].forEach(syn => relatedTerms.add(normalizeText(syn)));
    }
  }
  return Array.from(relatedTerms);
}

export function checkCategorySearch(term: string): boolean {
  const normalizedTerm = normalizeText(term);
  const termVariations = generatePlurals(normalizedTerm);
  for (const variant of termVariations) {
    if (Object.keys(CUISINE_FAMILIES).some(cuisine => normalizeText(cuisine) === variant)) return true;
    if (Object.keys(MEAL_TIMES).some(meal => normalizeText(meal) === variant)) return true;
    if (Object.keys(FOOD_CATEGORIES).some(cat => normalizeText(cat) === variant)) return true;
  }
  return false;
}

export function getCategoryTerms(category: string): string[] {
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