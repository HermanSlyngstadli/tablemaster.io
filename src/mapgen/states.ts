import { CellGraph } from './graph'
import { Heights } from './heightmap'
import { Point } from './points'
import { Rng } from './rng'
import { partitionTerritory } from './territory'
import { traceBoundaries, smoothPath } from './boundaries'
import { SettlementSite } from './settlements'
import { NamingStyle, shuffledNamingStyles } from './naming'
import { buildTables, generateBatch, GenerateOptions } from '../nameSynthEngine'

export interface State {
    id: number
    capital: SettlementSite
    name: string
    namingStyle: NamingStyle
    color: string
}

export interface StateLayer {
    owner: Int32Array // cell -> state id, -1 = water/unclaimed
    states: State[]
    borders: Point[][]
}

const TITLES = ['Kingdom', 'Duchy', 'Barony', 'Empire', 'Realm', 'Dominion', 'Principality']

const NAME_OPTIONS: GenerateOptions = {
    order: 3,
    temperature: 0.95,
    vowelFactor: 1,
    harshFactor: 1,
    rarity: 0,
    minLen: 4,
    maxLen: 10,
}

function stateColor(index: number, count: number): string {
    // Offset from region hues (which start at 0°) so the two layers don't
    // land on visually-identical colors when both are shown at once.
    const hue = (360 * index) / Math.max(1, count) + 180
    return `hsl(${hue % 360}, 70%, 45%)`
}

// Kingdoms/states: capitals are simply the biggest existing settlement
// SITES (already ranked by site quality) — political power concentrates
// where settlement placement already decided the best cities are, no
// separate seed-picking heuristic needed. Territory spreads by the same
// cost-weighted flood fill as regions, but with a steeper mountain penalty:
// political borders should hug natural barriers more aggressively than a
// culture's looser, more organic spread.
//
// Each state gets its own naming style, invents its own name (rather than
// borrowing its capital's — the capital isn't named yet at this point, on
// purpose: naming happens after states/regions exist, so it can look up
// which state a settlement belongs to). That style then becomes
// authoritative for every settlement/POI inside the state's territory.
export function generateStates(
    graph: CellGraph,
    heights: Heights,
    seaLevel: number,
    settlementSites: SettlementSite[],
    rng: Rng,
    count: number
): StateLayer {
    const cities = settlementSites.filter((s) => s.tier === 'city').slice(0, count)
    if (cities.length === 0) return { owner: new Int32Array(graph.cellCount).fill(-1), states: [], borders: [] }

    const owner = partitionTerritory(
        graph,
        heights,
        seaLevel,
        cities.map((c) => c.cell),
        { mountainPenalty: 1.4 }
    )

    const styles = shuffledNamingStyles(rng)

    const states: State[] = cities.map((capital, id) => {
        const style = styles[id % styles.length]
        const tables = buildTables(style.corpus)
        const batch = generateBatch(tables, { ...NAME_OPTIONS, distinct: 0 }, 1, [], rng)
        const baseName = batch.names[0] ?? `State ${id + 1}`
        const title = TITLES[Math.floor(rng() * TITLES.length)]

        return {
            id,
            capital,
            name: `${title} of ${baseName}`,
            namingStyle: style.value,
            color: stateColor(id, cities.length),
        }
    })

    const isLand = (cell: number) => heights[cell] >= seaLevel
    const borders = traceBoundaries(graph, (a, b) => isLand(a) && isLand(b) && owner[a] !== owner[b]).map((path) =>
        smoothPath(path, 1)
    )

    return { owner, states, borders }
}
