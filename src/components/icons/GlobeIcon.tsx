import React from 'react'
import { IconTypes } from './IconTypes'

export const GlobeIcon = ({ color = '#000', size = 24 }: IconTypes) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={size} height={size}>
            <path
                d="M256,48C141.13,48,48,141.13,48,256s93.13,208,208,208,208-93.13,208-208S370.87,48,256,48Z"
                fill="none"
                stroke={color}
                strokeMiterlimit="10"
                strokeWidth="32px"
            />
            <path
                d="M256,48c-58.07,0-112.67,93.13-112.67,208S197.93,464,256,464s112.67-93.13,112.67-208S314.07,48,256,48Z"
                fill="none"
                stroke={color}
                strokeMiterlimit="10"
                strokeWidth="32px"
            />
            <path
                d="M117.33,117.33c38.24,27.15,86.38,43.34,138.67,43.34s100.43-16.19,138.67-43.34"
                fill="none"
                stroke={color}
                strokeMiterlimit="10"
                strokeWidth="32px"
            />
            <path
                d="M394.67,394.67c-38.24-27.15-86.38-43.34-138.67-43.34s-100.43,16.19-138.67,43.34"
                fill="none"
                stroke={color}
                strokeMiterlimit="10"
                strokeWidth="32px"
            />
            <line
                x1="256"
                y1="48"
                x2="256"
                y2="464"
                fill="none"
                stroke={color}
                strokeMiterlimit="10"
                strokeWidth="32px"
            />
            <line
                x1="464"
                y1="256"
                x2="48"
                y2="256"
                fill="none"
                stroke={color}
                strokeMiterlimit="10"
                strokeWidth="32px"
            />
        </svg>
    )
}