import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { GridContainer, GridItem } from '../components/Grid'
import { getItemsByShop } from '../services/getItemsByShop'
import { ItemShopCard } from "../components/ItemShopCard"

export const MagicshopPage = () => {
    const { uuid } = useParams<{ uuid: string }>()
    const [items, setItems] = useState<any[]>([]) // State to store items
    const [loading, setLoading] = useState(true)  // Loading state
    const [error, setError] = useState<string | null>(null) // Error state

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const data = await getItemsByShop(uuid)
                setItems(data)
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
                          {items.map((item) => (
                            <GridItem key={item['id']} large={'span 3'} small={'span 12'}>
                                <ItemShopCard
                                  heading={item.name}
                                  itemCost={item.cost}
                                  imageURL={item.image_url}
                                  tags={item.item_type}
                                />
                            </GridItem>
                          ))}
                      </GridContainer>
                  </GridItem>
              </GridContainer>
          </div>
      </PageContainer>
    )
}
