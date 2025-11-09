# HowzEverything - Cleanup Opportunities & Code Quality Improvements

## Executive Summary

This document provides a comprehensive list of cleanup opportunities, technical debt, and potential fixes for the HowzEverything codebase. While the application is functional and demonstrates good architectural patterns, there are several areas where code quality, performance, and maintainability can be improved.

**Priority Legend:**
- 🔴 **Critical**: Should be addressed soon (security, major bugs, performance)
- 🟡 **High**: Important improvements (code quality, maintainability)
- 🟢 **Medium**: Nice to have (optimization, polish)
- 🔵 **Low**: Future enhancements (long-term improvements)

---

## Table of Contents

1. [Critical Issues](#1-critical-issues)
2. [Code Quality Issues](#2-code-quality-issues)
3. [Type Safety Improvements](#3-type-safety-improvements)
4. [Performance Optimizations](#4-performance-optimizations)
5. [Security Enhancements](#5-security-enhancements)
6. [Code Duplication](#6-code-duplication)
7. [Testing Needs](#7-testing-needs)
8. [Architecture Improvements](#8-architecture-improvements)
9. [Developer Experience](#9-developer-experience)
10. [Documentation Gaps](#10-documentation-gaps)

---

## 1. Critical Issues

### 🔴 1.1 Profile Creation Race Condition

**Location:** `src/App.tsx:~line 150`

**Issue:**
```typescript
// Profile created with arbitrary 1000ms timeout
const timeoutId = setTimeout(async () => {
  if (!isMounted || !user || profile !== null) return;
  await createProfile({ ... });
}, 1000);
```

**Problems:**
- Race condition if user navigates quickly
- Arbitrary delay not tied to any actual condition
- May create profile after component unmount
- Could cause duplicate profile attempts

**Recommended Fix:**
```typescript
// Use effect dependencies instead of setTimeout
useEffect(() => {
  const createProfileIfNeeded = async () => {
    if (user && !profile && !isCreatingProfile.current) {
      isCreatingProfile.current = true;
      try {
        await createProfile({ ... });
      } finally {
        isCreatingProfile.current = false;
      }
    }
  };

  createProfileIfNeeded();
}, [user, profile]);
```

**Priority:** 🔴 Critical
**Effort:** Low (1-2 hours)
**Impact:** High (prevents potential auth bugs)

---

### 🔴 1.2 No Error Boundaries

**Locations:** Throughout application, no ErrorBoundary components found

**Issue:**
- Component errors crash the entire app
- No graceful error handling for React component failures
- Users see blank screen on component errors
- No error reporting/tracking

**Recommended Fix:**
```typescript
// Create src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Wrap major screens
<ErrorBoundary>
  <HomeScreen />
</ErrorBoundary>
```

**Priority:** 🔴 Critical
**Effort:** Medium (4-6 hours to implement and test)
**Impact:** High (prevents full app crashes)

---

### 🔴 1.3 Excessive Production Logging

**Locations:** Throughout codebase - 216 console.log statements

**Examples:**
- `src/contexts/AuthContext.tsx`: ~40+ console logs
- `src/hooks/useDishes.tsx`: ~15+ console logs
- `src/services/searchService.ts`: ~20+ console logs
- `src/FindRestaurantScreen.tsx`: ~25+ console logs
- `src/DiscoveryScreen.tsx`: ~15+ console logs

**Issues:**
- Clutters production console
- Potential performance impact (especially string concatenation)
- May leak sensitive information in production
- Makes debugging harder (signal-to-noise ratio)
- Some logs contain user data

**Recommended Fix:**

**Step 1: Create Logging Service**
```typescript
// src/services/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private minLevel: LogLevel = this.isDevelopment ? 'debug' : 'warn';

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`ℹ️ ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  error(message: string, error?: Error, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`❌ ${message}`, error, ...args);
      // TODO: Send to error tracking service (Sentry, etc.)
    }
  }
}

export const logger = new Logger();
```

**Step 2: Replace All Console Logs**
```typescript
// Before:
console.log('🔐 AuthContext: loadUserProfile: Starting for userId:', userId);

// After:
logger.debug('AuthContext: loadUserProfile starting', { userId });
```

**Priority:** 🔴 Critical (production concern)
**Effort:** High (8-12 hours to replace all 216 instances)
**Impact:** High (cleaner code, better debugging, production-ready)

---

### 🔴 1.4 Missing Pagination for Large Lists

**Locations:**
- `src/DiscoveryScreen.tsx` - Could display 1000+ dishes
- `src/MenuScreen.tsx` - Could display 100+ dishes per restaurant
- `src/RatingsScreen.tsx` - Could display all user ratings

**Issue:**
- All results rendered at once
- Poor performance with large datasets
- Slow initial render
- High memory usage
- Poor mobile experience

**Recommended Fix:**

**Option 1: Implement Pagination**
```typescript
// src/hooks/usePagination.tsx
interface UsePaginationOptions<T> {
  items: T[];
  itemsPerPage?: number;
}

export function usePagination<T>({ items, itemsPerPage = 50 }: UsePaginationOptions<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  return {
    currentItems,
    currentPage,
    totalPages,
    nextPage: () => setCurrentPage(p => Math.min(p + 1, totalPages)),
    previousPage: () => setCurrentPage(p => Math.max(p - 1, 1)),
    goToPage: setCurrentPage,
  };
}
```

**Option 2: Virtual Scrolling**
```typescript
// Install react-window
npm install react-window

// src/components/VirtualDishList.tsx
import { FixedSizeList } from 'react-window';

export function VirtualDishList({ dishes }: { dishes: DishWithDetails[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={dishes.length}
      itemSize={200}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <DishCard dish={dishes[index]} {...props} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

**Priority:** 🔴 Critical (performance issue with growth)
**Effort:** Medium (6-8 hours for pagination, 4-6 hours for virtual scrolling)
**Impact:** High (prevents performance degradation at scale)

---

## 2. Code Quality Issues

### 🟡 2.1 Inconsistent Similarity Thresholds

**Locations:**
- `src/hooks/useRestaurants.tsx:~line 400` - 95% threshold for name similarity
- `src/services/restaurantDataService.ts:~line 150` - 80% threshold for name similarity

**Issue:**
```typescript
// useRestaurants.tsx
const nameScore = calculateEnhancedSimilarity(dbRestaurant.name, apiResult.properties.name);
if (nameScore < 95) return false;

// restaurantDataService.ts
const nameScore = calculateEnhancedSimilarity(existingName, normalizedNewName);
if (nameScore < 80) return false;
```

**Problems:**
- Inconsistent duplicate detection behavior
- Magic numbers scattered throughout code
- Difficult to tune threshold values
- No single source of truth

**Recommended Fix:**
```typescript
// src/constants/thresholds.ts
export const SIMILARITY_THRESHOLDS = {
  // Restaurant matching
  RESTAURANT_NAME_EXACT: 95,          // API result vs DB (high confidence)
  RESTAURANT_NAME_FUZZY: 80,          // User-added duplicates (moderate)
  RESTAURANT_ADDRESS: 70,             // Address matching threshold

  // Dish matching
  DISH_NAME_DUPLICATE: 85,            // Duplicate dish detection
  DISH_NAME_SIMILAR: 70,              // Similar dish suggestions

  // Search relevance
  SEARCH_RELEVANCE_HIGH: 90,
  SEARCH_RELEVANCE_MEDIUM: 70,
  SEARCH_RELEVANCE_LOW: 50,
} as const;

// Usage:
import { SIMILARITY_THRESHOLDS } from '@/constants/thresholds';

if (nameScore < SIMILARITY_THRESHOLDS.RESTAURANT_NAME_EXACT) {
  return false;
}
```

**Priority:** 🟡 High
**Effort:** Low (1-2 hours)
**Impact:** Medium (better maintainability, consistency)

---

### 🟡 2.2 Duplicate Location Permission Handling

**Locations:**
- `src/FindRestaurantScreen.tsx:~line 80`
- `src/DiscoveryScreen.tsx:~line 60`

**Duplicate Code:**
```typescript
// Same pattern in both files
useEffect(() => {
  if (!initialCheckComplete) return;

  if (locationStatus === 'denied') {
    openPermissionModal();
  } else if (locationStatus === 'idle') {
    requestLocation();
  }
}, [locationStatus, initialCheckComplete, openPermissionModal, requestLocation]);
```

**Recommended Fix:**
```typescript
// src/hooks/useLocationPermissionHandler.tsx
export function useLocationPermissionHandler(options?: {
  autoRequest?: boolean;
  showModalOnDenied?: boolean;
}) {
  const {
    status,
    initialCheckComplete,
    requestLocation,
    openPermissionModal,
  } = useLocationService();

  useEffect(() => {
    if (!initialCheckComplete) return;

    if (options?.showModalOnDenied && status === 'denied') {
      openPermissionModal();
    } else if (options?.autoRequest && status === 'idle') {
      requestLocation();
    }
  }, [status, initialCheckComplete, options]);

  return { status, initialCheckComplete };
}

// Usage:
function DiscoveryScreen() {
  useLocationPermissionHandler({
    autoRequest: true,
    showModalOnDenied: true,
  });
  // ...
}
```

**Priority:** 🟡 High
**Effort:** Low (2-3 hours)
**Impact:** Medium (DRY principle, easier to maintain)

---

### 🟡 2.3 Object Literals in useEffect Dependencies

**Locations:**
- `src/hooks/useRestaurants.tsx:~line 200`
- Multiple hooks with object dependencies

**Issue:**
```typescript
// sortBy object recreated each render
const [selectedSort, setSelectedSort] = useState({ field: 'name', order: 'asc' });

useEffect(() => {
  // This will run on every render because sortBy is a new object
  fetchData();
}, [sortBy, userLat, userLon]);
```

**Problems:**
- Infinite re-renders if not memoized upstream
- Performance degradation
- Difficult to debug dependency issues

**Recommended Fix:**

**Option 1: Flatten Dependencies**
```typescript
useEffect(() => {
  fetchData();
}, [sortBy.field, sortBy.order, userLat, userLon]);
```

**Option 2: Use useMemo**
```typescript
const sortByMemo = useMemo(
  () => ({ field: sortField, order: sortOrder }),
  [sortField, sortOrder]
);

useEffect(() => {
  fetchData();
}, [sortByMemo, userLat, userLon]);
```

**Priority:** 🟡 High
**Effort:** Medium (4-6 hours to find and fix all instances)
**Impact:** Medium (prevents performance issues)

---

### 🟡 2.4 No Input Validation

**Locations:**
- `src/MenuScreen.tsx` - Add dish form
- `src/components/DishCard.tsx` - Edit dish name
- `src/components/CommentForm.tsx` - Add comment

**Issues:**
- Dish names can be empty strings
- Comments can be only whitespace
- No length limits enforced client-side
- Special characters not validated

**Examples:**
```typescript
// MenuScreen.tsx - No validation
const handleAddDish = async (dishName: string) => {
  // Directly inserts without validation
  await addDishToRestaurant(dishName);
};

// DishCard.tsx - No validation on edit
const handleUpdateDishName = async (newName: string) => {
  await updateDish(dishId, newName);
};
```

**Recommended Fix:**
```typescript
// src/utils/validation.ts
export const validators = {
  dishName: (name: string): { valid: boolean; error?: string } => {
    const trimmed = name.trim();

    if (!trimmed) {
      return { valid: false, error: 'Dish name is required' };
    }

    if (trimmed.length < 2) {
      return { valid: false, error: 'Dish name must be at least 2 characters' };
    }

    if (trimmed.length > 100) {
      return { valid: false, error: 'Dish name must be less than 100 characters' };
    }

    return { valid: true };
  },

  comment: (text: string): { valid: boolean; error?: string } => {
    const trimmed = text.trim();

    if (!trimmed) {
      return { valid: false, error: 'Comment cannot be empty' };
    }

    if (trimmed.length > 500) {
      return { valid: false, error: 'Comment must be less than 500 characters' };
    }

    return { valid: true };
  },

  restaurantName: (name: string): { valid: boolean; error?: string } => {
    const trimmed = name.trim();

    if (!trimmed) {
      return { valid: false, error: 'Restaurant name is required' };
    }

    if (trimmed.length < 2) {
      return { valid: false, error: 'Restaurant name must be at least 2 characters' };
    }

    return { valid: true };
  },
};

// Usage:
const handleAddDish = async (dishName: string) => {
  const validation = validators.dishName(dishName);

  if (!validation.valid) {
    setError(validation.error);
    return;
  }

  await addDishToRestaurant(dishName.trim());
};
```

**Priority:** 🟡 High
**Effort:** Medium (4-6 hours)
**Impact:** High (prevents data quality issues)

---

### 🟡 2.5 Missing Loading State Feedback

**Locations:**
- `src/MenuScreen.tsx` - Dish operations
- `src/components/DishCard.tsx` - Photo/comment operations
- `src/FindRestaurantScreen.tsx` - Restaurant operations

**Issue:**
- Users don't know if operations succeeded
- No confirmation after successful actions
- Loading states incomplete
- No error notifications

**Recommended Fix:**

**Step 1: Create Toast Notification System**
```typescript
// src/components/Toast.tsx
export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' && '✓ '}
      {type === 'error' && '✗ '}
      {message}
    </div>
  );
}

// src/hooks/useToast.tsx
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const success = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const error = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  return { success, error, toasts };
}
```

**Step 2: Add to Operations**
```typescript
const { success, error } = useToast();

const handleAddDish = async (dishName: string) => {
  try {
    setIsLoading(true);
    await addDishToRestaurant(dishName);
    success('Dish added successfully!');
  } catch (err) {
    error('Failed to add dish');
  } finally {
    setIsLoading(false);
  }
};
```

**Priority:** 🟡 High
**Effort:** Medium (6-8 hours for full implementation)
**Impact:** High (better UX, user confidence)

---

## 3. Type Safety Improvements

### 🟢 3.1 Untyped Object Destructuring

**Locations:**
- `src/hooks/useDishes.tsx:~line 200`

**Issue:**
```typescript
// Loses type safety
const d = comment as { is_hidden?: boolean };
const c = comment as Record<string, unknown>;

// Later accessing properties without type checking
const commentText = c.comment_text as string;
```

**Recommended Fix:**
```typescript
// Define proper interface for raw data
interface RawDishComment {
  id: string;
  dish_id: string;
  comment_text: string;
  is_hidden?: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  users?: {
    full_name?: string;
    email?: string;
  };
}

// Use proper type guards
function isValidComment(data: unknown): data is RawDishComment {
  const d = data as Partial<RawDishComment>;
  return (
    typeof d.id === 'string' &&
    typeof d.dish_id === 'string' &&
    typeof d.comment_text === 'string'
  );
}

// Usage with type safety
const comments = rawComments
  .filter(isValidComment)
  .map(comment => ({
    id: comment.id,
    comment_text: comment.comment_text,
    // ... fully typed
  }));
```

**Priority:** 🟢 Medium
**Effort:** Medium (4-6 hours)
**Impact:** Medium (better type safety, fewer runtime errors)

---

### 🟢 3.2 Any Type Usage

**Locations:**
- `src/hooks/useRestaurants.tsx:~line 350` - `as any` cast
- A few `any[]` usages

**Issue:**
```typescript
// Restaurant details cast
const restaurantDetails = result.data as any;
```

**Recommended Fix:**
```typescript
// Define proper return type
interface GeoapifyRestaurantDetails {
  properties: {
    name: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    lat?: number;
    lon?: number;
    place_id?: string;
    // ... other properties
  };
}

// Use proper typing
const restaurantDetails = result.data as GeoapifyRestaurantDetails;
```

**Priority:** 🟢 Medium
**Effort:** Low (2-3 hours)
**Impact:** Medium (better type safety)

---

## 4. Performance Optimizations

### 🟢 4.1 Distance Calculations Not Memoized

**Location:** `src/utils/geolocation.ts` called frequently without caching

**Issue:**
```typescript
// Called repeatedly for same coordinates
const distance = calculateDistanceInMiles(
  userLat, userLon,
  restaurantLat, restaurantLon
);
```

**Recommended Fix:**
```typescript
// src/utils/geolocation.ts
const distanceCache = new Map<string, number>();

export function calculateDistanceInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Create cache key
  const key = `${lat1.toFixed(6)},${lon1.toFixed(6)},${lat2.toFixed(6)},${lon2.toFixed(6)}`;

  if (distanceCache.has(key)) {
    return distanceCache.get(key)!;
  }

  // Calculate using Haversine formula
  const distance = /* ... calculation ... */;

  // Cache result (limit cache size)
  if (distanceCache.size > 1000) {
    const firstKey = distanceCache.keys().next().value;
    distanceCache.delete(firstKey);
  }

  distanceCache.set(key, distance);
  return distance;
}
```

**Priority:** 🟢 Medium
**Effort:** Low (2-3 hours)
**Impact:** Medium (performance improvement for distance-heavy screens)

---

### 🟢 4.2 Similarity Scoring Performance

**Location:** `src/utils/textUtils.ts` - calculateEnhancedSimilarity called many times

**Issue:**
- Called in loops without memoization
- Expensive 3-gram calculation
- No early exit for obviously different strings

**Recommended Fix:**
```typescript
export function calculateEnhancedSimilarity(str1: string, str2: string): number {
  // Early exit for identical strings
  if (str1 === str2) return 100;

  const norm1 = normalizeText(str1);
  const norm2 = normalizeText(str2);

  // Early exit if normalized strings are identical
  if (norm1 === norm2) return 100;

  // Early exit for very different lengths
  const lengthRatio = Math.min(norm1.length, norm2.length) /
                      Math.max(norm1.length, norm2.length);
  if (lengthRatio < 0.5) return 0;

  // Proceed with 3-gram calculation
  // ... existing logic ...
}

// Add caching for frequently compared strings
const similarityCache = new LRUCache<string, number>(500);

export function calculateEnhancedSimilarityCached(str1: string, str2: string): number {
  const key = `${str1}|||${str2}`;

  if (similarityCache.has(key)) {
    return similarityCache.get(key)!;
  }

  const score = calculateEnhancedSimilarity(str1, str2);
  similarityCache.set(key, score);
  return score;
}
```

**Priority:** 🟢 Medium
**Effort:** Medium (3-4 hours)
**Impact:** Medium (faster duplicate detection)

---

### 🟢 4.3 Overfetching Data

**Locations:**
- `src/hooks/useDishes.tsx` - Always fetches photos, comments, ratings even if not needed
- `src/hooks/useRestaurants.tsx` - Fetches all restaurants even when only needing nearby

**Issue:**
```typescript
// Always includes all joins
const { data, error } = await supabase
  .from('restaurant_dishes')
  .select(`
    *,
    dish_ratings(*),
    dish_comments(*),
    dish_photos(*)
  `);
```

**Recommended Fix:**
```typescript
// Add options parameter
export function useDishes(
  restaurantId: string,
  options?: {
    includePhotos?: boolean;
    includeComments?: boolean;
    includeRatings?: boolean;
  }
) {
  const selectQuery = buildSelectQuery(options);

  const { data, error } = await supabase
    .from('restaurant_dishes')
    .select(selectQuery);

  // ...
}

function buildSelectQuery(options?: DishQueryOptions): string {
  const base = '*';
  const joins: string[] = [];

  if (options?.includeRatings !== false) {
    joins.push('dish_ratings(*)');
  }

  if (options?.includeComments !== false) {
    joins.push('dish_comments(*)');
  }

  if (options?.includePhotos !== false) {
    joins.push('dish_photos(*)');
  }

  return joins.length > 0 ? `${base}, ${joins.join(', ')}` : base;
}

// Usage for list view (don't need full data)
useDishes(restaurantId, {
  includeComments: false,
  includePhotos: false
});
```

**Priority:** 🟢 Medium
**Effort:** Medium (4-6 hours)
**Impact:** High (reduced data transfer, faster loads)

---

### 🟢 4.4 Network Waterfalls

**Location:** Sequential fetching in multiple screens

**Issue:**
```typescript
// Sequential - slow
const restaurant = await fetchRestaurant(id);
const dishes = await fetchDishes(restaurant.id);
const stats = await fetchStats(restaurant.id);
```

**Recommended Fix:**
```typescript
// Parallel - fast
const [restaurant, dishes, stats] = await Promise.all([
  fetchRestaurant(id),
  fetchDishes(id),
  fetchStats(id),
]);
```

**Locations to Apply:**
- `src/MenuScreen.tsx` - Restaurant + dishes + stats
- `src/FindRestaurantScreen.tsx` - Pinned + nearby + visits

**Priority:** 🟢 Medium
**Effort:** Low (2-3 hours)
**Impact:** High (faster page loads)

---

## 5. Security Enhancements

### 🟢 5.1 API Rate Limiting

**Location:** `src/services/searchService.ts` - No rate limiting on Geoapify API

**Issue:**
- Users can make unlimited API requests
- Could exhaust API quota
- Potential for abuse
- No throttling

**Recommended Fix:**
```typescript
// src/utils/rateLimiter.ts
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();

    // Remove old requests outside window
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)}s`);
    }

    this.requests.push(now);
    return true;
  }
}

// Usage in SearchService
const geoapifyLimiter = new RateLimiter(20, 60000); // 20 requests per minute

async searchRestaurants(query: string) {
  await geoapifyLimiter.checkLimit();
  // ... proceed with API call
}
```

**Priority:** 🟢 Medium
**Effort:** Medium (3-4 hours)
**Impact:** Medium (prevents API quota exhaustion)

---

### 🟢 5.2 DOMPurify Usage Verification

**Location:** Need to verify DOMPurify is actually being used in comment rendering

**Action Items:**
1. Search for DOMPurify imports and usage
2. Ensure all user-generated content (comments, dish names, restaurant names) is sanitized
3. Add sanitization to any missed areas

**Recommended Implementation:**
```typescript
// src/utils/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  });
}

export function sanitizeText(text: string): string {
  // For plain text, just escape HTML entities
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Usage in DishCard
<p dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.comment_text) }} />
```

**Priority:** 🟢 Medium
**Effort:** Low (2-3 hours)
**Impact:** High (XSS protection)

---

## 6. Code Duplication

### 🟢 6.1 Duplicate Address Parsing Libraries

**Issue:** Both `addressit` and `parse-address` are used

**Locations:**
- `package.json` - Both libraries listed
- `src/utils/addressParser.ts` - Uses parse-address
- May have other usages

**Recommended Fix:**
1. Audit both libraries
2. Choose one based on accuracy and maintenance
3. Remove the other
4. Consolidate all address parsing logic

**Priority:** 🟢 Medium
**Effort:** Low (2-3 hours)
**Impact:** Low (reduced bundle size, simplified dependencies)

---

### 🟢 6.2 Duplicate Search Widget Pattern

**Locations:**
- `src/components/SearchAndSort.tsx` - Used in MenuScreen
- `src/components/restaurant/RestaurantSearchAndSort.tsx` - Used in FindRestaurantScreen
- Similar patterns in DiscoveryScreen

**Recommended Fix:**
```typescript
// src/components/shared/SearchAndFilterWidget.tsx
interface SearchAndFilterWidgetProps<T extends string> {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  sortOptions: Array<{ value: T; label: string }>;
  selectedSort: T;
  onSortChange: (value: T) => void;
  additionalFilters?: React.ReactNode;
}

export function SearchAndFilterWidget<T extends string>({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  sortOptions,
  selectedSort,
  onSortChange,
  additionalFilters,
}: SearchAndFilterWidgetProps<T>) {
  // Consolidated implementation
}
```

**Priority:** 🟢 Medium
**Effort:** Medium (4-6 hours)
**Impact:** Medium (DRY, easier to maintain)

---

### 🟢 6.3 Duplicate Modal Patterns

**Locations:**
- `src/components/DuplicateDishModal.tsx`
- `src/components/restaurant/DuplicateRestaurantModal.tsx`
- `src/components/PhotoModal.tsx`

**Similar Structure:**
- Overlay backdrop
- Center modal
- Close button
- Content area

**Recommended Fix:**
```typescript
// src/components/shared/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content modal-${maxWidth}`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
            <button onClick={onClose}>×</button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// Usage:
<Modal isOpen={showDuplicateWarning} onClose={() => setShowDuplicateWarning(false)}>
  <h3>Duplicate Dish Detected</h3>
  {/* Content */}
</Modal>
```

**Priority:** 🟢 Medium
**Effort:** Medium (4-6 hours)
**Impact:** Medium (consistency, maintainability)

---

## 7. Testing Needs

### 🟡 7.1 No Test Infrastructure

**Current State:**
- Zero test files
- No test configuration
- No testing libraries installed

**Recommended Setup:**

**Step 1: Install Testing Libraries**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Step 2: Configure Vitest**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

**Step 3: Create Test Setup**
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

**Priority:** 🟡 High
**Effort:** High (Initial setup: 4 hours, writing tests: ongoing)
**Impact:** Critical (prevents regressions, enables confident refactoring)

---

### 🟡 7.2 Critical Test Coverage Needed

**Priority Test Areas:**

**1. Authentication Flow**
```typescript
// src/contexts/__tests__/AuthContext.test.tsx
describe('AuthContext', () => {
  it('should sign in user successfully', async () => {
    // Test sign in flow
  });

  it('should handle sign in errors', async () => {
    // Test error states
  });

  it('should load user profile after sign in', async () => {
    // Test profile loading
  });

  it('should sign out user', async () => {
    // Test sign out
  });
});
```

**2. Dish Rating**
```typescript
// src/hooks/__tests__/useDishes.test.tsx
describe('useDishes', () => {
  it('should fetch dishes for restaurant', async () => {
    // Test data fetching
  });

  it('should process dish data correctly', async () => {
    // Test data transformation
  });

  it('should calculate average ratings', async () => {
    // Test rating calculation
  });
});
```

**3. Restaurant Search**
```typescript
// src/services/__tests__/searchService.test.ts
describe('SearchService', () => {
  it('should search restaurants via API', async () => {
    // Test API search
  });

  it('should deduplicate results', async () => {
    // Test deduplication
  });

  it('should cache search results', async () => {
    // Test caching
  });
});
```

**4. Duplicate Detection**
```typescript
// src/services/__tests__/restaurantDataService.test.ts
describe('isDuplicateRestaurant', () => {
  it('should detect exact duplicates', async () => {
    // Test exact matches
  });

  it('should detect similar names', async () => {
    // Test similarity matching
  });

  it('should not flag different restaurants', async () => {
    // Test false positives
  });
});
```

**Priority:** 🟡 High
**Effort:** Very High (40-60 hours for comprehensive coverage)
**Impact:** Critical (code reliability, regression prevention)

---

## 8. Architecture Improvements

### 🟢 8.1 Extract Business Logic from Components

**Issue:** Components like MenuScreen and FindRestaurantScreen contain too much business logic

**Example:**
```typescript
// MenuScreen.tsx - ~400 lines with business logic mixed in
const MenuScreen = () => {
  // 50+ lines of state declarations
  // Complex filtering logic
  // Duplicate detection logic
  // Data transformation logic
  // Event handlers
  // Rendering
};
```

**Recommended Fix:**

**Step 1: Extract to Custom Hook**
```typescript
// src/hooks/useMenuScreen.tsx
export function useMenuScreen(restaurantId: string) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState('name');
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null);

  const { dishes, isLoading } = useDishes(restaurantId);

  const filteredDishes = useMemo(() => {
    return filterAndSortDishes(dishes, searchTerm, selectedSort);
  }, [dishes, searchTerm, selectedSort]);

  const handleAddDish = useCallback(async (dishName: string) => {
    // Business logic here
  }, [restaurantId]);

  return {
    // State
    searchTerm,
    selectedSort,
    expandedDishId,

    // Derived data
    filteredDishes,
    isLoading,

    // Actions
    setSearchTerm,
    setSelectedSort,
    setExpandedDishId,
    handleAddDish,
  };
}

// MenuScreen.tsx - Much simpler
const MenuScreen = () => {
  const {
    filteredDishes,
    isLoading,
    searchTerm,
    setSearchTerm,
    // ... other values
  } = useMenuScreen(restaurantId);

  return (
    <div>
      {/* Rendering only */}
    </div>
  );
};
```

**Priority:** 🟢 Medium
**Effort:** High (12-16 hours for major screens)
**Impact:** High (testability, maintainability)

---

### 🟢 8.2 Centralize API Calls

**Issue:** Supabase queries scattered throughout hooks and components

**Recommended Fix:**
```typescript
// src/api/dishes.ts
export const dishesApi = {
  getAll: async (restaurantId: string) => {
    const { data, error } = await supabase
      .from('restaurant_dishes')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (error) throw error;
    return data;
  },

  create: async (dish: CreateDishInput) => {
    const { data, error } = await supabase
      .from('restaurant_dishes')
      .insert(dish)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: UpdateDishInput) => {
    const { data, error } = await supabase
      .from('restaurant_dishes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('restaurant_dishes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Usage in hooks
export function useDishes(restaurantId: string) {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    dishesApi.getAll(restaurantId).then(setDishes);
  }, [restaurantId]);

  const addDish = useCallback(async (dish: CreateDishInput) => {
    const newDish = await dishesApi.create(dish);
    setDishes(prev => [...prev, newDish]);
  }, []);

  return { dishes, addDish };
}
```

**Benefits:**
- Single source of truth for API calls
- Easier to mock for testing
- Consistent error handling
- Better TypeScript support

**Priority:** 🟢 Medium
**Effort:** High (16-20 hours)
**Impact:** High (maintainability, testability)

---

## 9. Developer Experience

### 🟢 9.1 Add Pre-commit Hooks

**Recommended Setup:**
```bash
npm install --save-dev husky lint-staged

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

**Configuration:**
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**Priority:** 🟢 Medium
**Effort:** Low (1-2 hours)
**Impact:** Medium (consistent code quality)

---

### 🟢 9.2 Add Prettier Configuration

**Recommended Setup:**
```bash
npm install --save-dev prettier
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

**Priority:** 🟢 Medium
**Effort:** Low (1 hour)
**Impact:** Medium (code consistency)

---

### 🟢 9.3 Add JSDoc Comments

**Current State:** Minimal documentation in code

**Recommended Additions:**
```typescript
/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 *
 * @param lat1 - Latitude of the first point in degrees
 * @param lon1 - Longitude of the first point in degrees
 * @param lat2 - Latitude of the second point in degrees
 * @param lon2 - Longitude of the second point in degrees
 * @returns Distance in miles
 *
 * @example
 * const distance = calculateDistanceInMiles(40.7128, -74.0060, 34.0522, -118.2437);
 * console.log(distance); // ~2451 miles (NYC to LA)
 */
export function calculateDistanceInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // ...
}
```

**Priority Areas:**
- Complex utility functions
- Custom hooks
- Service classes
- Algorithm implementations

**Priority:** 🔵 Low
**Effort:** Medium (8-12 hours)
**Impact:** Medium (developer onboarding, IDE support)

---

## 10. Documentation Gaps

### 🟢 10.1 API Documentation

**Create:** `docs/API.md`

**Should Include:**
- Supabase table schemas
- RPC function signatures
- Edge function endpoints
- Third-party API integrations (Geoapify)

---

### 🟢 10.2 Component Documentation

**Create:** `docs/COMPONENTS.md`

**Should Include:**
- Component hierarchy
- Props interfaces
- Usage examples
- State management patterns

---

### 🟢 10.3 Setup Instructions

**Enhance:** `README.md`

**Add:**
- Environment variable setup
- Supabase configuration
- Local development workflow
- Deployment process

---

## Summary & Prioritization

### Immediate Actions (This Sprint)

1. 🔴 Fix profile creation race condition (2 hours)
2. 🔴 Add error boundaries (6 hours)
3. 🟡 Create and implement logging service (12 hours)
4. 🟡 Add input validation (6 hours)
5. 🟡 Extract location permission handler (3 hours)

**Total Effort:** ~29 hours

---

### Short Term (Next 2-4 Weeks)

1. 🔴 Implement pagination for large lists (8 hours)
2. 🟡 Set up testing infrastructure (4 hours)
3. 🟡 Write critical tests (20 hours)
4. 🟡 Add toast notifications (8 hours)
5. 🟢 Centralize similarity thresholds (2 hours)
6. 🟢 Optimize distance calculations (3 hours)
7. 🟢 Fix network waterfalls (3 hours)

**Total Effort:** ~48 hours

---

### Medium Term (1-2 Months)

1. 🟢 Extract business logic from components (16 hours)
2. 🟢 Centralize API calls (20 hours)
3. 🟢 Consolidate duplicate code (12 hours)
4. 🟢 Type safety improvements (6 hours)
5. 🟢 Security enhancements (8 hours)
6. 🟢 Add pre-commit hooks and Prettier (2 hours)

**Total Effort:** ~64 hours

---

### Long Term (2-6 Months)

1. 🔵 Comprehensive test coverage (40 hours)
2. 🔵 Add JSDoc comments (12 hours)
3. 🔵 Performance monitoring (8 hours)
4. 🔵 Analytics integration (8 hours)
5. 🔵 Complete documentation (12 hours)

**Total Effort:** ~80 hours

---

## Conclusion

The HowzEverything codebase is functional and demonstrates good architectural patterns, but has accumulated technical debt through rapid development. By addressing the items in this document systematically, the codebase will become more maintainable, performant, and robust.

**Key Focus Areas:**
1. **Stability:** Error boundaries, input validation, race condition fixes
2. **Code Quality:** Logging service, duplicate code removal, type safety
3. **Testing:** Infrastructure setup, critical path coverage
4. **Performance:** Pagination, caching, parallel requests
5. **Developer Experience:** Documentation, tooling, architecture improvements

**Estimated Total Effort:** ~221 hours (5-6 weeks of development time)

This represents a significant but worthwhile investment that will pay dividends in reduced bugs, easier maintenance, and faster feature development in the future.
