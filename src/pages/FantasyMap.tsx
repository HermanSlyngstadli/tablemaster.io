import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { MapCanvas } from '../components/mapgen/MapCanvas'
import { DialsPanel } from '../components/mapgen/DialsPanel'
import { defaultMapConfig, generateMap, MapConfig } from '../mapgen/generate'
import { randomSeed } from '../mapgen/rng'
import { defaultRenderOptions, RenderOptions } from '../mapgen/renderOptions'

// PageContainer's own flex-grow: 1 is a no-op here — its parent (rendered
// through ThemeProvider, a plain context provider with no DOM element of
// its own) isn't a flex container, so PageContainer never actually had a
// bounded height; it sized to its content and the *document* scrolled
// natively, dragging the whole page (side nav included) with it. An
// explicit height, not inherited flex sizing, is what actually bounds it:
// the side nav fills it exactly (same 100vh, so the two agree by
// definition), the dial panel scrolls internally within it, and the map
// area stretches to fill whatever's left — none of them touch the page's
// own (now nonexistent) scroll.
const FixedPageContainer = styled(PageContainer)`
    height: 100vh;
    overflow: hidden;
`

const MapArea = styled.div`
    flex-grow: 1;
    position: relative;
    overflow: hidden;
`

export const FantasyMap = () => {
    const [config, setConfig] = useState<MapConfig>(defaultMapConfig)
    const [renderOptions, setRenderOptions] = useState<RenderOptions>(defaultRenderOptions)

    // Regenerating is just "run the pipeline again with a new config" — no
    // hidden state to keep in sync, so any terrain dial can drive it
    // directly. renderOptions is kept separate on purpose: those are
    // cosmetic (coastline smoothing, layer toggles) and only need a redraw,
    // not a terrain regeneration.
    const model = useMemo(() => generateMap(config), [config])

    return (
        <FixedPageContainer>
            <SideNavigation />
            <DialsPanel
                config={config}
                onChange={setConfig}
                onRandomizeSeed={() => setConfig((c) => ({ ...c, seed: randomSeed() }))}
                renderOptions={renderOptions}
                onRenderOptionsChange={setRenderOptions}
            />
            <MapArea>
                <MapCanvas model={model} renderOptions={renderOptions} />
            </MapArea>
        </FixedPageContainer>
    )
}
