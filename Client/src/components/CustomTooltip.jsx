import React from 'react'

export const CustomTooltip = ({content}) => {
    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1
                        bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        pointer-events-none z-50">
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
    )
}
