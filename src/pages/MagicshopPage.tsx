import React, { useEffect, useState } from 'react'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { supabase } from '../supabaseClient'
import { GridContainer, GridItem } from '../components/Grid'
import { Tables } from '../database-generated.types'
import styled from 'styled-components'

const ItemCardContainer = styled.div`
    width: 100%;
`

const ItemCard = styled.div`
    padding: 1em;
    background: #fbfafa;
    border: 2px #dad0c6;
    border-radius: 1rem;

    p {
        font-size: 0.75rem;
    }

    div {
        border-radius: 1rem;
        background: #ede9e9;
        height: 8rem;
    }
`

export const MagicshopPage = () => {
    type ItemType = Tables<'Items'>

    const [itemList, setItemList] = useState<ItemType[]>([])
    const [session, setSession] = useState<any>(null)

    supabase.auth.getSession().then(({ data }) => {
        setSession(data.session)
    })

    async function getItems() {
        let { data: items, error } = await supabase.from('Items').select('*').returns<ItemType[]>()

        if (error) {
            console.error(error)
            return
        }

        if (items) setItemList(items)
    }

    useEffect(() => {
        getItems()
    }, [])

    return (
        <PageContainer>
            <SideNavigation />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <GridContainer>
                    <GridItem large={'1 / 12'}>
                        <h1>Bellhands Magic Shop</h1>
                    </GridItem>
                    <GridItem large="1 / 12">
                        <GridContainer padding={0}>
                            {session &&
                                itemList.map((item) => {
                                    return (
                                        <GridItem key={item['id']} large={'span 3'} small={'span 12'}>
                                            <ItemCard>
                                                <div></div>
                                                <h2>{item['name']}</h2>
                                                <p>{item['description']}</p>
                                            </ItemCard>
                                        </GridItem>
                                    )
                                })}
                        </GridContainer>
                    </GridItem>
                </GridContainer>
            </div>
        </PageContainer>
    )
}
