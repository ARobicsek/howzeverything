# HowzEverything - Comprehensive Technical Documentation

## Project Overview

**HowzEverything** is a React 19 + TypeScript restaurant and food rating web application built with Vite. It enables users to discover restaurants, rate dishes, share food experiences, and manage their dining preferences using location-based services.

**Core Stack:**
- Frontend: React 19 + TypeScript with Vite 6.3.5
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Styling: Tailwind CSS 4.x + Custom Design System
- Routing: React Router DOM 7.x
- State Management: React Context (AuthContext) + Custom Hooks
- Search: Fuse.js 7.1.0 (fuzzy search), Geoapify API (location search)
- Total Codebase: ~17,276 lines of TypeScript/TSX code

---

## 1. DIRECTORY STRUCTURE & FILE ORGANIZATION

### Root Level Structure
```
/home/user/howzeverything/
├── src/
│   ├── components/          # React components (34 files across subdirs)
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks (10 hooks)
│   ├── services/            # API & external services
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── styles/              # Theme system
│   ├── tools/               # Development tools
│   ├── assets/              # Static assets
│   ├── App.tsx              # Main app router
│   ├── main.tsx             # Entry point
│   ├── constants.ts         # Design tokens & styles
│   ├── supabaseClient.ts    # Supabase initialization
│   └── index.css            # Global styles
├── public/                  # Static files
├── supabase/                # Edge functions
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config (strict mode)
├── package.json
└── eslint.config.js         # ESLint configuration
```

### Components Directory (src/components/)

**Top-level components (14 files):**
- AddDishForm.tsx
- CommentForm.tsx
- DishCard.tsx
- DuplicateDishModal.tsx
- PhotoCarousel.tsx
- PhotoModal.tsx
- PhotoUpload.tsx
- SearchAndSort.tsx
- ThemeSelector.tsx
- LoadingScreen.tsx
- InlineLoadingSpinner.tsx
- EmptyState.tsx
- ErrorScreen.tsx
- SupabaseDebugTest.tsx

**Subdirectories:**
- `location/` - LocationPermissionModal.tsx, LocationAwareButton.tsx
- `navigation/` - NavigationModal.tsx, TopNavigation.tsx
- `restaurant/` - AddRestaurantForm.tsx, EditRestaurantForm.tsx, DuplicateRestaurantModal.tsx, RestaurantCard.tsx, RestaurantSearchAndSort.tsx, RestaurantSearchForm.tsx, RestaurantSearchResults.tsx, SearchResultsModal.tsx
- `shared/` - StarRating.tsx, AccordionSection.tsx, AddressInput.tsx
- `user/` - LoginForm.tsx, UserForm.tsx, ForgotPasswordForm.tsx, ResetPasswordForm.tsx, ProfileCard.tsx

### Screen Components (Top-level src/ directory)
- App.tsx (Main router with protected routes)
- main.tsx (Entry point with Eruda debugger setup)
- HomeScreen.tsx
- MenuScreen.tsx
- FindRestaurantScreen.tsx
- DiscoveryScreen.tsx
- RestaurantScreen.tsx
- ProfileScreen.tsx
- RatingsScreen.tsx
- AboutScreen.tsx
- AdminScreen.tsx

---

## 2. REACT COMPONENTS - DETAILED ANALYSIS

### Core Application Components

#### **App.tsx** (~320 lines)
**Purpose:** Main router and entry point for authenticated app
**Key Features:**
- Implements React Router with protected routes
- Manages auth state and profile creation
- Handles URL-based sharing (restaurants and dishes)
- Responsive layout management with `getScreenConfig()`
- Supports shared content handling via `SharedContentHandler`
- Admin route conditional rendering

**Architecture Patterns:**
- ProtectedRoute wrapper for auth-gated pages
- SharedContentHandler as standalone component
- Separate flow components for auth (AuthFlow, ForgotPasswordFlow, ResetPasswordFlow)
- LocationProvider wraps entire app

**Dependencies:**
- useAuth, useTheme, useLocationService hooks
- React Router DOM 7.x
- Multiple screen components

---

### Screen Components Analysis

#### **HomeScreen.tsx** (~100 lines)
- Landing page with navigation cards
- Uses InfoCard sub-component for interactive cards
- Theme-aware styling
- Lazy navigation with scroll-to-top

#### **MenuScreen.tsx** (~400+ lines)
- Main dish browsing and rating interface
- Complex state management (search, sorting, expanded dishes)
- Duplicate dish detection with modal
- Real-time photo uploads and comments
- Sticky header with restaurant info
- Search/sort consolidation component

**State Management:**
- searchTerm, selectedSort
- expandedDishId (tracks which dish card is expanded)
- showDuplicateWarning (modal state)
- justAddedDishId timer (prevents photo upload interruption - recent fix)

#### **FindRestaurantScreen.tsx** (~500+ lines)
- Restaurant discovery with location services
- Pinned restaurants section
- Recent visits tracking
- Nearby restaurants based on radius
- Restaurant search results modal
- Add restaurant form integration
- Duplicate restaurant detection

**Complex Features:**
- Session-based location permission handling
- Multiple data sources (pinned, nearby, recent, search results)
- Accordion-based section management
- Restaurant stats calculation

#### **DiscoveryScreen.tsx** (~300+ lines)
- Global dish discovery across all restaurants
- Advanced filtering (rating, distance, search term)
- Location-based distance calculations
- Dishes grouped by restaurant
- Automatic location permission handling

**Filtering System:**
- searchTerm (fuzzy match against dish names)
- minRating (0-5 stars)
- maxDistance (-1 means "any")
- Distance filtering requires location permission

#### **RatingsScreen.tsx**
- User's rated dishes display
- Filtering and sorting
- Edit/delete rating capabilities

#### **ProfileScreen.tsx**
- User profile information display
- Profile editing via modal
- Statistics display
- Sign out functionality

#### **DiscoveryScreen.tsx & RatingsScreen.tsx**
- Similar layout patterns
- Hero images + filters + search
- Dish card listings

---

### Component Families

#### **DishCard Component** (~300+ lines)
**Props Interface:**
```typescript
interface DishCardProps {
  dish: DishWithDetails | null;
  currentUserId: string | null;
  onDelete: (dishId: string) => void;
  onUpdateRating: (dishId: string, rating: number) => void;
  onUpdateDishName?: (dishId: string, newName: string) => Promise<boolean>;
  onAddComment: (dishId: string, text: string) => Promise<void>;
  onUpdateComment: (commentId: string, dishId: string, text: string) => Promise<void>;
  onDeleteComment: (dishId: string, commentId: string) => Promise<void>;
  onAddPhoto: (dishId: string, file: File, caption?: string) => Promise<void>;
  onDeletePhoto: (dishId: string, photoId: string) => Promise<void>;
  onUpdatePhotoCaption: (photoId: string, caption: string) => Promise<void>;
  onShare: (dish: DishWithDetails) => void;
  isSubmittingComment: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  allowInlineRating?: boolean;
}
```

**Sub-components:**
- RatingSummary (displays personal vs community ratings)
- RatingBreakdown (interactive rating interface)

**Features:**
- Photo carousel with upload capability
- Comment threads with edit/delete
- Multi-star rating system (personal + community)
- Share functionality
- Photo upload modal with compression

#### **RestaurantCard Component**
- Minimal restaurant display
- Distance calculation and display
- Pin/favorite toggle
- Navigation to restaurant menu

#### **Login/Authentication Components**
- LoginForm.tsx - Sign in/sign up form
- ForgotPasswordForm.tsx - Password reset request
- ResetPasswordForm.tsx - New password entry
- UserForm.tsx - Profile editing (modal)
- ProfileCard.tsx - Profile display

---

## 3. CUSTOM HOOKS - STATE MANAGEMENT & DATA FETCHING

### Hook Inventory

| Hook | Purpose | Key Features |
|------|---------|--------------|
| `useAuth` | Authentication state & actions | Simple context wrapper |
| `useAuthLogic` | Auth implementation (in AuthContext) | Session management, profile loading |
| `useTheme` | Theme switching | localStorage persistence, 4 themes |
| `useRestaurants` | Fetch & manage restaurant list | Sorting, search, stats calculation |
| `useRestaurant` | Single restaurant details | Refresh mechanism with key state |
| `useDishes` | Fetch & manage dish data | Photo/comment processing, search |
| `useLocationService` | Geolocation management | Provider context, permission handling |
| `useNearbyRestaurants` | Nearby restaurants by radius | Distance-based filtering |
| `usePinnedRestaurants` | Pinned restaurant management | Optimistic updates, toggle |
| `useComments` | Dish comments management | CRUD operations |
| `useShare` | URL sharing functionality | Copy to clipboard |
| `useRestaurantVisits` | Track restaurant visits | Recent visits history |

### Key Hook Details

#### **useAuth Hook**
```typescript
// Simple wrapper around AuthContext
const useAuth = (): AuthContextReturn => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
```

**Actual logic in AuthContext.tsx (~250+ lines):**
- onAuthStateChange subscription
- Profile loading with caching
- Multiple auth methods (signIn, signUp, signOut, updateProfile, resetPassword)
- Session refresh on window focus
- Handles INITIAL_SESSION event
- Error states with clearError

#### **useRestaurants Hook** (~250+ lines)
**Complex functionality:**
- Fetches user favorite restaurants with stats (RPC call)
- Combines distance calculations
- Search functionality (Geoapify + local DB)
- Duplicate detection via similarity scoring
- Database and API result merging
- Sorting by name, date, or distance

**State Management:**
```typescript
const [restaurants, setRestaurants] = useState<RestaurantWithStats[]>([]);
const [isLoading, setIsLoading] = useState(initialFetch);
const [error, setError] = useState<string | null>(null);
const [searchResults, setSearchResults] = useState<GeoapifyPlace[]>([]);
const [isSearching, setIsSearching] = useState(false);
const [searchError, setSearchError] = useState<string | null>(null);
const [isLoadingDetails, setIsLoadingDetails] = useState(false);
const [restaurantErrors, setRestaurantErrors] = useState<Map<string, string>>(new Map());
```

#### **useDishes Hook** (~250+ lines)
**Key Features:**
- Processes raw dish data with joins (photos, ratings, comments)
- Filters hidden comments
- Generates public photo URLs
- Computes averages from ratings
- Search functionality (fuzzy + similarity)
- Similarity finding across restaurants

**Data Processing:**
- processDishesForMenu() - Main transformation function
- Handles missing user info with "Anonymous User" fallback
- Preserves photography metadata (caption, dimensions)

#### **useLocationService Hook** (~150+ lines)
**Location Management Context:**
```typescript
interface LocationContextType extends LocationState {
  browserInfo: BrowserInfo;
  requestLocation: () => void;
  refreshLocation: () => Promise<{ latitude: number, longitude: number } | null>;
  isAvailable: boolean;
  isPermissionModalOpen: boolean;
  openPermissionModal: () => void;
  closePermissionModal: () => void;
  initialCheckComplete: boolean;
}
```

**Features:**
- Browser detection (iOS/Android detection)
- Geolocation permission handling
- Modal for permission requests
- Caching of location requests via Promise ref
- Returns: coordinates, status, error, denialType

#### **usePinnedRestaurants Hook** (~100 lines)
**Optimistic Updates Pattern:**
- Toggles pin state immediately
- Reverts on error
- Set-based ID tracking for O(1) lookup
- Fetches full restaurant data on demand

#### **useNearbyRestaurants Hook**
- Distance-based filtering from user location
- Configurable radius (miles)
- Caching by location coordinates
- Returns sorted by distance

#### **useRestaurant Hook** (~60 lines)
**Simple Single-Resource Hook:**
- Fetches one restaurant by ID
- Key-based refresh mechanism
- Standard loading/error states

#### **useComments Hook**
- Comment CRUD operations
- Comment threads for dishes
- User metadata (name, email)

---

## 4. STATE MANAGEMENT & CONTEXT

### AuthContext.tsx (~300+ lines)

**Auth State Structure:**
```typescript
interface AuthState {
  user: User | null;
  profile: DatabaseUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<DatabaseUser>) => Promise<boolean>;
  createProfile: (profileData: Partial<DatabaseUser>) => Promise<boolean>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}
```

**Implementation Details:**
- Uses `onAuthStateChange` for real-time auth updates
- Profile loading with caching (loadingRef, profileLoadedRef)
- Handles PGRST116 error code (no profile exists)
- Handles 406 error (profile load during auth state change)
- Session refresh on window focus (proactive)
- Auto-creates profile 1 second after initial sign-in

**Issues Found:**
- Multiple ref-based caching mechanisms can be confusing
- Profile creation delay (1000ms setTimeout) - potential race condition
- Extensive logging for debugging

### ThemeContext.tsx (~900 lines)

**Theme System:**
- 4 themes: victorian (default), 90s (neon), grumpy-cat, copenhagen
- localStorage persistence
- Theme engine-driven approach
- Massive color override system

**Theme Structure:**
```typescript
export interface ThemeContextType {
  currentTheme: string;
  theme: Theme;
  availableThemes: Theme[];
  switchTheme: (themeId: string) => void;
}
```

**Theme Definitions:**
- Base specs with minimal properties
- Color overrides (100+ properties per theme)
- Font overrides (heading, body, elegant)
- Effect overrides (hover, glow)
- Image mappings per theme
- Semantic tokens for component-specific styling

**Design System Complexity:**
- Over 200 color tokens across all themes
- Theme engine generates derived colors
- Custom semantic tokens (aboutHeaderBackground, menuInputBoxShadow, etc.)

### LocationProvider (useLocationService.tsx)

**Provider Architecture:**
- Wraps entire app (in App.tsx)
- Manages browser's Geolocation API
- Tracks permission status (granted, denied, requesting)
- Handles browser limitations (iOS/Android differences)

---

## 5. ROUTING STRUCTURE

### Protected Routes Architecture

**Route Hierarchy:**
```
/
├── /login                    # AuthFlow (public)
├── /forgot-password          # ForgotPasswordFlow (public)
├── /reset-password           # ResetPasswordFlow (public)
└── /* (ProtectedRoute)       # Requires auth
    ├── /home                 # HomeScreen
    ├── /find-restaurant      # FindRestaurantScreen
    ├── /restaurants          # RestaurantScreen (list view)
    ├── /restaurants/:restaurantId # MenuScreen (dishes)
    ├── /discover             # DiscoveryScreen
    ├── /ratings              # RatingsScreen
    ├── /profile              # ProfileScreen
    ├── /about                # AboutScreen
    └── /admin                # AdminScreen (admin only)
```

**Route Configuration (App.tsx):**
- Uses React Router 7.x declarative Routes
- ProtectedRoute component checks auth state
- Redirects unauthenticated users to /login
- Preserves origin location for post-login redirect
- Admin route conditional rendering based on email list
- Dynamic screen config for layout management

**Shared URL Handling:**
- parseSharedUrl() extracts shared content from URL
- Supports multiple URL formats (querystring and path-based)
- Legacy format fallback (?shared=... & ?id=...)
- clearSharedUrlParams() cleans URL after processing
- Adds restaurant to favorites before navigating

---

## 6. BACKEND INTEGRATION - SUPABASE

### Database Schema (from types/supabase.ts)

**Core Tables:**

1. **users** - User profiles
   - id, full_name, email, bio, location, avatar_url
   - Created automatically on first sign-in
   - Foreign key relationships with ratings, comments, photos

2. **restaurants**
   - id, name, address, full_address
   - Location: latitude, longitude, geoapify_place_id
   - Metadata: phone, website_url, rating, price_tier, category
   - created_by, created_at
   - opening_hours (JSON)

3. **restaurant_dishes**
   - id, restaurant_id, name, description, category
   - is_active, verified_by_restaurant
   - total_ratings, average_rating
   - created_by, created_at

4. **dish_ratings**
   - id, user_id, dish_id, rating (1-5)
   - notes, date_tried
   - created_at, updated_at

5. **dish_comments**
   - id, dish_id, user_id, comment_text
   - is_hidden (moderation flag)
   - hidden_at, hidden_by (admin moderation)
   - created_at, updated_at

6. **dish_photos**
   - id, dish_id, user_id, storage_path
   - caption, width, height (metadata)
   - created_at, updated_at

7. **user_favorite_restaurants**
   - user_id, restaurant_id
   - date_favorited, created_at
   - Composite primary key

8. **user_pinned_restaurants**
   - user_id, restaurant_id
   - pinned_at, created_at

9. **user_restaurant_visits**
   - user_id, restaurant_id, visited_at

### RPC Functions Used

```typescript
// In useRestaurants.tsx
supabase.rpc('get_user_favorite_restaurants_with_stats', { p_user_id })

// In services/restaurantDataService.ts
supabase.rpc('get_restaurants_stats', { p_restaurant_ids })
```

### Authentication Flow

**Supabase Auth Integration:**
```typescript
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

**Sign Up Process:**
1. User enters email, password, name
2. signUp() calls supabase.auth.signUp()
3. AuthContext listens for SIGNED_IN event
4. Profile created 1000ms after auth
5. Navigation to /home

**Sign Out Process:**
1. User clicks sign out
2. supabaseSignOut() called
3. AuthContext clears user/profile/session
4. Redirect to /login

### Storage (S3-like)

**Dish Photos Storage:**
- Bucket: 'dish-photos'
- Path format: `{restaurantId}/{userId}/{photoId}`
- Public URLs via getPublicUrl()
- Image compression before upload

---

## 7. TYPE DEFINITIONS & INTERFACES

### Core Type Files

#### **types/supabase.ts**
- Generated or manually maintained Database type
- JSON helper type
- All table Row, Insert, Update types
- Foreign key relationships

#### **types/restaurant.ts**
```typescript
export interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  full_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  manually_added: boolean | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  geoapify_place_id: string | null;
  phone: string | null;
  website_url: string | null;
  rating: number | null;
  price_tier: number | null;
  category: string | null;
  opening_hours: Json | null;
  created_by: string | null;
  dateAdded?: string;
  date_favorited?: string;
  dishCount?: number;
  raterCount?: number;
  total_unique_raters?: number;
}

export interface RestaurantWithPinStatus extends Restaurant {
  is_pinned?: boolean;
  distance?: number | string;
}
```

#### **hooks/useDishes.tsx** (type definitions)
```typescript
export interface DishPhoto {
  id: string;
  dish_id: string;
  user_id: string;
  storage_path: string;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  created_at: string;
  updated_at: string;
  photographer_name?: string;
  photographer_email?: string;
  url?: string;
}

export interface DishComment {
  id: string;
  dish_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_hidden?: boolean | null;
  commenter_name?: string;
  commenter_email?: string;
}

export interface DishWithDetails extends RestaurantDish {
  comments: DishComment[];
  ratings: DishRating[];
  photos: DishPhoto[];
  dateAdded: string;
}

export interface DishSearchResultWithRestaurant extends DishWithDetails {
  restaurant: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}
```

#### **types/location.ts**
```typescript
export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';
export type LocationDenialType = 'browser' | 'site' | 'unavailable';

export interface LocationState {
  status: LocationStatus;
  denialType: LocationDenialType | null;
  coordinates: { latitude: number; longitude: number } | null;
  error: GeolocationPositionError | null;
  lastChecked: number | null;
}
```

### Type Safety Analysis

**Good Practices:**
- Strict TypeScript mode enabled
- Comprehensive type definitions for data models
- Union types for status states
- Nullable fields properly marked with `| null`
- Interface inheritance for extensibility

**Issues Found:**
- `any[]` type used in 2 places (minimal)
- `as any` cast in useRestaurants (restaurantDetails casting)
- Some untyped object destructuring in dish processing
- localStorage not typed (string keys)

---

## 8. UTILITY FUNCTIONS & HELPERS

### Utility Files Inventory

#### **utils/geolocation.ts** (~110 lines)
**Functions:**
- `calculateDistanceInMiles()` - Haversine formula
- `formatDistanceMiles()` - Smart formatting (feet < 1000ft, mi otherwise)
- `calculateDistanceInKm()` - Metric version
- `formatDistanceKm()` - Metric formatting
- `sortRestaurantsArray()` - Sort by name, date, or distance

**Key Algorithm:**
```typescript
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function calculateDistanceInMiles(lat1, lon1, lat2, lon2): number {
  const R = 3959; // Earth radius in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2)² + cos(lat1)·cos(lat2)·sin(dLon/2)²;
  const c = 2·atan2(√a, √(1-a));
  return R · c;
}
```

#### **utils/dishSearch.ts** (~800+ lines)
**Advanced Search Implementation:**
- Hierarchical FOOD_CATEGORIES object (6 main categories, 20+ subcategories)
- Extensive synonym dictionary (200+ synonyms for food items)
- Fuse.js integration for fuzzy search
- enhancedDishSearch() - Combines category, synonym, and fuzzy matching
- findSimilarDishes() - Similarity scoring for duplicate detection

**Search Strategy:**
1. Category matching (hierarchical)
2. Synonym expansion
3. Fuzzy matching (Fuse.js)
4. Similarity scoring
5. Weighting by match type

#### **utils/urlShareHandler.ts** (~260 lines)
**Sharing Features:**
- parseSharedUrl() - Multiple format support
- handleSharedContent() - Process shared restaurant/dish
- clearSharedUrlParams() - Clean URL after processing
- Auto-favorite on shared link visit

**URL Format Support:**
- New format: `?shareType=restaurant&shareId=...&restaurantId=...`
- Path-based: `/shared/restaurant/...`
- Legacy: `?shared=restaurant&id=...`

#### **utils/addressParser.ts** (~200 lines)
**Address Parsing:**
- Uses parse-address library
- Extracts components (street, city, state, zip)
- Handles various address formats
- Fallback for unparseable addresses

#### **utils/textUtils.ts** (~50 lines)
**Text Processing:**
- calculateEnhancedSimilarity() - Normalized string comparison
- normalizeText() - Lowercase, trim, remove punctuation

**Similarity Algorithm:**
- 3-gram matching
- Case-insensitive comparison
- Special character handling

#### **utils/browserDetection.ts** (~50 lines)
**Browser Detection:**
- Detects iOS vs Android
- Identifies browser (Chrome, Firefox, Safari, Edge)
- User-Agent parsing

#### **utils/countryDetection.ts** (~400 lines)
**Country Detection:**
- User location to country code mapping
- Comprehensive country database
- Used for address validation

#### **utils/queryAnalysis.ts** (~50 lines)
**Search Query Analysis:**
- Detects query type (business name, location, combination)
- Extracts business name and location components
- Enhances search precision

#### **utils/apiCounter.ts** (~30 lines)
**API Usage Tracking:**
- Tracks Geoapify API calls
- incrementGeoapifyCount()
- logGeoapifyCount()

---

## 9. SERVICES LAYER

### Service Files

#### **services/searchService.ts** (~300+ lines)
**SearchService Class:**
- Wrapper around Geoapify API via proxy
- Client-side caching (Map<string, GeoapifyPlace[]>)
- AbortController for request cancellation
- Query analysis for smart search

**Key Methods:**
- searchRestaurants(query, userLat, userLon) - Geoapify + local DB
- Combines API results with local database
- Deduplication by similarity scoring
- Two-pronged approach for 'business location' queries

#### **services/restaurantDataService.ts** (~250+ lines)
**Restaurant Management:**
- verifyRestaurantExists() - Quick existence check
- fetchUserRestaurantsWithStats() - RPC call for stats
- isDuplicateRestaurant() - Similarity-based detection
- findSimilarRestaurants() - Returns matching restaurants
- Additional restaurant CRUD operations

**Duplicate Detection Algorithm:**
```
1. Check geoapify_place_id if provided
2. Normalize names and addresses
3. Compare all restaurants:
   - Name similarity >= 80 (required)
   - If addresses exist: address similarity > 70
   - Otherwise: name similarity > 90
```

#### **services/favoritesService.ts** (~50 lines)
**Favorite Management:**
- addToFavorites() - Add restaurant to user favorites
- isAlreadyFavorited() - Check favorite status
- removeFavorite() - Remove from favorites

#### **services/geocodingService.ts** (~50 lines)
**Geocoding:**
- geocodeAddress() - Convert address to lat/lon
- Uses Geoapify API
- Caches results

---

## 10. CONFIGURATION FILES

### vite.config.ts
```typescript
export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: { outDir: 'dist', sourcemap: false },
  css: { postcss: './postcss.config.js' }
})
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  }
}
```

### eslint.config.js
- ESLint 9.x with TypeScript support
- React hooks plugin enabled
- React refresh warnings
- No additional custom rules

### package.json
**Key Dependencies:**
- React 19.1.0
- TypeScript 5.8.3
- Vite 6.3.5
- Tailwind CSS 4.1.7
- Supabase 2.39.2
- Fuse.js 7.1.0
- DOMPurify 3.2.6 (XSS protection)
- Eruda 3.4.3 (mobile debugging)

---

## 11. DESIGN SYSTEM & STYLING

### constants.ts (~2000+ lines)

**Style Categories:**
1. **DESIGN_TOKENS** - Color palette, typography, spacing
2. **COMPONENT_STYLES** - LoginForm, ProfileCard, UserForm styles
3. **SCREEN_STYLES** - MenuScreen, FindRestaurantScreen, etc. styles
4. **LAYOUT_CONFIG** - Container widths, padding, margins
5. **SPACING** - Spacing scale [0.5, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24]
6. **TYPOGRAPHY** - Font sizes, weights, line heights
7. **SHADOWS** - Predefined box-shadows (light, medium, large)
8. **BORDERS** - Border radius values
9. **Z_INDICES** - Z-index scale for layering
10. **STYLES** - Common component styles (card, button, modal, etc.)
11. **UTILITIES** - Utility classes (fullBleed, flexCenter, etc.)
12. **STYLE_FUNCTIONS** - Functions for dynamic styling

### Theme System (styles/themeEngine.ts & ThemeContext.tsx)

**4 Available Themes:**
1. **Victorian** (default) - Blue primary, burgundy accent, elegant
2. **90s** - Neon colors, cyan/magenta, cyberpunk aesthetic
3. **Grumpy Cat** - Warm orange/brown, cream background
4. **Copenhagen** - Sophisticated Nordic, deep charcoal, brass accents

**Theme Structure:**
```typescript
interface GeneratedTheme {
  colors: {
    primary, primaryHover, primaryLight, accent,
    gray50-900, blue variants, green variants, red variants,
    white, black, shadowLight/Medium, overlay,
    ratingGold, danger, success, warning,
    navBar, text, textSecondary, background, cardBg,
    // + 100+ semantic tokens per theme
  };
  fonts: {
    primary: { fontFamily, letterSpacing, textShadow };
    heading: { ... };
    body: { ... };
    elegant: { ... };
  };
  effects: {
    primaryButtonHover, cardHover, glowEffect;
  };
  images: {
    logo, homeFindRestaurants, homeDiscoverDishes,
    discoveryHero, findRestaurantHero, ratingsHero,
    aboutHero, restaurantDefault
  };
}
```

**Theme Persistence:**
- localStorage key: 'howzeverything-theme'
- Fallback to 'victorian' if not found
- Automatic save on switch

**Tailwind Integration:**
- Global index.css with @tailwind directives
- postcss.config.js for processing
- Customized via constants.ts design tokens

---

## 12. DEVELOPER TOOLS & DEBUGGING

### Eruda Mobile Debugger (main.tsx)
```typescript
const params = new URLSearchParams(window.location.search);
const enableDebug = params.get('debug') === 'true' || import.meta.env.DEV;

if (enableDebug) {
  import('eruda').then(eruda => {
    eruda.default.init();
    console.log('📱 Eruda mobile debugger initialized');
  });
}
```

**Usage:** Add `?debug=true` to URL or run in dev mode

### Console Logging
- 216 console statements throughout codebase
- Heavy logging for debugging (especially in AuthContext)
- Styled logs in SearchService (color formatting)
- Performance markers (console.time/timeEnd)

### Development Scripts (package.json)
```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "type-check": "tsc --noEmit",
  "sync-search": "node sync-search-logic.js"
}
```

---

## 13. KEY FEATURES & IMPLEMENTATION

### Feature 1: Restaurant Discovery & Favoriting
**Flow:**
1. FindRestaurantScreen loads user's favorite restaurants
2. Search via Geoapify API or local database
3. Similarity scoring to avoid duplicates
4. Add to favorites via user_favorite_restaurants join table
5. Pinning on top (user_pinned_restaurants table)
6. Recent visits tracked (user_restaurant_visits table)

**Implementation:** useRestaurants, useNearbyRestaurants, usePinnedRestaurants hooks

### Feature 2: Dish Rating & Community Average
**Data Model:**
- Each dish has multiple ratings (dish_ratings table)
- Personal rating: user's own rating
- Community average: mean of all ratings
- Display: RatingSummary component shows both

**Calculation:**
```typescript
const actualAverageRating = ratings.length > 0
  ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
  : 0;
```

### Feature 3: Photo Management
**Flow:**
1. User selects photo in PhotoUpload component
2. Image compressed client-side
3. Uploaded to dish-photos S3 bucket
4. Public URL generated
5. Metadata (width, height, caption) stored in DB
6. Photo carousel displays all photos for dish
7. Delete removes both S3 file and DB record

**Components:** PhotoUpload, PhotoCarousel, PhotoModal

**Recent Fix:** justAddedDishId timer prevents photo modal from interrupting during upload (extended timer)

### Feature 4: Comments & Moderation
**Features:**
- Comments per dish with user info
- Edit/delete comments by author
- Hidden comments (is_hidden flag)
- Admin moderation (hidden_by, hidden_at)
- Comment threads in DishCard

**Components:** CommentForm, comments rendered in DishCard

### Feature 5: Dish Discovery & Global Search
**Implementation (DiscoveryScreen):**
1. Filter by search term (fuzzy via dishSearch.ts)
2. Filter by minimum rating
3. Filter by maximum distance (requires location)
4. Combine filters with AND logic
5. Group results by restaurant
6. Display with distance badges

**Search Sophistication:**
- Hierarchical category matching
- Synonym expansion (e.g., "coffee" → latte, cappuccino, espresso)
- Fuzzy matching via Fuse.js
- Similarity scoring for duplicate detection

### Feature 6: URL Sharing
**Supported Shares:**
- Share restaurant link
- Share dish link (with restaurant context)

**Implementation:**
1. parseSharedUrl() extracts from URL params
2. handleSharedContent() processes share
3. Auto-adds restaurant to favorites
4. Navigates to appropriate screen
5. clearSharedUrlParams() cleans URL
6. Multiple URL format support for backward compatibility

**Formats Supported:**
- `?shareType=restaurant&shareId=ID&restaurantId=ID`
- `/shared/restaurant/ID`
- Legacy `?shared=type&id=ID`

### Feature 7: Location-Based Services
**Components:**
1. LocationProvider (context) - Browser geolocation
2. LocationAwareButton - Request permission
3. LocationPermissionModal - User explanation
4. useLocationService hook - Location state

**Features:**
- Automatic permission request on location screens
- Distance calculation and filtering
- Session-based permission check (LOCATION_INTERACTION_KEY)
- Browser detection (iOS/Android handling)
- Fallback when unavailable

### Feature 8: Theme Switching
**Implementation:**
- ThemeProvider wraps app
- useTheme hook provides current theme
- localStorage persists selection
- 4 complete themes with all color overrides
- Semantic tokens for specific components
- Image swapping per theme

**Complexity:** 900 lines in ThemeContext for color definitions

---

## 14. CODE QUALITY ANALYSIS

### Strengths

1. **Type Safety**
   - Strict TypeScript mode enabled
   - Comprehensive type definitions
   - Few `any` casts (1-2 instances)
   - Good use of union types for states

2. **Component Organization**
   - Clear separation of concerns
   - Reusable shared components
   - Feature-based directory structure
   - Props interfaces well-defined

3. **State Management**
   - Custom hooks encapsulate logic
   - Context API for global state
   - Optimistic updates in some places
   - Error states properly handled

4. **Error Handling**
   - Try-catch blocks in async operations
   - Error state in hooks
   - User-facing error messages
   - Graceful fallbacks

5. **Performance**
   - React.memo used for FindRestaurantScreen
   - Debouncing in search (useRef timers)
   - Caching in SearchService
   - Lazy imports (Eruda debugger)

### Issues & Anti-Patterns

#### 1. **Excessive Logging**
```typescript
// ~216 console statements
console.log('🔐 AuthContext: loadUserProfile: Starting for userId:', userId);
console.log('[DISCOVERY] Search Effect Run #${effectRunCount.current}');
```
**Impact:** Clutters production logs, slow debugging
**Fix:** Implement proper logging service with levels

#### 2. **Duplicate Location Permission Handling**
```typescript
// Same pattern in FindRestaurantScreen & DiscoveryScreen
if (!initialCheckComplete) return;
if (locationStatus === 'denied') openPermissionModal();
else if (locationStatus === 'idle') requestLocation();
```
**Impact:** Code duplication across screens
**Fix:** Extract to custom hook useLocationPermissionHandler()

#### 3. **Multiple useEffect Dependencies on Objects**
```typescript
// useRestaurants.tsx
useEffect(() => { ... }, [sortBy, userLat, userLon, initialFetch]);
```
**Issue:** Object literal `sortBy` recreated each render
**Impact:** Potential infinite re-runs if not memoized upstream
**Fix:** Properly memoize or extract object literals

#### 4. **Profile Creation Race Condition**
```typescript
// App.tsx - createProfile called 1000ms after auth
const timeoutId = setTimeout(async () => {
  if (!isMounted || !user || profile !== null) return;
  await createProfile({ ... });
}, 1000);
```
**Impact:** Race conditions if user navigates quickly
**Fix:** Use effect dependencies or conditional logic

#### 5. **Untyped Object Destructuring**
```typescript
// In useDishes.tsx - dish processing
const d = comment as { is_hidden?: boolean };
const c = comment as Record<string, unknown>;
```
**Impact:** Type safety lost on deeply nested objects
**Fix:** Define proper interfaces for raw data

#### 6. **Missing Error Boundaries**
- No React Error Boundary components
- Errors in components crash entire app
**Fix:** Wrap screens in error boundaries

#### 7. **Similarity Scoring Inconsistency**
```typescript
// useRestaurants - 95% name similarity
const nameScore = calculateEnhancedSimilarity(dbRestaurant.name, apiResult.properties.name);
if (nameScore < 95) return false;

// restaurantDataService - 80% name similarity
const nameScore = calculateEnhancedSimilarity(existingName, normalizedNewName);
if (nameScore < 80) return false;
```
**Impact:** Inconsistent duplicate detection
**Fix:** Use constants for thresholds

#### 8. **No Input Validation on Dish Names**
```typescript
// MenuScreen.tsx - onShowAddForm() doesn't validate
// DishCard - allows empty dish updates
```
**Impact:** Database pollution with empty/whitespace entries
**Fix:** Add validation layer before submission

#### 9. **Single() Error Handling Variation**
```typescript
// AuthContext - checks for PGRST116 & 406 errors
if (result.error.code === 'PGRST116' || result.error.code === '406')

// useRestaurant - doesn't handle specific error codes
if (fetchError) throw fetchError;
```
**Impact:** Inconsistent error handling
**Fix:** Centralize error code handling

#### 10. **Missing Loading State Management**
```typescript
// MenuScreen.tsx - loading states for different operations
// but no overall "is saving" state for dish edits
// Users don't know if operation succeeded
```
**Impact:** UX uncertainty during operations
**Fix:** Add completion confirmation or toast notifications

### Security Issues

1. **localStorage Usage**
   - Theme stored in localStorage (no risk)
   - Location interaction flag in sessionStorage (OK)
   - No sensitive data stored locally (GOOD)

2. **XSS Protection**
   - DOMPurify imported but not visible in scanned components
   - Need to verify it's used in comment rendering
   - HTML escaping in React prevents most XSS

3. **CSRF Protection**
   - Supabase auth token sent via Authorization header (GOOD)
   - No explicit CSRF token handling needed for modern frameworks

4. **API Rate Limiting**
   - No rate limiting on Geoapify API calls
   - Could be abused by repeated searches
   - Fix: Implement request debouncing (already partially done)

5. **Input Sanitization**
   - Comments use DOMPurify (good)
   - Address parsing could be exploited (medium risk)
   - Dish names not validated (minor risk)

---

## 15. DATA FLOW DIAGRAMS

### Restaurant Discovery Flow
```
FindRestaurantScreen
├── useRestaurants (favorite restaurants)
├── useNearbyRestaurants (by radius + location)
├── usePinnedRestaurants (pin status)
├── useRestaurantVisits (recent visits)
├── User Interaction
│   ├── Search: useRestaurants.searchRestaurants()
│   │   ├── SearchService.searchRestaurants()
│   │   │   ├── Geoapify API (via proxy edge function)
│   │   │   └── Local DB query
│   │   └── Deduplication & merging
│   ├── Add Restaurant: AddRestaurantForm
│   │   ├── isDuplicateRestaurant() (similarity check)
│   │   ├── geocodeAddress()
│   │   └── Insert to restaurants table
│   └── Pin Toggle: usePinnedRestaurants.togglePin()
│       └── Insert/delete user_pinned_restaurants
└── Navigation to MenuScreen with restaurantId
```

### Dish Browsing Flow
```
MenuScreen/:restaurantId
├── useRestaurant (fetch restaurant details)
├── useDishes (fetch all dishes for restaurant)
│   └── processDishesForMenu() (transform raw data)
│       ├── Process ratings (calculate average)
│       ├── Filter hidden comments
│       ├── Generate photo URLs
│       └── Attach user info to photos/comments
├── User Interactions
│   ├── Search: Enhanced search within dishes
│   ├── Rate Dish: updateRatingForDish()
│   │   └── Insert/update dish_ratings table
│   ├── Add Comment: onAddComment()
│   │   └── Insert dish_comments
│   ├── Upload Photo: PhotoUpload → onAddPhoto()
│   │   ├── Compress image client-side
│   │   ├── Upload to S3 (dish-photos bucket)
│   │   └── Save metadata to dish_photos table
│   └── Share: Share button → copy URL with params
└── DishCard (expanded/collapsed state management)
```

### Discovery Flow
```
DiscoveryScreen
├── useRestaurants (favorite restaurants for names)
├── useLocationService (user coordinates)
├── Search & Filter
│   ├── searchAllDishes() - Global dish search
│   │   └── Across all restaurants
│   ├── Filter by minRating (>= X stars)
│   ├── Filter by maxDistance (>= X miles) - requires location
│   └── Combine filters (AND logic)
├── Group by Restaurant
│   └── sortByDistance (if available)
└── Display RestaurantGroups with DishCards
```

### Authentication Flow
```
Login
├── LoginForm (email, password)
├── useAuth.signIn() / signUp()
│   └── supabase.auth.signIn/signUp()
├── AuthContext listens for onAuthStateChange
│   ├── SIGNED_IN event triggers
│   └── loadUserProfile() called
├── Profile created if missing
│   └── 1000ms setTimeout (potential race condition)
└── Navigate to /home

Logout
├── ProfileScreen - Sign Out button
├── useAuth.signOut()
│   └── supabase.auth.signOut()
├── AuthContext clears state
└── Redirect to /login via ProtectedRoute
```

---

## 16. PERFORMANCE ANALYSIS

### Load Time Factors

1. **Bundle Size**
   - React 19.1.0 (39KB)
   - React Router DOM (30KB)
   - Supabase client (50KB)
   - Tailwind CSS (compiled, ~200KB)
   - Total: ~350KB+ (gzipped: ~80-100KB estimated)

2. **Initial Auth Check**
   - Supabase session detection (network dependent)
   - Profile loading (RPC query)
   - Takes 1+ seconds before app is interactive

3. **Screen Load Times**
   - MenuScreen: RPC for stats + query for dishes
   - DiscoveryScreen: searchAllDishes() slow for large dataset
   - FindRestaurantScreen: Multiple parallel queries

### Optimizations Present

1. **Memoization**
   - React.memo on FindRestaurantScreen
   - useCallback on handlers

2. **Debouncing**
   - Search has debounce timer (searchDebounceTimer useRef)
   - ~500ms delay before search fires

3. **Caching**
   - SearchService caches results by query + coords
   - Location requests cached via Promise ref
   - Browser detection cached

4. **Lazy Loading**
   - Eruda debugger imported dynamically
   - Components imported dynamically via Routes

### Performance Issues

1. **Overfetching**
   - useRestaurants fetches all user restaurants even when only needing nearby
   - useDishes processes all joins (photos, comments, ratings) even if not needed

2. **Similarity Scoring**
   - calculateEnhancedSimilarity() called many times
   - Could be precomputed or cached

3. **Large Dish Lists**
   - DiscoveryScreen with 1000+ dishes could be slow
   - No pagination or virtual scrolling
   - All dishes rendered even if off-screen

4. **Network Waterfalls**
   - Restaurant fetch → get restaurant ID
   - Then dishes fetch → get dishes
   - No parallel fetching

5. **Re-renders**
   - Many useEffect dependencies cause frequent re-runs
   - No useMemo for expensive computations
   - Object literals recreated in dependency arrays

### Recommendations

1. **Implement Pagination**
   - Limit dishes per page (50-100)
   - Lazy load as user scrolls

2. **Virtual Scrolling**
   - Use react-window for large lists

3. **Request Parallel Loading**
   - Promise.all() for independent queries

4. **Memoize Expensive Functions**
   - calculateDistanceInMiles()
   - calculateEnhancedSimilarity()

5. **Optimize Images**
   - WebP format with fallback
   - Responsive image sizes
   - Lazy loading

---

## 17. TESTING & QA

### Current State
- No test files found
- No test configuration
- No unit or integration tests

### Critical Tests Needed

1. **Authentication Tests**
   - Sign up → Create profile → Navigate
   - Sign in → Load profile → Navigate
   - Sign out → Clear state → Redirect
   - Password reset flow
   - Error handling (invalid credentials)

2. **Restaurant CRUD**
   - Search restaurants (API + local)
   - Add restaurant (duplicate detection)
   - Favorite/unfavorite
   - Pin/unpin
   - Edit restaurant

3. **Dish Rating**
   - Rate dish (1-5 stars)
   - Update rating
   - View community average
   - View personal rating

4. **Photos**
   - Upload photo
   - Delete photo
   - Update caption
   - Display carousel

5. **Comments**
   - Add comment
   - Edit comment
   - Delete comment
   - Hide comment (admin)

6. **URL Sharing**
   - Share restaurant link
   - Share dish link
   - Visit shared link (auto-favorite)
   - Malformed URLs

7. **Location Services**
   - Request location permission
   - Calculate distance
   - Filter by distance
   - Browser detection

8. **Theme Switching**
   - Switch theme
   - Persist to localStorage
   - Apply correct colors
   - All 4 themes work

---

## 18. DEPENDENCY ANALYSIS

### Production Dependencies
```
@supabase/supabase-js@2.49.8      # Backend client
react@19.1.0                       # UI framework
react-dom@19.1.0                   # DOM rendering
react-router-dom@7.6.3             # Routing
tailwindcss@4.1.7                  # Styling
dompurify@3.2.6                    # XSS protection
fuse.js@7.1.0                      # Fuzzy search
addressit@1.8.2                    # Address parsing
parse-address@1.1.2                # Address parsing
eruda@3.4.3                        # Mobile debugging
```

### Dev Dependencies
```
@vitejs/plugin-react@4.4.1         # Vite React plugin
vite@6.3.5                         # Build tool
typescript@5.8.3                   # Type checking
@tailwindcss/postcss@4.1.9         # Tailwind plugin
eslint@9.25.0                      # Linting
typescript-eslint@8.30.1           # TS linting
```

### Security Audit

**Critical:**
- No known vulnerabilities in current versions

**Medium:**
- parse-address and addressit are maintained but niche
- Consider replacing with more robust solution

**Low:**
- Multiple address parsing libraries (duplication)

### Unused Dependencies
- Check if all imports are actually used
- addressit vs parse-address - both for address parsing?

---

## 19. REFACTORING OPPORTUNITIES

### High Priority

1. **Extract Location Permission Logic**
   ```typescript
   // Create useLocationPermissionHandler.tsx
   // Consolidate FindRestaurantScreen & DiscoveryScreen duplication
   ```

2. **Centralize Similarity Thresholds**
   ```typescript
   // Create constants/thresholds.ts
   const RESTAURANT_NAME_SIMILARITY_THRESHOLD = 0.85;
   const ADDRESS_SIMILARITY_THRESHOLD = 0.70;
   ```

3. **Add Error Boundary Components**
   ```typescript
   // Create ErrorBoundary.tsx wrapper
   // Wrap major screens and sections
   ```

4. **Implement Logging Service**
   ```typescript
   // Replace 216 console.log statements
   // Use structured logging with levels
   ```

5. **Type Safety Improvements**
   ```typescript
   // Replace Record<string, unknown> with proper interfaces
   // Better type guards for fetched data
   ```

### Medium Priority

1. **Extract Search Logic**
   - Create reusable SearchWidget component
   - Used in MenuScreen, DiscoveryScreen, FindRestaurantScreen

2. **Consolidate Address Parsing**
   - Use single library (addressit or parse-address, not both)
   - Wrap in service

3. **Optimize Distance Calculations**
   - Memoize haversine results
   - Cache by coordinate pair

4. **Create Shared Modal Component**
   - DuplicateRestaurantModal, DuplicateDishModal reuse pattern

5. **Extract Form Validation**
   - LoginForm, AddDishForm, AddRestaurantForm share patterns
   - Create FormValidator utility

### Low Priority

1. **Add JSDoc Comments**
   - Document complex functions
   - Improve IDE intellisense

2. **Consistent Error Messages**
   - Standardize error message format
   - User-facing vs developer-facing

3. **Performance Monitoring**
   - Add performance markers
   - Track real user metrics

4. **Analytics Integration**
   - Track user actions
   - Measure feature adoption

---

## 20. SUMMARY STATISTICS

| Metric | Value |
|--------|-------|
| Total Lines of Code | ~17,276 |
| Component Files | 34 |
| Hook Files | 10 |
| Service Files | 4 |
| Type Definition Files | 5 |
| Utility Files | 10 |
| Console.log Statements | 216 |
| ESLint Disable Comments | 8 |
| `any[]` Usage | 2 |
| `as any` Casts | 1 |
| Supabase .single() Calls | 23 |
| useEffect Usage | 13+ per hook |
| Themes Available | 4 |
| Color Tokens Per Theme | 100-200 |
| Routes in App | 12 |
| Custom Hooks | 10 |
| React Contexts | 2 (Auth, Theme, Location) |

---

## CONCLUSION

**HowzEverything** is a well-structured, feature-rich restaurant and food discovery application. The codebase demonstrates good React patterns with custom hooks for state management, proper separation of concerns, and a comprehensive design system.

**Key Strengths:**
- Clean component architecture
- Robust type safety (TypeScript strict mode)
- Comprehensive feature set (discovery, ratings, sharing)
- Sophisticated search and matching algorithms
- Theme system flexibility

**Areas for Improvement:**
- Reduce logging verbosity
- Consolidate duplicate logic (location permissions, search)
- Add testing infrastructure
- Implement error boundaries
- Optimize for large datasets (pagination, virtual scrolling)
- Extract magic numbers to constants

**Recommended Next Steps:**
1. Add comprehensive test coverage
2. Refactor duplicate location permission logic
3. Implement performance monitoring
4. Add Error Boundary components
5. Create logging service
6. Optimize image handling and caching
7. Add pagination to large lists

