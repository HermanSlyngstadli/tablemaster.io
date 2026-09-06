// Purely cosmetic, rendering-time settings — deliberately kept out of
// MapConfig. Changing these should redraw the canvas, not rerun the terrain
// pipeline (points/graph/heightmap all stay untouched).
//
// There's no single global namingStyle dial anymore: every settlement/POI
// resolves its own style from whichever state (or, failing that, region)
// its cell belongs to — see naming.ts's resolveNamingStyle. Naming variety
// now comes from regionCount/stateCount instead of a manual style pick.
export interface RenderOptions {
    showCoastline: boolean
    coastlineSmoothing: number // Chaikin corner-cutting iterations, 0-3
    showRivers: boolean
    riverDensity: number // % of land cells, ranked by accumulated flow, drawn as rivers — also gates lakes (same "how significant is this flow" bar)
    showLakes: boolean // pools where a river's flow has nowhere lower left to go
    showBiomes: boolean // biome coloring vs the flat elevation-band fallback
    temperatureBias: number // shifts the whole map colder/warmer, °-ish units
    moistureBias: number // shifts the whole map drier/wetter, 0-100 scale
    showSettlements: boolean
    settlementCount: number
    showRegions: boolean // cultures/peoples — independent of political borders
    regionCount: number
    showStates: boolean // kingdoms — capitals drawn from the biggest settlements
    stateCount: number
    showPois: boolean // dungeons, ruins, shrines, camps, landmarks
    poiCount: number
    showRoads: boolean // connects cities/towns via cost-weighted paths over terrain
}

export const defaultRenderOptions: RenderOptions = {
    showCoastline: true,
    coastlineSmoothing: 2,
    showRivers: true,
    riverDensity: 8,
    showLakes: true,
    showBiomes: true,
    temperatureBias: 0,
    moistureBias: 0,
    showSettlements: true,
    settlementCount: 40,
    showRegions: false,
    regionCount: 5,
    showStates: false,
    stateCount: 4,
    showPois: false,
    poiCount: 15,
    showRoads: true,
}
