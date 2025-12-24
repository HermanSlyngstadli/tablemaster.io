import { Database } from '../database-generated.types'
import { supabase } from '../supabaseClient'

export const createItem = async (itemData: Database['public']['Tables']['shop_item']['Insert']) => {
    const { data, error } = await supabase
        .from('shop_item')
        .insert(itemData)
        .select()
        .single()
        .returns<Database['public']['Tables']['shop_item']['Row']>()

    if (error) {
        console.error('Supabase error:', error.message)
        throw error
    }

    return data
}

