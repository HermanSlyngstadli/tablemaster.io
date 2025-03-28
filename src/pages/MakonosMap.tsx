import React, { useState } from 'react'
import { MapContainer, Marker, Popup, ImageOverlay, TileLayer, useMapEvents } from 'react-leaflet'
import L, { CRS, LatLngBounds } from 'leaflet'

import makonos from '../assets/makonos.png'

import 'leaflet/dist/leaflet.css'

function ClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            onClick(e.latlng) // Send clicked coordinates to parent
        },
    })
    return null
}

export const MakonosMap = () => {
    //Change this to match the highest number tile you generated
    const ZOOM_LEVELS = 7
    //Change this to the zoom level you wish to start on
    const STARTING_ZOOM = 2
    //Change this to the focal point of your map
    const CENTER_POINT: [number, number] = [0, 0]

    const [currentZoom, setZoomLevel] = useState(STARTING_ZOOM)
    const position: [number, number] = [51.505, -0.09]

    interface LatLng {
        lat: number
        lng: number
    }

    const handleMapClick = (latlng: LatLng): void => {
        console.log('Clicked coordinates:', latlng)
    }

    const bounds = new LatLngBounds(
        [0, 0], // Bottom-left corner
        [1000, 1000] // Top-right corner (adjust based on image size)
    )

    const markers: { position: [number, number]; text: string }[] = [
        { position: [500, 530], text: 'Den lilla stormen' },
        { position: [580, 670], text: 'Biblioteket i Prespa' },
        { position: [360, 450], text: 'Huset til Unge Keiser' },
        { position: [155, 890], text: 'Skipsvrak med loot' },
        { position: [529, 424], text: 'Aleksionene kan fikse båten her' },
        { position: [677, 176], text: 'Mind flayers har satt opp camp i en gammel gruve' },
        {
            position: [824, 215],
            text: 'Sammensmeltningen holder til her, og kan gi oss tips til hvordan fjerne slimlaget som beskytter elderhjernen',
        },
        { position: [606, 326], text: 'Rosedrakens tunge finnes i Valetharonskogen' },
        {
            position: [812, 687],
            text: 'Krigsherren Gauroth den Grådige har en hjelm som kan hjelpe oss mot elderhjernen.',
        },
        { position: [750, 891], text: 'Vi tror den siste av de lysende dørene er her et sted' },
        { position: [322, 814], text: 'Her våker en drageskilpadde' },
        { position: [379, 352], text: 'Kaghlimars øye' },
        { position: [155, 225], text: 'Spøkelser vi kan hjelpe' },
        { position: [316, 147], text: 'Mulig annet Tiamat-tempel' },
        { position: [573, 479], text: 'Baltrion' },
    ]

    return (
        <MapContainer center={[500, 500]} zoom={1} crs={L.CRS.Simple} scrollWheelZoom={true}>
            <ImageOverlay url={makonos} bounds={bounds} />
            <ClickHandler onClick={handleMapClick} />
            {markers.map((marker, index) => (
                <Marker key={index} position={marker.position}>
                    <Popup>{marker.text}</Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}
