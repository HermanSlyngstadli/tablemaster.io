import { CellGraph } from './graph'
import { Heights } from './heightmap'

// Minimal binary min-heap keyed by cost — just enough for Dijkstra. Exported
// so other cost-weighted graph searches (roads' point-to-point pathfinding)
// can reuse it instead of duplicating it.
export class MinHeap {
    private items: [number, number][] = [] // [cost, cell]

    push(cost: number, cell: number) {
        this.items.push([cost, cell])
        let i = this.items.length - 1
        while (i > 0) {
            const parent = (i - 1) >> 1
            if (this.items[parent][0] <= this.items[i][0]) break
            ;[this.items[parent], this.items[i]] = [this.items[i], this.items[parent]]
            i = parent
        }
    }

    pop(): [number, number] | undefined {
        const top = this.items[0]
        if (top === undefined) return undefined
        const last = this.items.pop() as [number, number]
        if (this.items.length > 0) {
            this.items[0] = last
            let i = 0
            for (;;) {
                const l = i * 2 + 1
                const r = i * 2 + 2
                let smallest = i
                if (l < this.items.length && this.items[l][0] < this.items[smallest][0]) smallest = l
                if (r < this.items.length && this.items[r][0] < this.items[smallest][0]) smallest = r
                if (smallest === i) break
                ;[this.items[smallest], this.items[i]] = [this.items[i], this.items[smallest]]
                i = smallest
            }
        }
        return top
    }

    get size() {
        return this.items.length
    }
}

export interface TerritoryOptions {
    // Extra travel cost through high terrain — higher values make mountain
    // ranges act as stronger natural borders instead of territory just
    // spreading in an even (Euclidean-Voronoi-like) circle from each seed.
    mountainPenalty: number
}

// Multi-source cost-weighted flood fill (Dijkstra): each land cell is
// assigned to whichever seed's territory reaches it cheapest. Water cells
// are impassable, so territory only ever spreads across the cell graph's
// land connectivity — the same mechanism a real border would follow
// (mountains, coastlines) rather than a straight-line Euclidean split.
export function partitionTerritory(
    graph: CellGraph,
    heights: Heights,
    seaLevel: number,
    seeds: number[],
    options: TerritoryOptions
): Int32Array {
    const owner = new Int32Array(graph.cellCount).fill(-1)
    const cost = new Float64Array(graph.cellCount).fill(Infinity)
    const heap = new MinHeap()

    seeds.forEach((seed, index) => {
        if (seed < 0 || seed >= graph.cellCount || heights[seed] < seaLevel) return
        cost[seed] = 0
        owner[seed] = index
        heap.push(0, seed)
    })

    while (heap.size > 0) {
        const popped = heap.pop()
        if (!popped) break
        const [currentCost, cell] = popped
        if (currentCost > cost[cell]) continue // stale entry, a cheaper path already won

        for (const neighbor of graph.neighbors[cell]) {
            if (heights[neighbor] < seaLevel) continue // water blocks territory expansion

            const land = Math.max(0, heights[neighbor] - seaLevel)
            const stepCost = 1 + options.mountainPenalty * (land / 100) ** 2 * 8
            const next = currentCost + stepCost

            if (next < cost[neighbor]) {
                cost[neighbor] = next
                owner[neighbor] = owner[cell]
                heap.push(next, neighbor)
            }
        }
    }

    return owner
}

// Farthest-point sampling: picks `count` land cells spread as evenly as
// possible across the landmass, starting from a random one. Used to seed
// cultures/regions, which (unlike states) aren't tied to settlement
// locations.
export function pickSpreadSeeds(
    graph: CellGraph,
    isLand: (cell: number) => boolean,
    count: number,
    rng: () => number
): number[] {
    const landCells: number[] = []
    for (let cell = 0; cell < graph.cellCount; cell++) if (isLand(cell)) landCells.push(cell)
    if (landCells.length === 0) return []

    const seeds: number[] = [landCells[Math.floor(rng() * landCells.length)]]
    const chosen = new Set(seeds)

    while (seeds.length < count && seeds.length < landCells.length) {
        let best = -1
        let bestDist = -1
        for (const cell of landCells) {
            if (chosen.has(cell)) continue
            const [cx, cy] = graph.points[cell]
            let minDist = Infinity
            for (const seed of seeds) {
                const [sx, sy] = graph.points[seed]
                const d = (sx - cx) ** 2 + (sy - cy) ** 2
                if (d < minDist) minDist = d
            }
            if (minDist > bestDist) {
                bestDist = minDist
                best = cell
            }
        }
        if (best === -1) break
        seeds.push(best)
        chosen.add(best)
    }

    return seeds
}
