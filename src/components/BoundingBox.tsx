import React from 'react'
//import { Line } from '@react-three/drei'

type BoundingBoxType = {
    height: number
    length: number
}

export const BoundingBox = ({ height, length }: BoundingBoxType) => {
    /*
    return (
        <>
            <Line
                points={[
                    [0, 0, 0],
                    [0, height - 1, 0],
                ]}
            />
            <Line
                points={[
                    [0, 0, 0],
                    [length - 1, 0, 0],
                ]}
            />
            <Line
                points={[
                    [length - 1, 0, 0],
                    [length - 1, height - 1, 0],
                ]}
            />
            <Line
                points={[
                    [0, height - 1, 0],
                    [length - 1, height - 1, 0],
                ]}
            />
        </>
    )*/
    return <></>
}
