import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { getShop } from '../services/getShop'
import { getItemsByShop } from '../services/getItemsByShop'
import { PageContainer } from '../components/PageContainer'
import { Button } from '../components/Button'
import { Heading2, Heading3, Heading4, Paragraph, SmallText } from '../components/Typography'
import { GridContainer, GridItem } from '../components/Grid'
import { Database } from '../database-generated.types'
import { Card, Table } from '@digdir/designsystemet-react'
import { IconButton } from '../components/IconButton'
import { EditIcon } from '../components/icons/EditIcon'

const InfoCard = styled(Card)`
    padding: 1.5rem;
    margin-bottom: 1.5rem;
`

const InfoRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;

    &:last-child {
        margin-bottom: 0;
    }
`

const InfoLabel = styled(SmallText)`
    font-weight: 700;
    color: #666;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
`

const InfoValue = styled(Paragraph)`
    margin: 0;
`

const HeaderSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
`

const ItemImage = styled.img`
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
`

const SoldBadge = styled.span`
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #e39d2a;
    color: white;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    margin-left: 0.5rem;
`

type Shop = Database['public']['Tables']['shop']['Row']
type ShopItem = Database['public']['Tables']['shop_item']['Row']

export const ShopViewPage = () => {
    const { shopId } = useParams<{ shopId: string }>()
    const navigate = useNavigate()
    const [shop, setShop] = useState<Shop | null>(null)
    const [items, setItems] = useState<ShopItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!shopId) {
                setError('No shop ID provided')
                setLoading(false)
                return
            }

            try {
                const shops = await getShop(shopId)
                if (shops.length === 0) {
                    setError('Shop not found')
                    setLoading(false)
                    return
                }

                const shopData = shops[0]
                setShop(shopData)

                const itemsData = await getItemsByShop(shopId)
                setItems(itemsData)
            } catch (err) {
                setError('Failed to fetch shop data')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [shopId])

    if (loading) {
        return (
            <PageContainer>
                <Heading2>Loading shop...</Heading2>
            </PageContainer>
        )
    }

    if (error || !shop) {
        return (
            <PageContainer>
                <Heading2 style={{ color: 'red' }}>Error</Heading2>
                <Paragraph>{error || 'Shop not found'}</Paragraph>
                <Button onClick={() => navigate('/admin')} style={{ marginTop: '1rem' }}>
                    Back to Admin
                </Button>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <GridContainer>
                <GridItem large="span 12">
                    <HeaderSection style={{ marginTop: '2rem' }}>
                        <div>
                            <Heading2 style={{ marginBottom: '0.5rem' }}>{shop.name || 'Unnamed Shop'}</Heading2>
                            <SmallText style={{ color: '#666' }}>ID: {shop.id}</SmallText>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button onClick={() => navigate('/admin')} variant="secondary">
                                Back
                            </Button>
                            <Button onClick={() => navigate(`/admin/shop/${shopId}/edit`)}>
                                Edit Shop
                            </Button>
                        </div>
                    </HeaderSection>
                </GridItem>

                <GridItem large="span 6" small="span 12">
                    <InfoCard>
                        <Heading3 style={{ marginBottom: '1.5rem' }}>Shop Information</Heading3>
                        
                        {shop.location && (
                            <InfoRow>
                                <InfoLabel>Location</InfoLabel>
                                <InfoValue>{shop.location}</InfoValue>
                            </InfoRow>
                        )}

                        {shop.shop_type && (
                            <InfoRow>
                                <InfoLabel>Shop Type</InfoLabel>
                                <InfoValue>{shop.shop_type}</InfoValue>
                            </InfoRow>
                        )}

                        {shop.opening_hours && (
                            <InfoRow>
                                <InfoLabel>Opening Hours</InfoLabel>
                                <InfoValue>{shop.opening_hours}</InfoValue>
                            </InfoRow>
                        )}

                        {shop.description && (
                            <InfoRow>
                                <InfoLabel>Description</InfoLabel>
                                <InfoValue>{shop.description}</InfoValue>
                            </InfoRow>
                        )}
                    </InfoCard>
                </GridItem>

                <GridItem large="span 6" small="span 12">
                    <InfoCard>
                        <Heading3 style={{ marginBottom: '1.5rem' }}>Items in Shop</Heading3>
                        {items.length === 0 ? (
                            <Paragraph>No items in this shop.</Paragraph>
                        ) : (
                            <Paragraph style={{ marginBottom: '1rem' }}>
                                Total: {items.length} item{items.length !== 1 ? 's' : ''}
                            </Paragraph>
                        )}
                    </InfoCard>
                </GridItem>

                <GridItem large="span 12">
                    <Card style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <Heading3 style={{ margin: 0 }}>Items List</Heading3>
                            <Button onClick={() => navigate(`/admin/shop/${shopId}/item/new`)}>
                                + New Item
                            </Button>
                        </div>
                        {items.length > 0 ? (
                            <Table hover border>
                                <Table.Head>
                                    <Table.Row>
                                        <Table.HeaderCell>Image</Table.HeaderCell>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        <Table.HeaderCell>Type</Table.HeaderCell>
                                        <Table.HeaderCell>Short Description</Table.HeaderCell>
                                        <Table.HeaderCell>Cost</Table.HeaderCell>
                                        <Table.HeaderCell>Status</Table.HeaderCell>
                                        <Table.HeaderCell>Actions</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Head>
                                <Table.Body>
                                    {items.map((item) => (
                                        <Table.Row key={item.id}>
                                            <Table.Cell>
                                                {item.image_url ? (
                                                    <ItemImage src={item.image_url} alt={item.name} />
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            backgroundColor: '#f0f0f0',
                                                            borderRadius: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#999',
                                                            fontSize: '0.75rem',
                                                        }}
                                                    >
                                                        No Image
                                                    </div>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Heading4 style={{ margin: 0, fontSize: '1rem' }}>
                                                    {item.name}
                                                </Heading4>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <SmallText style={{ margin: 0 }}>{item.item_type}</SmallText>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <SmallText style={{ margin: 0 }}>
                                                    {item.short_description}
                                                </SmallText>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <SmallText style={{ margin: 0, fontWeight: 700 }}>
                                                    {item.cost} gp
                                                </SmallText>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {item.sold && <SoldBadge>SOLD</SoldBadge>}
                                                {!item.sold && <SmallText style={{ margin: 0, color: '#269d36' }}>Available</SmallText>}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigate(`/admin/shop/${shopId}/item/${item.id}`)
                                                    }}
                                                >
                                                    <EditIcon size={20} color="#1c0413" />
                                                </IconButton>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        ) : (
                            <Paragraph>No items in this shop. Click "+ New Item" to add one.</Paragraph>
                        )}
                    </Card>
                </GridItem>
            </GridContainer>
        </PageContainer>
    )
}

