import React from 'react'
import { LandingHeader } from '../components/Landingpage/LandingHeader'
import LandingHero from '../components/Landingpage/LandingHero'
import { LandingFacility } from '../components/Landingpage/LandingFacility'
import { LandingFoot } from '../components/Landingpage/LandingFoot'
import Footer from '../components/Footer'
import { MultiStepForm } from '../components/MultiForm/MultiStepForm'
import { AppointmentFormProvider } from '../context/AppointmentFormContext'
import { LandingAbout } from '../components/Landingpage/LandingAbout'

const LandingPage = () => {
    return (
        <>
            <LandingHeader />
            <LandingHero />
            <LandingFacility />
            <LandingAbout />
            <AppointmentFormProvider>
                <div id='reservation' className='min-h-screen pt-24 md:pt-32 px-4 md:px-6'>
                    <div className='text-center mb-12 md:mb-16'>
                        <p className='uppercase tracking-widest text-xs font-semibold text-primary mb-3'>
                            Reserve Your Court
                        </p>
                        <h1 className='text-primary text-4xl sm:text-5xl font-bold tracking-tight mb-4'>
                            Book Your Next Pickleball Match
                        </h1>
                        <p className='text-muted text-sm max-w-md mx-auto leading-relaxed'>
                            Reserve a premium court, choose your preferred schedule, and secure your
                            game time in just a few steps.
                        </p>
                    </div>
                    <MultiStepForm />
                </div>
            </AppointmentFormProvider>
            <LandingFoot />
            <Footer />
        </>
    )
}

export default LandingPage
