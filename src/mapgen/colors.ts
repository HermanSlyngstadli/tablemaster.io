import { Biome } from './climate'

// Shared with river rendering — a river should read as the same water,
// not a differently-colored stream, at the moment it meets the coast.
export const SHALLOW_WATER_COLOR = '#4a90c4'

// The high end of the elevation range used to jump straight from highland
// to a single flat gray at land >= 55 — a 25-unit-wide band (nearly a third
// of the full 0-80 land range) rendered as one undifferentiated color, and
// templates routinely push 15-30%+ of their land area into it. Splitting it
// into a transitional rocky-slope tone plus a much narrower true-peak band
// makes gray read as "a few dramatic peaks," not "a third of the continent."
const ROCKY_SLOPE_COLOR = '#9a8d7c'
const BARE_PEAK_COLOR = '#cfcfcf'

// Elevation-banded coloring — this is the "low poly" look: flat color per
// cell, no blending. Kept as the fallback when biome coloring is switched
// off (or as a plain reference view independent of climate).
export function colorForCell(height: number, seaLevel: number): string {
    if (height < seaLevel * 0.5) return '#1f4e79' // deep ocean
    if (height < seaLevel) return SHALLOW_WATER_COLOR

    const land = height - seaLevel
    if (land < 3) return '#e8d9a0' // beach
    if (land < 20) return '#6fa34c' // plains
    if (land < 40) return '#4f7942' // hills / forest
    if (land < 55) return '#8a7a5c' // highland
    if (land < 70) return ROCKY_SLOPE_COLOR // rocky slopes
    return BARE_PEAK_COLOR // bare peaks
}

const BIOME_COLORS: Record<Biome, string> = {
    glacier: '#f2f2f2',
    tundra: '#c9c2a3',
    taiga: '#5f8f6e',
    steppe: '#c2b280',
    grassland: '#a8c66c',
    temperateForest: '#4f7942',
    temperateRainforest: '#2e6b3e',
    hotDesert: '#e3c16f',
    savanna: '#c9b458',
    tropicalForest: '#4f9a4f',
    tropicalRainforest: '#1f6b3a',
}

// Same water/beach handling as colorForCell, but land cells are colored by
// biome instead of a flat elevation band — except the tallest peaks, which
// stay bare rock regardless of biome (a real mountain pokes through
// whatever climate surrounds it; the lapse rate already makes most tall
// peaks read as cold/glacial anyway, this just keeps the rock visible too).
// Same rocky-slope/bare-peak split as colorForCell, for the same reason.
export function colorForBiomeCell(height: number, seaLevel: number, biome: Biome): string {
    if (height < seaLevel * 0.5) return '#1f4e79' // deep ocean
    if (height < seaLevel) return SHALLOW_WATER_COLOR

    const land = height - seaLevel
    if (land < 3) return '#e8d9a0' // beach
    if (land >= 70) return BARE_PEAK_COLOR
    if (land >= 55) return ROCKY_SLOPE_COLOR

    return BIOME_COLORS[biome]
}
