import React from 'react'
import styled from 'styled-components'
import { Card, Heading, Paragraph } from '@digdir/designsystemet-react'
import { MainContent } from '../components/MainContent'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { MapIcon } from '../components/icons/MapIcon'
import makonosThumb from '../assets/map-card-makonos.jpg'
import pirateThumb from '../assets/map-card-pirat.jpg'
import ankrealThumb from '../assets/map-card-ankreal.jpg'

const PageHeading = styled(Heading)`
    padding-left: 16px;
    margin-bottom: 0;
    margin-top: 16px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--ds-color-border-subtle);

    @media (max-width: 768px) {
        padding-left: 12px;
        padding-right: 12px;
        margin-top: 8px;
        padding-bottom: 16px;
    }
`

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    padding: 24px 16px;

    @media (max-width: 768px) {
        padding: 16px 12px;
    }
`

const MapCard = styled(Card)`
    display: block;
    padding: 0;
    overflow: hidden;
    text-decoration: none;
    color: var(--ds-color-text-default);
    transition:
        box-shadow 0.2s ease-in-out,
        transform 0.2s ease-in-out;

    &:hover {
        box-shadow: var(--box-shadow-default);
        transform: translateY(-2px);
    }
`

const Thumbnail = styled.div<{ src?: string }>`
    height: 140px;
    background-color: var(--ds-color-surface-tinted);
    background-image: ${(props) => (props.src ? `url(${props.src})` : 'none')};
    background-size: cover;
    background-position: center;
`

const FantasyThumbnail = styled(Thumbnail)`
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: linear-gradient(135deg, var(--ds-color-base-default), var(--ds-color-surface-active));
`

const CardBody = styled.div`
    padding: 12px 16px 16px;
`

const CardDescription = styled(Paragraph)`
    margin: 4px 0 0;
    color: var(--ds-color-text-subtle);
`

const maps = [
    {
        slug: 'fantasy',
        title: 'Fantasy',
        description: 'A new procedurally generated world every time.',
    },
    {
        slug: 'makonos',
        title: 'Makonos',
        description: 'The island of Makonos.',
        thumbnail: makonosThumb,
    },
    {
        slug: 'pirat',
        title: 'Pirat',
        description: 'High seas and pirate coves.',
        thumbnail: pirateThumb,
    },
    {
        slug: 'ankreal',
        title: 'Ankreal',
        description: 'The continent of Ankreal.',
        thumbnail: ankrealThumb,
    },
]

export const MapLandingPage = () => {
    return (
        <PageContainer>
            <SideNavigation />
            <MainContent>
                <PageHeading level={1} data-size="lg">
                    Maps
                </PageHeading>
                <CardGrid>
                    {maps.map((map) => (
                        <MapCard asChild key={map.slug}>
                            <a href={`/map/${map.slug}`}>
                                {map.thumbnail ? (
                                    <Thumbnail src={map.thumbnail} />
                                ) : (
                                    <FantasyThumbnail>
                                        <MapIcon size={32} color="var(--ds-color-base-contrast-default)" />
                                    </FantasyThumbnail>
                                )}
                                <CardBody>
                                    <Heading level={2} data-size="xs">
                                        {map.title}
                                    </Heading>
                                    <CardDescription data-size="sm">{map.description}</CardDescription>
                                </CardBody>
                            </a>
                        </MapCard>
                    ))}
                </CardGrid>
            </MainContent>
        </PageContainer>
    )
}
