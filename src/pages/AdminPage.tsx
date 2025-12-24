import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { getAllShops } from '../services/getAllShops'
import { PageContainer } from '../components/PageContainer'
import { Heading2, Paragraph, SmallText } from '../components/Typography'
import { GridContainer, GridItem } from '../components/Grid'
import { Database } from '../database-generated.types'
import { Button } from '../components/Button'

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    background-color: var(--panel-bg-color);
    border-radius: var(--panel-border-radius);
    overflow: hidden;
    box-shadow: var(--box-shadow-default);
`

const TableHeader = styled.thead`
    background-color: var(--dark-color);
    color: var(--light-color);
`

const TableHeaderCell = styled.th`
    padding: 1rem;
    text-align: left;
    font-weight: 700;
    font-size: 1rem;
    color: var(--light-color);
`

const TableBody = styled.tbody``

const TableRow = styled.tr`
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    border-bottom: 1px solid #e0e0e0;

    &:hover {
        background-color: #f5f5f5;
    }

    &:last-child {
        border-bottom: none;
    }
`

const TableCell = styled.td`
    padding: 1rem;
    font-size: 1rem;
`

const IdCell = styled(TableCell)`
    font-family: monospace;
    font-size: 0.875rem;
    color: #666;
    word-break: break-all;
    max-width: 200px;
`

const HeaderSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
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
                    <HeaderSection style={{ marginTop: '2rem' }}>
                        <div>
                            <Heading2 style={{ marginBottom: '0.5rem' }}>Admin - All Shops</Heading2>
                            <SmallText>
                                Total: {shops.length} shop{shops.length !== 1 ? 's' : ''}
                            </SmallText>
                        </div>
                        <Button onClick={() => navigate('/admin/shop/new')}>+ New Shop</Button>
                    </HeaderSection>
                </GridItem>

                {shops.length === 0 ? (
                    <GridItem large="span 12">
                        <Paragraph>No shops found in the database.</Paragraph>
                    </GridItem>
                ) : (
                    <GridItem large="span 12">
                        <Table>
                            <TableHeader>
                                <tr>
                                    <TableHeaderCell>Name</TableHeaderCell>
                                    <TableHeaderCell>Location</TableHeaderCell>
                                    <TableHeaderCell>Type</TableHeaderCell>
                                    <TableHeaderCell>Description</TableHeaderCell>
                                    <TableHeaderCell>Opening Hours</TableHeaderCell>
                                    <TableHeaderCell>ID</TableHeaderCell>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {shops.map((shop) => (
                                    <TableRow key={shop.id} onClick={() => handleRowClick(shop.id)}>
                                        <TableCell>{shop.name || 'Unnamed Shop'}</TableCell>
                                        <TableCell>{shop.location || '-'}</TableCell>
                                        <TableCell>{shop.shop_type || '-'}</TableCell>
                                        <TableCell>{shop.description || '-'}</TableCell>
                                        <TableCell>{shop.opening_hours || '-'}</TableCell>
                                        <IdCell>{shop.id}</IdCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </GridItem>
                )}
            </GridContainer>
        </PageContainer>
    )
}
