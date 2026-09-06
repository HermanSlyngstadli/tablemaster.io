import { CellGraph } from './graph'
import { Heights } from './heightmap'
import { RiverPath } from './hydrology'

export type Biome =
    | 'glacier'
    | 'tundra'
    | 'taiga'
    | 'steppe'
    | 'grassland'
    | 'temperateForest'
    | 'temperateRainforest'
    | 'hotDesert'
    | 'savanna'
    | 'tropicalForest'
    | 'tropicalRainforest'

export const BIOME_LABELS: Record<Biome, string> = {
    glacier: 'Glacier',
    tundra: 'Tundra',
    taiga: 'Taiga',
    steppe: 'Steppe',
    grassland: 'Grassland',
    temperateForest: 'Temperate Forest',
    temperateRainforest: 'Temperate Rainforest',
    hotDesert: 'Hot Desert',
    savanna: 'Savanna',
    tropicalForest: 'Tropical Forest',
    tropicalRainforest: 'Tropical Rainforest',
}

export interface ClimateModel {
    temperature: Float32Array
    moisture: Float32Array
    biome: Biome[] // meaningful only where the cell is land — water cells are colored by elevation, not biome
}

export interface ClimateOptions {
    equatorTemp: number
    poleTemp: number
    lapseRate: number // temperature lost per elevation unit above sea level
    temperatureBias: number
    moistureBias: number
}

export const defaultClimateOptions: ClimateOptions = {
    equatorTemp: 27,
    poleTemp: -20,
    lapseRate: 0.15,
    temperatureBias: 0,
    moistureBias: 0,
}

// Same technique as heightmap's smoothHeights: real climate varies smoothly
// across space, so without this, local elevation noise flips individual
// cells across a temperature/moisture threshold and the biome boundary
// reads as a blotchy checkerboard instead of a clean band.
function smoothField(field: Float32Array, graph: CellGraph, passes: number, strength: number) {
    for (let pass = 0; pass < passes; pass++) {
        const next = field.slice()
        for (let i = 0; i < graph.cellCount; i++) {
            const neighbors = graph.neighbors[i]
            if (!neighbors.length) continue
            const sum = neighbors.reduce((total, n) => total + field[n], field[i])
            next[i] = field[i] * (1 - strength) + (sum / (neighbors.length + 1)) * strength
        }
        field.set(next)
    }
}

// Warmest at the map's vertical center ("equator"), coldest at the top/bottom
// edges, reduced further by elevation — the same reason real mountains carry
// snow regardless of latitude. Because this already accounts for elevation,
// a tall enough peak reads as glacier/tundra on its own without needing a
// separate hard elevation override.
function computeTemperature(graph: CellGraph, heights: Heights, seaLevel: number, options: ClimateOptions) {
    const temperature = new Float32Array(graph.cellCount)
    const equatorY = graph.height / 2
    const maxDistFromEquator = graph.height / 2

    for (let i = 0; i < graph.cellCount; i++) {
        const [, y] = graph.points[i]
        const latitude = Math.min(1, Math.abs(y - equatorY) / maxDistFromEquator)
        const base = options.equatorTemp + (options.poleTemp - options.equatorTemp) * latitude
        const elevationAboveSea = Math.max(0, heights[i] - seaLevel)
        temperature[i] = base - elevationAboveSea * options.lapseRate + options.temperatureBias
    }

    smoothField(temperature, graph, 2, 0.5)
    return temperature
}

// Multi-source BFS distance (in graph hops) from every land cell to the
// nearest water cell, decayed into a 0-100 moisture value — coastal cells
// are wet, deep interiors are dry. Rivers then add a local moisture bonus
// (to the cells they pass through and their immediate neighbors), since a
// river is a water source independent of how far inland it runs.
function computeMoisture(
    graph: CellGraph,
    isLand: (cell: number) => boolean,
    rivers: RiverPath[],
    moistureBias: number
) {
    const moisture = new Float32Array(graph.cellCount)
    const distance = new Int32Array(graph.cellCount).fill(-1)
    const queue: number[] = []

    for (let cell = 0; cell < graph.cellCount; cell++) {
        if (isLand(cell)) continue
        for (const neighbor of graph.neighbors[cell]) {
            if (isLand(neighbor) && distance[neighbor] === -1) {
                distance[neighbor] = 0
                queue.push(neighbor)
            }
        }
    }

    let head = 0
    while (head < queue.length) {
        const cell = queue[head++]
        for (const neighbor of graph.neighbors[cell]) {
            if (!isLand(neighbor) || distance[neighbor] !== -1) continue
            distance[neighbor] = distance[cell] + 1
            queue.push(neighbor)
        }
    }

    for (let cell = 0; cell < graph.cellCount; cell++) {
        if (!isLand(cell)) continue
        const d = distance[cell]
        moisture[cell] = d === -1 ? 20 : Math.max(5, 100 * 0.88 ** d)
    }

    const riverBonusCells = new Set<number>()
    for (const river of rivers) {
        for (const cell of river.cells) {
            riverBonusCells.add(cell)
            for (const neighbor of graph.neighbors[cell]) riverBonusCells.add(neighbor)
        }
    }
    for (const cell of riverBonusCells) {
        if (isLand(cell)) moisture[cell] = Math.min(100, moisture[cell] + 25)
    }

    if (moistureBias !== 0) {
        for (let cell = 0; cell < graph.cellCount; cell++) {
            moisture[cell] = Math.min(100, Math.max(0, moisture[cell] + moistureBias))
        }
    }

    // Water cells never got a moisture value (loop above skips them) — leave
    // them at 100 rather than 0 before smoothing, or averaging would drag
    // coastal land toward 0 instead of the wet value it should be.
    for (let cell = 0; cell < graph.cellCount; cell++) {
        if (!isLand(cell)) moisture[cell] = 100
    }
    smoothField(moisture, graph, 1, 0.4)

    return moisture
}

type TempBand = 'cold' | 'temperate' | 'tropical'
type MoistBand = 'arid' | 'semiArid' | 'humid' | 'wet'

// A Whittaker-style biome matrix: temperature band × moisture band → biome.
const BIOME_MATRIX: Record<TempBand, Record<MoistBand, Biome>> = {
    cold: { arid: 'tundra', semiArid: 'tundra', humid: 'taiga', wet: 'taiga' },
    temperate: {
        arid: 'steppe',
        semiArid: 'grassland',
        humid: 'temperateForest',
        wet: 'temperateRainforest',
    },
    tropical: {
        arid: 'hotDesert',
        semiArid: 'savanna',
        humid: 'tropicalForest',
        wet: 'tropicalRainforest',
    },
}

function classifyBiomes(
    graph: CellGraph,
    heights: Heights,
    seaLevel: number,
    temperature: Float32Array,
    moisture: Float32Array
): Biome[] {
    const biome: Biome[] = new Array(graph.cellCount).fill('grassland')

    for (let i = 0; i < graph.cellCount; i++) {
        if (heights[i] < seaLevel) continue // water cells: biome is unused, elevation coloring handles them

        const temp = temperature[i]
        if (temp < -10) {
            biome[i] = 'glacier'
            continue
        }

        const tempBand: TempBand = temp < 2 ? 'cold' : temp < 18 ? 'temperate' : 'tropical'
        const moist = moisture[i]
        const moistBand: MoistBand = moist < 25 ? 'arid' : moist < 45 ? 'semiArid' : moist < 70 ? 'humid' : 'wet'

        biome[i] = BIOME_MATRIX[tempBand][moistBand]
    }

    return biome
}

export function computeClimate(
    graph: CellGraph,
    heights: Heights,
    seaLevel: number,
    rivers: RiverPath[],
    options: ClimateOptions
): ClimateModel {
    const isLand = (cell: number) => heights[cell] >= seaLevel

    const temperature = computeTemperature(graph, heights, seaLevel, options)
    const moisture = computeMoisture(graph, isLand, rivers, options.moistureBias)
    const biome = classifyBiomes(graph, heights, seaLevel, temperature, moisture)

    return { temperature, moisture, biome }
}
