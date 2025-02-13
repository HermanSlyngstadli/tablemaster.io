import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { CartIcon } from './icons/CartIcon'
import { DiceIcon } from './icons/DiceIcon'
import { HomeIcon } from './icons/HomeIcon'
import { MapIcon } from './icons/MapIcon'
import { NoteIcon } from './icons/NoteIcon'
import { supabase } from '../supabaseClient'

const NavContainer = styled.nav`
    height: 100vh;
    width: 80px;
    background: #2d142c;
    position: relative;
    z-index: 3;
`

const NavLinkList = styled.div`
    display: flex;
    flex-direction: column;
    padding: 12px;
    gap: 8px;
`

const NavLink = styled.a`
    display: flex;
    height: 56px;
    width: 56px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
        background: #592f57;
    }
`

export const SideNavigation = ({ ...props }) => {
    const [session, setSession] = useState<any>()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        let { error } = await supabase.auth.signOut()
    }

    const signUp = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
        })
    }
    return (
        <NavContainer {...props}>
            <NavLinkList>
                <NavLink href={'/'}>
                    <HomeIcon color={'#fff'} />
                </NavLink>
            </NavLinkList>
            <NavLinkList>
                <NavLink href={'/map-generator'}>
                    <MapIcon color={'#fff'} />
                </NavLink>

                <NavLink href={'/name-generator'}>
                    <DiceIcon color={'#fff'} />
                </NavLink>

                <NavLink href={'/mood-sounds'}>
                    <NoteIcon color={'#fff'} />
                </NavLink>

                <NavLink href={'/magicshop'}>
                    <CartIcon color={'#fff'} />
                </NavLink>
            </NavLinkList>
            <NavLinkList>
                {!session && <button onClick={() => signUp()}>Login</button>}
                {session && <button onClick={() => signOut()}>Logg ut</button>}
            </NavLinkList>
        </NavContainer>
    )
}
