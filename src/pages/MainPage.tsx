import React from 'react'
import { GridContainer, GridItem } from '../components/Grid'
import { PageContainer } from '../components/PageContainer'
import { MapIcon } from '../components/icons/MapIcon'
import { SideNavigation } from '../components/SideNavigation'
import { Card, Heading } from '@digdir/designsystemet-react'

export const MainPage = () => {
    return (
        <PageContainer>
            <SideNavigation />
            <GridContainer>
                <GridItem large={'span 4'} small={'span 12'}>
                    <Card asChild>
                        <a href={'/shop'}>
                            <Heading level={2} data-size="xs">
                                <MapIcon />
                                Shops
                            </Heading>
                        </a>
                    </Card>
                </GridItem>
            </GridContainer>
        </PageContainer>
    )
}
