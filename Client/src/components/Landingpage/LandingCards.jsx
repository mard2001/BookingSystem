import React from 'react'

export const LandingCards = ({ icon: Icon, title, description }) => {
  return (
    <div className='w-auto md:w-70 min-h-56 glass m-3 py-5 px-8 rounded-3xl shadow-xl/10 inset-shadow-sm transition-all duration-200 ease-out hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-1'>
      <div className='w-13 h-13 flex items-center justify-center bg-gradient-to-tr from-highlight to-highlight/80 text-primary-foreground rounded-xl shadow-xl/20 inset-shadow-sm transition-transform duration-200 group-hover:rotate-3'>
        <Icon className='w-7 h-7' />
      </div>
      <p className='text-highlight mt-5 font-semibold text-base'>{title}</p>
      <p className='text-black/50 mt-3 text-sm leading-relaxed'>{description}</p>
    </div>
  )
}