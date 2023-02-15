import React from 'react'
import styled from 'styled-components'
import { ArrowLeftIcon } from './icons/ArrowLeftIcon'

const StyledBackButton = styled.a`
    display: flex;
    align-items: center;
    padding: 0.75rem 0.25rem;
    border-radius: var(--panel-border-radius);
    gap: 0.25rem;

    &:hover {
        background: #bdc3c7;
    }
`

export const BackButton = ({ ...props }) => {
    return (
        <StyledBackButton href="/" {...props}>
            <ArrowLeftIcon /> Tilbake til oversikten
        </StyledBackButton>
    )
}
