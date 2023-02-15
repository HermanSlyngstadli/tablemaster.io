import React from 'react'
import styled from 'styled-components'
import { DiceIcon } from './icons/DiceIcon'
import { GlobeIcon } from './icons/GlobeIcon'
import { HomeIcon } from './icons/HomeIcon'
import { NoteIcon } from './icons/NoteIcon'

const NavContainer = styled.nav`
    height: 100vh;
    width: 80px;
    background: #2d142c;
    position: relative;
    z-index: 3;
`

const NavLinkList = styled.div`
    padding: 12px;
`

const NavLink = styled.a`
    display: flex;
    height: 56px;
    width: 56px;
    margin-bottom: 16px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
        background: #592f57;
    }
`

export const SideNavigation = ({ ...props }) => {
    return (
        <NavContainer {...props}>
            <NavLinkList>
                <NavLink href={'/'}>
                    <HomeIcon color={'#fff'} />
                </NavLink>
            </NavLinkList>
            <NavLinkList>
                <NavLink href={'/map-generator'}>
                    <GlobeIcon color={'#fff'} />
                </NavLink>

                <NavLink href={'/name-generator'}>
                    <DiceIcon color={'#fff'} />
                </NavLink>

                <NavLink href={'/mood-sounds'}>
                    <NoteIcon color={'#fff'} />
                </NavLink>
            </NavLinkList>
        </NavContainer>
    )
}
