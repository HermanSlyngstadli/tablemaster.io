import React from 'react'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import styled from 'styled-components'

const StyledBackButton = styled.a`
    display: flex;
    align-items: center;
    padding: 0.75rem 0.25rem;
    border-radius: var(--panel-border-radius);

    &:hover {
        background: #bdc3c7;
    }
`

export const BackButton = ({ ...props }) => {
    return (
        <StyledBackButton href="/" {...props}>
            <ArrowLeftIcon style={{ marginRight: '0.5rem' }} /> Tilbake til oversikten
        </StyledBackButton>
    )
}
