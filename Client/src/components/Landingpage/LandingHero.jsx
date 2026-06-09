import React from 'react'
import { HeroCardsQualities } from '../../constants/contants'
import { LandingCards } from './LandingCards'

const LandingHero = () => {
  return (
    <div className='relative mb-20'>
      {/* Hero Image Section */}
      <div className='heroLandingImage h-[70vh] flex flex-col justify-center'>
        <div className='px-10 md:pl-30 mt-25'>
          <h1 className='titleHeader1 text-3xl md:text-5xl font-black uppercase text-primary-foreground/90'>
            Elevate your game,
          </h1>
          <h2 className='titleHeader2 text-2xl md:text-3xl font-black uppercase text-primary-foreground/90 mb-2'>
            Play at Ylaya Smash Rally
          </h2>
          <p className='titleSubHeader1 text-sm md:text-md text-lg text-primary-foreground/50 -mb-1'>
            Talamban's Premier pickleball facility.
          </p>
          <p className='titleSubHeader2 text-sm md:text-md text-lg text-primary-foreground/50'>
            Book your schedule today.
          </p>
        </div>
        <div id="features" className='px-10 md:pl-30 mt-5 mb-10'>
          <button className="
            relative overflow-hidden
            bg-white text-[#005c9d]
            px-5 py-2.5 rounded-lg
            text-sm font-black tracking-wider uppercase
            transition-all duration-300
            hover:bg-[#005c9d] hover:text-white
            hover:ring-2 hover:ring-white/40
            active:scale-95 group hover:cursor-pointer
          ">
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            <span className="relative">Start Booking →</span>
          </button>
        </div>
      </div>

      {/* Cards — naturally below hero, overlapping with negative margin */}
      <div className='flex flex-wrap justify-center px-2 xl:px-15 -mt-15 sm:-mt-30 relative z-10 pb-10'>
        {HeroCardsQualities.map((feature, index) => (
          <LandingCards
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>

    </div>
  )
}

export default LandingHero
