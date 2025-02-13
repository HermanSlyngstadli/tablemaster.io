import React from 'react'
import styled from 'styled-components'

type GridContainerProps = {
    children: JSX.Element | JSX.Element[]
    padding?: number
}

type StyledContainerTypes = {
    padding: number
}

const StyledContainer = styled.div<StyledContainerTypes>`
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-flow: row;
    gap: 16px;
    padding: 0 ${(props: StyledContainerTypes) => props.padding}px;
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
`

export const GridContainer = ({ children, padding = 24, ...props }: GridContainerProps) => {
    return (
        <StyledContainer padding={padding} {...props}>
            {children}
        </StyledContainer>
    )
}

type GridItemProps = {
    children: JSX.Element | JSX.Element[]
    small?: string
    large?: string
    style?: React.CSSProperties
}

const Item = styled.div<GridItemProps>`
    grid-column: ${(props) => props.large};
    @media (max-width: 850px) {
        grid-column: ${(props) => props.small};
    }
`

export const GridItem = ({ children, small, large, style, ...props }: GridItemProps) => {
    return (
        <Item {...props} small={small} large={large} style={style}>
            {children}
        </Item>
    )
}
