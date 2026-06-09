import { X } from 'lucide-react'
import React from 'react'

export const Modal = ({open, onClose, size="md", children}) => {

    const sizeClass = {
        sm: "w-80",
        md: "w-[500px]",
        lg: "w-[800px]",
        xl: "w-[1100px]",
        full: "w-screen h-screen rounded-none",
    }

    return (
        <div onClick={onClose} className={`
            z-100 fixed inset-0 flex justify-center items-center transition-colors px-4 py-8
            ${open ? "visible bg-black/70":"invisible"}
        `}>
            {/* Modal */}
            <div onClick={(e) => e.stopPropagation()} className={`
                relative bg-white rounded-xl shadow transition-all flex flex-col
                max-h-[90vh]
                ${sizeClass[size] ?? sizeClass["md"]}
                ${open ? "scale-100 opacity-100": "scale-125 opacity-0"}    
            `}>
                {/* Sticky close button — stays fixed at top */}
                <div className="flex-shrink-0 flex justify-end bg-transparent rounded-t-xl px-2 pt-2">
                    <button onClick={onClose} className='p-1 rounded-lg text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-600 hover:cursor-pointer'>
                        <X />
                    </button>
                </div>

                {/* Content — only this scrolls */}
                <div className="overflow-y-auto px-6 pb-6">
                    {children}
                </div>
            </div>
        </div>
    )
}