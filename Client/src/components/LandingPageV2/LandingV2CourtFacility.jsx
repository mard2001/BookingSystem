import React, { useRef } from 'react';
import { Globe2, Radar, Clock, ArrowUpRight } from 'lucide-react';
import { BUSINESS_INFO, HeroCardsQualitiesV2 } from '../../constants/contants';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const LandingV2CourtFacility = () => {
    const sectionRef = useRef(null);

    useGSAP(() => {
        const scrollTrigger = {
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
        };

        gsap.from(['.gsap-eyebrow', '.gsap-headline', '.gsap-paragraph'], {
            opacity: 0,
            y: 24,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger,
        });

        gsap.from('.gsap-feature-item', {
            opacity: 0,
            y: 24,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.15,
            delay: 0.3,
            scrollTrigger,
        });

        gsap.from('.gsap-image', {
            opacity: 0,
            y: 24,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: { ...scrollTrigger, start: 'top 70%' },
            clearProps: 'transform',
        });

        gsap.from('.gsap-stat', {
            opacity: 0,
            y: 24,
            duration: 0.7,
            delay: 0.5,
            ease: 'power3.out',
            scrollTrigger: { ...scrollTrigger, start: 'top 70%' },
        });
    }, { scope: sectionRef });

    return (
        <section id="courts" ref={sectionRef} className="bg-foreground py-20 md:py-15 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                <div>
                    <div className="gsap-eyebrow flex items-center gap-3 mb-6">
                        <span className="h-px w-8 bg-primary" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase text-primary">
                            About the courts
                        </span>
                        <span className="h-px w-8 bg-primary" />
                    </div>

                    <h2 className="gsap-headline text-3xl md:text-4xl font-black uppercase leading-tight text-secondary">
                        Premium Courts For A
                        <br />
                        Winning Game,
                        <br />
                        <span className="text-primary">Every Time You Play</span>
                    </h2>

                    <p className="gsap-paragraph mt-6 max-w-md text-sm md:text-base text-secondary-brighter">
                        Our outdoor courts engineered to deliver consistent ball bounce, excellent traction, and enhanced comfort, creating the ideal environment for players of all skill levels to enjoy the game.
                    </p>

                    <div className="mt-9 space-y-6">
                        {HeroCardsQualitiesV2.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="gsap-feature-item flex items-start gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon size={20} strokeWidth={2} />
                                </span>
                                <div>
                                    <p className="font-bold text-secondary text-sm md:text-base">{title}</p>
                                    <p className="text-xs md:text-sm text-secondary-brighter mt-0.5">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative h-[420px] md:h-[520px]">
                    <img
                        src="images/bunalBradCourt.png"
                        className="gsap-image absolute left-0 top-0 h-[80%] w-[62%] rounded-3xl object-cover shadow-xl transition-transform duration-300 hover:-translate-y-5"
                    />
                    <img
                        src="images/bunalBradCourt2.png"
                        className="gsap-image absolute right-0 top-6 h-[65%] w-[46%] rounded-3xl object-cover shadow-xl transition-transform duration-300 hover:-translate-y-5"
                    />
                    <img
                        src="images/bunalBradCourt.png"
                        className="gsap-image absolute left-[30%] -bottom-20 h-[68%] w-[50%] rounded-3xl object-cover shadow-xl transition-transform duration-300 hover:-translate-y-5"
                    />

                    <div className="gsap-stat absolute right-2 bottom-6 w-44 rounded-2xl bg-card p-5 shadow-2xl">
                        <p className="text-3xl font-black text-primary">100%</p>
                        <p className="text-xs text-secondary mt-1">Court Cleanliness Guarantee</p>
                    </div>
                </div>

            </div>
        </section>
    );
};