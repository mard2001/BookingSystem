import { CheckCircle, ChevronLeft, ChevronRightIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { useAppointmentFormContext } from '../../context/AppointmentFormContext'
import { ServiceFormContent } from './ServiceFormContent'
import { DateTimeContent } from './DateTimeContent'
import { ContactInfoContent } from './ContactInfoContent'
import { SummaryContent } from './SummaryContent'




export const MultiStepForm = ({ onSuccess }) => {
    const summaryRef = useRef(null); 
    const { steps, currentStep, nextStep, prevStep } = useAppointmentFormContext();
    const [isChecking, setIsChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    

    const handleSelectTime = (time) => {
        setSelectedTimes(prev =>
            prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
        )
    }
    const renderStepContent = () => {
        switch(currentStep){
            case 1:
                return <ServiceFormContent />
            case 2:
                return  <DateTimeContent />
            case 3:
                return <ContactInfoContent />
            case 4: 
                return <SummaryContent ref={summaryRef} setIsChecking={setIsChecking} setIsSubmitting={setIsSubmitting} isConfirmed={isConfirmed} setIsConfirmed={setIsConfirmed} onSuccess={onSuccess} />
            default:
                null
        }
    }

    return (
        <div className='max-w-5xl mx-auto p-6'>
            <div className="mb-12">
                {/* Logics */}
                <div className="flex max-md:flex-wrap items-center justify-between max-md:justify-center mb-6">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;

                        const isActive = currentStep === stepNumber;
                        const isCompleted = currentStep > stepNumber;

                        return (
                            <div className='flex items-center max-sm:mb-10 max-md:mx-3' key={step.id}>
                                <div className='flex flex-col items-center'>
                                    <div
                                        className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-500 transform
                                        ${
                                            isCompleted
                                                ? "bg-gradient-to-r from-primary-brighter to-primary-brighter border-primary text-white shadow scale-110"
                                                : isActive
                                                ? "bg-gradient-to-r from-primary to-primary-brighter border-primary text-white shadow scale-110"
                                                : "bg-white border-gray-300 text-gray-400"
                                        }`}
                                    >
                                        {isCompleted? <CheckCircle/> : <step.icon/>}
                                    </div>
                                    <div className='mt-2 text-center'>
                                        <p className={`text-xs font-bold uppercase ${isActive? "text-primary": isCompleted?"text-primary-brighter":"text-muted"}`}>
                                            {step.key}
                                        </p>
                                        <p className={`mt-2 text-sm font-bold whitespace-nowrap ${isActive? "text-primary": isCompleted?"text-primary-brighter":"text-muted"}`}>
                                            {step.title}
                                        </p>
                                        <p className={`text-xs whitespace-nowrap ${isActive? "text-primary": isCompleted?"text-primary-brighter":"text-muted"}`}>
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && 
                                    <div className={`hidden lg:block w-24 h-1 min-lg:mx-6 rounded-full transition-all duration-500 ${
                                                        currentStep > step.id
                                                        ? "bg-gradient-to-r from-primary-brighter to-primary-200"
                                                        : "bg-gray-200"
                                                    }`}>

                                    </div>
                                }
                            </div>
                        );
                    })}
                </div>

                {/* Mobile Progressbar */}
                <div className="lg:hidden">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-black text-gray-700">Step {currentStep} of {steps.length}</span>
                        <span className="text-sm font-medium text-gray-600">{steps[currentStep-1].title}</span>
                    </div>
                    {/* Progressbar */}
                    <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
                        <div className="bg-gradient-to-r from-primary-brighter to-primary h-3 rounded-full transition-all duration-700" style={{width: `${(currentStep/steps.length)*100}%`}}></div>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-card backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 p-10 mb-10">
                <div className="min-h-[600]">{renderStepContent()}</div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
    
                <button onClick={prevStep} className={`flex items-center px-8 py-4 rounded-2xl font-semibold transition-all duration-200 hover:inset-shadow-sm hover:shadow-lg hover:-translate-y-1 hover:cursor-pointer 
                                                        ${currentStep == 1 || isConfirmed ?"invisible cursor-not-allowed":"visible"}`}>
                    <ChevronLeft className='w-5 h-5 mr-2' />
                    Previous
                </button> 

                {currentStep < steps.length ? (
                    <button onClick={nextStep} className={`flex items-center px-8 py-4 rounded-2xl font-semibold transition-all duration-200 hover:inset-shadow-sm hover:shadow-lg hover:-translate-y-1 hover:cursor-pointer`}>
                        Next
                        <ChevronRightIcon className='w-5 h-5 ml-2' />
                    </button>
                ) : isConfirmed ? (
                    null  
                ): (
                    <button
                        onClick={() => summaryRef.current?.handleConfirmBooking()}
                        disabled={isChecking || isSubmitting}
                        className={`flex items-center px-10 py-4  text-white
                                    rounded-2xl font-semibold transition-all duration-200 shadow-lg  
                                    ${isChecking || isSubmitting ? 'bg-secondary/50': 'bg-gradient-to-r from-primary to-primary-brighter hover:from-primary-brighter hover:to-primary hover:cursor-pointer hover:shadow:lg transform hover:-translate-y-1'}`}
                    >
                        {isChecking
                            ? 'Checking availability...'
                            : isSubmitting
                                ? 'Confirming booking...'
                                : isConfirmed
                                    ? 'Booking Confirmed'
                                    : 'Check Availability & Submit'
                        }
                    </button>
                )}
                
                
            </div>
        </div>
    )
}
