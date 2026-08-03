import React from 'react'
import { Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import { UnauthorizedPage } from '../pages/defaultPages/UnauthorizedPage'
import { LandingPageV2 } from '../pages/LandingPageV2'

export const PublicRoutes = [
    {
        key: "landingPage",
        path: "/",
        // element: <LandingPage />
        element: <LandingPageV2 />

    },
    { 
        key: "unauthorized", 
        path: "/unauthorized", 
        element: <UnauthorizedPage /> },
]
