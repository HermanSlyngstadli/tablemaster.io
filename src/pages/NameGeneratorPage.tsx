import React, { useState } from 'react'
import { Button } from '../components/Button'
import { GridContainer, GridItem } from '../components/Grid'
import { RefreshIcon } from '../components/icons/RefreshIcon'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { Heading1, Heading2, Paragraph } from '../components/Typography'
import { generateNames, makeNgrams } from '../markovFunctions'
import { names } from '../Names'

export const NameGeneratorPage = () => {
    const [currentNames, setCurrentNames] = useState(['No current names...'])

    const { ngrams, beginnings } = makeNgrams(names, 2)

    const generate = () => {
        const result = []
        while (result.length <= 20) {
            const newName = generateNames(beginnings, ngrams, 2)
            if (!names.includes(newName)) result.push(newName)
        }

        setCurrentNames(result)
    }

    return (
        <PageContainer>
            <SideNavigation />
            <GridContainer>
                <GridItem
                    small="1 / span 12"
                    large="1 / span 5"
                    style={{ borderRight: '2px solid #ddd', paddingRight: '16px' }}
                >
                    <Heading1>Name Generator</Heading1>
                    <label htmlFor="category">
                        Category
                        <select name="category" style={{ padding: '12px 8px', width: '100%' }}>
                            <option>Fantasy name</option>
                        </select>
                    </label>
                    <Button style={{ marginTop: '16px' }} onClick={() => generate()}>
                        <RefreshIcon size={16} color={'#fff'} /> Generate Names
                    </Button>
                </GridItem>
                <GridItem small="1 / span 12" large="6 / span 8" style={{ overflowY: 'scroll' }}>
                    <Heading2 style={{ marginTop: '2.5rem' }}>Results</Heading2>
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
                </GridItem>
            </GridContainer>
        </PageContainer>
    )
}
