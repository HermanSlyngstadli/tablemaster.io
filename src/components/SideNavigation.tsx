import React from 'react'
import styled from 'styled-components'

const NavContainer = styled.nav`
    height: 100vh;
    width: 80px;
    overflow: hidden;
    background: #2d142c;
    position: relative;
    z-index: 3;
`

const Logo = styled.div`
    background: #510a32;
    padding: 32px;
`

const NavLinks = styled.div`
    padding: 12px;
`

const NavLink = styled.a`
    display: block;
`

export const SideNavigation = ({ ...props }) => {
    return (
        <NavContainer {...props}>
            <Logo />
            <NavLinks>
                <NavLink></NavLink>
            </NavLinks>
        </NavContainer>
    )
}
