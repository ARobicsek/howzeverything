# Next Session: Theme Engine Refactor Continuation

## Context Overview

You are continuing work on a sophisticated theme engine refactor for the HowzEverything React TypeScript app. This is a **systematic migration project** to eliminate conditional theme logic across the entire codebase using semantic tokens.

## Current Project Status ✅

**Branch**: `feature/theme-engine-refactor`  
**Phase**: 3.5 - DiscoveryScreen Migration (Next Target)

### Major Accomplishments So Far

#### ✅ **Theme Engine Architecture (Phases 1-2)**
- **Minimal Theme Specifications**: 8-line ThemeSpec generates 70+ color properties automatically
- **Hybrid Approach**: Engine generation + pixel-perfect overrides for original theme accuracy
- **Complete Theme System**: Typography, spacing, shadows, effects all generated from core specs

#### ✅ **Component Migration Success (Phase 3.1-3.4)**
**Proven 7-Step Migration Pattern**:
1. Analyze conditional theme logic patterns
2. Design semantic tokens for identified patterns  
3. Add semantic tokens to ColorPalette type (src/styles/themes.ts)
4. Add generation logic to themeEngine.ts
5. Add specific values to theme overrides (src/contexts/ThemeContext.tsx)
6. Replace conditional logic with semantic tokens
7. Test build + verify both themes work

**Successfully Migrated Components**:
- ✅ **AboutScreen.tsx**: 18 instances → 0 instances (14 semantic tokens added)
- ✅ **MenuScreen.tsx**: 9 instances → 0 instances (10 semantic tokens added)
- ✅ **StarRating, EmptyState, TopNavigation, ProfileCard, App.tsx**: All conditional logic eliminated

#### ✅ **Recent Theme Refinements**
- **90s Theme Star Colors**: Optimized for visual cohesion
  - Personal stars: `#00FFFF` (neon turquoise - matches restaurant names)
  - Community stars: `#fecd06` (electric yellow - matches dish names)  
  - Thin `1px` borders for empty stars
  - Perfect half-star display (half filled, half empty)

## 🎯 **NEXT TARGET: Phase 3.5 - DiscoveryScreen Migration**

### Current Priority
**DiscoveryScreen.tsx** contains **8 instances** of conditional theme logic that need elimination using semantic tokens.

### Remaining Screens After DiscoveryScreen
1. **FindRestaurantScreen.tsx**: 8 instances
2. **RatingsScreen.tsx**: 6 instances

### Expected Patterns to Find in DiscoveryScreen
Based on previous screen migrations, likely patterns:
- `theme.colors.background === '#0D0515'` conditional checks
- `const is90sTheme = ...` detection variables
- Conditional styling for headers, backgrounds, text effects
- Theme-specific glow effects, shadows, colors

## 📋 **Critical Tasks for Next Session**

### Primary Objective
**Systematically eliminate all 8 conditional theme logic instances from DiscoveryScreen.tsx**

### Step-by-Step Approach
1. **📊 Analysis**: Search DiscoveryScreen.tsx for conditional theme patterns
2. **🎨 Design**: Create semantic tokens for discovered patterns
3. **⚙️ Implementation**: Apply proven 7-step migration pattern
4. **✅ Validation**: Test build + verify both themes work identically

### Expected Semantic Tokens
Estimate **6-12 semantic tokens** needed for DiscoveryScreen based on complexity patterns from AboutScreen (14 tokens) and MenuScreen (10 tokens).

## 📖 **CRITICAL: Documentation Requirements**

### ⚠️ **MANDATORY Documentation Update**
**ALWAYS update `THEME_ENGINE_REFACTOR_PROGRESS.md` throughout the session with**:

1. **Each semantic token added** and its specific purpose
2. **Exact conditional patterns eliminated** (with before/after code examples)  
3. **Build test results** and theme functionality verification
4. **Any styling issues discovered** and resolution methods
5. **Total semantic token count** and migration progress
6. **Lessons learned** comparing DiscoveryScreen vs previous screen complexity

### Why Documentation is Critical
- **Progress Tracking**: Systematic approach across large codebase
- **Pattern Evolution**: Recording successful migration strategies  
- **Future Development**: Helping other developers understand decisions
- **Quality Assurance**: Ensuring pixel-perfect theme preservation
- **Session Continuity**: Enabling efficient work resumption

## 🛠 **Technical Context**

### File Locations
- **Types**: `src/styles/themes.ts` (ColorPalette interface)
- **Engine**: `src/styles/themeEngine.ts` (generation logic)
- **Overrides**: `src/contexts/ThemeContext.tsx` (theme-specific values)
- **Target**: `src/DiscoveryScreen.tsx` (conditional logic to eliminate)

### Build Commands
- **Type Check**: `npm run type-check`
- **Build**: `npm run build`
- **Pattern Search**: `grep "theme.colors.background === '#0D0515'" src/DiscoveryScreen.tsx`

### Success Criteria
- ✅ Zero conditional theme logic instances in DiscoveryScreen.tsx
- ✅ Production build successful
- ✅ Both Victorian and 90s themes function identically to original
- ✅ All new semantic tokens properly documented

## 🎯 **Starting Action**

**Begin by running**: `grep "theme.colors.background === '#0D0515'" src/DiscoveryScreen.tsx` to identify all conditional theme patterns, then proceed with systematic semantic token migration using the proven 7-step pattern.

---

**Remember**: This is precision work requiring pixel-perfect accuracy. Document everything as you go, and always test both themes after changes.