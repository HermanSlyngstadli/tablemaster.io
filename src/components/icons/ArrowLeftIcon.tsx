import React from 'react'
import { IconTypes } from './IconTypes'

export const ArrowLeftIcon = ({ color = '#000', size = 24 }: IconTypes) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 512 512">
            <polyline
                points="244 400 100 256 244 112"
                fill="none"
                stroke={color}
                strokeMiterlimit="10"
                strokeWidth="48px"
            />
            <line
                x1="120"
                y1="256"
                x2="412"
                y2="256"
                fill="none"
                stroke={color}
                strokeMiterlimit="10"
                strokeWidth="48px"
            />
        </svg>
    )
}
