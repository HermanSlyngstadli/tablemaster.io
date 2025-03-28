import React from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

import pin from '../assets/pin.png'

interface CustomMarkerProps {
    position: [number, number] // Coordinates: [latitude, longitude]
    popupText: string // Text to display in the popup
}

export const MapMarker: React.FC<CustomMarkerProps> = ({ position, popupText, ...props }) => {
    // Create custom icon for the marker
    const customIcon = new L.Icon({
        iconUrl: pin, // Use the provided icon URL
        iconSize: [40, 50], // Custom size of the icon
        iconAnchor: [20, 40], // Anchor point at the bottom center
        popupAnchor: [0, -40], // Popup position relative to the icon
    })

    return (
        <Marker position={position} icon={customIcon} {...props}>
            <Popup>{popupText}</Popup>
        </Marker>
    )
}
