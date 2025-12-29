import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '@digdir/designsystemet-css'
import './design-tokens-build/tablemaster.css'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { NameGeneratorPage } from './pages/NameGeneratorPage'
import { MainPage } from './pages/MainPage'
import { MapGeneratorPage } from './pages/MapGeneratorPage'
import { SoundscapePage } from './pages/SoundscapePage'
import './index.css'
import { ShopLandingPage } from './pages/ShopLandingPage'
import { ShopPage } from './pages/ShopPage'
import { ProductPage } from './pages/ProductPage'
import { MakonosMap } from './pages/MakonosMap'
import { AnkrealMap } from './pages/AnkrealMap'
import { PirateMap } from './pages/PirateMap'
import { FantasyMap } from './pages/FantasyMap'
import { AdminPage } from './pages/AdminPage'
import { EditShopPage } from './pages/EditShopPage'
import { ShopViewPage } from './pages/ShopViewPage'
import { EditItemPage } from './pages/EditItemPage'
import { LoginPage } from './pages/LoginPage'

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
        element: <LoginPage />,
    },
    {
        path: '/admin',
        element: (
            <ProtectedRoute>
                <AdminPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/shop/new',
        element: (
            <ProtectedRoute>
                <EditShopPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/shop/:shopId/edit',
        element: (
            <ProtectedRoute>
                <EditShopPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/shop/:shopId',
        element: (
            <ProtectedRoute>
                <ShopViewPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/shop/:shopId/item/:itemId/edit',
        element: (
            <ProtectedRoute>
                <EditItemPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/shop/:shopId/item/new',
        element: (
            <ProtectedRoute>
                <EditItemPage />
            </ProtectedRoute>
        ),
    },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>
)
