import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '@digdir/designsystemet-css'
import './design-tokens-build/tablemaster.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { NameGeneratorPage } from './pages/NameGeneratorPage'
import { NameSynthPage } from './pages/NameSynthPage'
import { MainPage } from './pages/MainPage'
import { MapLandingPage } from './pages/MapLandingPage'
import { SoundscapePage } from './pages/SoundscapePage'
import { ShopLandingPage } from './pages/ShopLandingPage'
import { ShopPage } from './pages/ShopPage'
import { MakonosMap } from './pages/MakonosMap'
import { AnkrealMap } from './pages/AnkrealMap'
import { PirateMap } from './pages/PirateMap'
import { FantasyMap } from './pages/FantasyMap'
import { AdminPage } from './pages/AdminPage'
import { EditShopPage } from './pages/EditShopPage'
import { ShopViewPage } from './pages/ShopViewPage'
import { EditItemPage } from './pages/EditItemPage'
import { LoginPage } from './pages/LoginPage'
import { AuthProvider } from './contexts/AuthContext'

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainPage />,
    },
    {
        path: '/name-generator',
        element: <NameGeneratorPage />,
    },
    {
        path: '/name-synth',
        element: <NameSynthPage />,
    },
    {
        path: '/map',
        element: <MapLandingPage />,
    },
    {
        path: '/map/makonos',
        element: <MakonosMap />,
    },
    {
        path: '/map/ankreal',
        element: <AnkrealMap />,
    },
    {
        path: '/map/pirat',
        element: <PirateMap />,
    },
    {
        path: '/map/fantasy',
        element: <FantasyMap />,
    },
    {
        path: '/soundscape',
        element: <SoundscapePage />,
    },
    {
        path: '/shop',
        element: <ShopLandingPage />,
    },
    {
        path: '/shop/:uuid',
        element: <ShopPage />,
    },
    {
        path: '/admin/login',
        element: (
            <AuthProvider>
                <LoginPage />
            </AuthProvider>
        ),
    },
    {
        path: '/admin',
        element: (
            <AuthProvider>
                <ProtectedRoute>
                    <AdminPage />
                </ProtectedRoute>
            </AuthProvider>
        ),
    },
    {
        path: '/admin/shop/new',
        element: (
            <AuthProvider>
                <ProtectedRoute>
                    <EditShopPage />
                </ProtectedRoute>
            </AuthProvider>
        ),
    },
    {
        path: '/admin/shop/:shopId/edit',
        element: (
            <AuthProvider>
                <ProtectedRoute>
                    <EditShopPage />
                </ProtectedRoute>
            </AuthProvider>
        ),
    },
    {
        path: '/admin/shop/:shopId',
        element: (
            <AuthProvider>
                <ProtectedRoute>
                    <ShopViewPage />
                </ProtectedRoute>
            </AuthProvider>
        ),
    },
    {
        path: '/admin/shop/:shopId/item/:itemId/edit',
        element: (
            <AuthProvider>
                <ProtectedRoute>
                    <EditItemPage />
                </ProtectedRoute>
            </AuthProvider>
        ),
    },
    {
        path: '/admin/shop/:shopId/item/new',
        element: (
            <AuthProvider>
                <ProtectedRoute>
                    <EditItemPage />
                </ProtectedRoute>
            </AuthProvider>
        ),
    },
], {
    future: {
        v7_relativeSplatPath: true,
    },
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>
    </React.StrictMode>
)
