import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import styled from 'styled-components'
import { SideNavigation } from './components/SideNavigation'
import { Heading1 } from './components/Typography'
import { OrthographicCamera, Line, OrbitControls } from '@react-three/drei'
import Delaunator from 'delaunator'
import { nextHalfedge, triangleCenter, triangleOfEdge } from './delaunayFunctions'
import { BoundingBox } from './components/BoundingBox'

const PageContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: row;
`

const SidePanel = styled.div`
    width: 300px;
    padding: 24px;
    box-shadow: var(--box-shadow-default);
    background-color: var(--panel-bg-color);
    position: relative;
    z-index: 2;
`

export const MapGenerator = () => {
    const length = 40
    const height = 20

    const generateArray = () => {
        let tempNodes: number[][] = []
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < height; j++) {
                tempNodes.push([
                    i + Math.random() * 0.5 - Math.random() * 0.5,
                    j + Math.random() * 0.5 - Math.random() * 0.5,
                ])
            }
        }
        return tempNodes
    }
    const [nodes, setNodes] = useState<number[][]>(generateArray())
    const delaunator = Delaunator.from(nodes)

    let tempTriangles: number[][][] = []
    for (let e = 0; e < delaunator.triangles.length; e++) {
        if (e > delaunator.halfedges[e]) {
            const p = nodes[delaunator.triangles[e]]
            const q = nodes[delaunator.triangles[nextHalfedge(e)]]
            tempTriangles.push([p, q])
        }
    }

    const outOfBounds = (v: number[], length: number, height: number) => {
        if (v[0] > length || v[0] < 0 || v[1] > height || v[1] < 0) {
            return true
        }
        return false
    }

    let tempVoronoi: number[][][] = []
    for (let e = 0; e < delaunator.triangles.length; e++) {
        if (e < delaunator.halfedges[e]) {
            let p = triangleCenter(nodes, delaunator, triangleOfEdge(e))
            let q = triangleCenter(nodes, delaunator, triangleOfEdge(delaunator.halfedges[e]))

            tempVoronoi.push([p, q])
        }
    }

    const regenerateDelaunay = () => {
        setNodes(generateArray())
    }

    return (
        <PageContainer>
            <SideNavigation />
            <SidePanel>
                <Heading1>Map Generator</Heading1>
                <button onClick={() => regenerateDelaunay()}>Generate</button>
            </SidePanel>
            <Canvas>
                <ambientLight intensity={0.3} />
                <OrthographicCamera />
                <OrbitControls enableRotate={false} />

                {tempVoronoi.map((tri) => (
                    <Line
                        key={tri[0][0] + tri[0][1] + tri[1][1] + tri[1][1]}
                        points={[
                            [tri[0][0], tri[0][1], 0],
                            [tri[1][0], tri[1][1], 0],
                        ]}
                    />
                ))}
                <BoundingBox height={height} length={length} />
            </Canvas>
        </PageContainer>
    )
}
/*
{tempTriangles.map((tri) => (
    <Line
        points={[
            [tri[0][0], tri[0][1], 0],
            [tri[1][0], tri[1][1], 0],
        ]}
    />
))}
*/
export default MapGenerator