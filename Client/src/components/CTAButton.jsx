import React from 'react'

export const CTAButton = ({title, titleweight="normal", texttransform="normal", tracking="normal", primarybg, primarytextcolor, hoverbg, hovertextcolor, px, py}) => {
    return (
        <button className={`
            relative overflow-hidden
            bg-${primarybg} text-${primarytextcolor}
            px-${px} py-${py} rounded-lg
            text-sm font-${titleweight} tracking-${tracking} ${texttransform}
            transition-all duration-300
            hover:bg-${hoverbg} hover:text-${hovertextcolor}
            hover:ring-2 hover:ring-${hoverbg}
            active:scale-95
            group
            hover:cursor-pointer
        `}>
            {/* Shimmer sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            <span className="relative">{title}</span>
        </button>
    )
}
