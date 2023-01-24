import React, { useState } from 'react'
import styled from 'styled-components'
import { SideNavigation } from './components/SideNavigation'
import MapGenerator from './MapGenerator'
import { NameGenerator } from './Name'

const PageContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: row;
`

const SidePanel = styled.div`
    width: 300px;
    padding: 24px;
    box-shadow: var(--box-shadow-default);
    background-color: var(--panel-bg-color);
    position: relative;
    z-index: 2;
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
