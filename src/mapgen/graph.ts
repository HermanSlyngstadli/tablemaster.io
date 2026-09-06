import { Delaunay } from 'd3-delaunay'
import { Point } from './points'

// The cell graph is the single shared structure every generation stage reads
// from: heightmap spreads across `neighbors`, and later stages (coastline
// tracing, river flow, biome smoothing) all walk the same adjacency instead
// of recomputing geometry.
export interface CellGraph {
    points: Point[]
    cellCount: number
    neighbors: number[][]
    polygons: (Point[] | null)[]
    width: number
    height: number
    delaunay: Delaunay<Point>
}

export function buildGraph(points: Point[], width: number, height: number): CellGraph {
    const delaunay = Delaunay.from(points)
    const voronoi = delaunay.voronoi([0, 0, width, height])
    const cellCount = points.length

    const neighbors: number[][] = new Array(cellCount)
    const polygons: (Point[] | null)[] = new Array(cellCount)

    for (let i = 0; i < cellCount; i++) {
        neighbors[i] = [...voronoi.neighbors(i)]
        const poly = voronoi.cellPolygon(i)
        polygons[i] = poly ? (poly.map(([x, y]) => [x, y]) as Point[]) : null
    }

    return { points, cellCount, neighbors, polygons, width, height, delaunay }
}
