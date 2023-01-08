import React from 'react'
import styled from 'styled-components'

type GridContainerProps = {
    children: JSX.Element | JSX.Element[]
}

const StyledContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 16px;
    padding: 0 24px;
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
    @media only screen and (max-width: 850px) {
        padding: 0 24px;
    }
`

export const GridContainer = ({ children, ...props }: GridContainerProps) => {
    return <StyledContainer {...props}>{children}</StyledContainer>
}

type GridItemProps = {
    children: JSX.Element | JSX.Element[]
    small?: string
    large?: string
}

const Item = styled.div<GridItemProps>`
    grid-column: ${(props) => props.large};
    @media (max-width: 850px) {
        grid-column: ${(props) => props.small};
    }
`

export const GridItem = ({ children, small, large, ...props }: GridItemProps) => {
    return (
        <Item {...props} small={small} large={large}>
            {children}
        </Item>
    )
}
