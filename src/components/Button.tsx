import React from 'react'
import styled from 'styled-components'

type ButtonTypes = {
    children: React.ReactNode
    onClick: () => void
    style?: React.CSSProperties
    disabled?: boolean
}

const StyledButton = styled.button<{ disabled?: boolean }>`
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
    background-color: ${(props) => (props.disabled ? '#999' : '#1c0413')};
    color: var(--light-color);
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    gap: 0.5rem;
    opacity: ${(props) => (props.disabled ? 0.6 : 1)};

    &:hover {
        background-color: ${(props) => (props.disabled ? '#999' : 'var(--dark-color)')};
    }
`

export const Button = ({ children, onClick, style, disabled }: ButtonTypes) => {
    return (
        <StyledButton onClick={onClick} style={style} disabled={disabled}>
            {children}
        </StyledButton>
    )
}
