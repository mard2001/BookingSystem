import React from 'react'
import ProtectedRouteChecker from '../utils/ProtectedRouteChecker'
import { DashboardPage } from '../pages/DashboardPage'
import { MainLayout } from '../layout/MainLayout'
import { BookingsPage } from '../pages/BookingsPage'
import { CourtsPage } from '../pages/CourtsPage'
import { CustomersPage } from '../pages/CustomersPage'
import { BookingsCalendarPage } from '../pages/BookingsCalendarPage'
import { ProfilePage } from '../pages/ProfilePage'
import { ADMIN_ROLES, ALL_ROLES } from '../constants/contants'
import { ClosurePage } from '../pages/ClosurePage'

export const ProtectedRoutes = [
    {
        key:"dashboardPage",
        path: "/dashboard",
        element:(
            <ProtectedRouteChecker allowedRoles={ADMIN_ROLES}>
                <MainLayout>
                    <DashboardPage />
                </MainLayout>
            </ProtectedRouteChecker>
        )
    },
    {
        key:"bookingsPage",
        path: "/bookings",
        element:(
            <ProtectedRouteChecker allowedRoles={ADMIN_ROLES}>
                <MainLayout>
                    <BookingsPage />
                </MainLayout>
            </ProtectedRouteChecker>
        )
    },
    {
        key:"bookingCalendarPage",
        path: "/bookings/calendar",
        element:(
            <ProtectedRouteChecker allowedRoles={ADMIN_ROLES}>
                <MainLayout>
                    <BookingsCalendarPage />
                </MainLayout>
            </ProtectedRouteChecker>
        )
    },
    {
        key:"courtsPage",
        path: "/courts",
        element:(
            <ProtectedRouteChecker allowedRoles={ADMIN_ROLES}>
                <MainLayout>
                    <CourtsPage />
                </MainLayout>
            </ProtectedRouteChecker>
        )
    },
    {
        key:"customersPage",
        path: "/customers",
        element:(
            <ProtectedRouteChecker allowedRoles={ADMIN_ROLES}>
                <MainLayout>
                    <CustomersPage />
                </MainLayout>
            </ProtectedRouteChecker>
        )
    },

    {
        key:"ProfilePage",
        path: "/profile",
        element:(
            <ProtectedRouteChecker allowedRoles={ALL_ROLES}>
                <MainLayout>
                    <ProfilePage />
                </MainLayout>
            </ProtectedRouteChecker>
        )
    },

    {
        key:"ClosurePage",
        path: "/settings/closures",
        element:(
            <ProtectedRouteChecker allowedRoles={ADMIN_ROLES}>
                <MainLayout>
                    <ClosurePage />
                </MainLayout>
            </ProtectedRouteChecker>
        )
    },
]
