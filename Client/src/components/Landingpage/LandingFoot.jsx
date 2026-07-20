import React from 'react'

export const LandingFoot = () => {
  return (
    <div className='relative overflow-hidden px-6 pt-15 pb-25'>
        <div className='pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 w-225 h-65 bg-primary/13 rounded-full blur-3xl' />

        <div className='relative flex flex-col justify-center items-center text-center mb-10'>
            <p className='uppercase tracking-widest text-xs font-semibold text-primary mb-4'>
                Let's Play
            </p>
            <h2 className='text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-primary leading-tight max-w-3xl mb-5'>
                Ready for your next rally?
            </h2>
            <p className='text-muted text-sm max-w-md'>
                Join the fastest growing sport in the world at the city's finest venue.
                Courts fill up fast—reserve your time today.
            </p>
        </div>

        <div className='relative flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto'>
            <button className="
                    relative overflow-hidden w-full sm:w-auto
                    bg-primary text-white
                    px-8 py-3.5 rounded-lg
                    text-sm
                    transition-all duration-300
                    hover:bg-white/50 hover:text-primary-lightdark
                    hover:ring-2 hover:ring-white/50
                    active:scale-95 group hover:cursor-pointer
                ">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary-lightdark/30 to-transparent skew-x-12" />
                <span className="relative">Start Playing Now</span>
            </button>

            <button className="
                    relative overflow-hidden w-full sm:w-auto
                    bg-white text-lightdark
                    px-8 py-3.5 rounded-lg
                    text-sm
                    transition-all duration-300
                    hover:bg-primary-lightdark hover:text-white
                    hover:ring-2 hover:ring-primary-lightdark
                    active:scale-95 group hover:cursor-pointer
                ">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                <span className="relative">Check Availability</span>
            </button>
        </div>
    </div>
  )
}