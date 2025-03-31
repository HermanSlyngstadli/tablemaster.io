import React, { useState } from 'react'
import { MapContainer, Marker, Popup, ImageOverlay, TileLayer, useMapEvents } from 'react-leaflet'
import L, { CRS, LatLngBounds } from 'leaflet'

import pirate from '../assets/pirate.jpeg'

import 'leaflet/dist/leaflet.css'
import { MapMarker } from '../components/MapMarker'

function ClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            onClick(e.latlng) // Send clicked coordinates to parent
        },
    })
    return null
}

export const PirateMap = () => {
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
        [1000, 1900] // Top-right corner (adjust based on image size)
    )

    const markers: { position: [number, number]; text: string }[] = []

    return (
        <MapContainer center={[500, 500]} zoom={1} crs={L.CRS.Simple} scrollWheelZoom={true}>
            <ImageOverlay url={pirate} bounds={bounds} />
            <ClickHandler onClick={handleMapClick} />
            {markers.map((marker, index) => (
                <MapMarker key={index} position={marker.position} popupText={marker.text} />
            ))}
        </MapContainer>
    )
}
