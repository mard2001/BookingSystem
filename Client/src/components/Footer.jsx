import React from 'react'

const FOOTER_LINKS = {
  company: [
    { label: 'Contact Us', href: '#contact' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Privacy Policy', href: '#privacy' },
  ],
}

const SOCIALS = [
  { label: 'Instagram', href: '#' },
  { label: 'Facebook', href: '#' },
]

const Footer = () => {
  return (
    <>
        <div className='border-t border-secondary-foreground/20 shadow-[0_-4px_6px_rgba(0,0,0,0.05)]'>
            <div className='flex flex-col justify-between md:flex-row gap-10 md:gap-6 px-6 md:px-10 pt-10 pb-10'>
                <div className='md:grow max-w-sm'>
                <img src="./images/bunalBrad_Transparent1.png" className='w-20 h-auto mb-4' alt="Bunal Brad" />
                <p className='text-muted text-sm leading-relaxed'>
                    Premium pickleball experience designed for those who demand the best in
                    recreational facilities and athletic excellence.
                </p>
                </div>

                <div className='flex gap-16 sm:gap-24'>
                <div className='flex-none'>
                    <span className='text-primary uppercase text-xs font-bold tracking-wider'>
                    Company
                    </span>
                    <ul className='text-muted text-sm space-y-2.5 mt-5'>
                    {FOOTER_LINKS.company.map(({ label, href }) => (
                        <li key={label}>
                        <a href={href} className='transition-colors duration-200 hover:text-primary'>
                            {label}
                        </a>
                        </li>
                    ))}
                    </ul>
                </div>

                <div className='flex-none'>
                    <span className='text-primary uppercase text-xs font-bold tracking-wider'>
                    Social
                    </span>
                    <ul className='text-muted text-sm space-y-2.5 mt-5'>
                    {SOCIALS.map(({ label, href }) => (
                        <li key={label}>
                        
                            <a href={href} className='flex items-center gap-2 transition-colors duration-200 hover:text-primary'>
                            {/* <Icon className='w-4 h-4' /> */}
                            {label}
                        </a>
                        </li>
                    ))}
                    </ul>
                </div>
                </div>
            </div>

            <div className='px-6 md:px-10 pb-8 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center'>
                <span className='text-muted/40 text-xs uppercase tracking-wide'>
                © 2026 Bunal Brad. All rights reserved.
                </span>
            </div>
        </div>
    </>
  )
}

export default Footer