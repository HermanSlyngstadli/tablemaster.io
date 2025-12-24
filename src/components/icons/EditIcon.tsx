import React from 'react'
import { IconTypes } from './IconTypes'

export const EditIcon = ({ color = '#000', size = 24 }: IconTypes) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 512 512">
            <path
                d="M364.13,125.87,358,120,202,276a24,24,0,0,0,0,34l23.26,23.26a24,24,0,0,0,34,0L364.13,125.87"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="32px"
            />
            <path
                d="M420,56H308a28,28,0,0,0-28,28V96h0"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="32px"
            />
            <path
                d="M400,96V420a28,28,0,0,1-28,28H92a28,28,0,0,1-28-28V156a28,28,0,0,1,28-28H320"
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="32px"
            />
        </svg>
    )
}

