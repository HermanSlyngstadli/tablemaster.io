import { Database } from '../database-generated.types'
import { supabase } from '../supabaseClient'

export const getItemsByShop = async (shopId: string | undefined) => {
    const { data: items, error } = await supabase
        .from('shop_item')
        .select('*')
        .eq('shop_id', shopId)
        .returns<Database['public']['Tables']['shop_item']['Row'][]>()

    if (error) {
        console.error('Supabase error:', error.message)
        return []
    }

    return items
}
