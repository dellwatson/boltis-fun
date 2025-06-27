import { supabase, Feedback, EmailSubscription } from "../lib/supabase";

export class FeedbackService {
  static async submitFeedback(feedback: {
    type: "bug_report" | "feature_request" | "general" | "complaint" | "praise";
    subject: string;
    message: string;
    gameState?: any;
  }): Promise<{ success: boolean; error: any }> {
    try {
      // Check if Supabase is available
      if (!supabase) {
        console.log("⚠️ Feedback not submitted - database not available");
        return { success: false, error: new Error("Database not available") };
      }

      const { data, error } = await supabase
        .from("feedback")
        .insert({
          ...feedback,
          user_agent: navigator.userAgent,
          page_url: window.location.href,
        })
        .select()
        .single();

      if (error) {
        console.error("Error submitting feedback:", error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error in submitFeedback:", error);
      return { success: false, error };
    }
  }

  static async subscribeToNewsletter(
    email: string,
    preferences = {
      newsletter: true,
      game_updates: true,
      tournament_notifications: false,
    }
  ): Promise<{ success: boolean; error: any }> {
    try {
      if (!supabase) {
        console.log(
          "⚠️ Newsletter subscription not submitted - database not available"
        );
        return { success: false, error: new Error("Database not available") };
      }

      // Call the database function
      const { data, error } = await supabase.rpc(
        "handle_newsletter_subscription",
        {
          p_email: email,
          p_newsletter: preferences.newsletter,
          p_game_updates: preferences.game_updates,
          p_tournament_notifications: preferences.tournament_notifications,
        }
      );

      if (error) {
        console.error("Error subscribing to newsletter:", error);
        return { success: false, error };
      }

      return {
        success: true,
        data,
        error: null,
      };
    } catch (error) {
      console.error("Error in subscribeToNewsletter:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  static async unsubscribeFromNewsletter(
    email: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Check if Supabase is available
      if (!supabase) {
        return { success: false, error: new Error("Database not available") };
      }

      const { error } = await supabase
        .from("email_subscriptions")
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq("email", email.toLowerCase().trim());

      if (error) {
        console.error("Error unsubscribing from newsletter:", error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error in unsubscribeFromNewsletter:", error);
      return { success: false, error };
    }
  }
}
