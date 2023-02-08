import React from 'react'
import styled from 'styled-components'
import { SideNavigation } from './components/SideNavigation'
import { NameGenerator } from './Name'

const PageContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: row;
`

function App() {
    return (
        <PageContainer>
            <SideNavigation />
            <NameGenerator />
        </PageContainer>
    )
}
export default App
