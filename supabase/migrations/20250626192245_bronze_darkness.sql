/*
  # Fix email subscriptions RLS policies

  1. Security Updates
    - Update RLS policies for email_subscriptions table
    - Allow anonymous users to subscribe
    - Fix permission issues

  2. Changes
    - Drop existing restrictive policies
    - Create new policies that allow anonymous subscriptions
    - Ensure proper permissions for email operations
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can read own subscriptions" ON email_subscriptions;
DROP POLICY IF EXISTS "Anyone can subscribe" ON email_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON email_subscriptions;

-- Create new policies that allow anonymous subscriptions
CREATE POLICY "Anyone can subscribe to newsletter"
  ON email_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow reading subscriptions for authenticated users only (privacy)
CREATE POLICY "Users can read own subscriptions"
  ON email_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow updating subscriptions (for unsubscribe, etc.)
CREATE POLICY "Anyone can update subscriptions"
  ON email_subscriptions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow service role to perform any operation
CREATE POLICY "Service role can manage subscriptions"
  ON email_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure the table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email_active 
  ON email_subscriptions(email, is_active);

CREATE INDEX IF NOT EXISTS idx_email_subscriptions_created_at 
  ON email_subscriptions(created_at DESC);