import { CellGraph } from './graph'
import { Point } from './points'

// Rounding precision (decimal places) used to match up shared vertices
// between two neighboring cells' polygons. Cell spacing is always well
// above this, so it never merges genuinely distinct vertices.
const PRECISION = 2

function vertexKey(p: Point): string {
    return `${p[0].toFixed(PRECISION)},${p[1].toFixed(PRECISION)}`
}

function edgeKey(a: Point, b: Point): string {
    const ka = vertexKey(a)
    const kb = vertexKey(b)
    return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
}

type Segment = [Point, Point]

interface EdgeInfo {
    segment: Segment
    cells: number[]
}

// Traces every boundary between two cells that satisfy `isBoundary` into
// continuous polylines, independent of the underlying (jagged) Voronoi cell
// edges. Each Voronoi edge borders exactly two cells (or one, at the map's
// clip rectangle). A coastline's predicate is "does land/water disagree"; a
// political border's is "are both land, but owned by different states" —
// which a plain group-inequality can't express (it would also draw a
// border along every coastline, since land and water are always
// differently "owned"), hence a full predicate rather than a group key.
//
// A Voronoi vertex is shared by exactly 3 cells, so with a binary predicate
// at most 2 of its 3 edges can ever be a boundary — chains never branch.
// With more than two groups (regions/states), a vertex can be a genuine
// three-way border point; stitchSegments below still handles that
// correctly, it just emits more (shorter) polylines through it rather than
// one continuous one, which is harmless for rendering.
export function traceBoundaries(graph: CellGraph, isBoundary: (cellA: number, cellB: number) => boolean): Point[][] {
    const edges = new Map<string, EdgeInfo>()

    for (let cell = 0; cell < graph.cellCount; cell++) {
        const poly = graph.polygons[cell]
        if (!poly || poly.length < 2) continue

        for (let i = 0; i < poly.length; i++) {
            const a = poly[i]
            const b = poly[(i + 1) % poly.length]
            const k = edgeKey(a, b)

            const existing = edges.get(k)
            if (existing) existing.cells.push(cell)
            else edges.set(k, { segment: [a, b], cells: [cell] })
        }
    }

    const segments: Segment[] = []
    for (const edge of edges.values()) {
        if (edge.cells.length !== 2) continue // map border edge, not shared with a neighbor
        const [c1, c2] = edge.cells
        if (isBoundary(c1, c2)) segments.push(edge.segment)
    }

    return stitchSegments(segments)
}

function stitchSegments(segments: Segment[]): Point[][] {
    const byVertex = new Map<string, Segment[]>()
    const remaining = new Set(segments)

    for (const segment of segments) {
        for (const p of [segment[0], segment[1]]) {
            const k = vertexKey(p)
            const list = byVertex.get(k)
            if (list) list.push(segment)
            else byVertex.set(k, [segment])
        }
    }

    const nextUnusedFrom = (vertex: Point, exclude: Segment): Segment | null => {
        const candidates = byVertex.get(vertexKey(vertex))
        if (!candidates) return null
        for (const segment of candidates) {
            if (segment !== exclude && remaining.has(segment)) return segment
        }
        return null
    }

    const otherEnd = (segment: Segment, vertex: Point): Point =>
        vertexKey(segment[0]) === vertexKey(vertex) ? segment[1] : segment[0]

    const paths: Point[][] = []
    const safetyLimit = segments.length + 2

    for (const start of segments) {
        if (!remaining.has(start)) continue
        remaining.delete(start)

        const path: Point[] = [start[0], start[1]]

        let current = start
        while (path.length < safetyLimit) {
            const tail = path[path.length - 1]
            const next = nextUnusedFrom(tail, current)
            if (!next) break
            remaining.delete(next)
            path.push(otherEnd(next, tail))
            current = next
        }

        current = start
        while (path.length < safetyLimit) {
            const head = path[0]
            const prev = nextUnusedFrom(head, current)
            if (!prev) break
            remaining.delete(prev)
            path.unshift(otherEnd(prev, head))
            current = prev
        }

        paths.push(path)
    }

    return paths
}

// Chaikin corner-cutting: turns a straight-edge Voronoi boundary into a
// smooth curve without touching the underlying cell data — a purely
// rendering-time detail pass. Shared by coastlines, region borders, and
// state borders alike.
export function smoothPath(path: Point[], iterations: number): Point[] {
    let current = path
    for (let iter = 0; iter < iterations && current.length >= 3; iter++) {
        const next: Point[] = [current[0]]
        for (let i = 0; i < current.length - 1; i++) {
            const [x1, y1] = current[i]
            const [x2, y2] = current[i + 1]
            next.push([x1 * 0.75 + x2 * 0.25, y1 * 0.75 + y2 * 0.25])
            next.push([x1 * 0.25 + x2 * 0.75, y1 * 0.25 + y2 * 0.75])
        }
        next.push(current[current.length - 1])
        current = next
    }
    return current
}
