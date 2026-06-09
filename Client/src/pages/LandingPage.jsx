import React from 'react'
import { LandingHeader } from '../components/Landingpage/LandingHeader'
import LandingHero from '../components/Landingpage/LandingHero'
import { LandingFacility } from '../components/Landingpage/LandingFacility'
import { LandingFoot } from '../components/Landingpage/LandingFoot'
import Footer from '../components/Footer'
import { MultiStepForm } from '../components/MultiForm/MultiStepForm'
import { AppointmentFormProvider } from '../context/AppointmentFormContext'

const LandingPage = () => {
    return (
        <>
            <LandingHeader />
            <LandingHero />
            <LandingFacility />
            <AppointmentFormProvider>
                <div id='reservation' className='min-h-screen py-12 px-4'>
                    <div>
                        <div className='text-center mb-15'>
                            <h1 className='text-primary max-sm:text-4xl text-5xl font-bold mb-4'>Book Your Next Pickleball Match</h1>
                            <p className='text-muted'>Reserve premium courts, choose your preferred schedule, and get ready to play.</p>
                            <p className='text-secondary text-sm'>Secure your game time and enjoy a seamless reservation experience.</p>
                        </div>
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
