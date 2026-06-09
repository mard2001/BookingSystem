import React from 'react'

export const LandingFoot = () => {
  return (
    <div className='mt-20 mb-30'>
        <div className='flex flex-col justify-center items-center text-center mb-10'>
            <span className='text-5xl font-medium text-primary mb-5'>Ready for your next rally?</span>
            <p className='text-secondary text-sm'>Join the fastest growing sport in the world at the city's finest venue.<br /> Courts fill up fast—reserve your time today.</p>
        </div>
        <div className='flex items-center justify-center space-x-3'>
            <button className="
                    relative overflow-hidden
                    bg-primary text-white
                    px-8 py-3.5 rounded-lg
                    text-sm 
                    transition-all duration-300
                    hover:bg-white/50 hover:text-[#005c9d]
                    hover:ring-2 hover:ring-white/50
                    active:scale-95 group hover:cursor-pointer
                ">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-[#005c9d]/30 to-transparent skew-x-12" />
                <span className="relative">Start Playing Now</span>
            </button>

            <button className="
                    relative overflow-hidden
                    bg-white text-[#005c9d]
                    px-8 py-3.5 rounded-lg
                    text-sm 
                    transition-all duration-300
                    hover:bg-[#005c9d] hover:text-white
                    hover:ring-2 hover:ring-[#005c9d]
                    active:scale-95 group hover:cursor-pointer
                ">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                <span className="relative">Check Availability</span>
            </button>
        </div>
    </div>
  )
}
