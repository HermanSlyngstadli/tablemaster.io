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
    width: 60px;
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
    height: 36px;
    width: 36px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
        background: #592f57;
    }
`

export const SideNavigation = ({ ...props }) => {
    /*
    const [session, setSession] = useState<any>()
    const [profileImageURL, setProfileImageURL] = useState<string>()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            console.log(session?.user.user_metadata)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])*/

    const signOut = async () => {
        let { error } = await supabase.auth.signOut()
    }

    const signUp = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: import.meta.env.VITE_GOOGLE_REDIRECT_URL },
        })
    }
    return (
        <NavContainer {...props}>
            <NavLinkList>
                <NavLink href={'/'}>
                    <HomeIcon color={'#fff'} size={16} />
                </NavLink>
            </NavLinkList>
            <NavLinkList>
                <NavLink href={'/map'}>
                    <MapIcon color={'#fff'} size={16} />
                </NavLink>

                <NavLink href={'/name-generator'}>
                    <DiceIcon color={'#fff'} size={16} />
                </NavLink>

                <NavLink href={'/soundscape'}>
                    <NoteIcon color={'#fff'} size={16} />
                </NavLink>

                <NavLink href={'/shop'}>
                    <CartIcon color={'#fff'} size={16} />
                </NavLink>
            </NavLinkList>
        </NavContainer>
    )
}

/*

            <NavLinkList>
                {!session && <button onClick={() => signUp()}>Login</button>}
                {session && <button onClick={() => signOut()}>Logg ut</button>}
            </NavLinkList>*/
