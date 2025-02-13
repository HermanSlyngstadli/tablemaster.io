import { createClient } from '@supabase/supabase-js'
import { Database } from './database-generated.types'

export const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_PROJECT_URL,
    import.meta.env.VITE_SUPABASE_ANONYMOUS_KEY
)
