import React, { useState } from 'react'
import { MapContainer, Marker, Popup, ImageOverlay, TileLayer, useMapEvents, Polyline } from 'react-leaflet'
import L, { CRS, LatLngBounds } from 'leaflet'

import makonos from '../assets/makonos.png'

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
        console.log('[', latlng.lat, ',', latlng.lng, ']')
    }

    const bounds = new LatLngBounds(
        [0, 0], // Bottom-left corner
        [1000, 1000] // Top-right corner (adjust based on image size)
    )

    const routeTwo: L.LatLngTuple[] = [
        [587, 455.75],
        [676.5, 454.25],
        [691, 481.75],
        [681, 507.75],
        [665.5, 533.5],
        [676.75, 556.5],
    ]

    const routeThree: L.LatLngTuple[] = [
        [587, 455.75],
        [648.5, 558.25],
        [677.5, 556.75],
        [666.75, 577],
        [647, 578.5],
        [644.5, 592.25],
        [627, 621],
        [618.75, 609.25],
    ]

    const routeFour: L.LatLngTuple[] = [
        [587, 455.75],
        [558, 456],
        [527, 506.5],
        [573, 585.25],
        [602.5, 582.5],
        [617, 609],
        [589.5, 609.5],
        [616, 659.25],
        [589.25, 659.25],
        [572.75, 633.75],
        [558.25, 659.5],
        [527.25, 659.5],
        [542.75, 685.5],
        [561.5, 712.75],
        [557.5, 738],
        [542.5, 766.25],
        [528.5, 776.75],
        [527.25, 791.75],
    ]

    const route: L.LatLngTuple[] = [
        [201, 507],
        [260.5, 506],
        [291, 557.5],
        [275.5, 584],
        [261, 557.5],
        [245.5, 532.5],
        [187, 531],
        [201, 507],
        [187, 531],
        [262, 660],
        [230.5, 608],
        [202.5, 608.5],
        [172.5, 555],
        [187, 531],
        [217, 480],
        [334, 479.5],
        [348, 454],
        [201.5, 453.5],
        [187.5, 480.5],
        [201, 507],
        [167, 506],
        [112, 403],
        [173, 300.5],
        [156.5, 276],
        [184, 226],
        [199.5, 249],
        [319, 249.5],
        [348, 302.5],
        [338.5, 327.5],
        [350, 352.5],
        [372, 353],
        [338.5, 327.5],
        [348, 302.5],
        [319, 249.5],
        [305.75, 224.25],
        [275.25, 226],
        [261, 252],
        [246, 276.75],
        [216.25, 276.5],
        [201, 301.75],
        [186, 329],
        [158.25, 327],
        [128, 379.25],
        [141.75, 405.5],
        [168.5, 457.25],
        [158, 480.25],
        [166.75, 507.75],
        [199.5, 507.75],
        [170, 508.75],
        [111.5, 608.5],
        [127.75, 633.75],
        [141.75, 662],
        [200, 660.5],
        [290.5, 814.5],
        [274.5, 787.25],
        [246, 790],
        [230, 762.5],
        [171.25, 762],
        [127.25, 685],
        [142, 660.25],
        [126.5, 634.5],
        [111.25, 608.25],
        [169.75, 504.5],
        [201.75, 508.5],
        [148, 489],
        [172.125, 504],
        [111, 403.25],
        [156.25, 326],
        [185, 327.5],
        [214.25, 276],
        [244.75, 275.25],
        [263, 251],
        [290.25, 251.5],
        [305.25, 225.5],
        [424.5, 224.5],
        [438.5, 200.25],
        [470, 199.25],
        [512.5, 276],
        [542, 275],
        [602, 378.5],
        [588, 404],
        [602.5, 378],
        [617.5, 403.5],
        [587.5, 455.75],
        [587.5, 455.75],
        [617, 455.75],
        [633, 429.25],
        [661.5, 429],
        [708, 352.5],
        [721.75, 325],
        [691.25, 328.5],
        [677.75, 355],
        [662, 326.75],
        [632.25, 327],
    ]

    const markers: { position: [number, number]; text: string }[] = [
        { position: [500, 530], text: 'Den lilla stormen' },
        { position: [275.5, 584], text: 'Karleon' },
        { position: [259.5, 763.5], text: 'Safirtårnet' },
        { position: [262, 660], text: 'Orakelet' },
        { position: [580, 670], text: 'Biblioteket i Prespa' },
        { position: [360, 450], text: 'Huset til Unge Keiser' },
        { position: [155, 890], text: 'Skipsvrak med loot' },
        { position: [529, 424], text: 'Aleksionene kan fikse båten her' },
        { position: [677, 176], text: 'Mind flayers har satt opp camp i en gammel gruve' },
        {
            position: [960, 210],
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
        { position: [587, 455.75], text: 'Baltrion' },
    ]

    return (
        <MapContainer center={[500, 500]} zoom={1} crs={L.CRS.Simple} scrollWheelZoom={true}>
            <ImageOverlay url={makonos} bounds={bounds} />
            <Polyline pathOptions={{ color: 'grey', dashArray: [1, 8] }} positions={route} />
            <Polyline pathOptions={{ color: 'grey', dashArray: [1, 8] }} positions={routeTwo} />
            <Polyline pathOptions={{ color: 'grey', dashArray: [1, 8] }} positions={routeThree} />
            <Polyline pathOptions={{ color: 'grey', dashArray: [1, 8] }} positions={routeFour} />
            <ClickHandler onClick={handleMapClick} />
            {markers.map((marker, index) => (
                <MapMarker key={index} position={marker.position} popupText={marker.text} />
            ))}
        </MapContainer>
    )
}
