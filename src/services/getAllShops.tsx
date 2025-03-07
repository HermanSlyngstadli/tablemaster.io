import { Database } from '../database-generated.types'
import { supabase } from '../supabaseClient'

export const getAllShops = async () => {
    const { data: items, error } = await supabase
        .from('shop')
        .select('*')
        .returns<Database['public']['Tables']['shop']['Row'][]>()

    if (error) {
        console.error('Supabase error:', error.message)
        return []
    }

    return items
}
