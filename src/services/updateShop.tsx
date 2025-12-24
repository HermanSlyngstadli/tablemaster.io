import { Database } from '../database-generated.types'
import { supabase } from '../supabaseClient'

export const updateShop = async (
    shopId: string,
    updates: Database['public']['Tables']['shop']['Update']
) => {
    const { data, error } = await supabase
        .from('shop')
        .update(updates)
        .eq('id', shopId)
        .select()
        .single()
        .returns<Database['public']['Tables']['shop']['Row']>()

    if (error) {
        console.error('Supabase error:', error.message)
        throw error
    }

    return data
}

