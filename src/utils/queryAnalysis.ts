// src/utils/queryAnalysis.ts
import { QueryAnalysis } from '../types/restaurantSearch';
import { normalizeText } from './textUtils';

export function analyzeQuery(query: string): QueryAnalysis {
    const normalizedQuery = normalizeText(query);

    // Check for explicit location indicators (in, at, near, etc.)
    const locationKeywords = [' in ', ' at ', ' near ', ' on ', ' by ', ' around '];
    for (const indicator of locationKeywords) {
        const parts = normalizedQuery.split(indicator);
        if (parts.length === 2 && parts[0] && parts[1]) {
            return { type: 'business_location_proposal', businessName: parts[0].trim(), location: parts[1].trim() };
        }
    }

    // Check for comma-separated format (e.g., "Cafe Landwer, Newton MA")
    const commaParts = normalizedQuery.split(',');
    if (commaParts.length >= 2) {
        const business = commaParts[0].trim();
        const location = commaParts.slice(1).join(',').trim();
        // Only treat as location query if location part looks like a place (has 2+ chars)
        if (business && location && location.length >= 2) {
            return { type: 'business_location_proposal', businessName: business, location: location };
        }
    }

    // Default: treat entire query as business name
    // DO NOT automatically split multi-word queries - this breaks restaurant names like:
    // - "Cafe Landwer" (would incorrectly split to business="Cafe", location="Landwer")
    // - "Boston Market" (would incorrectly split to business="Boston", location="Market")
    // - "California Pizza Kitchen" (would split incorrectly)
    return { type: 'business', businessName: normalizedQuery };
}