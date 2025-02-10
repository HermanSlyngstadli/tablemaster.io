import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { NameGeneratorPage } from './pages/NameGeneratorPage'
import { MainPage } from './pages/MainPage'
import { MapGeneratorPage } from './pages/MapGeneratorPage'
import { MoodSoundsPage } from './pages/MoodSoundsPage'
import { MagicshopPage } from './pages/MagicshopPage'
import './index.css'

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
        path: '/map-generator',
        element: <MapGeneratorPage />,
    },
    {
        path: '/mood-sounds',
        element: <MoodSoundsPage />,
    },
    {
        path: '/magicshop',
        element: <MagicshopPage />,
    },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)
