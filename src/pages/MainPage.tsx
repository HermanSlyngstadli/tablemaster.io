import React from 'react'
import { GridContainer, GridItem } from '../components/Grid'
import { NavigationCard } from '../components/NavigationCard'
import { PageContainer } from '../components/PageContainer'
import { MapIcon } from '../components/icons/MapIcon'
import { SideNavigation } from '../components/SideNavigation'

export const MainPage = () => {
    return (
        <PageContainer>
            <SideNavigation />
            <GridContainer>
                <GridItem large={'span 4'} small={'span 12'}>
                    <NavigationCard href={'/shop'}>
                        <MapIcon />
                        Shops
                    </NavigationCard>
                </GridItem>
            </GridContainer>
        </PageContainer>
    )
}
