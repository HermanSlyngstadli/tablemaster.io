import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signInWithGoogle: () => Promise<{ error: any }>
    signOut: () => Promise<void>
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            // When a user signs in via OAuth, check if they need admin role set
            if (event === 'SIGNED_IN' && session?.user) {
                const userMetadata = session.user.user_metadata
                const appMetadata = session.user.app_metadata
                // If user doesn't have admin role in either metadata, set it (for first-time Google sign-in)
                if (userMetadata?.role !== 'admin' && appMetadata?.role !== 'admin') {
                    try {
                        // Update user metadata to include admin role
                        const { error: updateError } = await supabase.auth.updateUser({
                            data: {
                                ...userMetadata,
                                role: 'admin',
                            },
                        })

                        if (!updateError) {
                            // Wait a bit for the update to propagate, then refresh session
                            await new Promise((resolve) => setTimeout(resolve, 500))

                            // Refresh session to get new JWT with updated metadata
                            const {
                                data: { session: refreshedSession },
                                error: refreshError,
                            } = await supabase.auth.refreshSession()
                            if (!refreshError && refreshedSession) {
                                setSession(refreshedSession)
                                setUser(refreshedSession.user)
                                setLoading(false)
                                return
                            }
                        }
                    } catch (err) {
                        console.error('Error setting admin role:', err)
                    }
                }
            }

            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/admin`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        })
        return { error }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    // Check if user is admin based on user_metadata
    const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin'

    const value = {
        user,
        session,
        loading,
        signInWithGoogle,
        signOut,
        isAdmin,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
