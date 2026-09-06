import { CellGraph } from './graph'
import { Heights } from './heightmap'
import { Point } from './points'

// A river path through consecutive cell centers, with per-point accumulated
// flux (same units as computeWaterFlow below) so rendering can taper the
// stroke width — thin near the source, wide near the mouth. `cells`
// parallels `points` so other stages (climate's moisture-from-rivers) can
// key off cell index without re-deriving it from coordinates.
export interface RiverPath {
    points: Point[]
    widths: number[]
    cells: number[]
}

// A landlocked body of water: one or more adjacent "sink" cells (nowhere
// lower to drain to) at a similar height, merged into one basin.
export interface Lake {
    cells: number[]
    center: Point
}

export interface FlowResult {
    flowTo: Int32Array // index of the neighbor each cell drains into, -1 if none (a local depression)
    flux: Float32Array // accumulated discharge per cell
}

// Steepest-descent flow: every land cell drains into whichever neighbor is
// lowest (which may be a water cell, ending the flow there). Flux starts
// proportional to a cell's own elevation (a stand-in for rainfall until a
// real climate stage exists) and is accumulated by visiting cells from
// highest to lowest, so by the time a cell hands its water downhill, every
// upstream contribution has already been folded into it.
//
// Exported (rather than kept private) so rivers and lakes can share one
// computation instead of each recomputing it.
export function computeWaterFlow(graph: CellGraph, heights: Heights, isLand: (cell: number) => boolean): FlowResult {
    const flowTo = new Int32Array(graph.cellCount).fill(-1)
    const flux = new Float32Array(graph.cellCount)
    const landCells: number[] = []

    for (let cell = 0; cell < graph.cellCount; cell++) {
        if (!isLand(cell)) continue
        landCells.push(cell)
        flux[cell] = heights[cell]

        let lowest = -1
        let lowestHeight = heights[cell]
        for (const neighbor of graph.neighbors[cell]) {
            if (heights[neighbor] < lowestHeight) {
                lowestHeight = heights[neighbor]
                lowest = neighbor
            }
        }
        flowTo[cell] = lowest
    }

    landCells.sort((a, b) => heights[b] - heights[a])
    for (const cell of landCells) {
        const target = flowTo[cell]
        if (target !== -1) flux[target] += flux[cell]
    }

    return { flowTo, flux }
}

// A percentile flux threshold, shared by rivers and lakes: the same
// "how significant does the flow need to be" bar decides both what counts
// as a river and what counts as a lake-worthy sink, so one density dial
// governs both instead of needing a second one just for lakes.
function fluxThreshold(graph: CellGraph, isLand: (cell: number) => boolean, flux: Float32Array, densityPercent: number) {
    const landFlux: number[] = []
    for (let cell = 0; cell < graph.cellCount; cell++) {
        if (isLand(cell)) landFlux.push(flux[cell])
    }
    if (landFlux.length === 0) return null

    landFlux.sort((a, b) => b - a)
    const rank = Math.max(0, Math.min(landFlux.length - 1, Math.floor((landFlux.length * densityPercent) / 100)))
    return landFlux[rank]
}

// densityPercent (0-100): what fraction of land cells, ranked by accumulated
// flux, count as rivers. A percentile threshold (rather than a fixed flux
// value) keeps the dial behaving consistently across map sizes and
// templates instead of needing retuning per map.
export function extractRivers(
    graph: CellGraph,
    heights: Heights,
    isLand: (cell: number) => boolean,
    flow: FlowResult,
    densityPercent: number
): RiverPath[] {
    const { flowTo, flux } = flow
    const threshold = fluxThreshold(graph, isLand, flux, densityPercent)
    if (threshold === null) return []

    const isRiverCell = (cell: number) => isLand(cell) && flux[cell] > 0 && flux[cell] >= threshold

    // A source is a river cell with no upstream river cell feeding it —
    // walking downhill from every source traces the whole network exactly
    // once, since a tributary stops as soon as it joins an already-claimed
    // (already drawn) downstream stretch instead of redrawing it.
    const hasRiverUpstream = new Uint8Array(graph.cellCount)
    for (let cell = 0; cell < graph.cellCount; cell++) {
        if (!isRiverCell(cell)) continue
        const target = flowTo[cell]
        if (target !== -1 && isRiverCell(target)) hasRiverUpstream[target] = 1
    }

    const claimed = new Set<number>()
    const rivers: RiverPath[] = []

    for (let cell = 0; cell < graph.cellCount; cell++) {
        if (!isRiverCell(cell) || hasRiverUpstream[cell]) continue

        const points: Point[] = [graph.points[cell]]
        const widths: number[] = [flux[cell]]
        const cells: number[] = [cell]
        claimed.add(cell)

        let current = cell
        for (;;) {
            const next = flowTo[current]
            if (next === -1) break // dead end: a local depression with no lower neighbor — see identifyLakes

            points.push(graph.points[next])
            widths.push(flux[next])
            cells.push(next)

            if (!isRiverCell(next) || claimed.has(next)) break // reached the sea, or joined an existing stem
            claimed.add(next)
            current = next
        }

        if (points.length >= 2) rivers.push({ points, widths, cells })
    }

    return rivers
}

// Where flow simply had nowhere left to go — a real topographic depression
// with no lower neighbor at all — water pools instead of vanishing. This is
// exactly the dead end extractRivers stops at above; a lake is what that
// dead end actually is. Adjacent sink cells at a similar height merge into
// one basin instead of each rendering as its own isolated puddle.
export function identifyLakes(
    graph: CellGraph,
    heights: Heights,
    isLand: (cell: number) => boolean,
    flow: FlowResult,
    densityPercent: number
): Lake[] {
    const { flowTo, flux } = flow
    const threshold = fluxThreshold(graph, isLand, flux, densityPercent)
    if (threshold === null) return []

    const isSink = (cell: number) => isLand(cell) && flowTo[cell] === -1 && flux[cell] >= threshold

    const visited = new Uint8Array(graph.cellCount)
    const lakes: Lake[] = []

    for (let start = 0; start < graph.cellCount; start++) {
        if (visited[start] || !isSink(start)) continue

        const group: number[] = []
        const queue = [start]
        visited[start] = 1

        while (queue.length) {
            const cell = queue.shift() as number
            group.push(cell)
            for (const neighbor of graph.neighbors[cell]) {
                if (visited[neighbor] || !isSink(neighbor)) continue
                if (Math.abs(heights[neighbor] - heights[cell]) > 3) continue // only near-flat basins merge
                visited[neighbor] = 1
                queue.push(neighbor)
            }
        }

        let x = 0
        let y = 0
        for (const cell of group) {
            x += graph.points[cell][0]
            y += graph.points[cell][1]
        }
        lakes.push({ cells: group, center: [x / group.length, y / group.length] })
    }

    return lakes
}
