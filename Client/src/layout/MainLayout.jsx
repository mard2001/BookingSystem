import React from 'react'
import { Sidebar } from '../components/MainLayout/Sidebar'
import { Header } from '../components/MainLayout/Header'

export const MainLayout = ({ children }) => {
    return (
       <div className="flex h-screen bg-surface/50">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                    {/* Offset for mobile hamburger button */}
                    <div className="lg:hidden h-14" />
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}