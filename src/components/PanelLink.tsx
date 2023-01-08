import React from 'react'
import styled from 'styled-components'
import { ArrowRightIcon } from '@radix-ui/react-icons'

const StyledPanelLink = styled.a`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    margin-bottom: 1rem;
    background: var(--panel-bg-color);
    border-radius: var(--panel-border-radius);
    box-shadow: var(--box-shadow-default);

    &:hover {
        background: #34495e;
        color: #ecf0f1;

        path {
            color: #ecf0f1;
        }
    }
`

type PanelLinkTypes = {
    children?: JSX.Element | JSX.Element[] | string
    href: string
}

export const PanelLink = ({ children, href, ...props }: PanelLinkTypes) => {
    return (
        <StyledPanelLink {...props} href={href}>
            {children}
            <ArrowRightIcon height={16} width={16} />
        </StyledPanelLink>
    )
}
