import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { getShop } from '../services/getShop'
import { updateShop } from '../services/updateShop'
import { createShop } from '../services/createShop'
import { PageContainer } from '../components/PageContainer'
import { Button } from '../components/Button'
import { Heading2, Label, Paragraph } from '../components/Typography'
import { GridContainer, GridItem } from '../components/Grid'
import { Database } from '../database-generated.types'

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`

const Input = styled.input`
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-family: 'Alegreya Sans', Arial, sans-serif;

    &:focus {
        outline: none;
        border-color: var(--dark-color);
    }
`

const TextArea = styled.textarea`
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-family: 'Alegreya Sans', Arial, sans-serif;
    min-height: 100px;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: var(--dark-color);
    }
`

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
`

const StyledButton = styled.button<{ disabled?: boolean }>`
    display: inline-flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.1rem;
    line-height: 100%;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background-color: ${(props) => (props.disabled ? '#999' : '#1c0413')};
    color: var(--light-color);
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    gap: 0.5rem;
    opacity: ${(props) => (props.disabled ? 0.6 : 1)};

    &:hover {
        background-color: ${(props) => (props.disabled ? '#999' : 'var(--dark-color)')};
    }
`

const FormCard = styled.div`
    background-color: var(--panel-bg-color);
    border-radius: var(--panel-border-radius);
    padding: 2rem;
    box-shadow: var(--box-shadow-default);
`

type Shop = Database['public']['Tables']['shop']['Row']

export const EditShopPage = () => {
    const { shopId } = useParams<{ shopId: string }>()
    const navigate = useNavigate()
    const [shop, setShop] = useState<Shop | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const isNewShop = shopId === 'new'

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        shop_type: '',
        description: '',
        opening_hours: '',
    })

    useEffect(() => {
        const fetchShop = async () => {
            if (isNewShop) {
                // For new shops, just initialize empty form
                setLoading(false)
                return
            }

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
                setFormData({
                    name: shopData.name || '',
                    location: shopData.location || '',
                    shop_type: shopData.shop_type || '',
                    description: shopData.description || '',
                    opening_hours: shopData.opening_hours || '',
                })
            } catch (err) {
                setError('Failed to fetch shop')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchShop()
    }, [shopId, isNewShop])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setSaving(true)
        setError(null)

        try {
            if (isNewShop) {
                // Create new shop
                await createShop({
                    name: formData.name || null,
                    location: formData.location || null,
                    shop_type: formData.shop_type || null,
                    description: formData.description || null,
                    opening_hours: formData.opening_hours || null,
                })
            } else {
                // Update existing shop
                if (!shopId) return
                await updateShop(shopId, {
                    name: formData.name || null,
                    location: formData.location || null,
                    shop_type: formData.shop_type || null,
                    description: formData.description || null,
                    opening_hours: formData.opening_hours || null,
                })
            }
            navigate('/admin')
        } catch (err) {
            setError(isNewShop ? 'Failed to create shop' : 'Failed to update shop')
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    if (loading) {
        return (
            <PageContainer>
                <Heading2>Loading shop...</Heading2>
            </PageContainer>
        )
    }

    if (error && !shop) {
        return (
            <PageContainer>
                <Heading2 style={{ color: 'red' }}>Error</Heading2>
                <Paragraph>{error}</Paragraph>
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
                    <Heading2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                        {isNewShop ? 'Create New Shop' : 'Edit Shop'}
                    </Heading2>
                    {shop && !isNewShop && (
                        <Paragraph style={{ marginBottom: '2rem', color: '#666' }}>ID: {shop.id}</Paragraph>
                    )}
                </GridItem>

                <GridItem large="span 8" small="span 12">
                    <FormCard>
                        <Form onSubmit={handleSubmit}>
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Shop name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Shop location"
                                />
                            </div>

                            <div>
                                <Label htmlFor="shop_type">Shop Type</Label>
                                <Input
                                    id="shop_type"
                                    name="shop_type"
                                    type="text"
                                    value={formData.shop_type}
                                    onChange={handleChange}
                                    placeholder="e.g., Magic Shop, General Store"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <TextArea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Shop description"
                                />
                            </div>

                            <div>
                                <Label htmlFor="opening_hours">Opening Hours</Label>
                                <Input
                                    id="opening_hours"
                                    name="opening_hours"
                                    type="text"
                                    value={formData.opening_hours}
                                    onChange={handleChange}
                                    placeholder="e.g., 9:00 AM - 6:00 PM"
                                />
                            </div>

                            {error && <Paragraph style={{ color: 'red' }}>{error}</Paragraph>}

                            <ButtonGroup>
                                <StyledButton type="submit" disabled={saving}>
                                    {saving
                                        ? isNewShop
                                            ? 'Creating...'
                                            : 'Saving...'
                                        : isNewShop
                                        ? 'Create Shop'
                                        : 'Save Changes'}
                                </StyledButton>
                                <Button onClick={() => navigate('/admin')} style={{ backgroundColor: '#666' }}>
                                    Cancel
                                </Button>
                            </ButtonGroup>
                        </Form>
                    </FormCard>
                </GridItem>
            </GridContainer>
        </PageContainer>
    )
}
