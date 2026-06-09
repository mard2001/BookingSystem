"use Client"

import React from 'react'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export const LandingMapContainer = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const position = { lat: 10.374327, lng: 123.922846 };

    return (
        <APIProvider apiKey={apiKey} >
            <div className='w-[100%] h-85 mx-auto mb-20 bg-white/50 rounded-4xl flex justify-center items-center shadow-lg inset-shadow-sm'>
                <div className='w-[95%] h-80 rounded-3xl overflow-hidden'>
                    <Map defaultZoom={16} defaultCenter={position} mapTypeControl={false} >
                        <Marker position={position} />
                    </Map>
                </div>
            </div>
        </APIProvider>
    )
}
