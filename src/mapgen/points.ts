import { Delaunay } from 'd3-delaunay'
import { Rng } from './rng'

export type Point = [number, number]

// A jittered grid (point per grid cell + random offset) gives far more even
// cell sizes than pure random placement, so fewer Lloyd relaxation passes are
// needed to get organic-looking, non-sliver Voronoi cells.
export function generateJitteredPoints(width: number, height: number, cellCount: number, rng: Rng): Point[] {
    const aspect = width / height
    const cols = Math.max(1, Math.round(Math.sqrt(cellCount * aspect)))
    const rows = Math.max(1, Math.round(cellCount / cols))
    const dx = width / cols
    const dy = height / rows

    const points: Point[] = []
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const jitterX = (rng() - 0.5) * dx * 0.9
            const jitterY = (rng() - 0.5) * dy * 0.9
            points.push([col * dx + dx / 2 + jitterX, row * dy + dy / 2 + jitterY])
        }
    }
    return points
}

// Lloyd relaxation: move each point toward its Voronoi cell's centroid.
// Smooths out remaining irregularity from the jitter without erasing it
// entirely (a handful of passes is enough — full convergence looks too
// uniform/artificial).
export function relaxPoints(points: Point[], width: number, height: number, iterations: number): Point[] {
    let current = points

    for (let iter = 0; iter < iterations; iter++) {
        const delaunay = Delaunay.from(current)
        const voronoi = delaunay.voronoi([0, 0, width, height])

        current = current.map((point, i): Point => {
            const cell = voronoi.cellPolygon(i)
            if (!cell || cell.length === 0) return point

            let x = 0
            let y = 0
            for (const [px, py] of cell) {
                x += px
                y += py
            }
            return [x / cell.length, y / cell.length]
        })
    }

    return current
}
