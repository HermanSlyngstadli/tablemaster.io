// Deterministic PRNG so a map is fully reproducible from a numeric seed —
// every generation stage (points, heightmap, later rivers/biomes) pulls from
// the same stream, so "seed" becomes a real dial instead of Math.random()
// giving a different map on every render.
export type Rng = () => number

// mulberry32 — small, fast, good-enough distribution for map generation.
export function createRng(seed: number): Rng {
    let a = seed >>> 0 || 1
    return function rng() {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export function randomSeed(): number {
    return Math.floor(Math.random() * 2 ** 31)
}
