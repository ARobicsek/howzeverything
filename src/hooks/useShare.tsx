// src/hooks/useShare.tsx
import { useCallback } from 'react';

interface ShareOptions {
  title: string;
  text: string;
  url: string;
}

interface ShareItem {
  type: 'restaurant' | 'dish';
  id: string;
  name: string;
  restaurantName?: string; // For dishes, to include restaurant context
}

export const useShare = () => {
  const generateShareUrl = useCallback((item: ShareItem): string => {
    const baseUrl = window.location.origin;
    if (item.type === 'restaurant') {
      return `${baseUrl}/shared/restaurant/${item.id}`;
    } else {
      return `${baseUrl}/shared/dish/${item.id}`;
    }
  }, []);

  const generateShareContent = useCallback((item: ShareItem): ShareOptions => {
    const shareUrl = generateShareUrl(item);
    
    if (item.type === 'restaurant') {
      return {
        title: `Check out ${item.name} on Howzeverything!`,
        text: `I thought you'd like this restaurant: ${item.name}. Check it out on Howzeverything!`,
        url: shareUrl
      };
    } else {
      return {
        title: `Check out this dish on Howzeverything!`,
        text: `I thought you'd like this dish: ${item.name} at ${item.restaurantName}. Check it out on Howzeverything!`,
        url: shareUrl
      };
    }
  }, [generateShareUrl]);

  const shareItem = useCallback(async (item: ShareItem): Promise<boolean> => {
    const shareContent = generateShareContent(item);

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share(shareContent);
        return true;
      } catch (error) {
        // User cancelled sharing or sharing failed
        console.log('Web Share API failed or was cancelled:', error);
        // Fall through to clipboard fallback
      }
    }

    // Fallback: Copy to clipboard
    try {
      const textToCopy = `${shareContent.text}\n\n${shareContent.url}`;
      await navigator.clipboard.writeText(textToCopy);
      
      // Show a simple notification
      alert('Link copied to clipboard! You can now paste it in a text or email.');
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      // Final fallback: Show the link in an alert
      const textToShow = `${shareContent.text}\n\n${shareContent.url}`;
      alert(`Copy this link to share:\n\n${textToShow}`);
      return false;
    }
  }, [generateShareContent]);

  return {
    shareItem,
    generateShareUrl,
    generateShareContent
  };
};