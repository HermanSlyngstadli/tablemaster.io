import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Button } from '../components/Button'
import { RefreshIcon } from '../components/icons/RefreshIcon'
import { MainContent } from '../components/MainContent'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { dyr, monster, names } from '../Names'
import {
    african,
    american,
    angloSaxon,
    arabian,
    chinese,
    dwarven,
    easternEuropean,
    elven,
    germanic,
    gnomish,
    japanese,
    latin,
    latina,
    malay,
    mediterranean,
    nordic,
    norse,
    orcish,
    pacific,
} from '../nameSynthCorpora'
import {
    africanPlace,
    americanPlace,
    angloSaxonPlace,
    arabianPlace,
    chinesePlace,
    dwarvenPlace,
    dyrPlace,
    easternEuropeanPlace,
    elvenPlace,
    germanicPlace,
    gnomishPlace,
    japanesePlace,
    latinaPlace,
    latinPlace,
    malayPlace,
    mediterraneanPlace,
    monsterPlace,
    namesPlace,
    nordicPlace,
    norsePlace,
    orcishPlace,
    pacificPlace,
} from '../placeSynthCorpora'
import {
    bigramSet,
    buildTables,
    generateBatch,
    mergeTables,
    normalizeName,
    type BatchResult,
} from '../nameSynthEngine'
import {
    Chip,
    Details,
    Field,
    Fieldset,
    Heading,
    Label,
    Paragraph,
    Select,
    SelectOption,
    ToggleGroup,
} from '@digdir/designsystemet-react'

const PageHeading = styled(Heading)`
    padding-left: 16px;
    margin-bottom: 0;
    margin-top: 16px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--ds-color-border-subtle);

    @media (max-width: 768px) {
        padding-left: 12px;
        padding-right: 12px;
        margin-top: 8px;
        padding-bottom: 16px;
    }
`

const PageSubtitle = styled(Paragraph)`
    padding: 4px 16px 0;
    color: var(--ds-color-text-subtle);

    @media (max-width: 768px) {
        padding: 4px 12px 0;
    }
`

const GeneratorSection = styled.section`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    min-width: 0;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`

const SettingsPanel = styled.div`
    flex-basis: 340px;
    flex-shrink: 0;
    overflow-y: auto;
    padding: 24px 16px;
    border-right: 1px solid var(--ds-color-border-subtle);

    @media (max-width: 768px) {
        flex-basis: auto;
        padding: 16px 12px;
        border-right: none;
        border-bottom: 1px solid var(--ds-color-border-subtle);
    }
`

const StyledFieldset = styled(Fieldset)`
    margin-bottom: 24px;
`

const BlendField = styled(Field)`
    margin-top: 16px;
`

const BatchSizeField = styled(Field)`
    margin-bottom: 24px;
`

const AdvancedOptions = styled(Details)`
    margin-bottom: 24px;
`

const BlendReadout = styled.span`
    font-variant-numeric: tabular-nums;
    color: var(--ds-color-accent-text-default);
    font-weight: 600;
`

const SliderField = styled.div`
    margin-top: 16px;
`

const SliderHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
`

const SliderReadout = styled.span`
    font-variant-numeric: tabular-nums;
    color: var(--ds-color-accent-text-default);
    font-weight: 600;
    white-space: nowrap;
`

const RangeInput = styled.input`
    width: 100%;
    accent-color: var(--ds-color-accent-base-default);
    margin-top: 6px;
`

const SliderCaption = styled(Paragraph)`
    margin: 4px 0 0;
    color: var(--ds-color-neutral-text-subtle);
`

const GenerateButton = styled(Button)`
    width: 100%;
    justify-content: center;
    margin-top: 24px;
`

const ResultsPanel = styled.div`
    overflow-y: auto;
    flex-grow: 1;
    min-width: 0;
    padding: 16px 24px;
    margin: 8px;
    border-radius: var(--panel-border-radius);
    background-color: var(--ds-color-surface-tinted);
    box-shadow: var(--box-shadow-default);

    @media (max-width: 768px) {
        padding: 12px 16px;
        margin: 0 12px 12px;
        max-height: 60vh;
    }
`

const ResultsHeading = styled(Heading)`
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--ds-color-border-subtle);
`

const ResultsMeta = styled(Paragraph)`
    margin-bottom: 16px;
    color: var(--ds-color-neutral-text-subtle);
`

const NameTape = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`

const NAME_SOURCES = {
    dyr: { label: 'Dyr', list: dyr },
    monster: { label: 'Monster', list: monster },
    names: { label: 'Navn', list: names },
    elven: { label: 'Elven', list: elven },
    dwarven: { label: 'Dwarven', list: dwarven },
    orcish: { label: 'Orcish', list: orcish },
    gnomish: { label: 'Gnomish', list: gnomish },
    nordic: { label: 'Nordic', list: nordic },
    easternEuropean: { label: 'Eastern European', list: easternEuropean },
    arabian: { label: 'Arabian', list: arabian },
    mediterranean: { label: 'Mediterranean', list: mediterranean },
    african: { label: 'African', list: african },
    pacific: { label: 'Pacific', list: pacific },
    angloSaxon: { label: 'Anglo-Saxon', list: angloSaxon },
    latin: { label: 'Latin', list: latin },
    latina: { label: 'Latina', list: latina },
    germanic: { label: 'Germanic', list: germanic },
    chinese: { label: 'Chinese', list: chinese },
    japanese: { label: 'Japanese', list: japanese },
    malay: { label: 'Malay', list: malay },
    american: { label: 'American', list: american },
    norse: { label: 'Norse', list: norse },
} as const

const PLACE_SOURCES = {
    dyr: { label: 'Dyr', list: dyrPlace },
    monster: { label: 'Monster', list: monsterPlace },
    names: { label: 'Navn', list: namesPlace },
    elven: { label: 'Elven', list: elvenPlace },
    dwarven: { label: 'Dwarven', list: dwarvenPlace },
    orcish: { label: 'Orcish', list: orcishPlace },
    gnomish: { label: 'Gnomish', list: gnomishPlace },
    nordic: { label: 'Nordic', list: nordicPlace },
    easternEuropean: { label: 'Eastern European', list: easternEuropeanPlace },
    arabian: { label: 'Arabian', list: arabianPlace },
    mediterranean: { label: 'Mediterranean', list: mediterraneanPlace },
    african: { label: 'African', list: africanPlace },
    pacific: { label: 'Pacific', list: pacificPlace },
    angloSaxon: { label: 'Anglo-Saxon', list: angloSaxonPlace },
    latin: { label: 'Latin', list: latinPlace },
    latina: { label: 'Latina', list: latinaPlace },
    germanic: { label: 'Germanic', list: germanicPlace },
    chinese: { label: 'Chinese', list: chinesePlace },
    japanese: { label: 'Japanese', list: japanesePlace },
    malay: { label: 'Malay', list: malayPlace },
    american: { label: 'American', list: americanPlace },
    norse: { label: 'Norse', list: norsePlace },
} as const

type CategoryKey = 'names' | 'places'

const SOURCES_BY_CATEGORY: Record<CategoryKey, typeof NAME_SOURCES> = {
    names: NAME_SOURCES,
    places: PLACE_SOURCES,
}

type SourceKey = keyof typeof NAME_SOURCES

type ChannelKey = 'order' | 'chaos' | 'rarity' | 'vowels' | 'harsh' | 'distinct' | 'minLen' | 'maxLen'

type Channel = {
    key: ChannelKey
    label: string
    min: number
    max: number
    step: number
    defaultValue: number
    caption: string
}

const CHANNELS: Channel[] = [
    {
        key: 'order',
        label: 'Order',
        min: 1,
        max: 3,
        step: 1,
        defaultValue: 3,
        caption: 'Letters of context per pick. Low = looser, high = closer to the source.',
    },
    {
        key: 'chaos',
        label: 'Chaos',
        min: 0.3,
        max: 2,
        step: 0.05,
        defaultValue: 1,
        caption: 'Sampling temperature. Low = safest letter, high = wildcards.',
    },
    {
        key: 'rarity',
        label: 'Rarity',
        min: 0,
        max: 1,
        step: 0.05,
        defaultValue: 0,
        caption: 'Boosts low-count letter-pairs over common ones.',
    },
    {
        key: 'vowels',
        label: 'Vowels',
        min: 0,
        max: 2,
        step: 0.05,
        defaultValue: 1,
        caption: 'Weights a e i o u y up or down before sampling.',
    },
    {
        key: 'harsh',
        label: 'Harsh',
        min: 0,
        max: 2,
        step: 0.05,
        defaultValue: 1,
        caption: 'Weights hard consonants k g t d x z q p b up or down.',
    },
    {
        key: 'distinct',
        label: 'Distinct',
        min: 0,
        max: 0.9,
        step: 0.05,
        defaultValue: 0,
        caption: 'Rejects names echoing one source name too closely (shared letter-pairs).',
    },
    {
        key: 'minLen',
        label: 'Min length',
        min: 2,
        max: 8,
        step: 1,
        defaultValue: 4,
        caption: 'Shortest allowed name, in letters.',
    },
    {
        key: 'maxLen',
        label: 'Max length',
        min: 4,
        max: 14,
        step: 1,
        defaultValue: 9,
        caption: 'Longest allowed name, in letters.',
    },
]

const defaultChannelValues = Object.fromEntries(CHANNELS.map((c) => [c.key, c.defaultValue])) as Record<
    ChannelKey,
    number
>

const BATCH_SIZES = [5, 8, 10, 15, 20, 24]

export const NameSynthPage = () => {
    const [category, setCategory] = useState<CategoryKey>('names')
    const [sourceA, setSourceA] = useState<SourceKey>('monster')
    const [sourceB, setSourceB] = useState<SourceKey>('names')
    const [blend, setBlend] = useState(0)
    const [channelValues, setChannelValues] = useState<Record<ChannelKey, number>>(defaultChannelValues)
    const [batchSize, setBatchSize] = useState(8)
    const [results, setResults] = useState<BatchResult | null>(null)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    const SOURCES = SOURCES_BY_CATEGORY[category]

    const tablesA = useMemo(() => buildTables(SOURCES[sourceA].list), [SOURCES, sourceA])
    const tablesB = useMemo(() => buildTables(SOURCES[sourceB].list), [SOURCES, sourceB])
    const mergedTables = useMemo(() => mergeTables(tablesA, tablesB, blend / 100), [tablesA, tablesB, blend])

    const sourceBigramSets = useMemo(
        () =>
            SOURCES[sourceA].list
                .concat(SOURCES[sourceB].list)
                .map(normalizeName)
                .filter(Boolean)
                .map(bigramSet),
        [SOURCES, sourceA, sourceB]
    )

    const handleCategoryChange = (value: string) => {
        setCategory(value as CategoryKey)
        setResults(null)
        setCopiedIndex(null)
    }

    const setChannel = (key: ChannelKey, value: number) => {
        setChannelValues((prev) => {
            const next = { ...prev, [key]: value }
            if (key === 'minLen' && value > next.maxLen) next.maxLen = value
            if (key === 'maxLen' && value < next.minLen) next.minLen = value
            return next
        })
    }

    const generate = () => {
        const opts = {
            order: Math.round(channelValues.order),
            temperature: channelValues.chaos,
            vowelFactor: channelValues.vowels,
            harshFactor: channelValues.harsh,
            rarity: channelValues.rarity,
            distinct: channelValues.distinct,
            minLen: Math.round(channelValues.minLen),
            maxLen: Math.round(channelValues.maxLen),
        }
        setResults(generateBatch(mergedTables, opts, batchSize, sourceBigramSets))
        setCopiedIndex(null)
    }

    const handleCopy = (name: string, index: number) => {
        navigator.clipboard?.writeText(name).catch(() => {})
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 700)
    }

    const totalRejected = results ? results.rejectedShape + results.rejectedEcho : 0
    const rejectionNotes = results
        ? [
              results.rejectedShape ? `${results.rejectedShape} shape` : null,
              results.rejectedEcho ? `${results.rejectedEcho} echo` : null,
          ].filter(Boolean)
        : []

    return (
        <PageContainer>
            <SideNavigation />
            <MainContent>
                <PageHeading level={1} data-size="lg">
                    Name Synth
                </PageHeading>
                <PageSubtitle data-size="sm">
                    An experimental version of the name generator: blend two sources and dial in order, chaos and
                    phonology bias.
                </PageSubtitle>
                <GeneratorSection>
                    <SettingsPanel>
                        <StyledFieldset>
                            <Fieldset.Legend data-size="md">Category</Fieldset.Legend>
                            <ToggleGroup value={category} onChange={handleCategoryChange} name="category">
                                <ToggleGroup.Item value="names">Names</ToggleGroup.Item>
                                <ToggleGroup.Item value="places">Places</ToggleGroup.Item>
                            </ToggleGroup>
                        </StyledFieldset>

                        <StyledFieldset>
                            <Fieldset.Legend data-size="md">Sources</Fieldset.Legend>
                            <Field>
                                <Label>Source A</Label>
                                <Select
                                    name="sourceA"
                                    value={sourceA}
                                    onChange={(e) => setSourceA(e.target.value as SourceKey)}
                                >
                                    {Object.entries(SOURCES).map(([key, { label }]) => (
                                        <SelectOption key={key} value={key}>
                                            {label}
                                        </SelectOption>
                                    ))}
                                </Select>
                            </Field>
                            <BlendField>
                                <Label>Source B</Label>
                                <Select
                                    name="sourceB"
                                    value={sourceB}
                                    onChange={(e) => setSourceB(e.target.value as SourceKey)}
                                >
                                    {Object.entries(SOURCES).map(([key, { label }]) => (
                                        <SelectOption key={key} value={key}>
                                            {label}
                                        </SelectOption>
                                    ))}
                                </Select>
                            </BlendField>
                            <SliderField>
                                <SliderHeader>
                                    <Label htmlFor="blend">A ↔ B blend</Label>
                                    <SliderReadout>{blend}% B</SliderReadout>
                                </SliderHeader>
                                <RangeInput
                                    id="blend"
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={blend}
                                    onChange={(e) => setBlend(Number(e.target.value))}
                                    aria-label="Blend between source A and source B"
                                />
                            </SliderField>
                        </StyledFieldset>

                        <BatchSizeField>
                            <Label>Batch size</Label>
                            <Select
                                name="batchSize"
                                value={batchSize}
                                onChange={(e) => setBatchSize(Number(e.target.value))}
                            >
                                {BATCH_SIZES.map((size) => (
                                    <SelectOption key={size} value={size}>
                                        {size}
                                    </SelectOption>
                                ))}
                            </Select>
                        </BatchSizeField>

                        <AdvancedOptions defaultOpen={false}>
                            <Details.Summary>Advanced options</Details.Summary>
                            <Details.Content>
                                <Fieldset>
                                    <Fieldset.Legend data-size="md">Phonology</Fieldset.Legend>
                                    {CHANNELS.map((channel) => (
                                        <SliderField key={channel.key}>
                                            <SliderHeader>
                                                <Label htmlFor={`ctl-${channel.key}`}>{channel.label}</Label>
                                                <SliderReadout>
                                                    {channel.step < 1
                                                        ? channelValues[channel.key].toFixed(2)
                                                        : channelValues[channel.key]}
                                                </SliderReadout>
                                            </SliderHeader>
                                            <RangeInput
                                                id={`ctl-${channel.key}`}
                                                type="range"
                                                min={channel.min}
                                                max={channel.max}
                                                step={channel.step}
                                                value={channelValues[channel.key]}
                                                onChange={(e) => setChannel(channel.key, Number(e.target.value))}
                                                aria-label={channel.label}
                                            />
                                            <SliderCaption data-size="xs">{channel.caption}</SliderCaption>
                                        </SliderField>
                                    ))}
                                </Fieldset>
                            </Details.Content>
                        </AdvancedOptions>

                        <GenerateButton onClick={generate}>
                            <RefreshIcon size={16} color="currentColor" /> Generate names
                        </GenerateButton>
                    </SettingsPanel>
                    <ResultsPanel>
                        <ResultsHeading level={2} data-size="md">
                            Results
                        </ResultsHeading>
                        {results ? (
                            <>
                                <ResultsMeta data-size="sm">
                                    {results.names.length} kept
                                    {totalRejected > 0 ? ` · ${totalRejected} rejected (${rejectionNotes.join(', ')})` : ''}
                                </ResultsMeta>
                                {results.names.length === 0 ? (
                                    <Paragraph>
                                        No clean names survived — loosen chaos, rarity, distinct, or the length range.
                                    </Paragraph>
                                ) : (
                                    <NameTape>
                                        {results.names.map((name, index) => (
                                            <Chip.Button
                                                key={index}
                                                title="Click to copy"
                                                data-color={copiedIndex === index ? 'success' : undefined}
                                                onClick={() => handleCopy(name, index)}
                                            >
                                                {name}
                                            </Chip.Button>
                                        ))}
                                    </NameTape>
                                )}
                            </>
                        ) : (
                            <Paragraph>No current names...</Paragraph>
                        )}
                    </ResultsPanel>
                </GeneratorSection>
            </MainContent>
        </PageContainer>
    )
}
