// src/utils/queryAnalysis.ts
import { QueryAnalysis } from '../types/restaurantSearch';
import { normalizeText } from './textUtils';

export function analyzeQuery(query: string): QueryAnalysis {
    const normalizedQuery = normalizeText(query);
    const locationKeywords = [' in ', ' at ', ' near ', ' on ', ' by ', ' around '];
    for (const indicator of locationKeywords) {
        const parts = normalizedQuery.split(indicator);
        if (parts.length === 2 && parts[0] && parts[1]) {
            return { type: 'business_location_proposal', businessName: parts[0].trim(), location: parts[1].trim() };
        }
    }
    const commaParts = normalizedQuery.split(',');
    if (commaParts.length > 1) {
        const business = commaParts.slice(0, -1).join(',').trim();
        const location = commaParts[commaParts.length - 1].trim();
        if (business && location) {
            return { type: 'business_location_proposal', businessName: business, location: location };
        }
    }
    const words = normalizedQuery.split(' ');
    if (words.length > 2) {
        const business = words.slice(0, -2).join(' ');
        const location = words.slice(-2).join(' ');
        return { type: 'business_location_proposal', businessName: business, location: location };
    }
    if (words.length > 1) {
        const business = words.slice(0, -1).join(' ');
        const location = words.slice(-1).join(' ');
        return { type: 'business_location_proposal', businessName: business, location: location };
    }
    return { type: 'business', businessName: normalizedQuery };
}