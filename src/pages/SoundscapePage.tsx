import React from 'react'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { Label, Paragraph, SmallText } from '../components/Typography'
import { GridContainer, GridItem } from '../components/Grid'
import { ItemShopCard } from '../components/ItemShopCard'
import { InformationTag } from '../components/InformationTag'
import { NoteIcon } from '../components/icons/NoteIcon'
import { Alert, Button, Heading } from '@digdir/designsystemet-react'
import '../design-tokens-build/tablemaster.css'

export const SoundscapePage = () => {
    return (
        <PageContainer>
            <SideNavigation />
            <GridContainer>
                <GridItem small={'1 / span 12'} large={'1 / span 12'}>
                    <Alert data-color="info">Dette er en alert</Alert>
                    <Heading data-size="2xl" level={1}>
                        Heading
                    </Heading>
                    <Paragraph>Paragraph</Paragraph>
                    <SmallText>Small Text</SmallText>
                    <Label>Label</Label>
                    <Button onClick={() => console.log('button')}>Button</Button>
                    <ItemShopCard
                        heading="Bag of Holding"
                        itemCost={500}
                        tags="Uncommon,Storage,Wearable"
                        imageURL="https://www.dndbeyond.com/avatars/thumbnails/45205/443/1000/1000/638657413430473951.png"
                        style={{ width: '20rem' }}
                    />
                    <InformationTag text="Phandalin" icon={<NoteIcon />} />
                </GridItem>
            </GridContainer>
        </PageContainer>
    )
}
