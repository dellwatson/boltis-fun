import { supabase, Feedback, EmailSubscription } from '../lib/supabase';

export class FeedbackService {
  static async submitFeedback(feedback: {
    type: 'bug_report' | 'feature_request' | 'general' | 'complaint' | 'praise';
    subject: string;
    message: string;
    gameState?: any;
  }): Promise<{ success: boolean; error: any }> {
    try {
      // Check if Supabase is available
      if (!supabase) {
        console.log('⚠️ Feedback not submitted - database not available');
        return { success: false, error: new Error('Database not available') };
      }

      const { data, error } = await supabase
        .from('feedback')
        .insert({
          ...feedback,
          user_agent: navigator.userAgent,
          page_url: window.location.href,
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in submitFeedback:', error);
      return { success: false, error };
    }
  }

  static async subscribeToNewsletter(email: string, preferences = {
    newsletter: true,
    game_updates: true,
    tournament_notifications: false
  }): Promise<{ success: boolean; error: any }> {
    try {
      // Check if Supabase is available
      if (!supabase) {
        console.log('⚠️ Newsletter subscription not submitted - database not available');
        return { success: false, error: new Error('Database not available') };
      }

      const { data, error } = await supabase
        .from('email_subscriptions')
        .insert({
          email,
          ...preferences,
          source: 'website',
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (error) {
        // Handle duplicate email gracefully
        if (error.code === '23505') {
          return { 
            success: false, 
            error: { message: 'This email is already subscribed!' } 
          };
        }
        console.error('Error subscribing to newsletter:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in subscribeToNewsletter:', error);
      return { success: false, error };
    }
  }

  static async unsubscribeFromNewsletter(email: string): Promise<{ success: boolean; error: any }> {
    try {
      // Check if Supabase is available
      if (!supabase) {
        return { success: false, error: new Error('Database not available') };
      }

      const { error } = await supabase
        .from('email_subscriptions')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) {
        console.error('Error unsubscribing from newsletter:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in unsubscribeFromNewsletter:', error);
      return { success: false, error };
    }
  }

  private static async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }
}