# Script References

> **AI Agent Instruction:** When looking for code to modify or understand, read this file first to identify relevant scripts by their namespace and description.

---

## Screens (`app/src/`)

| Script | Namespace | Description | Link |
|--------|-----------|-------------|------|
| App.tsx | `App` | Main application router with React Router setup, navigation, auth flows, and shared content handling. | [App.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/App.tsx) |
| main.tsx | - | Application entry point that initializes React root and Eruda mobile debugger. | [main.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/main.tsx) |
| HomeScreen.tsx | `HomeScreen` | Landing page with navigation cards to Find Restaurant and Discover sections. | [HomeScreen.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/HomeScreen.tsx) |
| DiscoveryScreen.tsx | `DiscoveryScreen` | Global dish search/discovery screen with location-based filtering and distance display. | [DiscoveryScreen.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/DiscoveryScreen.tsx) |
| FindRestaurantScreen.tsx | `FindRestaurantScreen` | Restaurant search screen with nearby, pinned, and recent restaurants sections. | [FindRestaurantScreen.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/FindRestaurantScreen.tsx) |
| RestaurantScreen.tsx | `RestaurantScreen` | Restaurant details and selection screen with Geoapify integration. | [RestaurantScreen.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/RestaurantScreen.tsx) |
| MenuScreen.tsx | `MenuScreen` | Restaurant menu view with dish list, search, add dish form, and duplicate detection. | [MenuScreen.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/MenuScreen.tsx) |
| RatingsScreen.tsx | `RatingsScreen` | User's personal rated dishes screen with sorting and distance display. | [RatingsScreen.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/RatingsScreen.tsx) |
| ProfileScreen.tsx | `ProfileScreen` | User profile view with theme selector and profile card. | [ProfileScreen.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/ProfileScreen.tsx) |
| AboutScreen.tsx | `AboutScreen` | About/info page with app description and call-to-action. | [AboutScreen.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/AboutScreen.tsx) |
| AdminScreen.tsx | `AdminScreen` | Admin dashboard for managing restaurants, dishes, comments, and user analytics. | [AdminScreen.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/AdminScreen.tsx) |

---

## Hooks (`app/src/hooks/`)

| Script | Namespace | Description | Link |
|--------|-----------|-------------|------|
| useDishes.tsx | `useDishes` | Manages dish CRUD operations, ratings, comments, photos, and search for a restaurant. | [useDishes.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/hooks/useDishes.tsx) |
| useRestaurants.tsx | `useRestaurants` | Manages restaurant data fetching, creation, and verification with Supabase. | [useRestaurants.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/hooks/useRestaurants.tsx) |
| useRestaurant.tsx | `useRestaurant` | Fetches a single restaurant by ID. | [useRestaurant.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/hooks/useRestaurant.tsx) |
| useNearbyRestaurants.tsx | `useNearbyRestaurants` | Fetches restaurants near user location using Geoapify with caching. | [useNearbyRestaurants.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/hooks/useNearbyRestaurants.tsx) |
| usePinnedRestaurants.tsx | `usePinnedRestaurants` | Manages user's pinned/favorite restaurants. | [usePinnedRestaurants.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/hooks/usePinnedRestaurants.tsx) |
| useRestaurantVisits.tsx | `useRestaurantVisits` | Tracks user's recently visited restaurants for quick access. | [useRestaurantVisits.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/hooks/useRestaurantVisits.tsx) |
| useLocationService.tsx | `useLocationService` | Provides geolocation with permission handling and location state management. | [useLocationService.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/hooks/useLocationService.tsx) |
| useAuth.tsx | `useAuth` | Convenience hook to access AuthContext for authentication state. | [useAuth.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/hooks/useAuth.tsx) |
| useComments.tsx | `useComments` | Manages dish comments CRUD operations. | [useComments.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/hooks/useComments.tsx) |
| useShare.tsx | `useShare` | Handles Web Share API for sharing dishes and restaurants. | [useShare.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/hooks/useShare.tsx) |
| useTheme.ts | `useTheme` | Convenience hook to access ThemeContext for theming. | [useTheme.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/hooks/useTheme.ts) |

---

## Utilities (`app/src/utils/`)

| Script | Namespace | Description | Link |
|--------|-----------|-------------|------|
| dishSearch.ts | `dishSearch` | Advanced dish search with fuzzy matching, synonyms, food categories, and cuisine families. | [dishSearch.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/utils/dishSearch.ts) |
| addressParser.ts | `addressParser` | Parses addresses into structured components (street, city, state, zip). | [addressParser.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/utils/addressParser.ts) |
| geolocation.ts | `geolocation` | Distance calculations and location formatting utilities. | [geolocation.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/utils/geolocation.ts) |
| restaurantGeolocation.ts | `restaurantGeolocation` | Restaurant-specific geolocation utilities for distance calculations. | [restaurantGeolocation.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/utils/restaurantGeolocation.ts) |
| countryDetection.ts | `countryDetection` | Detects country from location data for regional formatting. | [countryDetection.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/utils/countryDetection.ts) |
| queryAnalysis.ts | `queryAnalysis` | Analyzes search queries for intent extraction (location, restaurant name). | [queryAnalysis.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/utils/queryAnalysis.ts) |
| textUtils.ts | `textUtils` | Text normalization and similarity calculation utilities. | [textUtils.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/utils/textUtils.ts) |
| urlShareHandler.ts | `urlShareHandler` | Handles shared URL parsing and navigation for deep linking. | [urlShareHandler.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/utils/urlShareHandler.ts) |
| browserDetection.ts | `browserDetection` | Detects browser type and mobile device for platform-specific behavior. | [browserDetection.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/utils/browserDetection.ts) |
| apiCounter.ts | `apiCounter` | Tracks Geoapify API call counts for debugging and monitoring. | [apiCounter.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/utils/apiCounter.ts) |

---

## Services (`app/src/services/`)

| Script | Namespace | Description | Link |
|--------|-----------|-------------|------|
| searchService.ts | `SearchService` | Restaurant search service with Geoapify integration, caching, and relevance scoring. | [searchService.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/services/searchService.ts) |
| restaurantDataService.ts | `restaurantDataService` | Restaurant data operations with Supabase including CRUD and search. | [restaurantDataService.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/services/restaurantDataService.ts) |
| geocodingService.ts | `geocodingService` | Address geocoding service using Geoapify. | [geocodingService.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/services/geocodingService.ts) |
| favoritesService.ts | `favoritesService` | Manages user favorites/pins in Supabase. | [favoritesService.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/services/favoritesService.ts) |

---

## Contexts (`app/src/contexts/`)

| Script | Namespace | Description | Link |
|--------|-----------|-------------|------|
| AuthContext.tsx | `AuthContext, AuthProvider` | Authentication state management with Supabase Auth (sign in/up/out, profile). | [AuthContext.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/contexts/AuthContext.tsx) |
| ThemeContext.tsx | `ThemeContext, ThemeProvider` | Theme management with multiple theme specs (Copenhagen, Victorian, 90s, Grumpy Cat). | [ThemeContext.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/contexts/ThemeContext.tsx) |

---

## Types (`app/src/types/`)

| Script | Namespace | Description | Link |
|--------|-----------|-------------|------|
| supabase.ts | `Database` | Auto-generated Supabase database types for type-safe queries. | [supabase.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/types/supabase.ts) |
| restaurant.ts | `Restaurant` | Restaurant type definitions. | [restaurant.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/types/restaurant.ts) |
| restaurantSearch.ts | `GeoapifyPlace` | Geoapify API response types for restaurant search. | [restaurantSearch.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/types/restaurantSearch.ts) |
| location.ts | `Location` | Location/coordinates type definitions. | [location.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/types/location.ts) |
| address.ts | `AddressFormData` | Address form data types for manual entry. | [address.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/types/address.ts) |

---

## Components (`app/src/components/`)

### Core Components

| Script | Namespace | Description | Link |
|--------|-----------|-------------|------|
| DishCard.tsx | `DishCard` | Main dish display card with ratings, comments, photos, and actions. | [DishCard.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/DishCard.tsx) |
| PhotoUpload.tsx | `PhotoUpload` | Photo upload component with camera/gallery support and compression. | [PhotoUpload.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/PhotoUpload.tsx) |
| PhotoModal.tsx | `PhotoModal` | Full-screen photo viewer with swipe navigation. | [PhotoModal.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/PhotoModal.tsx) |
| PhotoCarousel.tsx | `PhotoCarousel` | Horizontal photo carousel for dish images. | [PhotoCarousel.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/PhotoCarousel.tsx) |
| ThemeSelector.tsx | `ThemeSelector` | Theme selection UI with preview cards. | [ThemeSelector.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/ThemeSelector.tsx) |
| LoadingScreen.tsx | `LoadingScreen` | Full-screen loading indicator. | [LoadingScreen.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/LoadingScreen.tsx) |
| ErrorScreen.tsx | `ErrorScreen` | Error display screen with retry option. | [ErrorScreen.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/ErrorScreen.tsx) |
| EmptyState.tsx | `EmptyState` | Empty state placeholder for lists. | [EmptyState.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/EmptyState.tsx) |
| AddDishForm.tsx | `AddDishForm` | Form for adding new dishes with name and rating. | [AddDishForm.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/AddDishForm.tsx) |
| CommentForm.tsx | `CommentForm` | Form for adding dish comments. | [CommentForm.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/CommentForm.tsx) |
| DuplicateDishModal.tsx | `DuplicateDishModal` | Modal for handling potential duplicate dish entries. | [DuplicateDishModal.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/DuplicateDishModal.tsx) |
| SearchAndSort.tsx | `SearchAndSort` | Search input and sort controls component. | [SearchAndSort.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/SearchAndSort.tsx) |
| InlineLoadingSpinner.tsx | `InlineLoadingSpinner` | Small inline loading indicator. | [InlineLoadingSpinner.tsx](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/components/InlineLoadingSpinner.tsx) |

---

## Other Files

| Script | Namespace | Description | Link |
|--------|-----------|-------------|------|
| constants.ts | `SPACING, TYPOGRAPHY, STYLES, etc.` | Design system constants for spacing, typography, colors, and layout styles. | [constants.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/constants.ts) |
| supabaseClient.ts | `supabase` | Supabase client initialization and auth helper functions. | [supabaseClient.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/supabaseClient.ts) |
| themeValidator.ts | `themeValidator` | Validates theme configurations for completeness and consistency. | [themeValidator.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/src/tools/themeValidator.ts) |

---

## Supabase Edge Functions (`app/supabase/functions/`)

| Script | Namespace | Description | Link |
|--------|-----------|-------------|------|
| dish-search/index.ts | - | Edge function for server-side dish search. | [index.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/supabase/functions/dish-search/index.ts) |
| geoapify-proxy/index.ts | - | Secure proxy for Geoapify API calls (hides API key). | [index.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/supabase/functions/geoapify-proxy/index.ts) |
| get-menu-data/index.ts | - | Edge function to fetch menu data for a restaurant. | [index.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/supabase/functions/get-menu-data/index.ts) |
| admin-data/index.ts | - | Edge function for admin dashboard data operations. | [index.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/supabase/functions/admin-data/index.ts) |
| keep-alive/index.ts | - | Edge function to keep Supabase connection alive. | [index.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/supabase/functions/keep-alive/index.ts) |
| _shared/search-logic.ts | - | Shared search logic used by edge functions. | [search-logic.ts](file:///c:/Users/ariro/OneDrive/Documents/howzeverything/app/supabase/functions/_shared/search-logic.ts) |
