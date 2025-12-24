import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { getItem } from '../services/getItem'
import { updateItem } from '../services/updateItem'
import { createItem } from '../services/createItem'
import { PageContainer } from '../components/PageContainer'
import { Button } from '../components/Button'
import { Heading2, Label, Paragraph } from '../components/Typography'
import { GridContainer, GridItem } from '../components/Grid'
import { Database } from '../database-generated.types'
import { Textfield, Textarea, Field, Checkbox } from '@digdir/designsystemet-react'

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

type ShopItem = Database['public']['Tables']['shop_item']['Row']

export const EditItemPage = () => {
    const { shopId, itemId } = useParams<{ shopId: string; itemId?: string }>()
    const navigate = useNavigate()
    const [item, setItem] = useState<ShopItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const isNewItem = !itemId || itemId === 'new'

    const [formData, setFormData] = useState({
        name: '',
        item_type: '',
        short_description: '',
        long_description: '',
        cost: '',
        image_url: '',
        sold: false,
    })

    useEffect(() => {
        const fetchItem = async () => {
            if (isNewItem) {
                // For new items, just initialize empty form
                setLoading(false)
                return
            }

            if (!itemId) {
                setError('No item ID provided')
                setLoading(false)
                return
            }

            try {
                const items = await getItem(itemId)
                if (items.length === 0) {
                    setError('Item not found')
                    setLoading(false)
                    return
                }

                const itemData = items[0]
                setItem(itemData)
                setFormData({
                    name: itemData.name || '',
                    item_type: itemData.item_type || '',
                    short_description: itemData.short_description || '',
                    long_description: itemData.long_description || '',
                    cost: itemData.cost.toString() || '',
                    image_url: itemData.image_url || '',
                    sold: itemData.sold || false,
                })
            } catch (err) {
                setError('Failed to fetch item')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchItem()
    }, [itemId, isNewItem])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!shopId) return

        setSaving(true)
        setError(null)

        try {
            if (isNewItem) {
                // Create new item
                await createItem({
                    shop_id: shopId,
                    name: formData.name,
                    item_type: formData.item_type,
                    short_description: formData.short_description || undefined,
                    long_description: formData.long_description,
                    cost: parseFloat(formData.cost) || 0,
                    image_url: formData.image_url || null,
                    sold: formData.sold,
                })
            } else {
                // Update existing item
                if (!itemId) return
                await updateItem(itemId, {
                    name: formData.name || undefined,
                    item_type: formData.item_type || undefined,
                    short_description: formData.short_description || undefined,
                    long_description: formData.long_description || undefined,
                    cost: formData.cost ? parseFloat(formData.cost) : undefined,
                    image_url: formData.image_url || null,
                    sold: formData.sold,
                })
            }
            navigate(`/admin/shop/${shopId}`)
        } catch (err) {
            setError(isNewItem ? 'Failed to create item' : 'Failed to update item')
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        if (type === 'checkbox') {
            setFormData((prev) => ({ ...prev, [name]: checked }))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }

    if (loading) {
        return (
            <PageContainer>
                <Heading2>Loading item...</Heading2>
            </PageContainer>
        )
    }

    if (error && !item && !isNewItem) {
        return (
            <PageContainer>
                <Heading2 style={{ color: 'red' }}>Error</Heading2>
                <Paragraph>{error}</Paragraph>
                <Button onClick={() => navigate(`/admin/shop/${shopId}`)} style={{ marginTop: '1rem' }}>
                    Back to Shop
                </Button>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <GridContainer>
                <GridItem large="span 12">
                    <Heading2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                        {isNewItem ? 'Create New Item' : 'Edit Item'}
                    </Heading2>
                    {item && !isNewItem && (
                        <Paragraph style={{ marginBottom: '2rem', color: '#666' }}>ID: {item.id}</Paragraph>
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
                                    placeholder="Item name"
                                    required
                                />
                            </Field>

                            <Field>
                                <Textfield
                                    label="Item Type"
                                    id="item_type"
                                    name="item_type"
                                    value={formData.item_type}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="e.g., Weapon, Armor, Potion"
                                    required
                                />
                            </Field>

                            <Field>
                                <Textfield
                                    label="Short Description"
                                    id="short_description"
                                    name="short_description"
                                    value={formData.short_description}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="Brief description"
                                />
                            </Field>

                            <Field>
                                <Label htmlFor="long_description">Long Description</Label>
                                <Textarea
                                    id="long_description"
                                    name="long_description"
                                    value={formData.long_description}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="Detailed description"
                                    rows={6}
                                    required
                                />
                            </Field>

                            <Field>
                                <Textfield
                                    label="Cost (gp)"
                                    id="cost"
                                    name="cost"
                                    type="number"
                                    value={formData.cost}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="0"
                                    required
                                />
                            </Field>

                            <Field>
                                <Textfield
                                    label="Image URL"
                                    id="image_url"
                                    name="image_url"
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </Field>

                            {error && <Paragraph style={{ color: 'red' }}>{error}</Paragraph>}

                            <ButtonGroup>
                                <Button disabled={saving} type="submit">
                                    {saving
                                        ? isNewItem
                                            ? 'Creating...'
                                            : 'Saving...'
                                        : isNewItem
                                        ? 'Create Item'
                                        : 'Save Changes'}
                                </Button>
                                <Button onClick={() => navigate(`/admin/shop/${shopId}`)} variant="secondary">
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
