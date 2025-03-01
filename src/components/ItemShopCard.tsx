import React from 'react'
import styled from 'styled-components'
import { Heading3, Heading5, SmallText } from './Typography'

type ComponentTypes = {
    style?: React.CSSProperties
    heading: string
    tags: string
    itemCost: string
    imageURL: string
    action?: () => void
}

const StyledCard = styled.div`
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid #e0e0e0;
    cursor: pointer;
    transition: all 0.3s;
    img {
        width: 100%;
    }
    &:hover {
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
        border-color: #4b1939;
    }
`
interface ImageProps {
    src: string
}
const ImageContainer = styled.div<ImageProps>`
    width: 100%;
    height: 200px;
    background-color: #ede9e9;
    background-image: url(${(props) => props.src});
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
    background-color: #000;
    border-radius: 50%;
    margin: 0.25rem;
    display: inline-block;
`

export const ItemShopCard = ({ style, heading, tags, itemCost, imageURL, action }: ComponentTypes) => {
    const tagText = tags.split(',')
    return (
        <StyledCard style={style} {...action}>
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
                <Heading5 style={{ margin: 0 }}>{itemCost}</Heading5>
            </ItemCardContent>
        </StyledCard>
    )
}
