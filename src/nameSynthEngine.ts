// Ported from name-generator-example.html ("Name Synth").
// A character-level Markov chain with configurable order, sampling temperature,
// rarity bias, phonology weighting (vowels/hard consonants), a min/max length
// window, and an "echo" filter that rejects candidates too similar to a single
// source name (measured by bigram Jaccard similarity).

export type MarkovTable = Map<string, Map<string, number>>

export const MAX_ORDER = 3

export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y'])
export const HARD_CONSONANTS = new Set(['k', 'g', 't', 'd', 'x', 'z', 'q', 'p', 'b'])

export const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z']/g, '')

// tables[order] : Map<context (length === order), Map<nextChar, weight>>
export const buildTables = (names: string[], maxOrder: number = MAX_ORDER): MarkovTable[] => {
    const tables: MarkovTable[] = []
    for (let o = 0; o <= maxOrder; o++) tables.push(new Map())

    for (const raw of names) {
        const n = normalizeName(raw)
        if (!n) continue
        const padded = '^'.repeat(maxOrder) + n + '$'
        for (let i = maxOrder; i < padded.length; i++) {
            const nextCh = padded[i]
            for (let o = 0; o <= maxOrder; o++) {
                const ctx = o === 0 ? '' : padded.slice(i - o, i)
                let m = tables[o].get(ctx)
                if (!m) {
                    m = new Map()
                    tables[o].set(ctx, m)
                }
                m.set(nextCh, (m.get(nextCh) || 0) + 1)
            }
        }
    }
    return tables
}

// Linear interpolation of two count tables (blend: 0 = pure A, 1 = pure B).
export const mergeTables = (tablesA: MarkovTable[], tablesB: MarkovTable[], blend: number): MarkovTable[] => {
    const wA = 1 - blend
    const wB = blend
    const merged: MarkovTable[] = []

    for (let o = 0; o < tablesA.length; o++) {
        const m: MarkovTable = new Map()
        const addFrom = (table: MarkovTable, w: number) => {
            if (w <= 0) return
            for (const [ctx, counts] of table.entries()) {
                let dest = m.get(ctx)
                if (!dest) {
                    dest = new Map()
                    m.set(ctx, dest)
                }
                for (const [ch, c] of counts.entries()) {
                    dest.set(ch, (dest.get(ch) || 0) + c * w)
                }
            }
        }
        addFrom(tablesA[o], wA)
        addFrom(tablesB[o], wB)
        merged.push(m)
    }
    return merged
}

// Backoff: try the requested order, fall to lower orders when a context is unseen.
export const getDistribution = (
    tables: MarkovTable[],
    order: number,
    context: string
): Map<string, number> | null => {
    for (let o = order; o >= 0; o--) {
        const ctx = o === 0 ? '' : context.slice(context.length - o)
        const m = tables[o]?.get(ctx)
        if (m && m.size) return m
    }
    return null
}

// rng defaults to Math.random so every existing call site keeps working
// unchanged; callers that need reproducible output (e.g. map generation,
// where the same seed should always name settlements the same way) pass
// their own seeded generator instead.
export const weightedSample = (entries: [string, number][], rng: () => number = Math.random): string => {
    const total = entries.reduce((s, e) => s + e[1], 0)
    if (total <= 0) return entries[0][0]
    let r = rng() * total
    for (const [ch, w] of entries) {
        if (r < w) return ch
        r -= w
    }
    return entries[entries.length - 1][0]
}

export type GenerateOptions = {
    order: number
    temperature: number
    vowelFactor: number
    harshFactor: number
    rarity: number
    minLen: number
    maxLen: number
}

export const generateOne = (tables: MarkovTable[], opts: GenerateOptions, rng: () => number = Math.random): string => {
    const { order, temperature, vowelFactor, harshFactor, rarity, minLen, maxLen } = opts
    let seq = '^'.repeat(MAX_ORDER)
    let result = ''
    const maxSteps = maxLen + 6

    for (let step = 0; step < maxSteps; step++) {
        const context = seq.slice(seq.length - order)
        const dist = getDistribution(tables, order, context)
        if (!dist) break

        let entries = Array.from(dist.entries())

        if (result.length < minLen) {
            entries = entries.filter(([ch]) => ch !== '$')
            if (entries.length === 0) break
        }
        if (result.length >= maxLen) {
            entries = [['$', 1]]
        }

        entries = entries.map(([ch, count]): [string, number] => {
            let w = count
            if (ch !== '$' && ch !== "'") {
                if (VOWELS.has(ch)) w *= vowelFactor
                if (HARD_CONSONANTS.has(ch)) w *= harshFactor
                if (rarity > 0) {
                    // Inverse-frequency tilt: rare transitions (low count) get boosted,
                    // common ones dampened — distinct from temperature, which preserves rank order.
                    const rarityFactor = Math.min(Math.pow(Math.max(count, 0.15), -rarity), 40)
                    w *= rarityFactor
                }
            }
            w = Math.pow(Math.max(w, 1e-6), 1 / temperature)
            return [ch, w]
        })

        const next = weightedSample(entries, rng)
        if (next === '$') break
        result += next
        seq += next
    }
    return result
}

export const isClean = (name: string, minLen: number, maxLen: number): boolean => {
    if (!name || name.length < minLen || name.length > maxLen) return false
    if (/(.)\1{2,}/.test(name)) return false // triple-repeated letter
    return true
}

export const capitalizeName = (s: string): string =>
    s
        .split("'")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("'")

// "Echo" novelty filter: how much a candidate overlaps one single source name,
// measured as Jaccard similarity of their letter-pair (bigram) sets.
export const bigramSet = (s: string): Set<string> => {
    const set = new Set<string>()
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2))
    if (set.size === 0 && s.length === 1) set.add(s)
    return set
}

export const jaccardSimilarity = (a: Set<string>, b: Set<string>): number => {
    if (a.size === 0 && b.size === 0) return 1
    let inter = 0
    for (const x of a) if (b.has(x)) inter++
    const union = a.size + b.size - inter
    return union === 0 ? 1 : inter / union
}

export const maxSourceSimilarity = (nameLower: string, sourceBigramSets: Set<string>[]): number => {
    const cand = bigramSet(nameLower)
    let max = 0
    for (const s of sourceBigramSets) {
        const sim = jaccardSimilarity(cand, s)
        if (sim > max) max = sim
        if (max === 1) break
    }
    return max
}

export type BatchOptions = GenerateOptions & { distinct: number }

export type BatchResult = {
    names: string[]
    rejectedShape: number
    rejectedEcho: number
    attempts: number
}

export const generateBatch = (
    tables: MarkovTable[],
    opts: BatchOptions,
    count: number,
    sourceBigramSets: Set<string>[],
    rng: () => number = Math.random
): BatchResult => {
    const out: string[] = []
    let rejectedShape = 0
    let rejectedEcho = 0
    let attempts = 0
    const cap = Math.max(count * 30, 90)

    while (out.length < count && attempts < cap) {
        attempts++
        const n = generateOne(tables, opts, rng)
        if (!isClean(n, opts.minLen, opts.maxLen)) {
            rejectedShape++
            continue
        }
        if (opts.distinct > 0 && sourceBigramSets.length) {
            const sim = maxSourceSimilarity(n, sourceBigramSets)
            if (sim > 1 - opts.distinct) {
                rejectedEcho++
                continue
            }
        }
        out.push(capitalizeName(n))
    }
    return { names: out, rejectedShape, rejectedEcho, attempts }
}
