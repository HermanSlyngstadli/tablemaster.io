import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
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

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainPage />,
    },
    {
        path: '/',
        element: <ProductPage />,
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
        path: '/admin',
        element: <AdminPage />,
    },
    {
        path: '/admin/shop/:shopId',
        element: <EditShopPage />,
    },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)
