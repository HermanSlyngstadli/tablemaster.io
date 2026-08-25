import React, { useState, useRef, useEffect } from 'react'
import { Avatar } from '@digdir/designsystemet-react'
import { useAuth } from '../contexts/AuthContext'
import styled from 'styled-components'

const TopMenuContainer = styled.header`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 1rem 2rem;
    background-color: var(--ds-color-surface-default);
    border-bottom: 1px solid var(--ds-color-border-subtle);
    position: relative;
    z-index: 100;
`

const AvatarButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.05);
    }

    &:focus {
        outline: 2px solid var(--ds-color-border-focus);
        outline-offset: 2px;
    }
`

const DropdownContainer = styled.div`
    position: relative;
`

const DropdownMenu = styled.div<{ isOpen: boolean }>`
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background-color: var(--ds-color-surface-default);
    border: 1px solid var(--ds-color-border-subtle);
    border-radius: 0.5rem;
    box-shadow: var(--box-shadow-default);
    min-width: 200px;
    display: ${(props) => (props.isOpen ? 'block' : 'none')};
    z-index: 1000;
    padding: 0.5rem 0;
`

const DropdownItem = styled.button`
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    color: var(--ds-color-text-default);
    font-size: 0.875rem;
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--ds-color-surface-tinted);
    }

    &:first-child {
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
    }

    &:last-child {
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
    }
`

const UserInfo = styled.div`
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--ds-color-border-subtle);
    color: var(--ds-color-text-subtle);
    font-size: 0.875rem;
`

export const TopMenu = () => {
    const { user, loading, signInWithGoogle, signOut } = useAuth()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isDropdownOpen])

    const handleAvatarClick = () => {
        if (user) {
            // Toggle dropdown if user is logged in
            setIsDropdownOpen(!isDropdownOpen)
        } else {
            // Sign in if user is not logged in
            signInWithGoogle()
        }
    }

    const handleSignOut = async () => {
        await signOut()
        setIsDropdownOpen(false)
    }

    const userAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
    const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User'
    const userEmail = user?.email || ''

    if (loading) {
        return (
            <TopMenuContainer>
                <AvatarButton disabled>
                    <Avatar aria-hidden="true">{userName.charAt(0).toUpperCase()}</Avatar>
                </AvatarButton>
            </TopMenuContainer>
        )
    }

    return (
        <TopMenuContainer>
            <DropdownContainer ref={dropdownRef}>
                <AvatarButton onClick={handleAvatarClick} aria-label={user ? 'User menu' : 'Sign in'}>
                    {user && userAvatarUrl ? (
                        <Avatar aria-hidden="true">
                            <img src={userAvatarUrl} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        </Avatar>
                    ) : (
                        <Avatar aria-hidden="true">{userName.charAt(0).toUpperCase()}</Avatar>
                    )}
                </AvatarButton>
                {user && (
                    <DropdownMenu isOpen={isDropdownOpen}>
                        <UserInfo>
                            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{userName}</div>
                            <div style={{ fontSize: '0.75rem' }}>{userEmail}</div>
                        </UserInfo>
                        <DropdownItem onClick={handleSignOut}>Log out</DropdownItem>
                    </DropdownMenu>
                )}
            </DropdownContainer>
        </TopMenuContainer>
    )
}

