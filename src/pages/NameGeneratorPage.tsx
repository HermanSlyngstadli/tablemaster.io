import React, { useState } from 'react'
import { Button } from '../components/Button'
import { RefreshIcon } from '../components/icons/RefreshIcon'
import { MainContent } from '../components/MainContent'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { generateNames, makeNgrams } from '../markovFunctions'
import { dyr, monster, names } from '../Names'
import { Field, Heading, Label, Paragraph, Select, SelectOption } from '@digdir/designsystemet-react'

export const NameGeneratorPage = () => {
    const [currentNames, setCurrentNames] = useState(['No current names...'])
    const [numberOfNames, setNumberOfNames] = useState({ value: 10 })
    const [maxNameLength, setmaxNameLength] = useState({ value: 6 })
    const nameList = monster

    const { ngrams, beginnings } = makeNgrams(nameList, 2)

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
                <Heading
                    style={{
                        paddingLeft: '16px',
                        marginBottom: '0',
                        marginTop: '16px',
                        paddingBottom: '24px',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    Name Generator
                </Heading>
                <section style={{ display: 'flex', flexDirection: 'row', flexGrow: '1' }}>
                    <div
                        style={{
                            flexBasis: '300px',
                            padding: '16px',
                        }}
                    >
                        <Heading data-size="xl" level={2}>
                            Settings
                        </Heading>
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
                                <option value={5}>5</option>
                                <option value={6}>6</option>
                                <option value={7}>7</option>
                                <option value={8}>8</option>
                                <option value={9}>9</option>
                                <option value={10}>10</option>
                            </Select>
                        </Field>
                        <Button onClick={() => generate()}>
                            <RefreshIcon size={16} color={'#fff'} /> Generate names
                        </Button>
                    </div>
                    <div
                        style={{
                            overflowY: 'scroll',
                            flexGrow: '1',
                            padding: '16px',
                            margin: '8px',
                            borderRadius: '16px',
                            backgroundColor: '#fafafa',
                            boxShadow: '0 0 10px #ddd',
                        }}
                    >
                        <Heading>Results</Heading>
                        <hr />
                        <div>
                            {currentNames.map((name, index) => {
                                return (
                                    <Paragraph key={index + 'sdfs'}>
                                        {name.charAt(0).toUpperCase() + name.slice(1)}
                                    </Paragraph>
                                )
                            })}
                        </div>
                    </div>
                </section>
            </MainContent>
        </PageContainer>
    )
}
