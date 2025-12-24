import { Database } from '../database-generated.types'
import { supabase } from '../supabaseClient'

export const getItem = async (itemId: string | undefined) => {
    const { data: items, error } = await supabase
        .from('shop_item')
        .select('*')
        .eq('id', itemId ?? '')
        .returns<Database['public']['Tables']['shop_item']['Row'][]>()

    if (error) {
        console.error('Supabase error:', error.message)
        return []
    }

    return items
}

