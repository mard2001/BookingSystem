import React from 'react'

const Footer = () => {
  return (
    <div>
      <div className='relative flex px-10 pb-10 border-t border-secondary-foreground/20 pt-5 space-x-10 shadow-[0_-4px_6px_rgba(0,0,0,0.1)]'>
        <div className='grow relative'>
            <img src="./images/ylayaSmashRallyTransparent3.png" className='w-20 h-auto' />
            <div className='w-[30%]'>
                <span className='text-secondary'>Premium pickleball experience designed for those who demand the best in recreational facilities and athletic excellence.</span>
            </div>
        </div>
        <div className='flex-none'>
            <span className='text-primary uppercase text-xs font-bold tracking-wider'>Company</span>
            <div className='mt-5'>
                <ul className='text-secondary text-sm space-y-2.5'>
                    <li>Contact Us</li>
                    <li>Terms of Service</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>
        </div>
        <div className='flex-none'>
            <span className='text-primary uppercase text-xs font-bold tracking-wider'>Social</span>
            <div className='mt-5'>
                <ul className='text-secondary text-sm space-y-2.5'>
                    <li>Instagram</li>
                    <li>Facebook</li>
                </ul>
            </div>
        </div>
      </div>
      <div className='px-10 pb-10'>
        <span className='text-secondary/40 text-xs'>© 2024 Ylaya Smash Rally. ALL RIGHTS RESERVED.</span>
      </div>
    </div>
  )
}

export default Footer
