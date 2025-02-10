import React, { useEffect, useState } from 'react'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { supabase } from '../supabaseClient'

type itemType = {
    id: number
    created_at: string
    name: string
    cost: number
}

type responseType = {
    id: number
}

export const MagicshopPage = () => {
    const [itemList, setItemList] = useState<responseType[]>([])

    async function getItems() {
        let { data: items, error } = await supabase.from('items').select('*')
        console.log(items)

        if (error) {
            console.error(error)
            return
        }

        //setItemList(items)
    }

    useEffect(() => {
        getItems()
    }, [])

    return (
        <PageContainer>
            <SideNavigation />
            <div>
                {itemList.map((item) => {
                    return <div>{item.id}</div>
                })}
            </div>
        </PageContainer>
    )
}
