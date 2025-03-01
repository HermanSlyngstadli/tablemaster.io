import React from 'react'
import styled from 'styled-components'

type ButtonTypes = {
    children: React.ReactNode
    onClick: () => void
    style?: React.CSSProperties
}

const StyledButton = styled.button`
    display: inline-flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.1rem;
    line-height: 100%;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background-color: #1c0413;
    color: var(--light-color);
    cursor: pointer;
    gap: 0.5rem;

    &:hover {
        background-color: var(--dark-color);
    }
`

export const Button = ({ children, onClick, style }: ButtonTypes) => {
    return (
        <StyledButton onClick={onClick} style={style}>
            {children}
        </StyledButton>
    )
}
