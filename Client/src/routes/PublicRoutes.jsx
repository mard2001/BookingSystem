import React from 'react'
import { Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import { UnauthorizedPage } from '../pages/defaultPages/UnauthorizedPage'

export const PublicRoutes = [
    {
        key: "landingPage",
        path: "/",
        element: <LandingPage />
    },
    { 
        key: "unauthorized", 
        path: "/unauthorized", 
        element: <UnauthorizedPage /> },
]
