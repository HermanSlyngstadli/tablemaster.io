-- Create shop and shop_item tables
-- This migration creates the core tables for the shop management system

CREATE TABLE IF NOT EXISTS "public"."shop" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "description" "text",
    "location" "text",
    "opening_hours" "text",
    "shop_type" "text"
);

ALTER TABLE "public"."shop" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."shop_item" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "short_description" character varying DEFAULT '125'::character varying NOT NULL,
    "long_description" "text" NOT NULL,
    "cost" bigint NOT NULL,
    "item_type" "text" NOT NULL,
    "sold" boolean DEFAULT false NOT NULL,
    "shop_id" "uuid" NOT NULL,
    "image_url" "text"
);

ALTER TABLE "public"."shop_item" OWNER TO "postgres";

-- Add primary keys and constraints (only if they don't exist)
DO $$
BEGIN
    -- Add shop constraints
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'shop_id_key' 
        AND conrelid = 'public.shop'::regclass
    ) THEN
        ALTER TABLE ONLY "public"."shop"
            ADD CONSTRAINT "shop_id_key" UNIQUE ("id");
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'shop_pkey' 
        AND conrelid = 'public.shop'::regclass
    ) THEN
        ALTER TABLE ONLY "public"."shop"
            ADD CONSTRAINT "shop_pkey" PRIMARY KEY ("id");
    END IF;

    -- Add shop_item constraints
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'shop_items_pkey' 
        AND conrelid = 'public.shop_item'::regclass
    ) THEN
        ALTER TABLE ONLY "public"."shop_item"
            ADD CONSTRAINT "shop_items_pkey" PRIMARY KEY ("id");
    END IF;

    -- Add foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'shop_items_shop_id_fkey'
    ) THEN
        ALTER TABLE ONLY "public"."shop_item"
            ADD CONSTRAINT "shop_items_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shop"("id");
    END IF;
END $$;

-- Enable RLS
ALTER TABLE "public"."shop" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shop_item" ENABLE ROW LEVEL SECURITY;

-- RLS policies are created in the next migration (20241229100000_allow_authenticated_users_to_manage_shops.sql)

-- Grant permissions
GRANT ALL ON TABLE "public"."shop" TO "anon";
GRANT ALL ON TABLE "public"."shop" TO "authenticated";
GRANT ALL ON TABLE "public"."shop" TO "service_role";

GRANT ALL ON TABLE "public"."shop_item" TO "anon";
GRANT ALL ON TABLE "public"."shop_item" TO "authenticated";
GRANT ALL ON TABLE "public"."shop_item" TO "service_role";

