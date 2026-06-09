import { CalendarCheck2Icon, IdCardIcon, Info, InfoIcon, Mail, Phone, Ratio } from 'lucide-react'
import React from 'react'
import { useAppointmentFormContext } from '../../context/AppointmentFormContext';
import { useEffect } from 'react';
import { getStoredUser } from '../../utils/LocalVariables';
import { addOneHour, formatSlotTime } from '../../utils/ValueFormat';
import { toast } from 'sonner';

export const ContactInfoContent = () => {
    const { formData, errors, updateContactInfoSelected} = useAppointmentFormContext();

    const selectedCourt = formData.courtInfo.court;

    const formattedDate = formData.dateTimeInfo.date 
        ? formData.dateTimeInfo.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "No date selected";

    const formattedTimes = () => {
        const time = formData.dateTimeInfo.time;

        if (!time || time.length === 0) {
            toast.error("No time selected.");
            return "";
        }

        const firstTime = time[0];
        const startTime = formatSlotTime(firstTime);
        const lastTime = time[time.length - 1];
        const endTime = formatSlotTime(addOneHour(lastTime));

        return `${startTime} - ${endTime}`;
    }

    useEffect(() => {
        const user = getStoredUser();
        if (!user) return;

        if (user.firstName && user.lastName)
            updateContactInfoSelected("fullname", `${user.firstName} ${user.lastName}`);

        if (user.email)
            updateContactInfoSelected("email", user.email);

        if (user.contactNumber)
            updateContactInfoSelected("phoneNumber", user.contactNumber);

    }, []); 

    return (
        <div className='min-lg:w-[80%] mx-auto'>
            <h1 className='text-primary text-xl font-bold'>Your Details</h1>
            <p className='text-sm text-secondary'>We'll use this information to confirm your court reservation and send you entry instructions.</p>
            <div className='mt-5'>
                <div className='mb-5 w-[90%] mx-auto'>
                    <div className='mb-1'>
                        <span className='text-xs font-semibold uppercase tracking-widest text-secondary font-semibold'>Full Name</span>
                    </div>
                    <div className={`flex items-center border ${errors.fullname? "border-[#FF0000]/60":"border-gray-200" } rounded-2xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap3 focus-within:ring-2 focus:bg-white/80`}>
                        <IdCardIcon size={20} className='text-gray-500' />
                        <input 
                            type="text" 
                            name="fullname" 
                            id="fullname"
                            value={formData.contactPersonInfo.fullname} 
                            onChange={(e) => updateContactInfoSelected("fullname", e.target.value)}
                            placeholder='Josse Smith'
                            className='h-10 pl-5 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                        />
                    </div>
                    {
                        errors.fullname && (
                            <p className='flex items-center text-[#FF0000]/60 text-xs ml-5'><InfoIcon className='w-3 mr-1' />{errors.fullname}</p>
                        )
                    }
                </div>
                <div className='mb-5 w-[90%] mx-auto'>
                    <div className='mb-1'>
                        <span className='text-xs font-semibold uppercase tracking-widest text-secondary font-semibold'>Email</span>
                    </div>
                    <div className={`flex items-center border ${(errors.email)? "border-[#FF0000]/60":"border-gray-200" } rounded-2xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap3 focus-within:ring-2 focus:bg-white/80`}>
                        <Mail size={20} className='text-gray-500' />
                        <input 
                            type="text" 
                            name="email" 
                            id="email" 
                            value={formData.contactPersonInfo.email}
                            onChange={(e) => updateContactInfoSelected("email", e.target.value)}
                            placeholder='JosseSmith@gmail.com'
                            className='h-10 pl-5 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                        />
                    </div>
                    {
                        errors.email && (
                            <p className='flex items-center text-[#FF0000]/60 text-xs ml-5'><InfoIcon className='w-3 mr-1' />{errors.email}</p>
                        )
                    }
                </div>
                <div className='mb-5 w-[90%] mx-auto'>
                    <div className='mb-1'>
                        <span className='text-xs font-semibold uppercase tracking-widest text-secondary font-semibold'>Phone Number</span>
                    </div>
                    <div className={`flex items-center border ${errors && errors.phone && formData.contactPersonInfo.phoneNumber == ""? "border-[#FF0000]/60":"border-gray-200" } rounded-2xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap3 focus-within:ring-2 focus:bg-white/80`}>
                        <Phone size={20} className='text-gray-500' />
                        <input 
                            type="text" 
                            name="phoneNumber" 
                            id="phoneNumber" 
                            value={formData.contactPersonInfo.phoneNumber}
                            onChange={(e) => updateContactInfoSelected("phoneNumber", e.target.value)}
                            placeholder='09*********'
                            className='h-10 pl-5 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                            maxLength={11}
                            onKeyDown={(e) => {
                                const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"]
                                if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
                            }}
                        />
                    </div>
                    {errors.phone && (
                        <p className='flex items-center text-[#FF0000]/60 text-xs ml-5'>
                            <InfoIcon className='w-3 mr-1' />{errors.phone}
                        </p>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
                    <div className='mt-4 p-3 bg-primary/10 border border-primary/10 rounded-lg flex items-center'>
                        <div className='flex space-x-2'>
                            <Ratio className='w-5 h-5 text-primary' />
                            <div>
                                <p className='text-secondary uppercase font-normal text-xs'>Court</p>
                                <div className=''>
                                    <p className='text-primary font-semibold'>{selectedCourt ? `${selectedCourt.courtLabel} — ${selectedCourt.courtSport}` : "None selected"}</p>
                                    <p className='text-primary font-normal text-sm'>{selectedCourt ? `${selectedCourt.courtType}` : ""}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mt-4 p-3 bg-primary/10 border border-primary/10 rounded-lg flex items-center'>
                        <div className='flex space-x-2'>
                            <CalendarCheck2Icon className='w-5 h-5 text-primary' />
                            <div>
                                <p className='text-secondary uppercase font-normal text-xs'>Date & Time</p>
                                <div className=''>
                                    <p className='text-primary font-semibold'>{formattedDate}</p>
                                    <p className='text-primary font-normal text-sm'>{formattedTimes()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-4 p-3 bg-primary/10 border border-primary/10 rounded-lg text-sm text-primary font-medium flex items-center'>
                    <Info className='w-5 mr-2'/> By processing, you agree to our Terms of Service and Privacy Policy. 
                </div>
            </div>
        </div>
    )
}
