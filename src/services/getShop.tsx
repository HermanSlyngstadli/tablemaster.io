import { Database } from '../database-generated.types'
import { supabase } from '../supabaseClient'

export const getShop = async (shopId: string | undefined) => {
    const { data: items, error } = await supabase
        .from('shop')
        .select('*')
        .eq('id', shopId)
        .returns<Database['public']['Tables']['shop']['Row'][]>()

    if (error) {
        console.error('Supabase error:', error.message)
        return []
    }

    return items
}
