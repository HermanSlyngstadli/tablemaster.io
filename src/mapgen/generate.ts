import { createRng, Rng, randomSeed } from './rng'
import { generateJitteredPoints, relaxPoints, Point } from './points'
import { buildGraph, CellGraph } from './graph'
import { applyTemplate, Heights, TemplateName } from './heightmap'

// The full set of dials. Every generation stage reads only from this object,
// so regenerating is just "call generateMap with a new config" — no hidden
// state anywhere else.
export interface MapConfig {
    seed: number
    width: number
    height: number
    cellCount: number
    relaxIterations: number
    seaLevel: number
    template: TemplateName
}

// 2:1 width:height — the map is meant to read as a whole planet, and an
// equirectangular projection of a sphere (360° of longitude vs 180° of
// latitude) is exactly 2:1. Height stays 800 so the existing vertical
// (latitude/pole) tuning — climate, mask falloff — is untouched.
export const defaultMapConfig: MapConfig = {
    seed: randomSeed(),
    width: 1600,
    height: 800,
    cellCount: 10000,
    relaxIterations: 2,
    seaLevel: 20,
    template: 'continents',
}

export interface MapModel {
    graph: CellGraph
    heights: Heights
    config: MapConfig
}

export function generateMap(config: MapConfig): MapModel {
    const rng: Rng = createRng(config.seed)

    let points: Point[] = generateJitteredPoints(config.width, config.height, config.cellCount, rng)
    if (config.relaxIterations > 0) {
        points = relaxPoints(points, config.width, config.height, config.relaxIterations)
    }

    const graph = buildGraph(points, config.width, config.height)
    const heights = applyTemplate(config.template, graph, rng)

    return { graph, heights, config }
}
