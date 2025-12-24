import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { getAllShops } from '../services/getAllShops'
import { PageContainer } from '../components/PageContainer'
import { Heading2, Paragraph, SmallText } from '../components/Typography'
import { GridContainer, GridItem } from '../components/Grid'
import { Database } from '../database-generated.types'
import { Button } from '../components/Button'
import { Table } from '@digdir/designsystemet-react'

const StyledTableRow = styled(Table.Row)`
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;

    &:hover {
        background-color: #f5f5f5;
    }
`

const IdCell = styled(Table.Cell)`
    font-family: monospace;
    font-size: 0.875rem;
    color: #666;
    word-break: break-all;
    max-width: 200px;
`

type Shop = Database['public']['Tables']['shop']['Row']

export const AdminPage = () => {
    const [shops, setShops] = useState<Shop[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const shopData = await getAllShops()
                setShops(shopData)
            } catch (err) {
                setError('Failed to fetch shops')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchShops()
    }, [])

    if (loading) {
        return (
            <PageContainer>
                <Heading2>Loading shops...</Heading2>
            </PageContainer>
        )
    }

    if (error) {
        return (
            <PageContainer>
                <Heading2 style={{ color: 'red' }}>Error</Heading2>
                <Paragraph>{error}</Paragraph>
            </PageContainer>
        )
    }

    const handleRowClick = (shopId: string) => {
        navigate(`/admin/shop/${shopId}`)
    }

    return (
        <PageContainer>
            <GridContainer>
                <GridItem large="span 12">
                    <div style={{ marginTop: '2rem' }}>
                        <div>
                            <Heading2 style={{ marginBottom: '0.5rem' }}>Admin - All Shops</Heading2>
                            <SmallText>
                                Total: {shops.length} shop{shops.length !== 1 ? 's' : ''}
                            </SmallText>
                        </div>
                        <Button onClick={() => navigate('/admin/shop/new')}>+ New Shop</Button>
                    </div>
                </GridItem>

                {shops.length === 0 ? (
                    <GridItem large="span 12">
                        <Paragraph>No shops found in the database.</Paragraph>
                    </GridItem>
                ) : (
                    <GridItem large="span 12">
                        <Table hover border>
                            <Table.Head>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Location</Table.HeaderCell>
                                    <Table.HeaderCell>Type</Table.HeaderCell>
                                    <Table.HeaderCell>Description</Table.HeaderCell>
                                    <Table.HeaderCell>Opening Hours</Table.HeaderCell>
                                    <Table.HeaderCell>ID</Table.HeaderCell>
                                </Table.Row>
                            </Table.Head>
                            <Table.Body>
                                {shops.map((shop) => (
                                    <StyledTableRow key={shop.id} onClick={() => handleRowClick(shop.id)}>
                                        <Table.Cell>{shop.name || 'Unnamed Shop'}</Table.Cell>
                                        <Table.Cell>{shop.location || '-'}</Table.Cell>
                                        <Table.Cell>{shop.shop_type || '-'}</Table.Cell>
                                        <Table.Cell>{shop.description || '-'}</Table.Cell>
                                        <Table.Cell>{shop.opening_hours || '-'}</Table.Cell>
                                        <IdCell>{shop.id}</IdCell>
                                    </StyledTableRow>
                                ))}
                            </Table.Body>
                        </Table>
                    </GridItem>
                )}
            </GridContainer>
        </PageContainer>
    )
}
