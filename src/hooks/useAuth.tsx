// src/hooks/useAuth.tsx
import { useContext } from 'react';
import { AuthContext, type UseAuthReturn as AuthContextReturn } from '../contexts/AuthContext';

export const useAuth = (): AuthContextReturn => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Re-export the type to maintain the original file's public API for other parts of the codebase.
export type UseAuthReturn = AuthContextReturn;