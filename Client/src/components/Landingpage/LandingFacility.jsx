import { Check, MapPin } from 'lucide-react'
import React from 'react'
import { LandingMapContainer } from './LandingMapContainer'

export const LandingFacility = () => {
  return (
    <div className='flex flex-col lg:flex-row mb-10'>
        <div className="FacilityleftCont flex-1 mt-15 order-2 lg:order-1">
            <div className='px-10 xl:pl-20 mb-5'>
                <p className='uppercase tracking-wide text-primary '>The Facility</p>
                <p className='uppercase text-3xl mb-5'>A New Standard in Recreational Excellence</p>
                <p className='text-muted'>Ylaya Smash Rally isn't just about courts; it's about the community and the experience. Our complex features eight championship-grade acrylic surfaces that provide consistent bounce and reduced impact on joints.</p>
            </div>

            <div className='px-10 xl:px-20 mb-5'>
                <div className='bg-card/30 w-full rounded-xl flex flex-wrap p-5 justify-around grid grid-cols-2 gap-4 shadow-lg inset-shadow-sm'>
                    <div className='flex items-center'>
                        <div className='w-6 h-6 bg-secondary/50 flex items-center justify-center rounded-full'>
                            <Check className='w-4 h-4 text-primary'/>
                        </div>
                        <span className='pl-2 text-highlight text-sm'>Tournament-Rated Court</span>
                    </div>
                    <div className='flex items-center'>
                        <div className='w-6 h-6 bg-secondary/50 flex items-center justify-center rounded-full'>
                            <Check className='w-4 h-4 text-primary'/>
                        </div>
                        <span className='pl-2 text-highlight text-sm'>Pro-Grade Lighting</span>
                    </div>
                    <div className='flex items-center'>
                        <div className='w-6 h-6 bg-secondary/50 flex items-center justify-center rounded-full'>
                            <Check className='w-4 h-4 text-primary'/>
                        </div>
                        <span className='pl-2 text-highlight text-sm'>Climate Control</span>
                    </div>
                </div>
            </div>
            <div className="px-10 xl:px-20 relative">
                <LandingMapContainer />
            </div>
        </div>
        <div className="FacilityrightCont flex-1 order-1 lg:order-2">
            <div className='flex items-center justify-center md:px-10'>
                <div className='w-[90%] md:w-full xl:w-138 bg-white/50 flex items-center justify-center rounded-2xl shadow-lg inset-shadow-sm p-4'>
                    <div className='relative w-full h-100 lg:h-auto'>
                        <img 
                            src="./images/ylayaCourt.jpg" 
                            alt="" 
                            className='w-full h-100 lg:h-auto object-cover rounded-xl' 
                        />
                        <div className='absolute bottom-5 left-2 min-md:left-5 flex flex-row items-center glass rounded-2xl p-4'>
                            <div>
                                <div className='w-10 h-10 md:w-12 md:h-12 bg-primary flex items-center justify-center rounded-full mr-1 md:mr-3'>
                                    <MapPin className='w-5 h-5 md:w-7 md:h-7 text-muted-foreground' />
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                <span className='uppercase trailing-wide text-primary text-sm'>Find Us</span>
                                <span className='text-xs'>Santo Nino Ylaya, Talamban, Cebu City</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
