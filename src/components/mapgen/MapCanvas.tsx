import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { MapModel } from '../../mapgen/generate'
import { colorForBiomeCell, colorForCell, SHALLOW_WATER_COLOR } from '../../mapgen/colors'
import { smoothPath, traceCoastline } from '../../mapgen/coastline'
import { computeWaterFlow, extractRivers, identifyLakes } from '../../mapgen/hydrology'
import { computeClimate, defaultClimateOptions, BIOME_LABELS } from '../../mapgen/climate'
import { pickSettlementSites, nameSettlements, Settlement, SettlementTier } from '../../mapgen/settlements'
import { generateRegions } from '../../mapgen/regions'
import { generateStates } from '../../mapgen/states'
import { placePointsOfInterest, PointOfInterest, POI_GLYPHS, POI_LABELS, POI_FLAVOR } from '../../mapgen/pointsOfInterest'
import { generateRoads } from '../../mapgen/roads'
import { resolveNamingStyle } from '../../mapgen/naming'
import { createRng } from '../../mapgen/rng'
import { RenderOptions } from '../../mapgen/renderOptions'

// A different tone from both the ocean (SHALLOW_WATER_COLOR) and the old
// river color — lakes read as a distinct freshwater body, not just "more
// ocean" or "a wide river."
const LAKE_COLOR = '#2f6690'

// Running per-owner centroid accumulator, shared by the region and state
// label passes — built during the main cell loop (which already visits
// every cell once) instead of a second pass just to average positions.
type Centroids = Map<number, { x: number; y: number; count: number }>

function accumulateCentroid(sums: Centroids, id: number, x: number, y: number) {
    const s = sums.get(id) ?? { x: 0, y: 0, count: 0 }
    s.x += x
    s.y += y
    s.count += 1
    sums.set(id, s)
}

// Pixel width for a river segment given its accumulated flux, in map units
// (divided by scale at draw time, same as the coastline stroke, so it stays
// a constant screen width regardless of zoom).
function riverWidth(flux: number): number {
    return Math.min(6, Math.max(0.6, Math.sqrt(flux) * 0.25))
}

// Three visibly distinct marker sizes — a handful of prominent cities, a
// mid band of towns, and villages small and faint enough not to clutter the
// map even though there are the most of them.
const SETTLEMENT_MARKER_STYLE: Record<
    SettlementTier,
    { radius: number; markerLineWidth: number; font: string; labelOpacity: number }
> = {
    city: { radius: 6, markerLineWidth: 1.5, font: 'bold 14px sans-serif', labelOpacity: 1 },
    town: { radius: 3.5, markerLineWidth: 1.2, font: '11px sans-serif', labelOpacity: 0.9 },
    village: { radius: 2, markerLineWidth: 1, font: '9px sans-serif', labelOpacity: 0.75 },
}

// Fixed halo radius POIs are drawn with (see the draw effect below) — kept
// here too since hit-testing needs the same number.
const POI_MARKER_RADIUS = 9

// A little extra tolerance beyond a marker's own radius, so small village/POI
// dots are still easy to click precisely.
const CLICK_TOLERANCE = 4

// A click that moved less than this many screen pixels between pointerdown
// and pointerup counts as a click; anything more was a drag-to-pan.
const CLICK_MOVE_THRESHOLD = 5

// The info card's content is a plain snapshot resolved at click time, not a
// live reference — simpler than keeping a floating card in sync with
// whichever settlement/POI it points to across regenerations.
interface MarkerInfo {
    title: string
    subtitle: string
    lines: string[]
}

// A tiny deterministic hash (not the map's seeded RNG — this is a display-only
// flavor number, not part of generation) so a settlement's population estimate
// stays stable across re-renders instead of jittering on every redraw.
function pseudoRandomFromCell(cell: number): number {
    const x = Math.sin(cell * 12.9898) * 43758.5453
    return x - Math.floor(x)
}

const POPULATION_RANGE: Record<SettlementTier, [number, number]> = {
    city: [5000, 30000],
    town: [800, 5000],
    village: [50, 800],
}

function estimatePopulation(cell: number, tier: SettlementTier): number {
    const [min, max] = POPULATION_RANGE[tier]
    const t = pseudoRandomFromCell(cell)
    return Math.round((min + t * (max - min)) / 10) * 10
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

// Cell count can run into the thousands, and will only grow once rivers,
// coastlines and labels stack on top — one <Polygon> React component per
// cell (the previous react-leaflet approach) doesn't scale. This draws every
// cell in a single canvas pass instead, with pan/zoom handled manually via a
// plain translate/scale transform.
const StyledCanvas = styled.canvas`
    width: 100%;
    height: 100%;
    display: block;
    cursor: grab;
    touch-action: none;

    &:active {
        cursor: grabbing;
    }
`

const Container = styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
`

const InfoPanel = styled.div`
    position: absolute;
    top: 16px;
    right: 16px;
    width: 260px;
    max-width: calc(100% - 32px);
    max-height: calc(100% - 32px);
    overflow-y: auto;
    background: var(--panel-bg-color);
    border-radius: var(--panel-border-radius);
    box-shadow: var(--box-shadow-default);
    padding: 14px 16px;
    z-index: 5;
`

const InfoPanelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
`

const InfoPanelTitle = styled.h3`
    margin: 0;
    font-size: 1.1rem;
`

const InfoPanelSubtitle = styled.p`
    margin: 2px 0 10px;
    font-size: 0.85rem;
    font-style: italic;
    opacity: 0.7;
`

const InfoPanelCloseButton = styled.button`
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    opacity: 0.6;
    padding: 2px 4px;

    &:hover {
        opacity: 1;
    }
`

const InfoPanelLine = styled.p`
    margin: 4px 0;
    font-size: 0.85rem;
`

type Transform = { x: number; y: number; scale: number }

// Clamps one axis of the pan offset so the map's content rectangle always
// covers the viewport when it's bigger than the viewport (no blank margin
// past either edge), or sits centered when it's smaller (nowhere useful to
// pan once the whole map already fits on screen).
function clampAxis(pos: number, contentSize: number, viewportSize: number): number {
    if (contentSize <= viewportSize) return (viewportSize - contentSize) / 2
    return Math.min(0, Math.max(viewportSize - contentSize, pos))
}

function clampTransform(t: Transform, viewportWidth: number, viewportHeight: number, mapWidth: number, mapHeight: number): Transform {
    return {
        scale: t.scale,
        x: clampAxis(t.x, mapWidth * t.scale, viewportWidth),
        y: clampAxis(t.y, mapHeight * t.scale, viewportHeight),
    }
}

export const MapCanvas = ({ model, renderOptions }: { model: MapModel; renderOptions: RenderOptions }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 })
    const dragOrigin = useRef<{ x: number; y: number } | null>(null)
    const pointerDownScreen = useRef<{ x: number; y: number } | null>(null)
    const [selected, setSelected] = useState<MarkerInfo | null>(null)

    // Derived purely from the model + a cosmetic smoothing amount — never
    // triggers a terrain regeneration, only a redraw.
    const coastline = useMemo(() => {
        const { graph, heights, config } = model
        const paths = traceCoastline(graph, (cell) => heights[cell] >= config.seaLevel)
        return paths.map((path) => smoothPath(path, renderOptions.coastlineSmoothing))
    }, [model, renderOptions.coastlineSmoothing])

    // Shared by rivers and lakes below, so the flow (steepest-descent,
    // accumulated flux) is computed once rather than twice.
    const flow = useMemo(() => {
        const { graph, heights, config } = model
        return computeWaterFlow(graph, heights, (cell) => heights[cell] >= config.seaLevel)
    }, [model])

    // Same idea as coastline: derived from the model, cheap enough to redo
    // whenever the density dial moves without touching the terrain itself.
    const rivers = useMemo(() => {
        const { graph, heights, config } = model
        return extractRivers(
            graph,
            heights,
            (cell) => heights[cell] >= config.seaLevel,
            flow,
            renderOptions.riverDensity
        )
    }, [model, flow, renderOptions.riverDensity])

    // A lake is exactly the dead end a river's flow hits when it has nowhere
    // lower left to drain — same flux-significance bar as rivers (the
    // riverDensity dial), so one dial governs both instead of a separate
    // lake-density control.
    const lakes = useMemo(() => {
        if (!renderOptions.showLakes) return []
        const { graph, heights, config } = model
        return identifyLakes(
            graph,
            heights,
            (cell) => heights[cell] >= config.seaLevel,
            flow,
            renderOptions.riverDensity
        )
    }, [model, flow, renderOptions.riverDensity, renderOptions.showLakes])

    // O(1) per-cell lookup for the main fill loop below, instead of
    // scanning every lake's cell list once per cell.
    const lakeCells = useMemo(() => {
        const set = new Set<number>()
        for (const lake of lakes) for (const cell of lake.cells) set.add(cell)
        return set
    }, [lakes])

    // Reused by the click-to-inspect info card's "on a river" detail.
    const riverCells = useMemo(() => {
        const set = new Set<number>()
        for (const river of rivers) for (const cell of river.cells) set.add(cell)
        return set
    }, [rivers])

    // Depends on rivers (for the moisture bonus) as well as the model —
    // still cheap (a BFS pass over land cells), so it's a redraw-time
    // derivation rather than something that reruns the terrain pipeline.
    const climate = useMemo(() => {
        const { graph, heights, config } = model
        return computeClimate(graph, heights, config.seaLevel, rivers, {
            ...defaultClimateOptions,
            temperatureBias: renderOptions.temperatureBias,
            moistureBias: renderOptions.moistureBias,
        })
    }, [model, rivers, renderOptions.temperatureBias, renderOptions.moistureBias])

    // Placement only — no names yet. Naming needs to know which state/region
    // a site falls in, which isn't known until those layers exist below, so
    // this deliberately stops at location + tier. A prime offset keeps this
    // RNG stream decorrelated from the terrain pipeline's own.
    const settlementSites = useMemo(() => {
        const { graph, heights, config } = model
        const rng = createRng(config.seed + 104729)
        return pickSettlementSites(graph, heights, config.seaLevel, rivers, rng, {
            count: renderOptions.settlementCount,
        })
    }, [model, rivers, renderOptions.settlementCount])

    // Connects cities/towns to their nearest few others by cost-weighted
    // path over terrain. Only needs site locations/tiers, not names, so it
    // doesn't have to wait on the naming stage below.
    const roads = useMemo(() => {
        if (!renderOptions.showRoads) return []
        const { graph, heights, config } = model
        return generateRoads(graph, heights, config.seaLevel, settlementSites, { neighborsPerSettlement: 2 })
    }, [model, settlementSites, renderOptions.showRoads])

    // Cultures — seeded independently of settlements, so a people's
    // heartland isn't forced to be a city. Always computed (not just when
    // shown): naming resolution below falls back to a region's style for
    // any cell no state claims, so this needs to exist even while hidden.
    const regions = useMemo(() => {
        const { graph, heights, config } = model
        const rng = createRng(config.seed + 224737)
        return generateRegions(graph, heights, config.seaLevel, climate.biome, rng, renderOptions.regionCount)
    }, [model, climate, renderOptions.regionCount])

    // Kingdoms — capitals are just the existing "city"-tier settlement
    // sites, so political power lands wherever placement already decided
    // the best sites are. Also always computed, for the same naming reason
    // as regions above — a state's assigned style is what makes every
    // settlement/POI inside its territory sound consistent.
    const states = useMemo(() => {
        const { graph, heights, config } = model
        const rng = createRng(config.seed + 71317)
        return generateStates(graph, heights, config.seaLevel, settlementSites, rng, renderOptions.stateCount)
    }, [model, settlementSites, renderOptions.stateCount])

    // Now that states and regions exist, every site can resolve a style —
    // state's wins, region's is the fallback — and settlements actually get
    // named. A distinct offset again for a decorrelated, deterministic
    // stream.
    const settlements = useMemo(() => {
        const { config } = model
        const rng = createRng(config.seed + 32452867)
        const stateStyles = states.states.map((s) => s.namingStyle)
        const regionStyles = regions.regions.map((r) => r.namingStyle)
        return nameSettlements(
            settlementSites,
            (cell) => resolveNamingStyle(cell, states.owner, stateStyles, regions.owner, regionStyles),
            rng
        )
    }, [model, settlementSites, states, regions])

    // Dungeons, ruins, shrines, camps, landmarks — scored per-type against
    // terrain/biome and distance from settlements (computed once and shared
    // across all five scorers), but named the same state/region-first way
    // as settlements. Independent RNG offset again for determinism without
    // correlating with the other derived layers. Skipped entirely while
    // hidden — this one doesn't gate anything else's correctness.
    const pointsOfInterest = useMemo(() => {
        if (!renderOptions.showPois) return []
        const { graph, heights, config } = model
        const rng = createRng(config.seed + 15485863)
        const stateStyles = states.states.map((s) => s.namingStyle)
        const regionStyles = regions.regions.map((r) => r.namingStyle)
        return placePointsOfInterest(graph, heights, config.seaLevel, climate.biome, rivers, settlementSites, rng, {
            count: renderOptions.poiCount,
            styleFor: (cell) => resolveNamingStyle(cell, states.owner, stateStyles, regions.owner, regionStyles),
        })
    }, [model, climate, rivers, settlementSites, states, regions, renderOptions.poiCount, renderOptions.showPois])

    // Fit the newly generated map into view whenever the model changes.
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const scale =
            Math.min(container.clientWidth / model.graph.width, container.clientHeight / model.graph.height) * 0.95
        const x = (container.clientWidth - model.graph.width * scale) / 2
        const y = (container.clientHeight - model.graph.height * scale) / 2
        setTransform({ x, y, scale })
    }, [model])

    // The info card is a snapshot, not a live reference — close it whenever
    // the underlying settlement/POI data could have shifted out from under
    // it (a new map, or a dial that repositions/renames everything), rather
    // than risk it showing stale info for a marker that moved or vanished.
    useEffect(() => {
        setSelected(null)
    }, [model, settlements, pointsOfInterest])

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const draw = () => {
            const ctx = canvas.getContext('2d')
            if (!ctx) return
            const dpr = window.devicePixelRatio || 1

            canvas.width = container.clientWidth * dpr
            canvas.height = container.clientHeight * dpr

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.fillStyle = '#0d2740'
            ctx.fillRect(0, 0, container.clientWidth, container.clientHeight)

            ctx.save()
            ctx.translate(transform.x, transform.y)
            ctx.scale(transform.scale, transform.scale)

            const { graph, heights, config } = model
            const regionCentroids: Centroids = new Map()
            const stateCentroids: Centroids = new Map()

            for (let i = 0; i < graph.cellCount; i++) {
                const poly = graph.polygons[i]
                if (!poly || poly.length < 3) continue

                ctx.beginPath()
                ctx.moveTo(poly[0][0], poly[0][1])
                for (let p = 1; p < poly.length; p++) ctx.lineTo(poly[p][0], poly[p][1])
                ctx.closePath()

                ctx.fillStyle =
                    renderOptions.showLakes && lakeCells.has(i)
                        ? LAKE_COLOR
                        : renderOptions.showBiomes
                        ? colorForBiomeCell(heights[i], config.seaLevel, climate.biome[i])
                        : colorForCell(heights[i], config.seaLevel)
                ctx.fill()

                // Translucent color wash for whichever political/cultural
                // layers are on, reusing this cell's path rather than
                // rebuilding it — the crisp black cell border below still
                // draws on top so cell edges stay legible under the wash.
                if (renderOptions.showRegions && regions.owner[i] !== -1) {
                    const [x, y] = graph.points[i]
                    accumulateCentroid(regionCentroids, regions.owner[i], x, y)
                    ctx.globalAlpha = 0.22
                    ctx.fillStyle = regions.regions[regions.owner[i]].color
                    ctx.fill()
                    ctx.globalAlpha = 1
                }
                if (renderOptions.showStates && states.owner[i] !== -1) {
                    const [x, y] = graph.points[i]
                    accumulateCentroid(stateCentroids, states.owner[i], x, y)
                    ctx.globalAlpha = 0.2
                    ctx.fillStyle = states.states[states.owner[i]].color
                    ctx.fill()
                    ctx.globalAlpha = 1
                }

                ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
                ctx.lineWidth = 0.5 / transform.scale
                ctx.stroke()
            }

            if (renderOptions.showCoastline) {
                ctx.strokeStyle = '#12324a'
                ctx.lineWidth = 2 / transform.scale
                ctx.lineJoin = 'round'
                ctx.lineCap = 'round'
                for (const path of coastline) {
                    if (path.length < 2) continue
                    ctx.beginPath()
                    ctx.moveTo(path[0][0], path[0][1])
                    for (let p = 1; p < path.length; p++) ctx.lineTo(path[p][0], path[p][1])
                    ctx.stroke()
                }
            }

            if (renderOptions.showRivers) {
                // Same color as shallow water, so a river blends into the
                // coast instead of visibly changing color right at the mouth.
                ctx.strokeStyle = SHALLOW_WATER_COLOR
                ctx.lineCap = 'round'
                for (const river of rivers) {
                    for (let p = 0; p < river.points.length - 1; p++) {
                        const avgFlux = (river.widths[p] + river.widths[p + 1]) / 2
                        ctx.lineWidth = riverWidth(avgFlux) / transform.scale
                        ctx.beginPath()
                        ctx.moveTo(river.points[p][0], river.points[p][1])
                        ctx.lineTo(river.points[p + 1][0], river.points[p + 1][1])
                        ctx.stroke()
                    }
                }
            }

            if (renderOptions.showRoads) {
                ctx.setLineDash([5 / transform.scale, 3 / transform.scale])
                ctx.strokeStyle = 'rgba(20, 16, 14, 0.9)'
                ctx.lineWidth = 1.8 / transform.scale
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
                for (const road of roads) {
                    if (road.points.length < 2) continue
                    ctx.beginPath()
                    ctx.moveTo(road.points[0][0], road.points[0][1])
                    for (let p = 1; p < road.points.length; p++) ctx.lineTo(road.points[p][0], road.points[p][1])
                    ctx.stroke()
                }
                ctx.setLineDash([])
            }

            if (renderOptions.showRegions) {
                ctx.setLineDash([6 / transform.scale, 4 / transform.scale])
                ctx.strokeStyle = 'rgba(40, 40, 40, 0.55)'
                ctx.lineWidth = 1.5 / transform.scale
                ctx.lineJoin = 'round'
                for (const path of regions.borders) {
                    if (path.length < 2) continue
                    ctx.beginPath()
                    ctx.moveTo(path[0][0], path[0][1])
                    for (let p = 1; p < path.length; p++) ctx.lineTo(path[p][0], path[p][1])
                    ctx.stroke()
                }
                ctx.setLineDash([])
            }

            if (renderOptions.showStates) {
                ctx.strokeStyle = 'rgba(20, 20, 20, 0.75)'
                ctx.lineWidth = 2.5 / transform.scale
                ctx.lineJoin = 'round'
                for (const path of states.borders) {
                    if (path.length < 2) continue
                    ctx.beginPath()
                    ctx.moveTo(path[0][0], path[0][1])
                    for (let p = 1; p < path.length; p++) ctx.lineTo(path[p][0], path[p][1])
                    ctx.stroke()
                }
            }

            ctx.restore()

            // Drawn in screen space, not the scaled/translated map space above —
            // markers stay a fixed size and labels stay legible at any zoom
            // level instead of shrinking to nothing or ballooning with it.
            if (renderOptions.showRegions) {
                ctx.font = 'italic 15px serif'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                for (const region of regions.regions) {
                    const c = regionCentroids.get(region.id)
                    if (!c) continue
                    const screenX = (c.x / c.count) * transform.scale + transform.x
                    const screenY = (c.y / c.count) * transform.scale + transform.y
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
                    ctx.lineWidth = 3
                    ctx.strokeText(region.name, screenX, screenY)
                    ctx.fillStyle = 'rgba(35, 30, 20, 0.85)'
                    ctx.fillText(region.name, screenX, screenY)
                }
                ctx.textAlign = 'start'
            }

            if (renderOptions.showStates) {
                ctx.font = 'bold 16px serif'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                for (const state of states.states) {
                    const c = stateCentroids.get(state.id)
                    if (!c) continue
                    const screenX = (c.x / c.count) * transform.scale + transform.x
                    const screenY = (c.y / c.count) * transform.scale + transform.y
                    const label = state.name.toUpperCase()
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
                    ctx.lineWidth = 3.5
                    ctx.strokeText(label, screenX, screenY)
                    ctx.fillStyle = 'rgba(10, 10, 10, 0.9)'
                    ctx.fillText(label, screenX, screenY)
                }
                ctx.textAlign = 'start'
            }

            if (renderOptions.showPois) {
                ctx.textBaseline = 'middle'
                for (const poi of pointsOfInterest) {
                    const screenX = poi.x * transform.scale + transform.x
                    const screenY = poi.y * transform.scale + transform.y

                    // A soft halo behind the glyph keeps it legible over any
                    // terrain color, without needing per-biome contrast logic.
                    ctx.beginPath()
                    ctx.arc(screenX, screenY, POI_MARKER_RADIUS, 0, Math.PI * 2)
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
                    ctx.fill()

                    ctx.font = '15px sans-serif'
                    ctx.textAlign = 'center'
                    ctx.fillText(POI_GLYPHS[poi.type], screenX, screenY)
                    ctx.textAlign = 'start'

                    ctx.font = 'italic 10px sans-serif'
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
                    ctx.lineWidth = 3
                    ctx.strokeText(poi.name, screenX + 10, screenY)
                    ctx.fillStyle = '#2b2416'
                    ctx.fillText(poi.name, screenX + 10, screenY)
                }
            }

            if (renderOptions.showSettlements) {
                for (const settlement of settlements) {
                    const screenX = settlement.x * transform.scale + transform.x
                    const screenY = settlement.y * transform.scale + transform.y
                    const style = SETTLEMENT_MARKER_STYLE[settlement.tier]

                    ctx.beginPath()
                    ctx.arc(screenX, screenY, style.radius, 0, Math.PI * 2)
                    ctx.fillStyle = '#2b2b2b'
                    ctx.fill()
                    ctx.strokeStyle = '#f5f0e0'
                    ctx.lineWidth = style.markerLineWidth
                    ctx.stroke()

                    ctx.font = style.font
                    ctx.textBaseline = 'middle'
                    ctx.lineJoin = 'round'
                    ctx.globalAlpha = style.labelOpacity
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
                    ctx.lineWidth = 3
                    ctx.strokeText(settlement.name, screenX + style.radius + 4, screenY)
                    ctx.fillStyle = '#1b1b1b'
                    ctx.fillText(settlement.name, screenX + style.radius + 4, screenY)
                    ctx.globalAlpha = 1
                }
            }
        }

        draw()
        const observer = new ResizeObserver(() => {
            draw()
            // A container resize (e.g. the window shrinking) can leave a pan
            // that was valid before now showing blank space past the map's
            // edge — snap it back in bounds. Bails out to the same object
            // when nothing needs correcting, so this doesn't cause an
            // unnecessary re-render on every resize tick.
            setTransform((t) => {
                const clamped = clampTransform(t, container.clientWidth, container.clientHeight, model.graph.width, model.graph.height)
                return clamped.x === t.x && clamped.y === t.y ? t : clamped
            })
        })
        observer.observe(container)
        return () => observer.disconnect()
    }, [
        model,
        transform,
        coastline,
        rivers,
        lakes,
        lakeCells,
        roads,
        climate,
        settlements,
        regions,
        states,
        pointsOfInterest,
        renderOptions.showCoastline,
        renderOptions.showRivers,
        renderOptions.showLakes,
        renderOptions.showRoads,
        renderOptions.showBiomes,
        renderOptions.showSettlements,
        renderOptions.showRegions,
        renderOptions.showStates,
        renderOptions.showPois,
    ])

    const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        const rect = e.currentTarget.getBoundingClientRect()
        const factor = e.deltaY < 0 ? 1.1 : 0.9
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top

        setTransform((t) => {
            const newScale = Math.min(8, Math.max(0.2, t.scale * factor))
            // Keep whatever map point is currently under the cursor fixed on
            // screen as scale changes — otherwise only `scale` moves and the
            // view drifts away from wherever you're pointing instead of
            // zooming in toward it.
            const mapX = (cx - t.x) / t.scale
            const mapY = (cy - t.y) / t.scale
            const next = { scale: newScale, x: cx - mapX * newScale, y: cy - mapY * newScale }
            return clampTransform(next, rect.width, rect.height, model.graph.width, model.graph.height)
        })
    }

    // Shared by both marker types' info cards: what the clicked cell itself
    // says regardless of what's standing on it — biome, which state/region
    // claims it, coastal/river access.
    const describeCell = (cell: number): string[] => {
        const { graph, heights, config } = model
        const lines: string[] = [`Biome: ${BIOME_LABELS[climate.biome[cell]]}`]

        const stateId = states.owner[cell]
        lines.push(stateId !== -1 ? `Realm: ${states.states[stateId].name}` : 'Realm: Unclaimed wilderness')

        const regionId = regions.owner[cell]
        if (regionId !== -1) lines.push(`Region: ${regions.regions[regionId].name}`)

        if (graph.neighbors[cell].some((n) => heights[n] < config.seaLevel)) lines.push('On the coast')
        if (riverCells.has(cell)) lines.push('On a river')

        return lines
    }

    const buildSettlementInfo = (settlement: Settlement): MarkerInfo => ({
        title: settlement.name,
        subtitle: `${capitalize(settlement.tier)} · population ~${estimatePopulation(
            settlement.cell,
            settlement.tier
        ).toLocaleString()}`,
        lines: describeCell(settlement.cell),
    })

    const buildPoiInfo = (poi: PointOfInterest): MarkerInfo => ({
        title: poi.name,
        subtitle: POI_LABELS[poi.type],
        lines: [POI_FLAVOR[poi.type], ...describeCell(poi.cell)],
    })

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        dragOrigin.current = { x: e.clientX - transform.x, y: e.clientY - transform.y }
        pointerDownScreen.current = { x: e.clientX, y: e.clientY }
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const origin = dragOrigin.current
        if (!origin) return
        const rect = e.currentTarget.getBoundingClientRect()
        setTransform((t) => {
            const next = { ...t, x: e.clientX - origin.x, y: e.clientY - origin.y }
            return clampTransform(next, rect.width, rect.height, model.graph.width, model.graph.height)
        })
    }

    const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        dragOrigin.current = null

        const start = pointerDownScreen.current
        pointerDownScreen.current = null
        if (!start) return
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > CLICK_MOVE_THRESHOLD) return // was a drag, not a click

        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top

        // Settlements take priority over POIs when markers overlap — they're
        // the more prominent feature at a glance. Within one category, the
        // closest marker under the click wins.
        let closest: MarkerInfo | null = null
        let closestDist = Infinity

        if (renderOptions.showSettlements) {
            for (const settlement of settlements) {
                const screenX = settlement.x * transform.scale + transform.x
                const screenY = settlement.y * transform.scale + transform.y
                const dist = Math.hypot(clickX - screenX, clickY - screenY)
                const radius = SETTLEMENT_MARKER_STYLE[settlement.tier].radius
                if (dist <= radius + CLICK_TOLERANCE && dist < closestDist) {
                    closestDist = dist
                    closest = buildSettlementInfo(settlement)
                }
            }
        }

        if (!closest && renderOptions.showPois) {
            for (const poi of pointsOfInterest) {
                const screenX = poi.x * transform.scale + transform.x
                const screenY = poi.y * transform.scale + transform.y
                const dist = Math.hypot(clickX - screenX, clickY - screenY)
                if (dist <= POI_MARKER_RADIUS + CLICK_TOLERANCE && dist < closestDist) {
                    closestDist = dist
                    closest = buildPoiInfo(poi)
                }
            }
        }

        setSelected(closest)
    }

    return (
        <Container ref={containerRef}>
            <StyledCanvas
                ref={canvasRef}
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            />
            {selected && (
                <InfoPanel>
                    <InfoPanelHeader>
                        <div>
                            <InfoPanelTitle>{selected.title}</InfoPanelTitle>
                            <InfoPanelSubtitle>{selected.subtitle}</InfoPanelSubtitle>
                        </div>
                        <InfoPanelCloseButton onClick={() => setSelected(null)} aria-label="Close">
                            ✕
                        </InfoPanelCloseButton>
                    </InfoPanelHeader>
                    {selected.lines.map((line, i) => (
                        <InfoPanelLine key={i}>{line}</InfoPanelLine>
                    ))}
                </InfoPanel>
            )}
        </Container>
    )
}
