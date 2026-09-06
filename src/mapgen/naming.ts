import { Rng } from './rng'
import {
    elvenPlace,
    dwarvenPlace,
    orcishPlace,
    gnomishPlace,
    nordicPlace,
    angloSaxonPlace,
    arabianPlace,
    mediterraneanPlace,
    norsePlace,
    dyrPlace,
} from '../placeSynthCorpora'

// A curated subset of the existing place-name corpora — enough stylistic
// range for a fantasy map without dumping all ~20 categories into one
// dropdown. Reuses the same Markov engine as the standalone Name Synth page.
//
// Shared by regions, states, settlements, and points of interest — all of
// them draw from this same list so a region/state's assigned style and a
// settlement/POI's resolved style always mean the same corpus.
export const NAMING_STYLES = [
    { value: 'nordic', label: 'Nordic', corpus: nordicPlace },
    { value: 'elven', label: 'Elven', corpus: elvenPlace },
    { value: 'dwarven', label: 'Dwarven', corpus: dwarvenPlace },
    { value: 'orcish', label: 'Orcish', corpus: orcishPlace },
    { value: 'gnomish', label: 'Gnomish', corpus: gnomishPlace },
    { value: 'angloSaxon', label: 'Anglo-Saxon', corpus: angloSaxonPlace },
    { value: 'arabian', label: 'Arabian', corpus: arabianPlace },
    { value: 'mediterranean', label: 'Mediterranean', corpus: mediterraneanPlace },
    { value: 'norse', label: 'Norse', corpus: norsePlace },
    { value: 'dyr', label: 'Dyr (Norwegian)', corpus: dyrPlace },
] as const

export type NamingStyle = (typeof NAMING_STYLES)[number]['value']

export function findNamingStyle(value: NamingStyle) {
    return NAMING_STYLES.find((s) => s.value === value) ?? NAMING_STYLES[0]
}

// A random permutation of the style list, so a set of regions/states each
// get a distinct style (cycling with modulo only once there are more
// regions/states than styles) instead of all rolling the same one by chance.
export function shuffledNamingStyles(rng: Rng) {
    const styles = [...NAMING_STYLES]
    for (let i = styles.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[styles[i], styles[j]] = [styles[j], styles[i]]
    }
    return styles
}

// The rule for "what style does this place's name come from": a state's
// style wins if the cell belongs to one (political naming — a kingdom's
// cities and points of interest all sound the same), otherwise fall back to
// the underlying region/culture's style (regions cover all land, so this
// only misses if a cell somehow belongs to neither — a last-resort default
// covers that). This is why settlements and POIs must be named *after*
// states and regions are both known, not at placement time.
export function resolveNamingStyle(
    cell: number,
    stateOwner: Int32Array,
    stateStyles: NamingStyle[],
    regionOwner: Int32Array,
    regionStyles: NamingStyle[],
    fallback: NamingStyle = 'nordic'
): NamingStyle {
    const stateId = stateOwner[cell]
    if (stateId !== -1 && stateStyles[stateId]) return stateStyles[stateId]

    const regionId = regionOwner[cell]
    if (regionId !== -1 && regionStyles[regionId]) return regionStyles[regionId]

    return fallback
}
