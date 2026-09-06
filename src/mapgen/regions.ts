import { CellGraph } from './graph'
import { Heights } from './heightmap'
import { Biome } from './climate'
import { Point } from './points'
import { Rng } from './rng'
import { partitionTerritory, pickSpreadSeeds } from './territory'
import { traceBoundaries, smoothPath } from './boundaries'
import { buildTables, generateBatch, GenerateOptions } from '../nameSynthEngine'
import { NamingStyle, shuffledNamingStyles } from './naming'

export interface Region {
    id: number
    seedCell: number
    name: string
    namingStyle: NamingStyle
    color: string
}

export interface RegionLayer {
    owner: Int32Array // cell -> region id, -1 = water/unassigned
    regions: Region[]
    borders: Point[][]
}

// A geography-flavored suffix per dominant biome — "Ravenfjell Wilds" reads
// as a place in a way "Ravenfjell Region 3" doesn't, and it's free: climate
// is already computed by the time regions run.
const BIOME_SUFFIX: Partial<Record<Biome, string>> = {
    glacier: 'Wastes',
    tundra: 'Tundra',
    taiga: 'Reach',
    steppe: 'Steppes',
    grassland: 'Plains',
    temperateForest: 'Wilds',
    temperateRainforest: 'Woodlands',
    hotDesert: 'Desert',
    savanna: 'Savanna',
    tropicalForest: 'Jungle',
    tropicalRainforest: 'Rainforest',
}

function regionColor(index: number, count: number): string {
    const hue = (360 * index) / Math.max(1, count)
    return `hsl(${hue.toFixed(0)}, 60%, 55%)`
}

// Cultures/peoples: seeded independently of settlements (a culture's heartland
// isn't necessarily a city) and spread by cost-weighted flood fill, so
// territory follows terrain rather than a straight Euclidean split.
export function generateRegions(
    graph: CellGraph,
    heights: Heights,
    seaLevel: number,
    biome: Biome[],
    rng: Rng,
    count: number
): RegionLayer {
    const isLand = (cell: number) => heights[cell] >= seaLevel
    const seeds = pickSpreadSeeds(graph, isLand, count, rng)
    if (seeds.length === 0) return { owner: new Int32Array(graph.cellCount).fill(-1), regions: [], borders: [] }

    const owner = partitionTerritory(graph, heights, seaLevel, seeds, { mountainPenalty: 0.6 })

    // Tally biome counts per region so each can pick a fitting name suffix.
    const biomeCounts: Record<number, Partial<Record<Biome, number>>> = {}
    for (let cell = 0; cell < graph.cellCount; cell++) {
        const id = owner[cell]
        if (id === -1) continue
        const counts = (biomeCounts[id] ??= {})
        counts[biome[cell]] = (counts[biome[cell]] || 0) + 1
    }

    const styles = shuffledNamingStyles(rng)
    const nameOptions: GenerateOptions = {
        order: 3,
        temperature: 0.95,
        vowelFactor: 1,
        harshFactor: 1,
        rarity: 0,
        minLen: 4,
        maxLen: 10,
    }

    const regions: Region[] = seeds.map((seedCell, id) => {
        const style = styles[id % styles.length]
        const tables = buildTables(style.corpus)
        const batch = generateBatch(tables, { ...nameOptions, distinct: 0 }, 1, [], rng)
        const baseName = batch.names[0] ?? `Region ${id + 1}`

        const counts = biomeCounts[id] ?? {}
        const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as Biome | undefined
        const suffix = (dominant && BIOME_SUFFIX[dominant]) || 'Lands'

        return {
            id,
            seedCell,
            name: `${baseName} ${suffix}`,
            namingStyle: style.value,
            color: regionColor(id, seeds.length),
        }
    })

    // Borders only where two DIFFERENT land regions meet — not at the coast,
    // where every region also technically differs from the (unowned) water,
    // which would otherwise draw a duplicate border along the whole coastline.
    const borders = traceBoundaries(graph, (a, b) => isLand(a) && isLand(b) && owner[a] !== owner[b]).map((path) =>
        smoothPath(path, 1)
    )

    return { owner, regions, borders }
}
