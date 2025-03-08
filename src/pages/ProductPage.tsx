import React from 'react'
import { GridContainer, GridItem } from '../components/Grid'
import { NavigationCard } from '../components/NavigationCard'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { DiceIcon } from '../components/icons/DiceIcon'
import { NoteIcon } from '../components/icons/NoteIcon'
import { MapIcon } from '../components/icons/MapIcon'

export const ProductPage = () => {
    return (
        <PageContainer>
            <SideNavigation />
            <GridContainer>
                <GridItem large={'span 4'} small={'span 12'}>
                    <NavigationCard href={'/map-generator'}>
                        <MapIcon />
                        World Map Generator
                    </NavigationCard>
                </GridItem>

                <GridItem large={'span 4'} small={'span 12'}>
                    <NavigationCard href={'/name-generator'}>
                        <DiceIcon />
                        Name Generator
                    </NavigationCard>
                </GridItem>

                <GridItem large={'span 4'} small={'span 12'}>
                    <NavigationCard href={'/mood-sounds'}>
                        <NoteIcon />
                        Mood Sounds
                    </NavigationCard>
                </GridItem>
            </GridContainer>
        </PageContainer>
    )
}
