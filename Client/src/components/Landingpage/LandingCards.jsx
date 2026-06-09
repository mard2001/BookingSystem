import React from 'react'

export const LandingCards = ({icon: Icon, title, description}) => {
    
  return (
    <div className='w-auto md:w-80 glass m-3 py-5 px-8 rounded-3xl shadow-xl/10 inset-shadow-sm'>
        <div className='w-13 h-13 flex items-center justify-center bg-gradient-to-tr from-highlight to-highlight/80 text-primary-foreground rounded-xl shadow-xl/20 inset-shadow-sm'>
            <Icon className='w-7 h-7' />
        </div>
        <p className='text-highlight mt-5 font-semibold text-md'>{title}</p>
        <p className='text-black/50 mt-3 text-sm md:text-md'>{description}</p>
    </div>
  )
}
