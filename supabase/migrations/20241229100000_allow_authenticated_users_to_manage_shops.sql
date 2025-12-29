-- Allow all authenticated users to insert and update shops (for POC)
-- This migration creates RLS policies to allow any authenticated user to manage shops

DO $$
BEGIN
    -- Only proceed if shop table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shop'
    ) THEN
        -- Create read policies for all users (including anonymous) - if they don't exist
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'shop' 
            AND policyname = 'Enable read access for all users'
        ) THEN
            DROP POLICY "Enable read access for all users" ON "public"."shop";
        END IF;
        -- Create policy that allows everyone (including anonymous users) to read shops
        CREATE POLICY "Enable read access for all users" ON "public"."shop" 
            FOR SELECT 
            TO public
            USING (true);
        -- Drop existing admin-only policies for shop table
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'shop' 
            AND policyname = 'Enable insert access for admins only (metadata)'
        ) THEN
            DROP POLICY "Enable insert access for admins only (metadata)" ON "public"."shop";
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'shop' 
            AND policyname = 'Enable update access for admins only (metadata)'
        ) THEN
            DROP POLICY "Enable update access for admins only (metadata)" ON "public"."shop";
        END IF;

        -- Create new policies that allow any authenticated user to insert and update shops
        -- Drop existing policy if it exists (to allow re-running migration)
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'shop' 
            AND policyname = 'Enable insert access for authenticated users'
        ) THEN
            DROP POLICY "Enable insert access for authenticated users" ON "public"."shop";
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'shop' 
            AND policyname = 'Enable update access for authenticated users'
        ) THEN
            DROP POLICY "Enable update access for authenticated users" ON "public"."shop";
        END IF;

        CREATE POLICY "Enable insert access for authenticated users" ON "public"."shop" 
            FOR INSERT 
            TO authenticated
            WITH CHECK (true);

        CREATE POLICY "Enable update access for authenticated users" ON "public"."shop" 
            FOR UPDATE 
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;

    -- Also allow authenticated users to insert and update shop_items
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shop_item'
    ) THEN
        -- Create read policies for all users (including anonymous) - if they don't exist
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'shop_item' 
            AND policyname = 'Enable read access for all users'
        ) THEN
            DROP POLICY "Enable read access for all users" ON "public"."shop_item";
        END IF;
        -- Create policy that allows everyone (including anonymous users) to read shop items
        CREATE POLICY "Enable read access for all users" ON "public"."shop_item" 
            FOR SELECT 
            TO public
            USING (true);
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'shop_item' 
            AND policyname LIKE '%admin%'
        ) THEN
            DROP POLICY IF EXISTS "Enable insert access for admins only (metadata)" ON "public"."shop_item";
            DROP POLICY IF EXISTS "Enable update access for admins only (metadata)" ON "public"."shop_item";
        END IF;

        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'shop_item' 
            AND policyname = 'Enable insert access for authenticated users'
        ) THEN
            DROP POLICY "Enable insert access for authenticated users" ON "public"."shop_item";
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'shop_item' 
            AND policyname = 'Enable update access for authenticated users'
        ) THEN
            DROP POLICY "Enable update access for authenticated users" ON "public"."shop_item";
        END IF;

        CREATE POLICY "Enable insert access for authenticated users" ON "public"."shop_item" 
            FOR INSERT 
            TO authenticated
            WITH CHECK (true);

        CREATE POLICY "Enable update access for authenticated users" ON "public"."shop_item" 
            FOR UPDATE 
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

