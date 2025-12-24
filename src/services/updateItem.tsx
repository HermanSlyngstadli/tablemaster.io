import { Database } from '../database-generated.types'
import { supabase } from '../supabaseClient'

export const updateItem = async (
    itemId: string,
    updates: Database['public']['Tables']['shop_item']['Update']
) => {
    const { data, error } = await supabase
        .from('shop_item')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single()
        .returns<Database['public']['Tables']['shop_item']['Row']>()

    if (error) {
        console.error('Supabase error:', error.message)
        throw error
    }

    return data
}

