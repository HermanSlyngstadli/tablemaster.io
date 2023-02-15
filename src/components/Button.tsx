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
    height: 48px;
    font-size: 1rem;
    font-weight: 700;
    padding: 16px;
    border: none;
    border-radius: 4px;
    background-color: #091e42;
    color: #fff;
    cursor: pointer;
    gap: 0.5rem;
`

export const Button = ({ children, onClick, style }: ButtonTypes) => {
    return (
        <StyledButton onClick={onClick} style={style}>
            {children}
        </StyledButton>
    )
}
