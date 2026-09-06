import { CellGraph } from './graph'
import { Heights } from './heightmap'
import { Biome } from './climate'
import { RiverPath } from './hydrology'
import { SettlementSite } from './settlements'
import { Rng } from './rng'
import { buildTables, generateBatch, GenerateOptions } from '../nameSynthEngine'
import { NamingStyle, findNamingStyle } from './naming'

export type PoiType = 'ruins' | 'dungeon' | 'shrine' | 'camp' | 'landmark'

export interface PointOfInterest {
    cell: number
    x: number
    y: number
    type: PoiType
    name: string
}

interface ScoreContext {
    graph: CellGraph
    heights: Heights
    seaLevel: number
    biome: Biome[]
    riverCells: Set<number>
    settlementDist: Int32Array // hops to nearest settlement, -1 if unreachable
}

const FOREST_BIOMES: ReadonlySet<Biome> = new Set([
    'taiga',
    'temperateForest',
    'temperateRainforest',
    'tropicalForest',
    'tropicalRainforest',
])

interface PoiTypeDef {
    type: PoiType
    label: string
    glyph: string // drawn as a canvas emoji marker — distinct, recognizable, no icon assets needed
    // The invented proper noun always comes from wherever the POI sits
    // (its state's style, or the underlying region's) — this only wraps it
    // in a type-appropriate shape, so a shrine still reads as "a shrine"
    // and a camp as "a camp" regardless of which style named it.
    namePattern: (generated: string) => string
    // -Infinity marks a cell as invalid for this POI type entirely.
    score: (ctx: ScoreContext, cell: number) => number
}

const POI_TYPES: PoiTypeDef[] = [
    {
        type: 'ruins',
        label: 'Ruins',
        glyph: '🏚️',
        namePattern: (name) => `Ruins of ${name}`,
        score: (ctx, cell) => {
            const land = ctx.heights[cell] - ctx.seaLevel
            if (land < 0 || ctx.settlementDist[cell] < 3) return -Infinity
            // Favors the same flat lowland a settlement would want — a
            // ruin reads as "somewhere civilization used to be" — but far
            // enough from any that it's actually abandoned.
            return Math.max(0, 30 - land) + Math.min(20, ctx.settlementDist[cell])
        },
    },
    {
        type: 'dungeon',
        label: 'Dungeon',
        glyph: '💀',
        namePattern: (name) => name,
        score: (ctx, cell) => {
            const land = ctx.heights[cell] - ctx.seaLevel
            if (land < 0 || ctx.settlementDist[cell] < 2) return -Infinity
            let score = 0
            if (land > 40) score += (land - 40) * 1.5 // mountain caves
            if (FOREST_BIOMES.has(ctx.biome[cell])) score += 25 // or deep forest
            score += Math.min(30, ctx.settlementDist[cell] * 2) // the more remote, the better
            return score
        },
    },
    {
        type: 'shrine',
        label: 'Shrine',
        glyph: '⛩️',
        namePattern: (name) => `Shrine of ${name}`,
        score: (ctx, cell) => {
            const land = ctx.heights[cell] - ctx.seaLevel
            if (land < 0 || ctx.settlementDist[cell] < 1) return -Infinity
            let score = 0
            if (land > 20 && land < 55) score += 30 // hills, not peaks
            if (ctx.graph.neighbors[cell].some((n) => ctx.heights[n] < ctx.seaLevel)) score += 15 // sea cliffs
            if (ctx.riverCells.has(cell)) score += 15 // sacred springs
            return score
        },
    },
    {
        type: 'camp',
        label: 'Bandit Camp',
        glyph: '⛺',
        namePattern: (name) => `${name} Camp`,
        score: (ctx, cell) => {
            const land = ctx.heights[cell] - ctx.seaLevel
            const dist = ctx.settlementDist[cell]
            if (land < 0 || dist < 2 || dist > 12) return -Infinity // near travel routes, not in town, not deep wild
            let score = 20
            if (ctx.biome[cell] === 'temperateForest' || ctx.biome[cell] === 'taiga' || ctx.biome[cell] === 'grassland')
                score += 15
            return score
        },
    },
    {
        type: 'landmark',
        label: 'Landmark',
        glyph: '🗿',
        namePattern: (name) => `The ${name} Spire`,
        score: (ctx, cell) => {
            const land = ctx.heights[cell] - ctx.seaLevel
            if (land < 0) return -Infinity
            return land // simply favors the highest points
        },
    },
]

export const POI_GLYPHS: Record<PoiType, string> = Object.fromEntries(POI_TYPES.map((d) => [d.type, d.glyph])) as Record<
    PoiType,
    string
>

export const POI_LABELS: Record<PoiType, string> = Object.fromEntries(POI_TYPES.map((d) => [d.type, d.label])) as Record<
    PoiType,
    string
>

// A one-line flavor hook per type, for the click-to-inspect info card — cheap
// (static per type, not generated) but gives a GM something to riff on
// instead of just a bare name and glyph.
export const POI_FLAVOR: Record<PoiType, string> = {
    ruins: 'Little remains of what once stood here, but the stones still hold their secrets.',
    dungeon: 'Whispers speak of danger lurking below.',
    shrine: 'A place of quiet reverence, still visited by the faithful.',
    camp: 'A rough camp — likely home to bandits or worse.',
    landmark: 'A striking landmark, visible for miles around.',
}

// Multi-source BFS distance (in graph hops) from every land cell to the
// nearest settlement — the shared "how remote is this place" signal every
// POI type's scoring reads from.
function computeSettlementDistance(
    graph: CellGraph,
    heights: Heights,
    seaLevel: number,
    settlements: SettlementSite[]
) {
    const distance = new Int32Array(graph.cellCount).fill(-1)
    const queue: number[] = []

    for (const settlement of settlements) {
        if (distance[settlement.cell] !== -1) continue
        distance[settlement.cell] = 0
        queue.push(settlement.cell)
    }

    let head = 0
    while (head < queue.length) {
        const cell = queue[head++]
        for (const neighbor of graph.neighbors[cell]) {
            if (heights[neighbor] < seaLevel || distance[neighbor] !== -1) continue
            distance[neighbor] = distance[cell] + 1
            queue.push(neighbor)
        }
    }

    return distance
}

export interface PoiOptions {
    count: number
    // Same rule as settlements: a POI's invented name comes from whichever
    // state/region its cell resolves to, so a kingdom's ruins, shrines, and
    // camps all sound consistent with its cities rather than each POI type
    // reaching for a fixed, location-independent corpus.
    styleFor: (cell: number) => NamingStyle
}

// Round-robins through the POI types (so a low count still gets variety
// instead of exhausting one type first), each drawing from its own
// score-sorted candidate list, skipping anything too close to a POI already
// placed — same greedy-with-spacing idea as settlement placement.
export function placePointsOfInterest(
    graph: CellGraph,
    heights: Heights,
    seaLevel: number,
    biome: Biome[],
    rivers: RiverPath[],
    settlements: SettlementSite[],
    rng: Rng,
    options: PoiOptions
): PointOfInterest[] {
    const riverCells = new Set<number>()
    for (const river of rivers) for (const cell of river.cells) riverCells.add(cell)

    const ctx: ScoreContext = {
        graph,
        heights,
        seaLevel,
        biome,
        riverCells,
        settlementDist: computeSettlementDistance(graph, heights, seaLevel, settlements),
    }

    const candidatesByType = new Map<PoiType, { cell: number; x: number; y: number; score: number }[]>()
    for (const def of POI_TYPES) {
        const list: { cell: number; x: number; y: number; score: number }[] = []
        for (let cell = 0; cell < graph.cellCount; cell++) {
            const score = def.score(ctx, cell)
            if (score === -Infinity) continue
            const [x, y] = graph.points[cell]
            list.push({ cell, x, y, score: score + rng() * 6 })
        }
        list.sort((a, b) => b.score - a.score)
        candidatesByType.set(def.type, list)
    }

    const minDist = Math.min(graph.width, graph.height) * Math.min(0.12, 0.6 / Math.sqrt(Math.max(1, options.count)))
    const minDistSq = minDist * minDist

    const chosen: { cell: number; x: number; y: number; type: PoiType }[] = []
    const cursor = new Map<PoiType, number>(POI_TYPES.map((d) => [d.type, 0]))

    let stalled = 0
    while (chosen.length < options.count && stalled <= POI_TYPES.length) {
        let placedThisRound = false

        for (const def of POI_TYPES) {
            if (chosen.length >= options.count) break

            const list = candidatesByType.get(def.type) as { cell: number; x: number; y: number; score: number }[]
            let idx = cursor.get(def.type) as number

            while (idx < list.length) {
                const candidate = list[idx]
                idx++
                const tooClose = chosen.some((p) => (p.x - candidate.x) ** 2 + (p.y - candidate.y) ** 2 < minDistSq)
                if (tooClose) continue
                chosen.push({ cell: candidate.cell, x: candidate.x, y: candidate.y, type: def.type })
                placedThisRound = true
                break
            }
            cursor.set(def.type, idx)
        }

        stalled = placedThisRound ? 0 : stalled + 1
    }

    const nameOptions: GenerateOptions = {
        order: 3,
        temperature: 0.95,
        vowelFactor: 1,
        harshFactor: 1,
        rarity: 0,
        minLen: 4,
        maxLen: 10,
    }

    // Grouped by resolved style (not by type) so a state/region's Markov
    // table is only built once and covers every POI type within it — the
    // type only decides the wrapping pattern, applied per item below.
    const byStyle = new Map<NamingStyle, typeof chosen>()
    for (const poi of chosen) {
        const style = options.styleFor(poi.cell)
        const group = byStyle.get(style)
        if (group) group.push(poi)
        else byStyle.set(style, [poi])
    }

    const results: PointOfInterest[] = []
    for (const [styleValue, group] of byStyle) {
        const tables = buildTables(findNamingStyle(styleValue).corpus)
        const batch = generateBatch(tables, { ...nameOptions, distinct: 0 }, group.length, [], rng)

        group.forEach((p, i) => {
            const def = POI_TYPES.find((d) => d.type === p.type) as PoiTypeDef
            results.push({
                cell: p.cell,
                x: p.x,
                y: p.y,
                type: p.type,
                name: def.namePattern(batch.names[i] ?? `${def.label} ${i + 1}`),
            })
        })
    }

    return results
}
