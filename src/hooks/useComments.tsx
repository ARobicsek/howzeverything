// src/hooks/useComments.tsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';

interface DishComment { 
  id: string; 
  comment_text: string; 
  created_at: string; 
  updated_at: string; 
}

export const useComments = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addComment = async (dishId: string, commentText: string) => {
    if (!commentText.trim() || !user) return null;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('dish_comments')
        .insert({ dish_id: dishId, comment_text: commentText.trim(), user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as DishComment;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateComment = async (commentId: string, newText: string) => {
    if (!newText.trim()) throw new Error("Comment text cannot be empty");
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('dish_comments')
        .update({ comment_text: newText.trim() })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return data as DishComment;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('dish_comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
  };

  return {
    isSubmitting,
    addComment,
    updateComment,
    deleteComment
  };
};