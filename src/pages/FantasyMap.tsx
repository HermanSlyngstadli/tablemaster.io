import React, { useEffect, useState } from 'react'
import { MapContainer, Polygon } from 'react-leaflet'
import L from 'leaflet'
import { Delaunay } from 'd3-delaunay'
import { createNoise2D } from 'simplex-noise'

const WIDTH = 1200
const HEIGHT = 800
const NUM_POINTS = 5000 // More points = more detail

const generatePoints = (num: number): [number, number][] =>
    Array.from({ length: num }, () => [Math.random() * WIDTH, Math.random() * HEIGHT] as [number, number])

const noise = createNoise2D()
// Removed duplicate getElevation function

const generateVoronoi = (points: [number, number][]) => {
    const delaunay = Delaunay.from(points)
    return delaunay.voronoi([0, 0, WIDTH, HEIGHT])
}

const computeCentroid = (polygon: [number, number][]): [number, number] => {
    let x = 0,
        y = 0,
        len = polygon.length
    polygon.forEach(([px, py]) => {
        x += px
        y += py
    })
    return [x / len, y / len]
}

const lloydRelaxation = (points: [number, number][], iterations: number = 3): [number, number][] => {
    for (let iter = 0; iter < iterations; iter++) {
        const voronoi = generateVoronoi(points)
        points = points.map((point, i) => {
            const cell = voronoi.cellPolygon(i)
            if (!cell) return point

            const centroid = computeCentroid(cell)
            return [
                point[0] * 0.7 + centroid[0] * 0.3, // Move slightly toward centroid
                point[1] * 0.7 + centroid[1] * 0.3,
            ]
        })
    }
    return points
}

const perturbEdges = (polygon: [number, number][], scale: number = 5): [number, number][] => {
    return polygon.map(([x, y]) => {
        let nx = x / WIDTH - 0.5
        let ny = y / HEIGHT - 0.5

        // Apply Perlin noise displacement
        let dx = noise(nx * scale, ny * scale) * 5
        let dy = noise(ny * scale, nx * scale) * 5

        return [x + dx, y + dy]
    })
}

const getElevation = ([x, y]: [number, number]) => {
    const nx = x / WIDTH - 0.5 // Normalize to -0.5 to 0.5
    const ny = y / HEIGHT - 0.5

    const largeScale = 2 // Low frequency, large landmasses
    const smallScale = 10 // High frequency, more details

    // Combine low and high-frequency noise
    let elevation = 0.6 * noise(nx * largeScale, ny * largeScale) + 0.4 * noise(nx * smallScale, ny * smallScale)

    // Apply a radial fade (circular island effect)
    const distance = Math.sqrt(nx * nx + ny * ny) * 2 // Distance from center
    elevation -= distance * 1.5 // Control landmass extent

    return elevation
}

const riverSources: [number, number][] = []

const classifyTerrain = (x: number, y: number, elevation: number): string => {
    if (elevation < -1.3) return '#28527a' // Deep ocean
    if (elevation < -0.9) return '#64a6bd' // Shallow water
    if (elevation < -0.88) return '#f4e8a3' // Sand / Beach
    if (elevation < -0.1) return '#4c9a2a' // Grasslands
    if (elevation < 0.2) return '#94724e' // Hills
    riverSources.push([x, y]) // Store mountains as river sources
    return '#aaaaaa' // Mountains
}

export const FantasyMap = () => {
    const [polygons, setPolygons] = useState<{ coords: L.LatLngTuple[][]; isLand: boolean; color: string }[]>([])

    useEffect(() => {
        let points = generatePoints(NUM_POINTS)
        points = lloydRelaxation(points, 5)
        points = lloydRelaxation(points, 5)

        const voronoi = generateVoronoi(points)
        let newPolygons = []

        for (let i = 0; i < points.length; i++) {
            const cell = voronoi.cellPolygon(i)
            if (!cell || cell.length < 3) continue // Ensure valid polygons

            const [x, y] = points[i] // Extract coordinates
            const elevation = getElevation([x, y])

            newPolygons.push({
                coords: [cell.map(([px, py]) => [py, px] as L.LatLngTuple)], // Wrap in an array to make it LatLngTuple[][]
                isLand: elevation > 0,
                color: classifyTerrain(x, y, elevation), // Pass (x, y)
            })
        }

        setPolygons(newPolygons) // Now matches expected type
    }, [])

    return (
        <MapContainer center={[500, 500]} zoom={0.2} crs={L.CRS.Simple} style={{ height: '100vh', width: '100%' }}>
            {polygons.map((poly, i) => (
                <Polygon key={i} positions={poly.coords} color={poly.color} weight={1} fillOpacity={0.7} />
            ))}
        </MapContainer>
    )
}
