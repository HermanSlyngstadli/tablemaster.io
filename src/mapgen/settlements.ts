import { CellGraph } from './graph'
import { Heights } from './heightmap'
import { RiverPath } from './hydrology'
import { Rng } from './rng'
import { buildTables, generateBatch, GenerateOptions } from '../nameSynthEngine'
import { NamingStyle, findNamingStyle } from './naming'

// A settlement's location and tier are decided independently of its name —
// naming needs to know which state/region the site falls in, which isn't
// known until after states and regions are generated, so placement and
// naming are deliberately two separate steps (pickSettlementSites, then
// nameSettlements) instead of one.
export type SettlementTier = 'city' | 'town' | 'village'

export interface SettlementSite {
    cell: number
    x: number
    y: number
    tier: SettlementTier
}

export interface Settlement extends SettlementSite {
    name: string
}

export interface SettlementOptions {
    count: number
}

// How suitable a cell is as a settlement site: favors flat lowland, harshly
// penalizes high mountains, and rewards coastal or river access (both are
// checked directly against the terrain rather than inferred, since we
// already have exact land/water and river-cell data).
function scoreCell(graph: CellGraph, heights: Heights, seaLevel: number, riverCells: Set<number>, cell: number) {
    const land = heights[cell] - seaLevel
    if (land < 0) return -Infinity

    let score = Math.max(0, 40 - land) // flatter, lower land scores higher
    if (land > 55) score -= 60 // mountain peaks are a poor place to found a settlement

    const isCoastal = graph.neighbors[cell].some((n) => heights[n] < seaLevel)
    if (isCoastal) score += 35
    if (riverCells.has(cell)) score += 30

    return score
}

// Greedily takes the highest-scoring cells, skipping any within minDist of
// an already-chosen site so settlements don't cluster on one especially
// good peninsula. minDist scales down automatically as more settlements are
// requested, so a higher count dial doesn't just run out of valid room.
export function pickSettlementSites(
    graph: CellGraph,
    heights: Heights,
    seaLevel: number,
    rivers: RiverPath[],
    rng: Rng,
    options: SettlementOptions
): SettlementSite[] {
    const riverCells = new Set<number>()
    for (const river of rivers) for (const cell of river.cells) riverCells.add(cell)

    const candidates: { cell: number; x: number; y: number; score: number }[] = []
    for (let cell = 0; cell < graph.cellCount; cell++) {
        const score = scoreCell(graph, heights, seaLevel, riverCells, cell)
        if (score === -Infinity) continue
        const [x, y] = graph.points[cell]
        candidates.push({ cell, x, y, score: score + rng() * 8 }) // jitter so tied/plateaued scores don't all cluster
    }
    candidates.sort((a, b) => b.score - a.score)

    const minDist = Math.min(graph.width, graph.height) * Math.min(0.25, 0.9 / Math.sqrt(Math.max(1, options.count)))
    const minDistSq = minDist * minDist

    const chosen: { cell: number; x: number; y: number; score: number }[] = []
    for (const candidate of candidates) {
        if (chosen.length >= options.count) break
        const tooClose = chosen.some((c) => (c.x - candidate.x) ** 2 + (c.y - candidate.y) ** 2 < minDistSq)
        if (tooClose) continue
        chosen.push(candidate)
    }
    chosen.sort((a, b) => b.score - a.score)

    // Three tiers instead of a flat city/town split: a smaller top slice of
    // real cities, a mid band of towns, and villages making up the bulk —
    // "more cities" isn't just a bigger count, it's a wider spread between
    // a handful of prominent cities and a larger scatter of small ones.
    const cityCount = Math.max(1, Math.round(chosen.length * 0.15))
    const townCount = Math.max(1, Math.round(chosen.length * 0.35))

    return chosen.map((c, i) => {
        const tier: SettlementTier = i < cityCount ? 'city' : i < cityCount + townCount ? 'town' : 'village'
        return { cell: c.cell, x: c.x, y: c.y, tier }
    })
}

const NAME_OPTIONS: GenerateOptions = {
    order: 3,
    temperature: 0.9,
    vowelFactor: 1,
    harshFactor: 1,
    rarity: 0,
    minLen: 4,
    maxLen: 11,
}

// Names every site using whatever style `styleFor` resolves for its cell —
// grouped by style so each distinct style's Markov table is only built
// once, not once per settlement. Iteration order (over `sites`, then over
// the style groups in first-seen order) is stable, so this stays
// deterministic for a given seed.
export function nameSettlements(
    sites: SettlementSite[],
    styleFor: (cell: number) => NamingStyle,
    rng: Rng
): Settlement[] {
    const byStyle = new Map<NamingStyle, SettlementSite[]>()
    for (const site of sites) {
        const style = styleFor(site.cell)
        const group = byStyle.get(style)
        if (group) group.push(site)
        else byStyle.set(style, [site])
    }

    const nameByCell = new Map<number, string>()
    for (const [styleValue, group] of byStyle) {
        const tables = buildTables(findNamingStyle(styleValue).corpus)
        const batch = generateBatch(tables, { ...NAME_OPTIONS, distinct: 0 }, group.length, [], rng)
        group.forEach((site, i) => nameByCell.set(site.cell, batch.names[i] ?? `Settlement ${site.cell}`))
    }

    return sites.map((site) => ({ ...site, name: nameByCell.get(site.cell) ?? 'Unknown' }))
}
