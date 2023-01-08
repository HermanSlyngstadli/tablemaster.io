import { Line } from '@react-three/drei'

type BoundingBoxType = {
    height: number
    length: number
}

export const BoundingBox = ({ height, length }: BoundingBoxType) => {
    return (
        <>
            <Line
                points={[
                    [0, 0, 0],
                    [0, height, 0],
                ]}
            />
            <Line
                points={[
                    [0, 0, 0],
                    [length, 0, 0],
                ]}
            />
            <Line
                points={[
                    [length, 0, 0],
                    [length, height, 0],
                ]}
            />
            <Line
                points={[
                    [0, height, 0],
                    [length, height, 0],
                ]}
            />
        </>
    )
}
