# NEXT SESSION PROMPT

## 🎯 SESSION CONTEXT

**Project**: HowzEverything Restaurant Rating Application  
**Last Session**: Security Remediation COMPLETE - All Critical Fixes Deployed  
**Date**: 2025-09-05  
**Status**: Critical security vulnerabilities fixed, but console errors need debugging

## ✅ **COMPLETED IN LAST SESSION**

### **🛡️ ALL CRITICAL SECURITY ISSUES FIXED & DEPLOYED:**

1. **✅ API Key Exposure (CRITICAL)**
   - ✅ Created & deployed secure proxy: `supabase/functions/geoapify-proxy/index.ts`
   - ✅ Added `GEOAPIFY_API_KEY` to Supabase environment variables
   - ✅ Updated `useNearbyRestaurants.tsx` to use authenticated proxy
   - ✅ Removed API key from client-side code

2. **✅ Unauthenticated Edge Functions (CRITICAL)**  
   - ✅ Added JWT authentication to `dish-search` edge function
   - ✅ Added JWT authentication to `get-menu-data` edge function
   - ✅ Updated client hooks to use proper session tokens
   - ✅ All functions deployed with 401 error responses for unauthenticated requests

3. **✅ XSS Vulnerability (HIGH)**
   - ✅ Installed DOMPurify for input sanitization
   - ✅ Added XSS protection to `useDishes.tsx` and `useComments.tsx`
   - ✅ All user comments and photo captions now sanitized before storage

### **🚀 ALL FUNCTIONS SUCCESSFULLY DEPLOYED:**
- ✅ `geoapify-proxy` - NEW secure proxy with JWT auth
- ✅ `dish-search` - UPDATED with JWT authentication  
- ✅ `get-menu-data` - UPDATED with JWT authentication

## 🚨 **IMMEDIATE PRIORITY - CONSOLE ERRORS**

**User reported: "We're getting a bunch of console errors"**

### **Your First Tasks:**

1. **🔍 Debug Console Errors**
   - Open browser developer tools and identify all console errors
   - Check both Console and Network tabs for authentication/API issues
   - Look for common problems with our security implementations

2. **🧪 Test Authentication Flow**
   - Verify login/logout works correctly
   - Test that authenticated features work when logged in
   - Confirm unauthenticated requests fail gracefully

3. **🔧 Fix Any Breaking Issues**
   - Address console errors that prevent functionality
   - Ensure all security fixes work without breaking user experience
   - Test critical user journeys (login → nearby restaurants → dish search → comments)

## 🔍 **LIKELY CONSOLE ERROR SOURCES**

Based on our security changes, common issues might be:

### **Authentication Errors:**
- Sessions not being properly retrieved: `supabase.auth.getSession()`
- JWT tokens missing or expired
- 401 responses from edge functions

### **Network/API Errors:**
- Failed calls to new `geoapify-proxy` function
- CORS issues with updated edge functions
- Environment variable not found: `GEOAPIFY_API_KEY`

### **XSS/Sanitization Issues:**
- DOMPurify causing unexpected behavior
- Comments/captions not displaying correctly after sanitization

### **Common Error Messages to Look For:**
```
- "Authentication required to fetch nearby restaurants"
- "Authentication required to search dishes" 
- "Authentication required to load restaurant menu"
- "Missing Authorization header"
- "Invalid token"
- "Geoapify API key not configured"
- 401 Unauthorized responses
- CORS policy errors
```

## 🛠️ **DEBUGGING APPROACH**

### **Step 1: Identify Errors**
1. Open browser developer tools (F12)
2. Go to Console tab - screenshot any error messages
3. Go to Network tab - look for failed requests (red entries)
4. Test both logged-in and logged-out user scenarios

### **Step 2: Categorize Issues**
- **Breaking**: Features completely broken
- **Authentication**: Auth-related errors  
- **Non-critical**: Warnings that don't affect functionality

### **Step 3: Fix Priority Order**
1. **Critical breaking issues** that prevent app from working
2. **Authentication flow problems** 
3. **Edge function connectivity issues**
4. **XSS sanitization side effects**
5. **Non-critical warnings**

## 📂 **KEY FILES TO CHECK**

**If errors are in these areas, check these files:**
- **Auth errors**: `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.tsx`
- **Nearby restaurants**: `src/hooks/useNearbyRestaurants.tsx`
- **Dish search**: `src/hooks/useDishes.tsx` (searchAllDishes function)
- **Restaurant menus**: `src/hooks/useDishes.tsx` (fetchDishes function)
- **Comments**: `src/hooks/useComments.tsx`, `src/hooks/useDishes.tsx`
- **Edge functions**: All deployed functions if getting 500 errors

## ⚡ **QUICK START COMMANDS**

```bash
# Start development to test
npm run dev

# Check for TypeScript errors
npm run type-check

# Build to check for any build issues
npm run build
```

## 🎯 **SUCCESS CRITERIA FOR THIS SESSION**

By the end of this session:
- [ ] All console errors identified and categorized
- [ ] Breaking errors fixed - app functionality restored
- [ ] Authentication flow works smoothly
- [ ] All security features work without breaking user experience
- [ ] Clean console with no critical errors

## 🔧 **AFTER DEBUGGING**

Once console errors are resolved, next priorities:

### **High Priority Security (Week 1)**
1. **Admin Authorization Bypass** - Move admin operations to server-side
2. **SQL Injection Prevention** - Replace string interpolation with parameterized queries
3. **Input Validation Enhancement** - Add comprehensive validation

### **Medium Priority Security (Week 2-3)**
1. **Rate Limiting** - Implement per-user and per-IP rate limits
2. **CORS Security** - Replace wildcard with specific domain
3. **Error Message Security** - Review for information disclosure

## 📋 **IMPORTANT REMINDERS**

1. **Our Security Fixes Are Deployed** - Don't undo the JWT authentication or XSS protection
2. **Test Both User States** - Logged in AND logged out scenarios
3. **Check Mobile/Different Browsers** - Ensure compatibility
4. **Screenshot Errors** - For complex issues, screenshots help with debugging

---

**Session Focus**: Debug and resolve console errors while maintaining all security implementations. The goal is a clean, secure, and fully functional application.

**Remember**: We've made significant security improvements - now we need to ensure they work seamlessly for users!