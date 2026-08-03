import React, { useRef } from 'react'
import { Clock, MapPin, ExternalLink, Navigation, Star } from 'lucide-react'
import { BUSINESS_INFO } from '../../constants/contants'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { LandingMapContainer } from '../Landingpage/LandingMapContainer'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// TODO: replace with the venue's real address once confirmed
const VENUE_ADDRESS = '888 Example Ave., Brgy. Example, Mandaue City, Cebu, Philippines'
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(VENUE_ADDRESS)}&output=embed`

export const LandingV2Location = () => {
    const sectionRef = useRef(null)

    useGSAP(() => {
        const scrollTrigger = () => ({
            trigger: sectionRef.current,
            start: 'top 78%',
            once: true,
        })

        gsap.from(['.gsap-eyebrow', '.gsap-location-headline', '.gsap-location-subheadline'], {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: scrollTrigger(),
        })

        gsap.from('.gsap-location-card', {
            opacity: 0,
            y: 24,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.15,
            delay: 0.2,
            scrollTrigger: scrollTrigger(),
        })

        gsap.from('.gsap-location-map', {
            opacity: 0,
            y: 24,
            duration: 0.7,
            ease: 'power3.out',
            delay: 0.25,
            scrollTrigger: scrollTrigger(),
        })
    }, { scope: sectionRef })

    return (
        <section id="location" ref={sectionRef} className="bg-foreground px-6 md:px-10 xl:px-20 py-20 md:py-28">
            <div className="max-w-7xl mx-auto">
                {/* heading */}
                <div className="text-center mb-14">
                    <div className="gsap-eyebrow flex items-center justify-center gap-3 mb-6">
                        <span className="h-px w-8 bg-primary" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase text-primary">
                            Visit the Court
                        </span>
                        <span className="h-px w-8 bg-primary" />
                    </div>
                    <h2 className="gsap-location-headline mt-6 text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] text-secondary">
                        Find Us Before Game Time.
                    </h2>
                    <p className="gsap-location-subheadline mt-4 text-sm md:text-base text-muted-foreground">
                        Local details stay simple. Booking stays fast.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    {/* LEFT: contact info + private events */}
                    <div className="flex flex-col gap-6">
                        <div className="gsap-location-card bg-card rounded-3xl border border-border p-6">
                            <h3 className="text-xl font-black uppercase text-secondary-brighter mb-5">
                                Contact Information
                            </h3>

                            <div className="flex items-start gap-4 rounded-2xl border border-border p-4 mb-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Clock size={20} strokeWidth={2} />
                                </span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-secondary-brighter">
                                        Operating Hours
                                    </p>
                                    <p className="font-bold text-primary">{BUSINESS_INFO.openingHours + " - " + BUSINESS_INFO.closingHours}</p>
                                    <p className="text-sm text-secondary-brighter">Open 7 Days a Week</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 rounded-2xl border border-border p-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <MapPin size={20} strokeWidth={2} />
                                </span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-secondary-brighter">
                                        Location
                                    </p>
                                    <p className="font-bold text-primary">{BUSINESS_INFO.name}</p>
                                    <p className="text-sm text-secondary-brighter">{BUSINESS_INFO.googleMapLocation}</p>
                                </div>
                            </div>
                        </div>

                        <div className="gsap-location-card group relative overflow-hidden rounded-3xl p-6 flex-1 min-h-[220px] flex flex-col justify-end">
                            <img
                                src="images/bunalBradCourt2.png"
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
                            <div className="relative">
                                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/60">
                                    Exclusive Events
                                </p>
                                <p className="mt-1 text-2xl font-black uppercase text-white">
                                    Talk With Our Court Team
                                </p>
                                <p className="mt-2 text-sm text-white/70 max-w-md">
                                    For group play, tournaments, or event reservations, reach out through
                                    our social channels or contact details.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: map */}
                    <div className="gsap-location-map relative rounded-3xl border border-border overflow-hidden min-h-[420px] lg:min-h-0">
                        <LandingMapContainer />
                        {/* floating venue info panel */}
                        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 rounded-2xl bg-card shadow-xl p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-black text-secondary">{BUSINESS_INFO.name}</p>
                                    <p className="text-xs text-secondary-brighter mt-1">{BUSINESS_INFO.googleMapLocation}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE_ADDRESS)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Open in Google Maps"
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(VENUE_ADDRESS)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Get directions"
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary-darker transition-colors"
                                    >
                                        <Navigation size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}