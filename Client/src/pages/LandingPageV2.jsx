import React from 'react'
import { LandingV2Hero } from '../components/LandingPageV2/LandingV2Hero'
import { LandingV2Header } from '../components/LandingPageV2/LandingV2Header'
import { LandingV2CourtFacility } from '../components/LandingPageV2/LandingV2CourtFacility'
import { LandingV2CourtRates } from '../components/LandingPageV2/LandingV2CourtRates'
import { LandingV2Features } from '../components/LandingPageV2/LandingV2Features'
import { LandingV2Location } from '../components/LandingPageV2/LandingV2Location'
import { AppointmentFormProvider } from '../context/AppointmentFormContext'
import { MultiStepForm } from '../components/MultiForm/MultiStepForm'
import { LandingV2Footer } from '../components/LandingPageV2/LandingV2Footer'

export const LandingPageV2 = () => {
    return (
        <>
            <LandingV2Header />
            <LandingV2Hero />
            <LandingV2CourtFacility />
            <LandingV2Location />
            <LandingV2CourtRates />
            <AppointmentFormProvider>
                <div id='reservation' className='bg-foreground min-h-screen pt-24 md:pt-32 px-4 md:px-6'>
                    <div className='text-center mb-12 md:mb-16'>
                        <div className="gsap-eyebrow flex items-center justify-center gap-3 mb-6">
                            <span className="h-px w-8 bg-primary" />
                            <span className="text-xs font-black tracking-[0.2em] uppercase text-primary">
                                Reserve your Court
                            </span>
                            <span className="h-px w-8 bg-primary" />
                        </div>
                        <h2 className='gsap-rates-headline uppercase text-3xl md:text-4xl leading-tight mb-5 font-black text-secondary'>
                            Book Your Next Pickleball Match
                        </h2>
                        <h2 className='gsap-rates-paragraph text-secondary text-sm leading-relaxed max-w-xl mx-auto'>
                            Reserve a premium court, choose your preferred schedule, and secure your
                            game time in just a few steps.
                        </h2>
                    </div>
                    <MultiStepForm />
                </div>
            </AppointmentFormProvider>
            <LandingV2Features />
            <LandingV2Footer />
        </>
    )
}
