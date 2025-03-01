import React from 'react'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { Heading1, Heading2, Heading3, Heading4, Heading5, Label, Paragraph, SmallText } from '../components/Typography'
import { GridContainer, GridItem } from '../components/Grid'
import { Button } from '../components/Button'
import { ItemShopCard } from '../components/ItemShopCard'
import { InformationTag } from '../components/InformationTag'
import { NoteIcon } from '../components/icons/NoteIcon'

export const MoodSoundsPage = () => {
    return (
        <PageContainer>
            <SideNavigation />
            <GridContainer>
                <GridItem small={'1 / span 12'} large={'1 / span 12'}>
                    <Heading1>Heading 1</Heading1>
                    <Heading2>Heading 2</Heading2>
                    <Heading3>Heading 3</Heading3>
                    <Heading4>Heading 4</Heading4>
                    <Heading5>Heading 5</Heading5>
                    <Paragraph>Paragraph</Paragraph>
                    <SmallText>Small Text</SmallText>
                    <Label>Label</Label>
                    <Button onClick={() => console.log('button')}>Button</Button>
                    <ItemShopCard
                        heading="Bag of Holding"
                        itemCost="550 gp"
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
