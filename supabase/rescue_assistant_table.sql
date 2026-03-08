-- RESCUE SCRIPT: Assistant Interactions Table
-- Ensures the table exists with the correct name and RLS policies inherited.

DO $$ 
BEGIN
    -- 1. Rename if it's still named budtender_interactions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budtender_interactions') THEN
        ALTER TABLE budtender_interactions RENAME TO assistant_interactions;
    END IF;

    -- 2. Ensure table exists if neither old or new names were found (unlikely but safe)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assistant_interactions') THEN
        CREATE TABLE assistant_interactions (
            id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id              uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            session_id           text,
            interaction_type     text NOT NULL,
            quiz_answers         jsonb DEFAULT '{}',
            recommended_products uuid[],
            clicked_product      uuid REFERENCES products(id) ON DELETE SET NULL,
            feedback             text CHECK (feedback IN ('positive', 'negative')),
            created_at           timestamptz DEFAULT now(),
            UNIQUE(user_id, session_id)
        );
        
        ALTER TABLE assistant_interactions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "assistant_interactions_owner" ON assistant_interactions;
        CREATE POLICY "assistant_interactions_owner" ON assistant_interactions 
            FOR ALL USING (user_id = auth.uid());
    END IF;
END $$;
