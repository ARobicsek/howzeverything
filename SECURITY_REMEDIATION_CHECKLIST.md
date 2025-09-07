# Security Remediation Checklist

**Project**: HowzEverything Restaurant Rating Application  
**Created**: 2025-09-03  
**Status**: Pending Implementation  

## 🚨 CRITICAL SECURITY ISSUES (Fix within 48 hours)

### 1. API Key Security - GEOAPIFY EXPOSURE
- [x] **Priority: CRITICAL**  
- [x] **File**: `src/hooks/useNearbyRestaurants.tsx`  
- [x] **Issue**: API key exposed in client-side code and network requests  
- [x] **Action**: Create server-side proxy edge function for Geoapify API calls  
- [x] **Steps**:
  - [x] Create new edge function: `supabase/functions/geoapify-proxy/index.ts`
  - [ ] Move API key to environment variables in Supabase
  - [x] Implement authentication in proxy function
  - [x] Update `useNearbyRestaurants.tsx` to call proxy instead of direct API
  - [x] Remove exposed API key from client code
  - [ ] Test functionality with new proxy
- [x] **Verification**: Network tab shows no direct Geoapify API calls with exposed keys

### 2. Unauthenticated Edge Functions - DATA EXPOSURE
- [x] **Priority: CRITICAL**  
- [x] **Files**: 
  - [x] `supabase/functions/dish-search/index.ts`
  - [x] `supabase/functions/get-menu-data/index.ts`  
- [x] **Issue**: Public endpoints exposing sensitive restaurant and user data  
- [x] **Actions**:
  - [x] Add JWT authentication to both functions
  - [x] Implement user validation before data access
  - [x] Add input validation for all parameters
  - [ ] Test with authenticated and unauthenticated requests
- [x] **Verification**: Unauthenticated requests return 401 errors

## ⚠️ HIGH PRIORITY SECURITY ISSUES (Fix within 1 week)

### 3. Cross-Site Scripting (XSS) Prevention
- [x] **Priority: HIGH**  
- [x] **Files**: 
  - [x] `src/hooks/useDishes.tsx` 
  - [x] `src/hooks/useComments.tsx`  
- [x] **Issue**: User-generated content not sanitized (comments, captions)  
- [x] **Actions**:
  - [x] Install DOMPurify: `npm install dompurify @types/dompurify`
  - [x] Sanitize comment text before database storage
  - [x] Sanitize photo captions before storage
  - [x] Sanitize content when displaying to users
  - [ ] Test with malicious HTML/script inputs
- [x] **Verification**: HTML tags and scripts are stripped/escaped properly

### 4. Authorization Security - ADMIN BYPASS
- [ ] **Priority: HIGH**  
- [ ] **File**: `src/hooks/useDishes.tsx` (lines 414-424)  
- [ ] **Issue**: Admin checks performed client-side, can be bypassed  
- [ ] **Actions**:
  - [ ] Create server-side edge function for admin operations
  - [ ] Move dish deletion authorization to server
  - [ ] Remove client-side admin validation
  - [ ] Implement proper server-side admin verification
  - [ ] Test with manipulated client data
- [ ] **Verification**: Admin operations fail when server doesn't verify admin status

### 5. SQL Injection Prevention
- [ ] **Priority: HIGH**  
- [ ] **File**: `src/hooks/useRestaurants.tsx` (line 99)  
- [ ] **Issue**: Raw user input in database queries  
- [ ] **Actions**:
  - [ ] Replace string interpolation with parameterized queries
  - [ ] Implement input sanitization for search terms
  - [ ] Add validation for special characters
  - [ ] Test with SQL injection payloads
- [ ] **Verification**: Malicious SQL inputs don't execute

## 🔧 MEDIUM PRIORITY ISSUES (Fix within 2 weeks)

### 6. Input Validation Enhancement
- [ ] **Files**: Multiple hooks with user input  
- [ ] **Actions**:
  - [ ] Add comprehensive validation for all user inputs
  - [ ] Implement length limits for text fields
  - [ ] Validate UUID formats for IDs
  - [ ] Add regex validation for structured data
  - [ ] Implement file upload validation (size, type, content)

### 7. Rate Limiting Implementation
- [ ] **Files**: All edge functions  
- [ ] **Actions**:
  - [ ] Implement per-user rate limiting
  - [ ] Add per-IP rate limiting
  - [ ] Create rate limiting middleware
  - [ ] Add rate limit headers to responses
  - [ ] Test with automated request tools

### 8. Data Exposure in Local Storage
- [ ] **File**: `src/hooks/useNearbyRestaurants.tsx`  
- [ ] **Actions**:
  - [ ] Implement encryption for cached data
  - [ ] Move to sessionStorage for sensitive data
  - [ ] Add data expiration mechanisms
  - [ ] Review all localStorage usage for sensitive data

## 🛡️ ROW LEVEL SECURITY (RLS) IMPLEMENTATION

### 9. Safe RLS Testing
- [ ] **Priority: MEDIUM**  
- [ ] **Test Table**: `admin_activity_log` (unused, safe to test)  
- [ ] **Actions**:
  - [ ] Enable RLS: `ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;`
  - [ ] Monitor for any unexpected errors
  - [ ] Document results for future RLS implementation
- [ ] **Verification**: No application functionality affected

### 10. RLS Policy Design (Future Implementation)
- [ ] **Tables to analyze**:
  - [ ] `restaurants` - Design policies for ownership/visibility
  - [ ] `user_restaurant_visits` - User-specific data policies  
  - [ ] `user_pinned_restaurants` - User-specific data policies
- [ ] **Actions**:
  - [ ] Design RLS policies for each table
  - [ ] Test policies in development environment
  - [ ] Plan staged rollout approach
  - [ ] Create rollback procedures

## 🔒 EASY SECURITY WINS (Do immediately)

### 11. Supabase Auth Configuration
- [ ] **Priority: LOW (Easy Win)**  
- [ ] **Location**: Supabase Dashboard → Authentication → Settings  
- [ ] **Actions**:
  - [ ] Enable leaked password protection (HaveIBeenPwned)
  - [ ] Review minimum password strength settings
  - [ ] Consider enabling MFA options
  - [ ] Review session timeout settings

### 12. CORS Security
- [ ] **Files**: All edge functions  
- [ ] **Actions**:
  - [ ] Replace wildcard CORS with specific domain
  - [ ] Add credentials handling
  - [ ] Review allowed headers
  - [ ] Test cross-origin requests

### 13. Error Message Security
- [ ] **Files**: All hooks and edge functions  
- [ ] **Actions**:
  - [ ] Review error messages for information disclosure
  - [ ] Implement production vs development error levels
  - [ ] Add proper logging without exposing sensitive data
  - [ ] Test error scenarios

## 🧪 TESTING & VALIDATION

### 14. Security Testing Suite
- [ ] **Actions**:
  - [ ] Create automated security tests
  - [ ] Test authentication bypass attempts
  - [ ] Test input validation with malicious data
  - [ ] Verify rate limiting functionality
  - [ ] Test CORS policies
  - [ ] Validate error handling

### 15. Code Review Process
- [ ] **Actions**:
  - [ ] Establish security-focused code review checklist
  - [ ] Document secure coding guidelines
  - [ ] Create security testing procedures
  - [ ] Plan regular security audits

## 📊 MONITORING & MAINTENANCE

### 16. Security Monitoring
- [ ] **Actions**:
  - [ ] Implement security event logging
  - [ ] Set up alerts for suspicious activity
  - [ ] Monitor API usage patterns
  - [ ] Track authentication failures
  - [ ] Review access logs regularly

### 17. Documentation
- [ ] **Actions**:
  - [ ] Document all security implementations
  - [ ] Create incident response procedures
  - [ ] Update deployment security checklist
  - [ ] Document RLS policy decisions

## 🎯 SUCCESS CRITERIA

### Critical Issues Resolved:
- [ ] No API keys exposed in client code
- [ ] All edge functions require authentication
- [ ] XSS vulnerabilities eliminated
- [ ] Client-side authorization bypasses prevented

### Security Posture Improved:
- [ ] Input validation implemented across all entry points
- [ ] Rate limiting prevents abuse
- [ ] Sensitive data properly handled
- [ ] Error messages don't leak information

### Monitoring & Response:
- [ ] Security events are logged and monitored
- [ ] Team has incident response procedures
- [ ] Regular security reviews scheduled

---

## 📝 NOTES

**Estimated Timeline**: 2-3 weeks for critical and high priority items  
**Team Members**: Assign specific tasks to team members  
**Dependencies**: Some tasks may depend on Supabase configuration changes  

**⚠️ IMPORTANT**: Test all changes in development environment first. Have rollback procedures ready for each implementation.

**🔄 REVIEW SCHEDULE**: 
- Daily standup: Review critical item progress
- Weekly: Review overall checklist status  
- Monthly: Conduct security posture assessment

---

*This checklist should be updated as items are completed and new security considerations are identified.*