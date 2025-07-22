// supabase/functions/_shared/search-logic.ts

// --- DICTIONARIES ---
export const FOOD_CATEGORIES = {
  'beverages': {
    'hot beverages': ['coffee', 'tea', 'hot chocolate', 'chai', 'matcha', 'espresso', 'latte', 'cappuccino'],
    'cold beverages': ['soda', 'juice', 'smoothie', 'iced tea', 'lemonade', 'iced coffee', 'vietnamese iced coffee'],
    'alcoholic': ['beer', 'wine', 'cocktail', 'martini', 'margarita', 'sake', 'soju', 'sangria', 'ouzo'],
    'specialty drinks': ['bubble tea', 'boba', 'kombucha', 'milkshake', 'lassi', 'energy drinks', 'sports drinks']
  },
  'appetizers': {
    'starters': ['appetizer', 'starter', 'antipasto', "hors d'oeuvre", 'small plate', 'tapas', 'pinchos', 'banchan'],
    'dips': ['hummus', 'guacamole', 'salsa', 'queso', 'spinach dip', 'baba ganoush', 'tzatziki', 'olive tapenade', 'muhammara'],
    'finger foods': ['wings', 'nachos', 'bruschetta', 'crostini', 'calamari', 'samosa', 'pakora', 'spring roll', 'egg roll', 'potsticker', 'mozzarella sticks', 'onion rings', 'hush puppies', 'deviled eggs', 'shrimp cocktail', 'croquetas', 'sliders']
  },
  'mains': {
    'proteins': ['chicken', 'beef', 'pork', 'fish', 'seafood', 'tofu', 'lamb', 'duck', 'veal', 'paneer', 'falafel'],
    'preparations': ['grilled', 'fried', 'baked', 'roasted', 'steamed', 'bbq', 'tandoori', 'stir fry', 'curry'],
    'dishes': ['pasta', 'pizza', 'burger', 'sandwich', 'steak', 'curry', 'taco', 'burrito', 'ramen', 'pho', 'sushi']
  },
  'desserts': {
    'cakes': ['cake', 'cupcake', 'cheesecake', 'tiramisu', 'torte', 'tres leches cake', 'red velvet cake', 'carrot cake'],
    'frozen': ['ice cream', 'gelato', 'sorbet', 'frozen yogurt', 'popsicle', 'kulfi', 'bingsu'],
    'pastries': ['pie', 'tart', 'pastry', 'croissant', 'donut', 'doughnut', 'cannoli', 'eclair', 'baklava', 'strudel', 'churros'],
    'sweets': ['cookie', 'brownie', 'chocolate', 'candy', 'fudge', 'macaron', 'mochi', 'gulab jamun', 'turkish delight', 'halva']
  },
  'bakery': {
    'breads': ['bread', 'baguette', 'ciabatta', 'sourdough', 'rye', 'pumpernickel', 'challah', 'brioche', 'focaccia', 'cornbread'],
    'rolls': ['bagel', 'bialy', 'roll', 'bun', 'kaiser roll', 'dinner roll', 'pretzel'],
    'pastries': ['croissant', 'danish', 'pain au chocolat', 'turnover', 'strudel', 'palmier', 'scone'],
    'sweet bakery': ['muffin', 'scone', 'coffee cake', 'cinnamon roll', 'sticky bun', 'bear claw', 'babka', 'panettone'],
    'flatbreads': ['pita', 'naan', 'tortilla', 'lavash', 'matzo', 'manakish']
  }
};
export const FOOD_SYNONYMS: { [key: string]: string[] } = {
  // Beverages (added as synonym)
  'beverage': ['drink', 'beverages', 'drinks', 'refreshment'],
  'beverages': ['beverage', 'drinks', 'refreshments'],
  'drink': ['beverage', 'drinks', 'refreshment', 'beverages', 'cocktail'],
  'drinks': ['drink', 'beverage', 'beverages', 'refreshments'],
  // Coffee family (expanded)
  'coffee': ['latte', 'cappuccino', 'espresso', 'americano', 'macchiato', 'mocha', 'caffè', 'cafe', 'java', 'joe', 'brew', 'coffees', 'vietnamese coffee'],
  'latte': ['coffee', 'cappuccino', 'café latte', 'cafe latte', 'flat white', 'lattes'],
  'cappuccino': ['coffee', 'latte', 'capp', 'cap', 'cappucino', 'cappuccinos'],
  'espresso': ['coffee', 'shot', 'doppio', 'ristretto', 'lungo', 'espressos'],
  'americano': ['coffee', 'long black', 'café americano', 'americanos'],
  'macchiato': ['coffee', 'caramel macchiato', 'espresso macchiato', 'macchiatos'],
  'mocha': ['coffee', 'chocolate coffee', 'café mocha', 'mochaccino', 'mochas'],
  'cold brew': ['iced coffee', 'cold coffee', 'coffee'],
  'iced coffee': ['cold brew', 'cold coffee', 'coffee'],
  // Tea family
  'tea': ['chai', 'green tea', 'black tea', 'herbal tea', 'iced tea', 'teas'],
  'chai': ['tea', 'chai tea', 'masala chai', 'spiced tea'],
  'matcha': ['green tea', 'tea', 'japanese tea'],
  'bubble tea': ['boba', 'pearl milk tea', 'tapioca tea', 'boba tea'],
  'boba': ['bubble tea', 'pearl milk tea', 'tapioca tea'],
  // Pasta family (expanded)
  'pasta': ['spaghetti', 'linguine', 'fettuccine', 'penne', 'rigatoni', 'noodles', 'tagliatelle', 'fusilli', 'macaroni', 'lasagna', 'ravioli', 'tortellini', 'gnocchi', 'orzo', 'angel hair', 'bucatini', 'cavatappi', 'manicotti', 'ziti', 'aglio e olio', 'cacio e pepe', 'amatriciana', 'bolognese', 'pastas'],
  'spaghetti': ['pasta', 'noodles', 'spag'],
  'mac and cheese': ['macaroni and cheese', 'mac n cheese', 'mac & cheese', 'pasta', 'macaroni'],
  'mac n cheese': ['macaroni and cheese', 'mac and cheese', 'mac & cheese'],
  'lasagna': ['lasagne', 'pasta'],
  'ravioli': ['pasta', 'filled pasta', 'stuffed pasta'],
  'gnocchi': ['pasta', 'potato pasta', 'dumplings'],
  // Sandwich family (expanded)
  'sandwich': ['sub', 'hoagie', 'grinder', 'hero', 'panini', 'wrap', 'sammy', 'sando', 'sambo', 'reuben', 'pastrami', 'italian sub', 'philly cheesesteak', 'banh mi', 'meatball sub', 'tuna melt', 'grilled chicken sandwich', 'po\' boy', 'cuban sandwich', 'monte cristo', 'sandwiches'],
  'sub': ['sandwich', 'submarine', 'hoagie', 'grinder', 'hero', "po'boy", 'spukie', 'torpedo', 'subs'],
  'hoagie': ['sandwich', 'sub', 'hero', 'grinder', 'hoagies'],
  'panini': ['sandwich', 'grilled sandwich', 'pressed sandwich', 'toasted sandwich'],
  'wrap': ['sandwich', 'burrito', 'rolled sandwich', 'wraps'],
  'blt': ['bacon lettuce tomato', 'sandwich'],
  'pb&j': ['peanut butter and jelly', 'pbj', 'sandwich'],
  'club': ['club sandwich', 'sandwich'],
  // Pizza family
  'pizza': ['pie', 'slice', 'za', 'margherita', 'pepperoni', 'sausage', 'supreme', 'hawaiian', 'bbq chicken', 'buffalo chicken', 'meat lovers', 'veggie', 'white pizza', 'deep dish', 'thin crust', 'stuffed crust', 'flatbread pizza', 'pizzas'],
  'calzone': ['pizza', 'folded pizza', 'pizza pocket', 'stromboli'],
  'flatbread': ['pizza', 'thin crust'],
  // Burger family (expanded)
  'burger': ['hamburger', 'cheeseburger', 'sandwich', 'patty', 'bacon burger', 'mushroom swiss', 'bbq burger', 'black bean burger', 'salmon burger', 'bison burger', 'lamb burger', 'sliders', 'double burger', 'patty melt', 'burgers'],
  'hamburger': ['burger', 'hamburg'],
  'cheeseburger': ['burger', 'hamburger', 'cheese burger'],
  'veggie burger': ['vegetarian burger', 'plant burger', 'beyond burger', 'impossible burger'],
  'turkey burger': ['burger', 'poultry burger'],
  // Chicken family (expanded)
  'chicken': ['pollo', 'fowl', 'hen', 'chick', 'chx', 'chickens'],
  'wings': ['chicken wings', 'buffalo wings', 'hot wings', 'bbq wings'],
  'tenders': ['chicken tenders', 'chicken strips', 'fingers', 'chicken fingers', 'tendies'],
  'nuggets': ['chicken nuggets', 'nugs', 'mcnuggets'],
  'rotisserie': ['roasted chicken', 'roast chicken', 'chicken'],
  'general tso\'s chicken': ['general tso', 'chinese food'],
  'kung pao chicken': ['kung pao', 'gong bao'],
  'orange chicken': [],
  'sweet and sour pork': ['sweet and sour chicken'],
  // Beef family (expanded)
  'beef': ['steak', 'meat', 'cow'],
  'steak': ['beef', 'filet', 'ribeye', 'sirloin', 'strip', 't-bone', 'porterhouse', 'steaks'],
  'brisket': ['beef', 'bbq beef', 'smoked beef'],
  'prime rib': ['beef', 'rib roast', 'standing rib roast'],
  'beef and broccoli': [],
  // Seafood family (expanded)
  'seafood': ['fish', 'shellfish', 'fish and chips', 'lobster roll', 'clam chowder', 'fish tacos', 'grilled salmon', 'shrimp scampi', 'crab cakes', 'oysters', 'mussels', 'calamari', 'fish fry', 'seared tuna', 'lobster bisque', 'cioppino', 'paella', 'ceviche', 'grilled shrimp'],
  'fish': ['seafood', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'bass', 'trout', 'mahi', 'catfish', 'unagi'],
  'shrimp': ['prawns', 'seafood', 'scampi', 'shrimps'],
  'crab': ['seafood', 'crabmeat', 'crab cake', 'crabs'],
  'lobster': ['seafood', 'langostino'],
  'calamari': ['squid', 'seafood', 'fried squid'],
  'oysters': ['seafood', 'raw bar', 'shellfish'],
  'sushi': ['sashimi', 'roll', 'maki', 'nigiri', 'japanese', 'raw fish', 'california roll', 'spicy tuna roll', 'dragon roll', 'rainbow roll'],
  'poke': ['raw fish', 'poke bowl', 'hawaiian'],
  // Baked goods and desserts family (expanded)
  'cake': ['dessert', 'torte', 'gateau', 'cupcake', 'cakes'],
  'ice cream': ['gelato', 'sorbet', 'frozen yogurt', 'froyo', 'dessert'],
  'gelato': ['ice cream', 'italian ice cream'],
  'pie': ['dessert', 'tart', 'pies'],
  'cookie': ['biscuit', 'dessert', 'cookies'],
  'brownie': ['dessert', 'chocolate dessert', 'brownies', 'cake'],
  'donut': ['doughnut', 'dessert', 'pastry', 'donuts'],
  'cupcake': ['cake', 'dessert', 'fairy cake', 'cupcakes'],
  'bread': ['toast', 'loaf', 'baguette', 'ciabatta', 'sourdough', 'rye', 'pumpernickel', 'challah', 'brioche', 'focaccia', 'ciabatta', 'bagel', 'bialy', 'pita', 'lavash', 'naan', 'cornbread'],
  // Breakfast family (expanded)
  'eggs': ['egg', 'omelette', 'scrambled', 'fried egg', 'poached', 'benedict', 'shakshuka'],
  'omelette': ['eggs', 'omelet', 'frittata'],
  'pancakes': ['pancake', 'flapjacks', 'hotcakes', 'griddlecakes'],
  'waffles': ['waffle', 'belgian waffle'],
  'french toast': ['toast', 'bread', 'pain perdu'],
  'bacon': ['pork', 'breakfast meat', 'rashers'],
  'sausage': ['breakfast sausage', 'links', 'patties', 'chorizo', 'bratwurst'],
  'cereal': ['breakfast', 'granola', 'muesli'],
  'oatmeal': ['porridge', 'oats', 'breakfast'],
  'bagel': ['bread', 'roll', 'bagels'],
  // Asian cuisine (expanded)
  'ramen': ['noodles', 'soup', 'japanese noodles', 'noodle soup'],
  'pho': ['vietnamese soup', 'noodle soup', 'soup'],
  'pad thai': ['thai noodles', 'noodles', 'stir fry'],
  'lo mein': ['noodles', 'chinese noodles', 'stir fry noodles'],
  'chow mein': ['noodles', 'chinese noodles', 'crispy noodles'],
  'fried rice': ['rice', 'chinese rice', 'yangzhou rice'],
  'dim sum': ['dumplings', 'chinese', 'yum cha', 'har gow', 'siu mai', 'char siu bao'],
  'dumplings': ['potstickers', 'gyoza', 'wontons', 'pierogi', 'momo', 'xiaolongbao', 'albondigas', 'knish'],
  'spring roll': ['egg roll', 'lumpia', 'vietnamese roll', 'summer roll'],
  'bibimbap': ['korean rice bowl', 'dolsot bibimbap'],
  'bulgogi': ['korean bbq', 'marinated beef'],
  // Mexican/Latin (expanded)
  'taco': ['tacos', 'soft taco', 'hard taco', 'carnitas', 'carne asada', 'al pastor', 'fish taco', 'korean tacos'],
  'burrito': ['wrap', 'burrito bowl', 'chimichanga', 'burritos'],
  'quesadilla': ['cheese quesadilla', 'mexican grilled cheese', 'quesadillas'],
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
  'curry': ['indian', 'masala', 'gravy', 'green curry', 'red curry', 'yellow curry', 'massaman curry', 'panang curry', 'vindaloo', 'korma', 'rogan josh', 'chicken curry', 'lamb curry', 'vegetable curry'],
  'tikka masala': ['curry', 'chicken tikka masala', 'indian'],
  'tandoori': ['indian', 'grilled', 'clay oven'],
  'naan': ['bread', 'indian bread', 'flatbread', 'garlic naan'],
  'samosa': ['indian', 'appetizer', 'fried pastry', 'samosas'],
  'biryani': ['rice', 'indian rice', 'spiced rice'],
  'dal': ['lentils', 'indian', 'daal', 'dhal', 'lentil soup'],
  // Drinks (expanded)
  'soda': ['pop', 'soft drink', 'cola', 'coke', 'pepsi', 'fizzy drink', 'carbonated'],
  'juice': ['fresh juice', 'fruit juice'],
  'smoothie': ['juice', 'shake', 'blended drink', 'smoothies'],
  'milkshake': ['shake', 'dessert drink', 'thick shake'],
  'lemonade': ['lemon drink', 'citrus drink', 'summer drink'],
  'beer': ['lager', 'ale', 'ipa', 'stout', 'pilsner', 'brew', 'beers'],
  'wine': ['vino', 'red wine', 'white wine', 'rosé', 'wines'],
  'cocktail': ['mixed drink', 'alcoholic beverage', 'drink', 'cocktails'],
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
  'italian': ['alfredo', 'antipasto', 'bolognese', 'bruschetta', 'calzone', 'cannoli', 'cappuccino', 'carbonara', 'caesar salad', 'caprese salad', 'chicken parmigiana', 'espresso', 'fettuccine alfredo', 'focaccia', 'gelato', 'gnocchi', 'lasagna', 'marinara', 'margherita pizza', 'minestrone', 'osso buco', 'panettone', 'panini', 'pasta', 'pepperoni pizza', 'pesto', 'pizza', 'ravioli', 'risotto', 'spaghetti', 'stromboli', 'tiramisu', 'veal marsala'],
  'mexican': ['al pastor', 'burrito', 'carne asada', 'carnitas', 'chiles rellenos', 'chimichangas', 'chips and salsa', 'churros', 'elote', 'enchilada', 'fajitas', 'fish tacos', 'flautas', 'guacamole', 'margarita', 'menudo', 'mole', 'nachos', 'pozole', 'quesadilla', 'salsa', 'taco', 'tamale', 'tostadas', 'tres leches cake'],
  'japanese': ['bento', 'bento box', 'california roll', 'chirashi bowl', 'dango', 'donburi', 'dragon roll', 'edamame', 'gyoza', 'miso', 'miso soup', 'mochi', 'nigiri', 'okonomiyaki', 'onigiri', 'rainbow roll', 'ramen', 'sake', 'sashimi', 'soba', 'spicy tuna roll', 'sushi', 'taiyaki', 'takoyaki', 'tempura', 'teppanyaki', 'teriyaki', 'teriyaki chicken', 'tonkatsu', 'udon', 'unagi', 'yakisoba', 'yakitori', 'matcha', 'chicken katsu'],
  'chinese': ['beef and broccoli', 'char siu bao', 'chow mein', 'congee', 'dan dan noodles', 'dim sum', 'dumplings', 'egg rolls', 'fortune cookie', 'fried rice', 'general tso', 'general tso\'s chicken', 'har gow', 'hot and sour soup', 'hot pot', 'kung pao chicken', 'lo mein', 'mapo tofu', 'orange chicken', 'peking duck', 'potstickers', 'salt and pepper shrimp', 'siu mai', 'spring roll', 'sweet and sour', 'sweet and sour pork', 'szechuan fish', 'tea eggs', 'wonton', 'wonton soup', 'xiaolongbao'],
  'indian': ['aloo gobi', 'basmati rice', 'biryani', 'butter chicken', 'chai', 'chana masala', 'chicken curry', 'chole', 'curry', 'dal', 'garlic naan', 'gulab jamun', 'korma', 'kulfi', 'lamb curry', 'lassi', 'naan', 'pakoras', 'palak paneer', 'paneer', 'papadum', 'raita', 'rogan josh', 'saag', 'samosa', 'tandoori', 'tandoori chicken', 'tikka masala', 'vindaloo'],
  'thai': ['basil fried rice', 'boat noodles', 'drunken noodles', 'green curry', 'khao soi', 'larb', 'mango sticky rice', 'massaman', 'massaman curry', 'pad krapow', 'pad see ew', 'pad thai', 'pad woon sen', 'panang curry', 'papaya salad', 'red curry', 'satay', 'som tam', 'spring rolls', 'sticky rice', 'summer rolls', 'thai beef salad', 'thai coconut soup', 'thai fried rice', 'tom kha soup', 'tom yum', 'tom yum soup', 'yellow curry'],
  'american': ['apple pie', 'baked beans', 'banana pudding', 'bbq', 'bbq chicken', 'biscuits and gravy', 'blt', 'buffalo wings', 'burger', 'catfish', 'cheeseburgers', 'chicken and waffles', 'chicken pot pie', 'chicken wings', 'chocolate chip cookies', 'clam chowder', 'club sandwich', 'coleslaw', 'cornbread', 'french fries', 'fried chicken', 'grilled cheese', 'hot dog', 'hush puppies', 'jambalaya', 'gumbo', 'lobster roll', 'mac and cheese', 'meatloaf', 'milkshakes', 'mozzarella sticks', 'onion rings', 'pancakes', 'pecan pie', 'po\' boys', 'pot roast', 'pulled pork', 'ribs', 'shrimp and grits', 'sweet potato pie', 'waffles', 'brisket'],
  'french': ['baguette', 'beef bourguignon', 'boeuf tartare', 'bouillabaisse', 'brie', 'brioche', 'camembert', 'cassoulet', 'coq au vin', 'creme brulee', 'crepe', 'croissant', 'croque monsieur', 'duck confit', 'eclair', 'eclairs', 'escargot', 'foie gras', 'french onion soup', 'french toast', 'macaron', 'macarons', 'nicoise salad', 'pain au chocolat', 'profiteroles', 'quiche', 'quiche lorraine', 'ratatouille', 'souffle'],
  'mediterranean': ['antipasto', 'baba ganoush', 'baklava', 'caprese salad', 'dolma', 'dolmas', 'falafel', 'fattoush', 'feta cheese', 'greek salad', 'grilled fish', 'grilled vegetables', 'gyro', 'halva', 'hummus', 'kebab', 'kibbeh', 'labneh', 'lamb kofta', 'lamb souvlaki', 'manakish', 'mediterranean quinoa bowl', 'moussaka', 'muhammara', 'olive tapenade', 'olives', 'pesto', 'pita', 'pita bread', 'prosciutto', 'ratatouille', 'seafood paella', 'shakshuka', 'shawarma', 'stuffed grape leaves', 'tabbouleh', 'turkish delight', 'tzatziki', 'za\'atar'],
  'korean': ['banchan', 'bibimbap', 'bingsu', 'buldak', 'bulgogi', 'dolsot bibimbap', 'galbi', 'hotteok', 'japchae', 'jajangmyeon', 'kimchi', 'kimchi fried rice', 'kimchi jjigae', 'kimbap', 'korean bbq', 'korean corn dogs', 'korean fried chicken', 'korean tacos', 'naengmyeon', 'samgyeopsal', 'soju', 'sundubu jjigae', 'tteokbokki'],
  'jewish': ['babka', 'bagel', 'bialy', 'brisket', 'challah', 'knish', 'lox', 'matzo', 'pastrami', 'rugelach'],
  'german': ['beer', 'bratwurst', 'pumpernickel', 'pretzel', 'sauerbraten', 'sauerkraut', 'schnitzel', 'spätzle', 'strudel'],
  'spanish': ['albondigas', 'calamari', 'chorizo', 'churros', 'crema catalana', 'croquetas', 'fabada', 'flan', 'gambas al ajillo', 'gazpacho', 'jamón ibérico', 'paella', 'pan con tomate', 'patatas bravas', 'pinchos', 'pulpo a la gallega', 'sangria', 'spanish olives', 'tapas', 'tortilla española'],
  'greek': ['baklava', 'dolmades', 'falafel', 'feta cheese', 'greek fries', 'greek lemon soup', 'greek salad', 'greek yogurt', 'grilled octopus', 'gyros', 'hummus', 'moussaka', 'ouzo', 'pastitsio', 'souvlaki', 'spanakopita', 'tzatziki'],
  'vietnamese': ['banh mi', 'banh xeo', 'bun bo hue', 'cao lau', 'che', 'com tam', 'grilled pork', 'lemongrass chicken', 'pho', 'spring rolls', 'summer rolls', 'vermicelli bowl', 'vietnamese coffee', 'vietnamese iced coffee', 'vietnamese pancakes']
};
export const MEAL_TIMES = {
  'breakfast': ['acai bowls', 'avocado toast', 'bacon', 'bagel', 'bialy', 'breakfast burrito', 'cereal', 'coffee cake', 'cinnamon roll', 'croissant', 'danish', 'eggs', 'french toast', 'granola', 'hash browns', 'muffin', 'oatmeal', 'pancakes', 'sausage', 'scone', 'smoothie bowl', 'toast', 'waffles', 'yogurt'],
  'brunch': ['avocado toast', 'bloody mary', 'crepes', 'eggs benedict', 'frittata', 'french toast', 'mimosa', 'pancakes', 'quiche', 'smoothie bowls'],
  'lunch': ['bowl', 'burger', 'panini', 'pizza slice', 'salad', 'sandwich', 'soup', 'wrap'],
  'dinner': ['casserole', 'curry', 'grilled fish', 'lasagna', 'pasta', 'roast', 'steak', 'stir fry'],
  'dessert': ['apple pie', 'baklava', 'brownie', 'brownies', 'cake', 'cannoli', 'carrot cake', 'cheesecake', 'chocolate cake', 'cookies', 'crème brûlée', 'cupcakes', 'donuts', 'fudge', 'gelato', 'ice cream', 'macarons', 'pie', 'pudding', 'red velvet cake', 'sorbet', 'tiramisu', 'tres leches cake', 'truffles'],
  'snack': ['cheese', 'chips', 'crackers', 'fruit', 'granola bar', 'nuts', 'popcorn', 'trail mix'],
  'appetizer': ['antipasto', 'bruschetta', 'buffalo dip', 'calamari', 'cheese board', 'cheese sticks', 'charcuterie', 'deviled eggs', 'dumplings', 'guacamole', 'hummus', 'mozzarella sticks', 'nachos', 'onion rings', 'shrimp cocktail', 'sliders', 'spinach dip', 'spring rolls', 'tapas', 'wings'],
  'soup': ['bisque', 'bouillabaisse', 'chicken noodle', 'clam chowder', 'french onion', 'gazpacho', 'lentil', 'lobster bisque', 'minestrone', 'miso', 'pho', 'ramen', 'split pea', 'tom yum', 'tomato', 'vegetable', 'wonton'],
  'salad': ['arugula', 'asian chicken', 'caesar', 'caprese', 'chicken salad', 'cobb', 'garden', 'greek', 'kale', 'mediterranean', 'nicoise', 'quinoa', 'southwest', 'spinach', 'tuna salad', 'waldorf']
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