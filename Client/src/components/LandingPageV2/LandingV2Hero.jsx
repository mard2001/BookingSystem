import React, { useRef } from "react";
import { BUSINESS_INFO } from "../../constants/contants";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export const LandingV2Hero = () => {
    const sectionRef = useRef(null);

    useGSAP(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const tl = gsap.timeline({
            defaults: { ease: 'power3.out', duration: reduceMotion ? 0 : 0.7 },
        });

        tl.from('.gsap-line1', { opacity: 0, y: 24 })
          .from('.gsap-line2', { opacity: 0, y: 24 }, reduceMotion ? '<' : '<+0.12')
          .from('.gsap-sub1', { opacity: 0, y: 24 }, reduceMotion ? '<' : '<+0.12')
          .from('.gsap-sub2', { opacity: 0, y: 24 }, reduceMotion ? '<' : '<+0.08')
          .from('.gsap-cta', { opacity: 0, y: 24 }, reduceMotion ? '<' : '<+0.12');
    }, { scope: sectionRef });

    return (
        <>
            <section ref={sectionRef} className="landingPageV2HeroBG relative overflow-hidden h-[80vh] rounded-t-3xl" >
                {/* ambient glow */}
                <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl bg-primary/30" />
                <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-102 rounded-full blur-3xl bg-primary/30" />

                <div className='h-[70vh] flex flex-col justify-center'>
                    <div className='px-10 md:pl-30 mt-25'>
                        <h1 className='gsap-line1 titleHeader1 text-3xl md:text-5xl font-black uppercase text-foreground'>
                        Elevate your game,
                        </h1>
                        <h2 className='gsap-line2 titleHeader2 text-2xl md:text-3xl font-black uppercase text-foreground mb-2'>
                        Play at {BUSINESS_INFO.name}
                        </h2>
                        <p className='gsap-sub1 titleSubHeader1 text-sm md:text-base text-muted-foreground/70 -mb-1'>
                        Discover Ylaya’s premier pickleball facility. Meticulously maintained courts, professional lighting, and a community built on the love of the rally.
                        </p>
                        <p className='gsap-sub2 titleSubHeader2 text-sm md:text-base text-muted-foreground/70'>
                        Book your schedule today.
                        </p>
                    </div>
                    <div className='gsap-cta px-10 md:pl-30 mt-5 mb-10'>
                        <a href="#reservation">
                        <button className="
                            relative overflow-hidden
                            bg-foreground text-primary-darker
                            px-5 py-2.5 rounded-lg
                            text-sm font-black tracking-wider uppercase
                            transition-all duration-300
                            hover:bg-primary-darker hover:text-muted-foreground
                            hover:ring-2 hover:ring-muted-foreground/40
                            active:scale-95 group cursor-pointer
                        ">
                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                            <span className="relative">Start Booking →</span>
                        </button>
                        </a>
                    </div>
                </div>

                {/* wavy bottom edge */}
                <div className="pointer-events-none absolute -bottom-1 left-0 w-full leading-[0]">
                    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="block h-16 w-full sm:h-24 lg:h-28" >
                        {/* secondary wave — lighter, sits further back */}
                        <path d="M0,32 C240,90 480,0 720,28 C960,56 1200,110 1440,50 L1440,120 L0,120 Z" fill="#F0F0F2" />
                    </svg>
                </div>
            </section>
        </>
    );
}