import React, { useState } from 'react'
import { Button } from '../components/Button'
import { RefreshIcon } from '../components/icons/RefreshIcon'
import { MainContent } from '../components/MainContent'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { Heading1, Heading2, Label, Paragraph } from '../components/Typography'
import { generateNames, makeNgrams } from '../markovFunctions'
import { dyr, monster, names } from '../Names'

export const NameGeneratorPage = () => {
    const [currentNames, setCurrentNames] = useState(['No current names...'])
    const [numberOfNames, setNumberOfNames] = useState({ value: 10 })
    const [maxNameLength, setmaxNameLength] = useState({ value: 6 })
    const nameList = monster

    const { ngrams, beginnings } = makeNgrams(nameList, 2)

    const generate = () => {
        const result = []
        while (result.length <= numberOfNames.value) {
            const newName = generateNames(beginnings, ngrams, 2, maxNameLength.value)
            if (!nameList.includes(newName)) result.push(newName)
        }

        setCurrentNames(result)
    }

    return (
        <PageContainer>
            <SideNavigation />
            <MainContent>
                <Heading1
                    style={{
                        paddingLeft: '16px',
                        marginBottom: '0',
                        marginTop: '16px',
                        paddingBottom: '24px',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    Name Generator
                </Heading1>
                <section style={{ display: 'flex', flexDirection: 'row', flexGrow: '1' }}>
                    <div
                        style={{
                            flexBasis: '300px',
                            padding: '16px',
                            borderRight: '1px solid #ccc',
                            backgroundColor: '#eee',
                        }}
                    >
                        <Heading2>Settings</Heading2>
                        <Label htmlFor="numberOfResults">
                            Number of names
                            <select
                                name="numberOfResults"
                                style={{ padding: '12px 8px', width: '100%' }}
                                value={numberOfNames.value}
                                onChange={(e) => setNumberOfNames({ value: Number(e.target.value) })}
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                            </select>
                        </Label>
                        <Label htmlFor="lengthOfNames">
                            Max name length
                            <select
                                name="lengthOfNames"
                                style={{ padding: '12px 8px', width: '100%' }}
                                value={maxNameLength.value}
                                onChange={(e) => setmaxNameLength({ value: Number(e.target.value) })}
                            >
                                <option value={5}>5</option>
                                <option value={6}>6</option>
                                <option value={7}>7</option>
                                <option value={8}>8</option>
                                <option value={9}>9</option>
                                <option value={10}>10</option>
                            </select>
                        </Label>
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
                        <Heading2>Results</Heading2>
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
