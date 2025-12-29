import React, { createContext, useContext, useEffect, useState } from 'react'

type ColorScheme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
    colorScheme: ColorScheme
    setColorScheme: (scheme: ColorScheme) => void
    isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}

interface ThemeProviderProps {
    children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
        const saved = localStorage.getItem('color-scheme') as ColorScheme | null
        return saved || 'auto'
    })
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        // Apply color scheme to document
        const root = document.documentElement
        root.setAttribute('data-color-scheme', colorScheme)

        // Determine if dark mode should be active
        if (colorScheme === 'dark') {
            setIsDark(true)
        } else if (colorScheme === 'light') {
            setIsDark(false)
        } else {
            // Auto mode: check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            setIsDark(prefersDark)
        }

        // Save to localStorage
        localStorage.setItem('color-scheme', colorScheme)
    }, [colorScheme])

    useEffect(() => {
        // Listen for system preference changes when in auto mode
        if (colorScheme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const handleChange = (e: MediaQueryListEvent) => {
                setIsDark(e.matches)
            }

            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        }
    }, [colorScheme])

    const setColorScheme = (scheme: ColorScheme) => {
        setColorSchemeState(scheme)
    }

    return (
        <ThemeContext.Provider value={{ colorScheme, setColorScheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    )
}

