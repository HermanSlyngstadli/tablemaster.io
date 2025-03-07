import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GridContainer, GridItem } from '../components/Grid'
import { getAllShops } from '../services/getAllShops'
import { PageContainer } from '../components/PageContainer'
import { Heading2, Heading4, Paragraph, SmallText } from '../components/Typography'
import styled from 'styled-components'

/*

    Magic Shop Ids:
    The Gilded Culdron          – 1ba4e677-34c2-4553-a007-bce5c9e30f51
    Moonveil Tomes & Scrolls    – 23f8b28e-9575-4186-87ae-51abc65c5d07
    The Arcane Trinket          – a6e5082a-7ff3-408a-9c4d-4f6806965d5c
    Runestone Relics            – c072b199-2a44-4b3f-b8ef-d7e4fe145eb1

*/

const NavCard = styled.a`
    display: block;
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease-in-out;
    text-decoration: none;
    color: inherit;
    &:hover {
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
`

export const ShopLandingPage = () => {
    const [shops, setShops] = useState<any[]>([]) // State to store items
    const [loading, setLoading] = useState(true) // Loading state
    const [error, setError] = useState<string | null>(null) // Error state

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const shopData = await getAllShops()
                setShops(shopData)
            } catch (err) {
                setError('Failed to fetch items')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchShops()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error}</div>
    }

    return (
        <PageContainer>
            <GridContainer>
                <GridItem large={'span 12'}>
                    <Heading2 style={{ marginTop: '2rem' }}>Shops</Heading2>
                </GridItem>
                <>
                    {shops.map((item) => {
                        return (
                            <GridItem large={'span 3'} small={'span 12'} key={item.id}>
                                <NavCard href={`/shop/${item.id}`}>
                                    <Heading4>{item.name}</Heading4>
                                    <SmallText>
                                        {item.location} | {item.shop_type}
                                    </SmallText>
                                    <Paragraph style={{ marginBottom: '0' }}>{item.description}</Paragraph>
                                </NavCard>
                            </GridItem>
                        )
                    })}
                </>
            </GridContainer>
        </PageContainer>
    )
}
