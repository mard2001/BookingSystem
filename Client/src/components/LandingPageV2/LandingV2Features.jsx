import React, { useRef } from 'react'
import { MapPinned, Users2, Timer, Star, BookImageIcon } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STATS = [
    { icon: MapPinned, value: '2', label: 'Outdoor Courts' },
    { icon: BookImageIcon, value: '100+', label: 'Successful Booking' },
    { icon: Users2, value: '500+', label: 'Satisfied Players' },
    { icon: Star, value: '96%', label: 'Player satisfaction rate' },
]

export const LandingV2Features = () => {
    const sectionRef = useRef(null)

    useGSAP(() => {
        const scrollTrigger = () => ({
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
        })

        gsap.from(['.gsap-features-headline', '.gsap-features-subheadline'], {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: scrollTrigger(),
        })

        gsap.from('.gsap-stat-item', {
            opacity: 0,
            y: 24,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.12,
            delay: 0.2,
            scrollTrigger: scrollTrigger(),
        })
    }, { scope: sectionRef })

    return (
        <section ref={sectionRef} className="bg-foreground px-6 md:px-10 xl:px-20 pb-20 md:pb-28">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="gsap-features-headline text-lg md:text-2xl font-black text-primary">
                    With courts built for every level and a team that loves the game,
                </h2>
                <p className="gsap-features-subheadline mt-2 text-sm md:text-base text-secondary">
                    we make sure every booking is smooth, on time, and within your budget.
                </p>

                <div className="mt-12 grid grid-cols-2 md:flex md:flex-row md:items-stretch">
                    {STATS.map(({ icon: Icon, value, label }, i) => (
                        <div
                            key={label}
                            className={`gsap-stat-item flex-1 flex flex-col items-center gap-3 p-6 md:py-0 md:px-6 border-border
                                ${i % 2 === 1 ? 'border-l' : ''}
                                ${i >= 2 ? 'border-t' : ''}
                                md:border-t-0 ${i !== 0 ? 'md:border-l' : 'md:border-l-0'}`}
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Icon size={22} strokeWidth={2} />
                            </span>
                            <p className="text-2xl md:text-3xl font-black text-secondary">{value}</p>
                            <p className="text-xs md:text-sm text-primary text-center max-w-[10rem]">
                                {label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}