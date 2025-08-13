# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TypeScript restaurant and food rating application called "HowzEverything" built with Vite, using Supabase for backend services. Users can discover restaurants, rate dishes, and share their food experiences.

## Development Commands

- **Development**: `npm run dev` - Start Vite development server
- **Build**: `npm run build` - Build for production with Vite
- **Lint**: `npm run lint` - Run ESLint
- **Type Check**: `npm run type-check` - Run TypeScript compiler without emitting files
- **Preview**: `npm run preview` - Preview production build

## Architecture Overview

### Core Structure
- **Frontend**: React 19 + TypeScript with Vite build system
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS 4.x with design system in `src/constants.ts`
- **Routing**: React Router DOM 7.x with protected routes
- **State Management**: React Context (AuthContext) + custom hooks

### Key Directories
- `src/components/` - Reusable UI components organized by feature
- `src/hooks/` - Custom hooks for data fetching and business logic
- `src/contexts/` - React contexts (AuthContext for authentication)
- `src/types/` - TypeScript type definitions
- `src/services/` - Service layer for external API calls
- `src/utils/` - Utility functions
- `supabase/functions/` - Edge functions for server-side logic

### Authentication Flow
- Uses Supabase Auth with email/password
- AuthContext (`src/contexts/AuthContext.tsx`) manages auth state
- Protected routes wrap main application areas
- User profiles stored in `users` table with automatic creation

### Design System
- Design tokens centralized in `src/constants.ts`
- Uses DESIGN_TOKENS, COMPONENT_STYLES, and LAYOUT_CONFIG
- Font family: Inter for primary interface
- Color scheme: Blue primary (#2563EB), accent (#642e32)

### Data Flow
- Custom hooks handle Supabase queries (`useDishes`, `useRestaurants`, etc.)
- Real-time subscriptions for live updates
- Optimistic UI updates with error handling
- Image compression and upload utilities

### Key Features
- Restaurant discovery and management
- Dish rating system with photos
- Location-based search
- Social features (comments, sharing)
- Admin functionality for data management

## Important Implementation Notes

- All components use the design system from `constants.ts` - avoid hardcoded styles
- Location services are wrapped in LocationProvider context
- URL sharing functionality for restaurant/dish links
- Comprehensive error handling and loading states
- Mobile-first responsive design

## Development Practices

- TypeScript strict mode enabled
- ESLint configuration includes React hooks rules
- File structure follows feature-based organization
- Custom hooks separate business logic from UI components