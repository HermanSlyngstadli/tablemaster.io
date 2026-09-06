import { CellGraph } from './graph'
import { Point } from './points'
import { traceBoundaries } from './boundaries'

export { smoothPath } from './boundaries'

// Traces the boundary between land and water cells into continuous
// polylines — a thin wrapper over the generic traceBoundaries (also used
// for region/state borders), grouping every cell into just "land" or
// "water" so only coastline edges qualify as boundaries.
export function traceCoastline(graph: CellGraph, isLand: (cell: number) => boolean): Point[][] {
    return traceBoundaries(graph, (a, b) => isLand(a) !== isLand(b))
}
