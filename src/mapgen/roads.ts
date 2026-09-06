import { CellGraph } from './graph'
import { Heights } from './heightmap'
import { Point } from './points'
import { MinHeap } from './territory'
import { SettlementSite } from './settlements'

export interface Road {
    points: Point[]
    cells: number[]
}

// A* point-to-point pathfinding: same terrain cost idea as territory
// partitioning (mountains cost more, water is impassable, so roads bend
// around a mountain range's natural barrier instead of cutting straight
// through it), but for a single start/end pair rather than a multi-source
// flood fill. The straight-line-to-target heuristic is what makes this
// practical to run once per road instead of once for the whole map: without
// it, a plain Dijkstra would have to explore roughly the full graph before
// discovering two settlements on different islands have no path at all.
// A visited-cell cap is the backstop for exactly that case.
function findPath(graph: CellGraph, heights: Heights, seaLevel: number, start: number, end: number): number[] | null {
    const avgSpacing = Math.sqrt((graph.width * graph.height) / graph.cellCount)
    const [ex, ey] = graph.points[end]
    const heuristic = (cell: number) => {
        const [x, y] = graph.points[cell]
        return Math.sqrt((x - ex) ** 2 + (y - ey) ** 2) / avgSpacing
    }

    const cost = new Float64Array(graph.cellCount).fill(Infinity)
    const prev = new Int32Array(graph.cellCount).fill(-1)
    const visited = new Uint8Array(graph.cellCount)
    const heap = new MinHeap()
    const visitCap = Math.min(graph.cellCount, 8000)
    let visitedCount = 0

    cost[start] = 0
    heap.push(heuristic(start), start)

    while (heap.size > 0) {
        const popped = heap.pop()
        if (!popped) break
        const [, cell] = popped
        if (visited[cell]) continue
        visited[cell] = 1
        visitedCount++
        if (cell === end) break
        if (visitedCount > visitCap) return null // unreachable (or too far) — give up rather than scan everything

        for (const neighbor of graph.neighbors[cell]) {
            if (heights[neighbor] < seaLevel || visited[neighbor]) continue
            const land = Math.max(0, heights[neighbor] - seaLevel)
            const stepCost = 1 + 6 * (land / 100) ** 2 // steep mountain penalty, same shape as territory's
            const next = cost[cell] + stepCost
            if (next < cost[neighbor]) {
                cost[neighbor] = next
                prev[neighbor] = cell
                heap.push(next + heuristic(neighbor), neighbor)
            }
        }
    }

    if (cost[end] === Infinity) return null

    const path: number[] = []
    let current = end
    while (current !== -1) {
        path.push(current)
        if (current === start) break
        current = prev[current]
    }
    return path[path.length - 1] === start ? path.reverse() : null
}

export interface RoadOptions {
    neighborsPerSettlement: number // how many nearest other settlements each one tries to connect to
}

// Connects each city/town to its few nearest others by cost-weighted path.
// Villages are deliberately skipped as road endpoints — connecting every one
// would clutter the map far more than it adds. Naturally forms a sparse,
// mostly-tree-like network (with some short-cut cycles between close
// neighbors) rather than a fully-connected mesh; settlements with no
// affordable path between them (different islands, e.g.) are silently
// skipped instead of drawing an impossible bridge over open sea.
export function generateRoads(
    graph: CellGraph,
    heights: Heights,
    seaLevel: number,
    settlements: SettlementSite[],
    options: RoadOptions
): Road[] {
    const nodes = settlements.filter((s) => s.tier === 'city' || s.tier === 'town')
    if (nodes.length < 2) return []

    // Nearest-by-straight-line-distance candidates first (cheap) — the
    // expensive terrain-aware pathfinding only runs on pairs likely to
    // actually become a road, not every possible pair.
    const candidateEdges: { a: number; b: number; dist: number }[] = []
    for (let i = 0; i < nodes.length; i++) {
        const distances: { j: number; dist: number }[] = []
        for (let j = 0; j < nodes.length; j++) {
            if (i === j) continue
            const dx = nodes[i].x - nodes[j].x
            const dy = nodes[i].y - nodes[j].y
            distances.push({ j, dist: dx * dx + dy * dy })
        }
        distances.sort((a, b) => a.dist - b.dist)
        for (const { j, dist } of distances.slice(0, options.neighborsPerSettlement)) {
            candidateEdges.push({ a: Math.min(i, j), b: Math.max(i, j), dist })
        }
    }
    candidateEdges.sort((a, b) => a.dist - b.dist)

    const seen = new Set<string>()
    const roads: Road[] = []

    for (const edge of candidateEdges) {
        const key = `${edge.a}-${edge.b}`
        if (seen.has(key)) continue
        seen.add(key)

        const path = findPath(graph, heights, seaLevel, nodes[edge.a].cell, nodes[edge.b].cell)
        if (!path || path.length < 2) continue

        roads.push({ points: path.map((cell) => graph.points[cell]), cells: path })
    }

    return roads
}
