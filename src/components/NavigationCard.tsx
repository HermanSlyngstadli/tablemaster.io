import React from 'react'
import { Card } from '@digdir/designsystemet-react'
import styled from 'styled-components'

const StyledCard = styled(Card)`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 24px;
    text-decoration: none;
    text-align: center;
    gap: 12px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-2px);
    }
`

export const NavigationCard = ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: any }) => {
    return (
        <StyledCard as="a" href={href} {...props}>
            {children}
        </StyledCard>
    )
}
