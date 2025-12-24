import { Database } from '../database-generated.types'
import { supabase } from '../supabaseClient'

export const createShop = async (shopData: Database['public']['Tables']['shop']['Insert']) => {
    const { data, error } = await supabase
        .from('shop')
        .insert(shopData)
        .select()
        .single()
        .returns<Database['public']['Tables']['shop']['Row']>()

    if (error) {
        console.error('Supabase error:', error.message)
        throw error
    }

    return data
}

