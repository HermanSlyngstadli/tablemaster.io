import { createNoise2D } from 'simplex-noise'
import { CellGraph } from './graph'
import { Rng } from './rng'

// Per-cell elevation, 0..100 (sea level sits somewhere in that range, not at
// a fixed point — it's a dial).
export type Heights = Float32Array
export type Range = [number, number]

function pick(rng: Rng, [min, max]: Range): number {
    return min + rng() * (max - min)
}

function nearestCell(graph: CellGraph, x: number, y: number): number {
    return graph.delaunay.find(x, y)
}

// Every decayRange constant in this file (CONTINENT_DECAY and the
// per-template overrides) was tuned and visually verified at this cell
// density — 3000 cells over a 1200x800 map. A fixed historical calibration
// point, not tied to whatever generate.ts's current default width/height is.
const REFERENCE_CELL_DENSITY = 3000 / (1200 * 800)

// Decay is naturally a per-hop factor, but a graph edge's physical length
// shrinks as cell density rises (more cells packed into the same map area
// — average spacing scales with 1/sqrt(density)). Left uncompensated, the
// same decayRange makes every hill/range/strait physically smaller as the
// cell-count dial goes up: features cluster near the map's center instead
// of spreading toward the poles, and at high enough density a landmass
// never reaches far enough in latitude for cold biomes to appear at all.
// Raising decay to this exponent keeps a feature's PHYSICAL radius
// constant across the cell-count dial instead of its hop-count radius.
function hopScaleExponent(graph: CellGraph): number {
    const density = graph.cellCount / (graph.width * graph.height)
    return Math.sqrt(REFERENCE_CELL_DENSITY / density)
}

// Adds `sign * delta` to a cell's height with a soft ceiling/floor instead of
// a hard one: as height approaches 100 (or 0, for troughs), the same delta
// contributes less. Without this, overlapping hills/ranges stack additively
// until they hit clampHeights' hard 0..100 bound and a whole region pins to
// the same flat value — an artificial plateau instead of a rounded peak.
function applyDelta(heights: Heights, cell: number, delta: number, sign: 1 | -1) {
    const room = sign > 0 ? (100 - heights[cell]) / 100 : heights[cell] / 100
    heights[cell] += sign * delta * Math.max(0, room)
}

// Spreads elevation outward from a single cell across the graph, decaying by
// a randomised factor at every hop. This is the core primitive behind every
// template feature (hills, ranges, straits): because it walks the actual
// cell adjacency instead of a geometric circle, the result follows the
// irregular Voronoi mesh and reads as an organic blob rather than a disc.
function spreadBlob(
    heights: Heights,
    graph: CellGraph,
    rng: Rng,
    startCell: number,
    startHeight: number,
    decayRange: Range,
    sign: 1 | -1
) {
    const scale = hopScaleExponent(graph)
    const heightAt = new Map<number, number>([[startCell, startHeight]])
    const queue = [startCell]

    while (queue.length) {
        const cell = queue.shift() as number
        const h = heightAt.get(cell) as number
        applyDelta(heights, cell, h, sign)
        if (h < 1) continue

        for (const neighbor of graph.neighbors[cell]) {
            if (heightAt.has(neighbor)) continue
            const decay = Math.pow(pick(rng, decayRange), scale)
            const neighborHeight = h * decay
            heightAt.set(neighbor, neighborHeight)
            if (neighborHeight >= 1) queue.push(neighbor)
        }
    }
}

// Decay controls how far a single hill/trough reaches before dying out —
// how much of the map one feature can plausibly cover. The default suits a
// handful of continent-scale features; a template placing many small hills
// (an archipelago's scattered islands) needs a tighter decay passed
// explicitly, or they overlap into one landmass instead of staying distinct.
const CONTINENT_DECAY: Range = [0.78, 0.9]

export function addHill(
    heights: Heights,
    graph: CellGraph,
    rng: Rng,
    count: number,
    heightRange: Range,
    xRange: Range = [0, 1],
    yRange: Range = [0, 1],
    decayRange: Range = CONTINENT_DECAY
) {
    for (let i = 0; i < count; i++) {
        const start = nearestCell(graph, graph.width * pick(rng, xRange), graph.height * pick(rng, yRange))
        spreadBlob(heights, graph, rng, start, pick(rng, heightRange), decayRange, 1)
    }
}

export function addTrough(
    heights: Heights,
    graph: CellGraph,
    rng: Rng,
    count: number,
    heightRange: Range,
    xRange: Range = [0, 1],
    yRange: Range = [0, 1],
    decayRange: Range = CONTINENT_DECAY
) {
    for (let i = 0; i < count; i++) {
        const start = nearestCell(graph, graph.width * pick(rng, xRange), graph.height * pick(rng, yRange))
        spreadBlob(heights, graph, rng, start, pick(rng, heightRange), decayRange, -1)
    }
}

// Greedy walk across the graph from `start` toward `end`, always stepping to
// whichever unvisited neighbor is closest to the target with a bit of random
// wobble thrown in so paths don't come out as dead-straight lines.
function walkPath(graph: CellGraph, rng: Rng, start: number, end: number): number[] {
    const [ex, ey] = graph.points[end]
    const path = [start]
    const visited = new Set([start])
    let current = start

    for (let step = 0; step < graph.cellCount; step++) {
        if (current === end) break

        let best = -1
        let bestScore = Infinity
        for (const neighbor of graph.neighbors[current]) {
            if (visited.has(neighbor)) continue
            const [nx, ny] = graph.points[neighbor]
            const distToEnd = (nx - ex) ** 2 + (ny - ey) ** 2
            const score = distToEnd + rng() * distToEnd * 0.5
            if (score < bestScore) {
                bestScore = score
                best = neighbor
            }
        }

        if (best === -1) break
        visited.add(best)
        path.push(best)
        current = best
    }

    return path
}

// A mountain range/ridge: walk a rough path between two random points and
// spread a narrow, elongated blob along each step.
export function addRange(heights: Heights, graph: CellGraph, rng: Rng, count: number, heightRange: Range) {
    for (let i = 0; i < count; i++) {
        const start = nearestCell(graph, rng() * graph.width, rng() * graph.height)
        const end = nearestCell(graph, rng() * graph.width, rng() * graph.height)
        const path = walkPath(graph, rng, start, end)
        const rangeHeight = pick(rng, heightRange)

        for (const cell of path) {
            // Tighter than a hill's decay so each step along the path stays
            // narrow — a chain of wide, overlapping blobs reads as a lumpy
            // round mass, not the linear ridge a mountain range should be.
            spreadBlob(heights, graph, rng, cell, rangeHeight * (0.7 + rng() * 0.3), [0.5, 0.65], 1)
        }
    }
}

// Cuts a lowered band from one side of the map to the other, breaking up a
// landmass into separate islands.
export function addStrait(heights: Heights, graph: CellGraph, rng: Rng, width = 1) {
    const vertical = rng() < 0.5
    const start = vertical ? nearestCell(graph, rng() * graph.width, 0) : nearestCell(graph, 0, rng() * graph.height)
    const end = vertical
        ? nearestCell(graph, rng() * graph.width, graph.height)
        : nearestCell(graph, graph.width, rng() * graph.height)

    const path = walkPath(graph, rng, start, end)
    for (const cell of path) {
        spreadBlob(heights, graph, rng, cell, 40 * width, [0.55, 0.7], -1)
    }
}

export function smoothHeights(heights: Heights, graph: CellGraph, passes = 1, strength = 0.5) {
    for (let pass = 0; pass < passes; pass++) {
        const next = heights.slice()
        for (let i = 0; i < graph.cellCount; i++) {
            const neighbors = graph.neighbors[i]
            if (!neighbors.length) continue
            const sum = neighbors.reduce((total, n) => total + heights[n], heights[i])
            const average = sum / (neighbors.length + 1)
            next[i] = heights[i] * (1 - strength) + average * strength
        }
        heights.set(next)
    }
}

// Pulls elevation down toward the poles (the map's top/bottom edges) so
// landmasses don't dominate them — but NOT toward the left/right edges.
// The map represents a whole planet: north/south are real boundaries (the
// poles), but east/west are just where an equirectangular projection cuts
// an otherwise-continuous surface. Suppressing land there too would make
// every continent look artificially clipped at a seam that shouldn't read
// as a coastline at all. (This is the cosmetic half of that: land can now
// run right up to the east/west edges. Actually continuing a landmass
// across the seam — true horizontal wraparound — would need the point/graph
// generation itself to be periodic, which this doesn't attempt.)
export function applyMask(heights: Heights, graph: CellGraph, power = 1) {
    const cy = graph.height / 2
    const maxDist = graph.height / 2

    for (let i = 0; i < graph.cellCount; i++) {
        const [, y] = graph.points[i]
        const dist = Math.abs(y - cy) / maxDist
        const falloff = Math.max(0, 1 - dist ** 2 * power)
        heights[i] *= falloff
    }
}

// Every primitive above (hills, ranges, straits) is an isotropic blob
// spread — round by construction, at every scale. Left alone, that's why
// coastlines come out smooth and rounded instead of the jagged, irregular
// shape — bays, peninsulas, fjords at every scale — that reads as a real
// (or a good fantasy) coastline. Layering small-scale noise on top adds
// that irregularity without touching the large-scale continent shape the
// template already decided. Seeded from the same rng, so it stays
// deterministic per map seed.
export function applyRoughness(
    heights: Heights,
    graph: CellGraph,
    rng: Rng,
    amplitude: number,
    wavelengthInCells: number
) {
    const noise2D = createNoise2D(rng)
    const avgSpacing = Math.sqrt((graph.width * graph.height) / graph.cellCount)
    const wavelength = avgSpacing * wavelengthInCells

    for (let i = 0; i < graph.cellCount; i++) {
        const [x, y] = graph.points[i]
        const n = noise2D(x / wavelength, y / wavelength) // roughly -1..1
        heights[i] += n * amplitude
    }
}

export function clampHeights(heights: Heights, min = 0, max = 100) {
    for (let i = 0; i < heights.length; i++) {
        heights[i] = Math.min(max, Math.max(min, heights[i]))
    }
}

export type TemplateName = 'continents' | 'archipelago' | 'pangea' | 'highIsland'

export const TEMPLATES: { value: TemplateName; label: string }[] = [
    { value: 'continents', label: 'Continents' },
    { value: 'archipelago', label: 'Archipelago' },
    { value: 'pangea', label: 'Pangea' },
    { value: 'highIsland', label: 'High Island' },
]

// A template is just a fixed recipe of the operations above — this is the
// same idea as Azgaar's heightmap templates, and the natural place to add
// more presets or expose the underlying dials individually later.
export function applyTemplate(name: TemplateName, graph: CellGraph, rng: Rng): Heights {
    const heights = new Float32Array(graph.cellCount)

    switch (name) {
        case 'pangea':
            addHill(heights, graph, rng, 1, [50, 70], [0.4, 0.6], [0.4, 0.6])
            addHill(heights, graph, rng, 6, [20, 40])
            addRange(heights, graph, rng, 2, [30, 50])
            applyMask(heights, graph, 1.2)
            smoothHeights(heights, graph, 1, 0.4)
            break
        case 'archipelago':
            addHill(heights, graph, rng, 14, [15, 35], [0, 1], [0, 1], [0.55, 0.72])
            addStrait(heights, graph, rng, 2)
            addStrait(heights, graph, rng, 2)
            applyMask(heights, graph, 2)
            smoothHeights(heights, graph, 1, 0.2)
            break
        case 'highIsland':
            addHill(heights, graph, rng, 1, [60, 85], [0.4, 0.6], [0.3, 0.6])
            addHill(heights, graph, rng, 4, [30, 55])
            addRange(heights, graph, rng, 1, [40, 60])
            applyMask(heights, graph, 2.5)
            smoothHeights(heights, graph, 1, 0.3)
            break
        case 'continents':
        default:
            addHill(heights, graph, rng, 2, [40, 60], [0.15, 0.4], [0.2, 0.8])
            addHill(heights, graph, rng, 2, [40, 60], [0.6, 0.85], [0.2, 0.8])
            addRange(heights, graph, rng, 4, [30, 55])
            addStrait(heights, graph, rng, 1)
            applyMask(heights, graph, 1.5)
            smoothHeights(heights, graph, 1, 0.3)
            break
    }

    // Two octaves of coastline noise — a broader one for bays/peninsulas,
    // a finer one for small jagged detail — applied after the template's
    // own shape but before clamping, so it roughens every template equally
    // without needing a per-template tuning pass.
    applyRoughness(heights, graph, rng, 10, 14)
    applyRoughness(heights, graph, rng, 4, 4)

    clampHeights(heights, 0, 100)
    return heights
}
