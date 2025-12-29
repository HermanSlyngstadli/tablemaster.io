import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@digdir/designsystemet-react'
import { ArrowLeftIcon } from './icons/ArrowLeftIcon'
import styled from 'styled-components'

type BackButtonProps = {
    to?: string
    children?: React.ReactNode
    style?: React.CSSProperties
}

export const BackButton = ({ to = '/shop', children, style, ...props }: BackButtonProps) => {
    const navigate = useNavigate()

    return (
        <Button variant="tertiary" onClick={() => navigate(to)} style={style} {...props}>
            <ArrowLeftIcon />
            {children || 'Back'}
        </Button>
    )
}
