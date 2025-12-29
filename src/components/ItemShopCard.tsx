import React from 'react'
import styled from 'styled-components'
import { Card } from '@digdir/designsystemet-react'
import { Heading3, Heading5, SmallText } from './Typography'

type ComponentTypes = {
    style?: React.CSSProperties
    heading: string
    tags: string
    itemCost: number
    imageURL: string | null
    onClick?: () => void
}

const StyledCard = styled(Card)`
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
    padding: 0;
    img {
        width: 100%;
    }
    &:hover {
        box-shadow: var(--box-shadow-default);
    }
`
interface ImageProps {
    src: string | null
}
const ImageContainer = styled.div<ImageProps>`
    width: 100%;
    height: 200px;
    background-color: var(--ds-color-surface-tinted);
    background-image: url(${(props) => (props.src ? props.src : '')});
    background-size: contain;
    background-repeat: no-repeat;
    background-position-x: center;
    background-position-y: center;
`

const ItemCardContent = styled.div`
    padding: 1rem;
`

const TagSpacer = styled.span`
    height: 0.25rem;
    width: 0.25rem;
    background-color: var(--ds-color-text-default);
    border-radius: 50%;
    margin: 0.25rem;
    display: inline-block;
`

export const ItemShopCard = ({ style, heading, tags, itemCost, imageURL, onClick }: ComponentTypes) => {
    const tagText = tags.split(',')
    return (
        <StyledCard style={style} onClick={onClick}>
            <ImageContainer src={imageURL} />
            <ItemCardContent>
                <Heading3 style={{ marginBottom: '0.5rem' }}>{heading}</Heading3>
                {tagText.map((tag, index) => {
                    if (index < tagText.length - 1) {
                        return (
                            <SmallText
                                style={{ marginBottom: '0.5rem', marginTop: '0rem', display: 'inline-block' }}
                                key={index + 2342}
                            >
                                {tag}
                                <TagSpacer />
                            </SmallText>
                        )
                    } else {
                        return (
                            <SmallText
                                style={{ marginBottom: '0.5rem', marginTop: '0rem', display: 'inline-block' }}
                                key={index + 2342}
                            >
                                {tag}
                            </SmallText>
                        )
                    }
                })}
                <Heading5 style={{ margin: 0 }}>{itemCost} gp</Heading5>
            </ItemCardContent>
        </StyledCard>
    )
}
