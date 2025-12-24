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
import { Textfield, Textarea, Field, Input } from '@digdir/designsystemet-react'

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
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
                            <Field>
                                <Textfield
                                    label="Name"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="Shop name"
                                />
                            </Field>

                            <Field>
                                <Textfield
                                    label="Location"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="Shop location"
                                />
                            </Field>

                            <Field>
                                <Textfield
                                    label="Shop Type"
                                    id="shop_type"
                                    name="shop_type"
                                    value={formData.shop_type}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="e.g., Magic Shop, General Store"
                                />
                            </Field>

                            <Field>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="Shop description"
                                    rows={4}
                                />
                            </Field>

                            <Field>
                                <Textfield
                                    label="Opening Hours"
                                    id="opening_hours"
                                    name="opening_hours"
                                    value={formData.opening_hours}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="e.g., 9:00 AM - 6:00 PM"
                                />
                            </Field>

                            {error && <Paragraph style={{ color: 'red' }}>{error}</Paragraph>}

                            <ButtonGroup>
                                <Button disabled={saving} type="submit">
                                    {saving
                                        ? isNewShop
                                            ? 'Creating...'
                                            : 'Saving...'
                                        : isNewShop
                                        ? 'Create Shop'
                                        : 'Save Changes'}
                                </Button>
                                <Button onClick={() => navigate('/admin')} variant="secondary">
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
