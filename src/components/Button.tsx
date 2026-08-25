import React from 'react'
import { Button as DSButton } from '@digdir/designsystemet-react'
import styled from 'styled-components'

type ButtonTypes = {
    children: React.ReactNode
    onClick?: () => void
    style?: React.CSSProperties
    className?: string
    disabled?: boolean
    variant?: 'primary' | 'secondary' | 'tertiary'
    color?: 'primary' | 'secondary' | 'success' | 'danger'
    type?: 'button' | 'submit' | 'reset'
}

const StyledButton = styled(DSButton)`
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.1rem;
`

export const Button = ({
    children,
    onClick,
    style,
    className,
    disabled,
    variant = 'primary',
    color,
    type = 'button',
}: ButtonTypes) => {
    return (
        <StyledButton
            onClick={onClick || (() => {})}
            style={style}
            className={className}
            disabled={disabled}
            variant={variant}
            color={color}
            type={type}
        >
            {children}
        </StyledButton>
    )
}
