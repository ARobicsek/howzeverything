// src/hooks/useComments.tsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';

interface DishComment {
  id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  dish_id: string;
}

export const useComments = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addComment = async (dishId: string, commentText: string): Promise<DishComment | null> => {
    if (!commentText.trim()) {
      setError('Comment text is required');
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to add comments');
        return null;
      }

      const { data: newComment, error: insertError } = await supabase
        .from('dish_comments')
        .insert([{
          dish_id: dishId,
          user_id: user.id,
          comment_text: commentText.trim()
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error adding comment:', insertError);
        setError(`Failed to add comment: ${insertError.message}`);
        return null;
      }

      return newComment as DishComment;
    } catch (err: any) {
      console.error('Error in addComment:', err);
      setError(`Failed to add comment: ${err.message}`);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateComment = async (commentId: string, newText: string): Promise<DishComment | null> => {
    if (!newText.trim()) {
      setError('Comment text is required');
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to update comments');
        return null;
      }

      const { data: updatedComment, error: updateError } = await supabase
        .from('dish_comments')
        .update({ 
          comment_text: newText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure user can only update their own comments
        .select()
        .single();

      if (updateError) {
        console.error('Error updating comment:', updateError);
        setError(`Failed to update comment: ${updateError.message}`);
        return null;
      }

      return updatedComment as DishComment;
    } catch (err: any) {
      console.error('Error in updateComment:', err);
      setError(`Failed to update comment: ${err.message}`);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to delete comments');
        return false;
      }

      // Check if user owns the comment or is admin
      const { data: comment } = await supabase
        .from('dish_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (!comment) {
        setError('Comment not found');
        return false;
      }

      if (comment.user_id !== user.id) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (!profile?.is_admin) {
          setError('You can only delete your own comments');
          return false;
        }
      }

      const { error: deleteError } = await supabase
        .from('dish_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) {
        console.error('Error deleting comment:', deleteError);
        setError(`Failed to delete comment: ${deleteError.message}`);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('Error in deleteComment:', err);
      setError(`Failed to delete comment: ${err.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isSubmitting,
    error,
    addComment,
    updateComment,
    deleteComment,
    clearError
  };
};