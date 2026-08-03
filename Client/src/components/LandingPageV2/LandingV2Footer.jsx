import React, { useRef } from 'react'
import { ArrowUpRight,Send } from 'lucide-react'
import { BUSINESS_INFO } from '../../constants/contants'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const QUICK_LINKS = [
    { label: 'About the Courts', href: '#about' },
    { label: 'Court Rates', href: '#rates' },
    { label: 'Find Us', href: '#location' },
    { label: 'Book Now', href: '#reservation' },
]

const SUPPORT_LINKS = [
    { label: 'Contact Us', href: '#contact' },
    { label: 'Booking Policy', href: '#' },
    { label: 'FAQs', href: '#' },
]

const SOCIALS = [
    // { icon: Facebook, href: '#', label: 'Facebook' },
    // { icon: Instagram, href: '#', label: 'Instagram' },
]

export const LandingV2Footer = () => {
    const footerRef = useRef(null)

    useGSAP(() => {
        const scrollTrigger = () => ({
            trigger: footerRef.current,
            start: 'top 85%',
            once: true,
        })

        gsap.from(['.gsap-footer-eyebrow', '.gsap-footer-headline', '.gsap-footer-info'], {
            opacity: 0,
            y: 24,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: scrollTrigger(),
        })

        gsap.from('.gsap-footer-col', {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { ...scrollTrigger(), start: 'top 90%' },
        })

        gsap.from('.gsap-footer-bottom', {
            opacity: 0,
            y: 16,
            duration: 0.6,
            ease: 'power3.out',
            delay: 0.2,
            scrollTrigger: { ...scrollTrigger(), start: 'top 90%' },
        })
    }, { scope: footerRef })

    return (
        <footer ref={footerRef} className="overflow-hidden">
            <div className="relative overflow-hidden bg-primary-darker px-6 md:px-10 xl:px-16 py-14">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
                >
                    <span className="whitespace-nowrap text-[10rem] sm:text-[14rem] md:text-[18rem] font-black uppercase leading-none text-primary-foreground/2">
                        {BUSINESS_INFO.name}
                    </span>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-3 gap-10">
                    <div className="gsap-footer-col col-span-3 md:col-span-1">
                        <p className="text-lg font-black uppercase text-primary-foreground">
                            {BUSINESS_INFO.name}
                        </p>
                        <p className="mt-3 text-sm text-primary-foreground/60 max-w-xs">
                            The city's premier pickleball and badminton courts — reserve your
                            time slot, show up, and play.
                        </p>
                        <a
                            href="#reservation"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-primary-foreground transition-all duration-200 hover:gap-3"
                        >
                            Book a Court
                            <ArrowUpRight size={16} />
                        </a>
                    </div>
                </div>

                <div className="gsap-footer-bottom mt-12 pt-6 border-t border-primary-foreground/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/60">
                    <p>© {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.</p>

                    <div className="flex items-center  divide-x divide-border">
                        <a href="/privacy" className="font-bold uppercase text-[10px] tracking-wide hover:text-primary-foreground transition-colors px-2">
                            Data Privacy Policy
                        </a>
                        <a href="/terms" className="font-bold uppercase text-[10px] tracking-wide hover:text-primary-foreground transition-colors px-2">
                            Terms &amp; Conditions
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}