import React from 'react'

export const LandingAbout = () => {
    const cards = [
        { title: "2 outdoor courts", desc: "Official Court Size" },
        { title: "2 PM – 11 PM", desc: "Open every day" },
        { title: "Message us to book", desc: "We'll lock in your court" },
        { title: "₱250 – ₱300", desc: "Hourly rates, all-in" },
    ];

    const courtTypes = [
        {
            name: "PROFESSIONAL COURT",
            desc: "Standard full-size competition pickleball court, billed hourly.",
            rates: [
                { time: "2:00 PM – 4:00 PM", price: "₱250" },
                { time: "5:00 PM – 11:00 PM", price: "₱300" },
            ],
        },
    ];

    return (
        <div className='px-20'>
            <h1 className='uppercase text-3xl mb-5'>Built for better play.</h1>
            <p className='text-muted text-sm lg:w-[850px]'>Bright spaces, quality courts, and a relaxed atmosphere come together to create an experience that's as enjoyable off the court as it is on it. Experience thoughtfully designed courts, a clean modern environment, and seamless convenience—all created to elevate every moment you spend on the court.</p>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch mt-10 2xl:w-[80%] 2xl:mx-auto'>
                <div className="bg-white/50 rounded-3xl p-4 h-full">
                    <div className="grid grid-cols-2 grid-rows-2 gap-5 h-full">
                        {cards.map((card) => (
                            <div
                                key={card.title}
                                className="bg-white rounded-2xl p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 hover:cursor-default flex flex-col justify-center"
                            >
                                <p className="text-xl font-bold text-gray-900 mb-1">
                                    {card.title}
                                </p>
                                <p className="text-sm text-gray-400">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/50 rounded-3xl p-6 h-full flex flex-col ">
                    <h2 className="font-serif text-3xl text-gray-900 mb-4">Court rates</h2>

                    <div className="flex flex-col gap-4 flex-1">
                        {courtTypes.map((court) => (
                            <div
                                key={court.name}
                                className="bg-white rounded-2xl p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 hover:cursor-default"
                            >
                                <p className="text-xs font-bold tracking-wide text-primary mb-1 uppercase">
                                    {court.name}
                                </p>
                                <p className="text-sm text-gray-400 mb-3">{court.desc}</p>

                                <div className="flex flex-col divide-y divide-gray-100">
                                    {court.rates.map((rate) => (
                                        <div
                                            key={rate.time}
                                            className="flex items-center justify-between py-2.5"
                                        >
                                            <span className="text-sm text-gray-700">{rate.time}</span>
                                            <span>
                                                <span className="font-bold text-gray-900">{rate.price}</span>
                                                <span className="text-gray-400 text-sm"> per hour</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}