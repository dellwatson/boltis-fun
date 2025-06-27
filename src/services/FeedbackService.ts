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

      // Check for spam prevention in localStorage
      const lastSubscription = localStorage.getItem('boltis_last_subscription');
      const subscriptionHistory = JSON.parse(localStorage.getItem('boltis_subscription_history') || '[]');
      
      // Prevent multiple subscriptions within 5 minutes
      if (lastSubscription) {
        const timeSinceLastSubscription = Date.now() - parseInt(lastSubscription);
        if (timeSinceLastSubscription < 5 * 60 * 1000) { // 5 minutes
          return { 
            success: false, 
            error: { message: 'Please wait 5 minutes before subscribing again.' } 
          };
        }
      }

      // Check if this email was recently attempted (prevent spam)
      const recentAttempt = subscriptionHistory.find((attempt: any) => 
        attempt.email === email && (Date.now() - attempt.timestamp) < 24 * 60 * 60 * 1000 // 24 hours
      );

      if (recentAttempt) {
        return { 
          success: false, 
          error: { message: 'This email was recently subscribed. Please check your inbox or try again later.' } 
        };
      }

      // Get client IP for tracking (optional)
      let clientIP = null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        clientIP = ipData.ip;
      } catch (ipError) {
        console.log('Could not get IP address:', ipError);
      }

      // Insert subscription with proper data
      const subscriptionData = {
        email: email.toLowerCase().trim(),
        newsletter: preferences.newsletter,
        game_updates: preferences.game_updates,
        tournament_notifications: preferences.tournament_notifications,
        source: 'website',
        ip_address: clientIP,
        user_agent: navigator.userAgent,
        is_active: true
      };

      const { data, error } = await supabase
        .from('email_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) {
        console.error('Error subscribing to newsletter:', error);
        
        // Handle specific error cases
        if (error.code === '23505') {
          return { 
            success: false, 
            error: { message: 'This email is already subscribed to our newsletter!' } 
          };
        }
        
        if (error.code === '42501') {
          return { 
            success: false, 
            error: { message: 'Permission denied. Please try again or contact support.' } 
          };
        }
        
        return { success: false, error };
      }

      // Update localStorage for spam prevention
      localStorage.setItem('boltis_last_subscription', Date.now().toString());
      
      const updatedHistory = [
        ...subscriptionHistory.filter((attempt: any) => 
          Date.now() - attempt.timestamp < 24 * 60 * 60 * 1000 // Keep only last 24 hours
        ),
        { email: email.toLowerCase().trim(), timestamp: Date.now() }
      ];
      localStorage.setItem('boltis_subscription_history', JSON.stringify(updatedHistory));

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
        .eq('email', email.toLowerCase().trim());

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
}