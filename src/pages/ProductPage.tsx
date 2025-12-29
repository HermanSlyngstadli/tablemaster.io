import React from 'react'
import { GridContainer, GridItem } from '../components/Grid'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { DiceIcon } from '../components/icons/DiceIcon'
import { NoteIcon } from '../components/icons/NoteIcon'
import { MapIcon } from '../components/icons/MapIcon'
import { Card, Heading } from '@digdir/designsystemet-react'

export const ProductPage = () => {
    return (
        <PageContainer>
            <SideNavigation />
            <GridContainer>
                <GridItem large={'span 4'} small={'span 12'}>
                    <Card>
                        <a href={'/map-generator'}>
                            <Heading level={2} data-size="xs">
                                <MapIcon /> World Map Generator
                            </Heading>
                        </a>
                    </Card>
                </GridItem>

                <GridItem large={'span 4'} small={'span 12'}>
                    <Card>
                        <a href={'/name-generator'}>
                            <Heading level={2} data-size="xs">
                                <DiceIcon /> Name Generator
                            </Heading>
                        </a>
                    </Card>
                </GridItem>

                <GridItem large={'span 4'} small={'span 12'}>
                    <Card>
                        <a href={'/mood-sounds'}>
                            <Heading level={2} data-size="xs">
                                <NoteIcon /> Mood Sounds
                            </Heading>
                        </a>
                    </Card>
                </GridItem>
            </GridContainer>
        </PageContainer>
    )
}
