// src/constants.ts
// Shared constants for consistent styling across the app

export const COLORS = {
  background: '#b0afa7',
  text: '#363738',
  textWhite: '#FFFFFF',
  textDark: '#374151',
  danger: '#EF4444',
  success: '#10B981', // Original Green, kept for other uses (e.g. Add Dish form save)
  successHover: '#059669',
  disabled: '#D1D5DB',
  primary: '#60A5FA',         // Blue for "Add Comment" / "Hide Comments"
  primaryHover: '#3B82F6',
  secondary: '#6b7280',
  secondaryHover: '#4b5563',
  navBar: '#5c5d5e',
  star: '#fbbf24',
  starEmpty: '#d1d5db',
  viewCommentsBg: '#968875',       // UPDATED: New color for "View Comments"
  viewCommentsBgHover: '#827563', // UPDATED: Darker version for hover
};

export const FONTS = {
  elegant: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: '300' as const,
    letterSpacing: '0.025em',
  }
};

export const STYLES = {
  mainContentPadding: '90px',
  
  primaryButton: { 
    background: COLORS.primary,
    color: COLORS.textWhite,
    border: 'none',
    cursor: 'pointer',
    borderRadius: '1rem', 
    fontSize: '1rem',
    fontWeight: '400' as const,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease-in-out',
    padding: '0.75rem 1.5rem', 
    width: '100%',
  },
  
  cardButton: {
    background: COLORS.text,
    color: COLORS.textWhite,
    border: 'none',
    cursor: 'pointer',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '400' as const,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease-in-out',
    padding: '0.625rem 1.25rem',
  },
  
  formButton: {
    color: COLORS.textWhite,
    border: 'none',
    cursor: 'pointer',
    borderRadius: '1rem',
    fontSize: '1rem',
    fontWeight: '300' as const,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s ease',
    padding: '0.75rem 1.5rem',
  },
  
  secondaryButton: {
    background: COLORS.secondary,
    color: COLORS.textWhite,
    border: 'none',
    cursor: 'pointer',
    borderRadius: '1rem',
    fontSize: '1rem',
    fontWeight: '300' as const,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    padding: '0.75rem 1.5rem',
  }
};