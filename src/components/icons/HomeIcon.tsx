import React from 'react'
import { IconTypes } from './IconTypes'

export const HomeIcon = ({ color = '#000', size = 24 }: IconTypes) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 512 512">
            <path
                d="M80,212V448a16,16,0,0,0,16,16h96V328a24,24,0,0,1,24-24h80a24,24,0,0,1,24,24V464h96a16,16,0,0,0,16-16V212"
                fill="none"
                stroke={color}
                strokeMiterlimit="10"
                strokeWidth="32px"
            />
            <path
                d="M480,256,266.89,52c-5-5.28-16.69-5.34-21.78,0L32,256"
                fill="none"
                stroke={color}
                strokeMiterlimit="10"
                strokeWidth="32px"
            />
            <polyline
                points="400 179 400 64 352 64 352 133"
                fill="none"
                stroke={color}
                strokeMiterlimit="10"
                strokeWidth="32px"
            />
        </svg>
    )
}
