import React from 'react'
import styled from 'styled-components'

type InformationTagTypes = {
    icon?: JSX.Element
    text: string
}

const StyledInformationTag = styled.span`
    display: inline-flex;
    align-items: center;
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    gap: 0.25rem;
    background-color: var(--ds-color-surface-tinted);
    color: var(--ds-color-text-default);
`

export const InformationTag = ({ icon, text, ...props }: InformationTagTypes) => {
    return (
        <StyledInformationTag {...props}>
            {icon}
            {text}
        </StyledInformationTag>
    )
}
