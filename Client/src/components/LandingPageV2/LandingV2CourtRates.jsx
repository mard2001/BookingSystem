import React, { useRef } from 'react'
import { courtCards, courtTypes } from '../../constants/contants'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export const LandingV2CourtRates = () => {
    const sectionRef = useRef(null)
    
    useGSAP(() => {
        const scrollTrigger = () => ({
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
        })
 
        gsap.from(['.gsap-eyebrow', '.gsap-rates-headline', '.gsap-rates-paragraph'], {
            opacity: 0,
            y: 24,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: scrollTrigger(),
        })
    }, { scope: sectionRef })

    return (
        <section id="rates" ref={sectionRef} className='bg-foreground px-6 md:px-10 xl:px-20 pt-20 md:pt-15'>
            <div className='max-w-7xl mx-auto'>
                <div className="gsap-eyebrow flex items-center gap-3 mb-6">
                    <span className="h-px w-8 bg-primary" />
                    <span className="text-xs font-black tracking-[0.2em] uppercase text-primary">
                        Court Rates
                    </span>
                    <span className="h-px w-8 bg-primary" />
                </div>
                <h2 className='gsap-rates-headline uppercase text-3xl md:text-4xl leading-tight mb-5 font-black text-secondary'>
                    Built for better play.
                </h2>
                <p className='gsap-rates-paragraph text-secondary-brighter text-sm leading-relaxed max-w-2xl'>
                    Bright spaces, quality courts, and a relaxed atmosphere come together to
                    create an experience that's as enjoyable off the court as it is on it.
                    Experience thoughtfully designed courts, a clean modern environment, and
                    seamless convenience—all created to elevate every moment you spend on the
                    court.
                </p>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch mt-10'>
                    <div className="bg-foreground rounded-3xl p-4 h-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-5 h-full">
                            {courtCards.map((card) => (
                                <div
                                    key={card.title}
                                    className="gsap-court-card bg-card/50 rounded-2xl p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 hover:cursor-default flex flex-col justify-center"
                                >
                                    <p className="text-lg sm:text-xl font-bold text-secondary mb-1 leading-snug">
                                        {card.title}
                                    </p>
                                    <p className="text-sm text-highlight">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card/50 rounded-3xl p-6 h-full flex flex-col">
                        <h3 className="gsap-rates-headline font-serif font-medium tracking-tight text-3xl text-highlight mb-4">
                            Court rates
                        </h3>

                        <div className="flex flex-col gap-4 flex-1">
                            {courtTypes.map((court) => (
                                <div key={court.name} className="gsap-rate-card bg-card rounded-2xl p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 hover:cursor-default">
                                    <p className="text-sm text-secondary-brighter mb-5">{court.desc}</p>

                                    <div className="flex flex-col divide-y divide-black/5">
                                        {court.rates.map((rate) => (
                                            <div key={rate.time}>
                                                <p className="text-xs font-bold tracking-wide text-primary mb-1 uppercase">{rate.label}</p>
                                                <div className="flex items-center justify-between py-2.5">
                                                    <span className="text-sm text-highlight/80">{rate.time}</span>
                                                    <span>
                                                        <span className="font-bold text-highlight">{rate.price}</span>
                                                        <span className="text-muted-foreground text-sm"> per hour</span>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}