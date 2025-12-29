import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GridContainer, GridItem } from '../components/Grid'
import { getItemsByShop } from '../services/getItemsByShop'
import { ItemShopCard } from '../components/ItemShopCard'
import { getShop } from '../services/getShop'
import { Heading2, Heading3, Heading4, Paragraph, SmallText } from '../components/Typography'
import { MapIcon } from '../components/icons/MapIcon'
import { CartIcon } from '../components/icons/CartIcon'
import { GlobeIcon } from '../components/icons/GlobeIcon'
import Modal from '../components/Modal'
import styled from 'styled-components'
import { InformationTag } from '../components/InformationTag'
import { BackButton } from '../components/BackButton'

const TagSpacer = styled.span`
    height: 0.25rem;
    width: 0.25rem;
    background-color: var(--ds-color-text-default);
    border-radius: 50%;
    margin: 0.25rem;
    display: inline-block;
`

const ShopHeader = styled.div`
    padding: 3rem 0;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--ds-color-border-subtle);
`

const ShopHeaderContent = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
`

/*

    Magic Shop Ids:
    The Gilded Culdron          – 1ba4e677-34c2-4553-a007-bce5c9e30f51
    Moonveil Tomes & Scrolls    – 23f8b28e-9575-4186-87ae-51abc65c5d07
    The Arcane Trinket          – a6e5082a-7ff3-408a-9c4d-4f6806965d5c
    Runestone Relics            – c072b199-2a44-4b3f-b8ef-d7e4fe145eb1

*/

export const ShopPage = () => {
    const { uuid } = useParams<{ uuid: string }>()
    const [items, setItems] = useState<any[]>([]) // State to store items
    const [currentItem, setCurrentItem] = useState<any>() // State to store items
    const [shop, setShop] = useState<any>() // State to store items
    const [loading, setLoading] = useState(true) // Loading state
    const [error, setError] = useState<string | null>(null) // Error state

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const shopData = await getShop(uuid)
                setShop(shopData[0])

                const itemData = await getItemsByShop(uuid)
                setItems(itemData)
            } catch (err) {
                setError('Failed to fetch items')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        if (uuid) {
            fetchItems()
        }
    }, [uuid])

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error}</div>
    }

    const clickItem = (id: string) => {
        for (const item of items) {
            if (item.id === id) {
                setCurrentItem(item)
            }
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
            <ShopHeader>
                <ShopHeaderContent>
                    <BackButton to={'/shop/'} style={{ marginBottom: '1.5rem' }}></BackButton>
                    <Heading2 style={{ marginBottom: '1rem' }}>{shop.name}</Heading2>
                    <Heading4 style={{ marginBottom: '2rem', color: 'var(--ds-color-text-subtle)' }}>
                        {shop.description}
                    </Heading4>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap' }}>
                        <InformationTag text={shop.location} icon={<MapIcon />} />
                        <InformationTag text={shop.opening_hours} icon={<GlobeIcon />} />
                        <InformationTag text={shop.shop_type} icon={<CartIcon />} />
                    </div>
                </ShopHeaderContent>
            </ShopHeader>
            <GridContainer>
                <GridItem large={'span 12'}>
                    <Heading3>Items</Heading3>
                    <GridContainer padding={0}>
                        {items.map((item) => (
                            <GridItem key={item['id']} large={'span 3'} small={'span 12'}>
                                <ItemShopCard
                                    heading={item.name}
                                    itemCost={item.cost}
                                    imageURL={item.image_url}
                                    tags={item.item_type}
                                    onClick={() => clickItem(item.id)}
                                />
                            </GridItem>
                        ))}
                    </GridContainer>
                </GridItem>
            </GridContainer>
            <Modal open={!!currentItem} onDismiss={() => setCurrentItem(null)}>
                {currentItem && (
                    <>
                        <div>
                            <img src={currentItem.image_url} style={{ width: '15rem' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            <Heading3 style={{ marginBottom: '0.5rem' }}>{currentItem.name}</Heading3>
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                {currentItem.item_type.split(',').map((tag: string, index: number) => {
                                    return (
                                        <SmallText style={{ margin: '0' }} key={index + 2342}>
                                            {tag}
                                            {index < currentItem.item_type.split(',').length - 1 && <TagSpacer />}
                                        </SmallText>
                                    )
                                })}
                            </div>
                            <Heading4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                                {currentItem.short_description}
                            </Heading4>
                            <Paragraph>{currentItem.long_description}</Paragraph>
                            <Heading4>{currentItem.cost} gp</Heading4>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    )
}
