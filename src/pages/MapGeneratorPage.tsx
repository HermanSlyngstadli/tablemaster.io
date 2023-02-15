import React, { useState } from 'react'
import styled from 'styled-components'
import Delaunator from 'delaunator'
import { nextHalfedge, triangleCenter, triangleOfEdge } from '../delaunayFunctions'
import { Canvas } from '@react-three/fiber'
import { OrthographicCamera, Line, OrbitControls } from '@react-three/drei'
import { SideNavigation } from '../components/SideNavigation'
import { BoundingBox } from '../components/BoundingBox'
import { PageContainer } from '../components/PageContainer'
import { Button } from '../components/Button'
import { RefreshIcon } from '../components/icons/RefreshIcon'

const CanvasContainer = styled.div`
    flex-grow: 1;
`

export const MapGeneratorPage = () => {
    const length = 40
    const height = 20

    const generateArray = () => {
        const tempNodes: number[][] = []
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

    const tempTriangles: number[][][] = []
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

    const tempVoronoi: number[][][] = []
    for (let e = 0; e < delaunator.triangles.length; e++) {
        if (e < delaunator.halfedges[e]) {
            const p = triangleCenter(nodes, delaunator, triangleOfEdge(e))
            const q = triangleCenter(nodes, delaunator, triangleOfEdge(delaunator.halfedges[e]))

            tempVoronoi.push([p, q])
        }
    }

    const regenerateDelaunay = () => {
        setNodes(generateArray())
    }

    return (
        <PageContainer>
            <SideNavigation />

            <CanvasContainer>
                <Button
                    style={{ position: 'absolute', right: '16px', top: '16px', zIndex: '2' }}
                    onClick={() => regenerateDelaunay()}
                >
                    <RefreshIcon color={'#fafafa'} /> Generate
                </Button>
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
            </CanvasContainer>
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
