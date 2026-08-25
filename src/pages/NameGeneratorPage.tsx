import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Button } from '../components/Button'
import { RefreshIcon } from '../components/icons/RefreshIcon'
import { MainContent } from '../components/MainContent'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { generateNames, makeNgrams } from '../markovFunctions'
import { dyr, monster, names } from '../Names'
import { Field, Fieldset, Heading, Label, Paragraph, Select, SelectOption } from '@digdir/designsystemet-react'

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
    flex-basis: 300px;
    flex-shrink: 0;
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
    max-width: 300px;

    @media (max-width: 768px) {
        max-width: none;
    }
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

const GenerateButton = styled(Button)`
    width: 100%;
    justify-content: center;
    margin-top: var(--ds-size-16);
`

const DATASETS = {
    dyr: { label: 'Dyr', list: dyr },
    monster: { label: 'Monster', list: monster },
    names: { label: 'Names', list: names },
} as const

type DatasetKey = keyof typeof DATASETS

export const NameGeneratorPage = () => {
    const [currentNames, setCurrentNames] = useState(['No current names...'])
    const [numberOfNames, setNumberOfNames] = useState({ value: 10 })
    const [maxNameLength, setmaxNameLength] = useState({ value: 6 })
    const [dataset, setDataset] = useState<DatasetKey>('monster')
    const nameList = DATASETS[dataset].list

    const { ngrams, beginnings } = useMemo(() => makeNgrams(nameList, 2), [nameList])

    const generate = () => {
        const result = []
        while (result.length <= numberOfNames.value - 1) {
            const newName = generateNames(beginnings, ngrams, 2, maxNameLength.value)
            if (!nameList.includes(newName)) result.push(newName)
        }

        setCurrentNames(result)
    }

    return (
        <PageContainer>
            <SideNavigation />
            <MainContent>
                <PageHeading level={1} data-size="lg">
                    Name Generator
                </PageHeading>
                <GeneratorSection>
                    <SettingsPanel>
                        <StyledFieldset>
                            <Fieldset.Legend data-size="md">Settings</Fieldset.Legend>
                            <Field>
                                <Label>Dataset</Label>
                                <Select
                                    name="dataset"
                                    value={dataset}
                                    onChange={(e) => setDataset(e.target.value as DatasetKey)}
                                >
                                    {Object.entries(DATASETS).map(([key, { label }]) => (
                                        <SelectOption key={key} value={key}>
                                            {label}
                                        </SelectOption>
                                    ))}
                                </Select>
                            </Field>
                            <Field>
                                <Label>Number of names</Label>
                                <Select
                                    name="numberOfResults"
                                    value={numberOfNames.value}
                                    onChange={(e) => setNumberOfNames({ value: Number(e.target.value) })}
                                >
                                    <SelectOption value={10}>10</SelectOption>
                                    <SelectOption value={15}>15</SelectOption>
                                    <SelectOption value={20}>20</SelectOption>
                                </Select>
                            </Field>
                            <Field>
                                <Label>Max name length</Label>
                                <Select
                                    name="lengthOfNames"
                                    value={maxNameLength.value}
                                    onChange={(e) => setmaxNameLength({ value: Number(e.target.value) })}
                                >
                                    <SelectOption value={5}>5</SelectOption>
                                    <SelectOption value={6}>6</SelectOption>
                                    <SelectOption value={7}>7</SelectOption>
                                    <SelectOption value={8}>8</SelectOption>
                                    <SelectOption value={9}>9</SelectOption>
                                    <SelectOption value={10}>10</SelectOption>
                                </Select>
                            </Field>
                        </StyledFieldset>
                        <GenerateButton onClick={() => generate()}>
                            <RefreshIcon size={16} color="currentColor" /> Generate names
                        </GenerateButton>
                    </SettingsPanel>
                    <ResultsPanel>
                        <ResultsHeading level={2} data-size="md">
                            Results
                        </ResultsHeading>
                        <div>
                            {currentNames.map((name, index) => {
                                return (
                                    <Paragraph key={index + 'sdfs'}>
                                        {name.charAt(0).toUpperCase() + name.slice(1)}
                                    </Paragraph>
                                )
                            })}
                        </div>
                    </ResultsPanel>
                </GeneratorSection>
            </MainContent>
        </PageContainer>
    )
}
