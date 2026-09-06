import React from 'react'
import styled from 'styled-components'
import { Checkbox, Select } from '@digdir/designsystemet-react'
import { Button } from '../Button'
import { MapConfig } from '../../mapgen/generate'
import { TemplateName, TEMPLATES } from '../../mapgen/heightmap'
import { RenderOptions } from '../../mapgen/renderOptions'

const Panel = styled.div`
    width: 260px;
    flex-shrink: 0;
    /* A flex item that's itself flex-direction: column defaults to
       min-height: auto, which lets it grow to fit all its content instead
       of respecting the height the row flex above stretches it to — which
       silently defeats overflow-y: auto below. This is the fix. */
    min-height: 0;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
    border-right: 1px solid var(--ds-color-border-subtle);

    /* Stop scroll chaining at the panel's own top/bottom — without this,
       once the panel can't scroll any further, the wheel event keeps going
       and scrolls the page underneath it instead. */
    overscroll-behavior-y: contain;
`

const DialGroup = styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.85rem;
`

const DialHeader = styled.span`
    display: flex;
    justify-content: space-between;
`

const DialValue = styled.span`
    opacity: 0.7;
    font-variant-numeric: tabular-nums;
`

const SectionLabel = styled.span`
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05rem;
    opacity: 0.6;
    margin-top: 4px;
`

type Props = {
    config: MapConfig
    onChange: (config: MapConfig) => void
    onRandomizeSeed: () => void
    renderOptions: RenderOptions
    onRenderOptionsChange: (options: RenderOptions) => void
}

export const DialsPanel = ({ config, onChange, onRandomizeSeed, renderOptions, onRenderOptionsChange }: Props) => {
    const set = <K extends keyof MapConfig>(key: K, value: MapConfig[K]) => onChange({ ...config, [key]: value })
    const setRender = <K extends keyof RenderOptions>(key: K, value: RenderOptions[K]) =>
        onRenderOptionsChange({ ...renderOptions, [key]: value })

    return (
        <Panel>
            <DialGroup>
                Template
                <Select value={config.template} onChange={(e) => set('template', e.target.value as TemplateName)}>
                    {TEMPLATES.map((t) => (
                        <Select.Option key={t.value} value={t.value}>
                            {t.label}
                        </Select.Option>
                    ))}
                </Select>
            </DialGroup>

            <DialGroup>
                <DialHeader>
                    Cell count <DialValue>{config.cellCount}</DialValue>
                </DialHeader>
                <input
                    type="range"
                    min={500}
                    max={50000}
                    step={500}
                    value={config.cellCount}
                    onChange={(e) => set('cellCount', Number(e.target.value))}
                />
            </DialGroup>

            <DialGroup>
                <DialHeader>
                    Sea level <DialValue>{config.seaLevel}</DialValue>
                </DialHeader>
                <input
                    type="range"
                    min={0}
                    max={60}
                    value={config.seaLevel}
                    onChange={(e) => set('seaLevel', Number(e.target.value))}
                />
            </DialGroup>

            <DialGroup>
                <DialHeader>
                    Relaxation passes <DialValue>{config.relaxIterations}</DialValue>
                </DialHeader>
                <input
                    type="range"
                    min={0}
                    max={6}
                    value={config.relaxIterations}
                    onChange={(e) => set('relaxIterations', Number(e.target.value))}
                />
            </DialGroup>

            <SectionLabel>Rendering</SectionLabel>

            <Checkbox
                label="Show coastline"
                checked={renderOptions.showCoastline}
                onChange={(e) => setRender('showCoastline', e.target.checked)}
            />

            <DialGroup>
                <DialHeader>
                    Coastline smoothing <DialValue>{renderOptions.coastlineSmoothing}</DialValue>
                </DialHeader>
                <input
                    type="range"
                    min={0}
                    max={3}
                    disabled={!renderOptions.showCoastline}
                    value={renderOptions.coastlineSmoothing}
                    onChange={(e) => setRender('coastlineSmoothing', Number(e.target.value))}
                />
            </DialGroup>

            <Checkbox
                label="Show rivers"
                checked={renderOptions.showRivers}
                onChange={(e) => setRender('showRivers', e.target.checked)}
            />

            <DialGroup>
                <DialHeader>
                    River density <DialValue>{renderOptions.riverDensity}%</DialValue>
                </DialHeader>
                <input
                    type="range"
                    min={1}
                    max={30}
                    disabled={!renderOptions.showRivers}
                    value={renderOptions.riverDensity}
                    onChange={(e) => setRender('riverDensity', Number(e.target.value))}
                />
            </DialGroup>

            <Checkbox
                label="Show lakes"
                checked={renderOptions.showLakes}
                onChange={(e) => setRender('showLakes', e.target.checked)}
            />

            <Checkbox
                label="Show biomes"
                checked={renderOptions.showBiomes}
                onChange={(e) => setRender('showBiomes', e.target.checked)}
            />

            <DialGroup>
                <DialHeader>
                    Temperature bias <DialValue>{renderOptions.temperatureBias}</DialValue>
                </DialHeader>
                <input
                    type="range"
                    min={-15}
                    max={15}
                    disabled={!renderOptions.showBiomes}
                    value={renderOptions.temperatureBias}
                    onChange={(e) => setRender('temperatureBias', Number(e.target.value))}
                />
            </DialGroup>

            <DialGroup>
                <DialHeader>
                    Moisture bias <DialValue>{renderOptions.moistureBias}</DialValue>
                </DialHeader>
                <input
                    type="range"
                    min={-30}
                    max={30}
                    disabled={!renderOptions.showBiomes}
                    value={renderOptions.moistureBias}
                    onChange={(e) => setRender('moistureBias', Number(e.target.value))}
                />
            </DialGroup>

            <Checkbox
                label="Show settlements"
                checked={renderOptions.showSettlements}
                onChange={(e) => setRender('showSettlements', e.target.checked)}
            />

            <DialGroup>
                <DialHeader>
                    Settlement count <DialValue>{renderOptions.settlementCount}</DialValue>
                </DialHeader>
                <input
                    type="range"
                    min={1}
                    max={150}
                    disabled={!renderOptions.showSettlements}
                    value={renderOptions.settlementCount}
                    onChange={(e) => setRender('settlementCount', Number(e.target.value))}
                />
            </DialGroup>

            <Checkbox
                label="Show roads"
                checked={renderOptions.showRoads}
                onChange={(e) => setRender('showRoads', e.target.checked)}
            />

            <Checkbox
                label="Show regions"
                checked={renderOptions.showRegions}
                onChange={(e) => setRender('showRegions', e.target.checked)}
            />

            <DialGroup>
                <DialHeader>
                    Region count <DialValue>{renderOptions.regionCount}</DialValue>
                </DialHeader>
                {/* Not disabled by the checkbox above — regions are always
                    computed (for naming), the checkbox only toggles drawing
                    the overlay, so this stays live either way. */}
                <input
                    type="range"
                    min={1}
                    max={12}
                    value={renderOptions.regionCount}
                    onChange={(e) => setRender('regionCount', Number(e.target.value))}
                />
            </DialGroup>

            <Checkbox
                label="Show states"
                checked={renderOptions.showStates}
                onChange={(e) => setRender('showStates', e.target.checked)}
            />

            <DialGroup>
                <DialHeader>
                    State count <DialValue>{renderOptions.stateCount}</DialValue>
                </DialHeader>
                <input
                    type="range"
                    min={1}
                    max={12}
                    value={renderOptions.stateCount}
                    onChange={(e) => setRender('stateCount', Number(e.target.value))}
                />
            </DialGroup>

            <Checkbox
                label="Show points of interest"
                checked={renderOptions.showPois}
                onChange={(e) => setRender('showPois', e.target.checked)}
            />

            <DialGroup>
                <DialHeader>
                    POI count <DialValue>{renderOptions.poiCount}</DialValue>
                </DialHeader>
                <input
                    type="range"
                    min={1}
                    max={40}
                    disabled={!renderOptions.showPois}
                    value={renderOptions.poiCount}
                    onChange={(e) => setRender('poiCount', Number(e.target.value))}
                />
            </DialGroup>

            <Button onClick={onRandomizeSeed}>New Seed</Button>
        </Panel>
    )
}
