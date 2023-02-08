import React, { useState } from 'react'
import { GridContainer, GridItem } from './components/Grid'
import { Heading1, Heading2, Paragraph } from './components/Typography'
import { generateNames, makeNgrams } from './markovFunctions'
import { names } from './Names'

export const NameGenerator = () => {
    const [currentNames, setCurrentNames] = useState(['No current names...'])

    const { ngrams, beginnings } = makeNgrams(names, 2)

    console.log()

    const generate = () => {
        const result = []
        for (let i = 0; i <= 10; i++) {
            result.push(generateNames(beginnings, ngrams, 2))
        }
        setCurrentNames(result)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100%' }}>
            <nav style={{ width: '300px', height: '100vh', backgroundColor: '#fafafa' }}>sdsd</nav>
            <GridContainer>
                <GridItem small="1 / span 12" large="1 / span 5">
                    <Heading1>Name Generator</Heading1>
                    <label htmlFor="category">
                        Category
                        <select name="category" style={{ padding: '12px 8px', width: '100%' }}>
                            <option>Fantasy name</option>
                        </select>
                    </label>
                    <button onClick={() => generate()}>Generate names</button>
                </GridItem>
                <GridItem small="1 / span 12" large="7 / span 6">
                    <Heading2 style={{ marginTop: '2.5rem' }}>Results</Heading2>
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
        </div>
    )
}
