import React from 'react'
import Lottie from "react-lottie-player";
import successAnimation from "../../assets/animations/successAnimation.json";


export const BookingConfirmation = ({ bookingId, onReset }) => {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <Lottie
          animationData={successAnimation}
          loop={false}
          play
          style={{ width: 80 }}
        />
      </div>

      <h1 className="text-2xl font-bold mt-4">Booking Confirmed!</h1>
      <p className="text-secondary text-sm mt-1">The court reservation has been successfully processed and the owner has been notified via email.</p>
      <p className="text-secondary text-sm mt-1">Thank you! We look forward to serving you again in the future!</p>

      <div className="my-10">
        <div className='inline-block bg-green-200 text-secondary py-2 px-5 rounded-full text-xs'>
          <span className='block sm:inline'>REFERENCE BOOKING ID:</span>
          <span className='block sm:inline sm:ml-3 font-bold text-sm'>{bookingId}</span>
        </div>
      </div>
      <p className="text-secondary text-sm mt-1">*Kindly take a screenshot for your records.</p>

      <button
        onClick={onReset}
        className="mt-10 px-8 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all hover:cursor-pointer"
      >
        Book Another Court
      </button>
    </div>
  )
}
