import { BanknoteArrowDown, CalendarClockIcon, ClipboardCheck, FileText, LucideServer } from 'lucide-react';
import { createContext, useContext, useState } from 'react'

const AppointmentFormContext = createContext();
export const useAppointmentFormContext = () => useContext(AppointmentFormContext);

export const AppointmentFormProvider = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        courtInfo: {
            court: null,
        },
        dateTimeInfo: {
            date: "",
            time: [],
        },
        contactPersonInfo: {
            fullname:"",
            email:"",
            phoneNumber:""
        },
        paymentInfo: { 
            paymentMethod: null,  
            bookingID: null,   
            totalAmount: null, 
        }
    });

    const validateStep = (step) => {
        const newErrors = {}

        if (step === 1) {
            if (!formData.courtInfo.court) {
                newErrors.courtID = "Choose a court to continue to the next step."
            }
        }

        if (step === 2) {
            if (!formData.dateTimeInfo.date) {
                newErrors.date = "Pick your preferred date for the booking."
            }
            if (formData.dateTimeInfo.time.length === 0) {
                newErrors.time = "Select at least one time slot for the chosen date."
            }
        }

        if (step === 3) {
            if (!formData.contactPersonInfo.fullname) {
                newErrors.fullname = "Full name is required"
            }
            if (!formData.contactPersonInfo.email) {
                newErrors.email = "Email is required"
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactPersonInfo.email)) {
                newErrors.email = "Enter a valid email address"
            }
            if (!formData.contactPersonInfo.phoneNumber) {
                newErrors.phone = "Phone number is required"
            } else if (!/^09\d{9}$/.test(formData.contactPersonInfo.phoneNumber)) {
                newErrors.phone = "Phone number must start with 09"
            } else if (formData.contactPersonInfo.phoneNumber.length < 11) {
                newErrors.phone = "Phone number must be 11 digits"
            }
        }

        if (step === 4) {
            if (!formData.paymentInfo.paymentMethod) {
                newErrors.paymentMethod = "Please select a payment method to continue.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length == 0;
    }

    const updateCourtSelected = (court) => {
        setFormData(prev => ({ ...prev, courtInfo: { court } }))
    }

    const updateDateTimeSelected = (date, time) => {
        const parseTime = (t) => {
            const [hours, minutes] = t.split(":").map(Number);
            return hours * 60 + minutes;
        };

        const sortedTime = [...time].sort((a, b) => parseTime(a) - parseTime(b));

        setFormData(prev => ({
            ...prev,
            dateTimeInfo: { date, time: sortedTime }
        }));
    };

    const updateContactInfoSelected = (field, value) => {
        setFormData(prev => (
            { ...prev, 
                contactPersonInfo: 
                { 
                    ...prev.contactPersonInfo, 
                    [field]: value 
                } 
            }
        ))
    }

    const updatePaymentMethod = (method) => {
        setFormData(prev => (
            {
                ...prev, 
                paymentInfo: { 
                    ...prev.paymentInfo,
                    paymentMethod: method 
                }
            }
        ));
    };

    const updateBookingResult = (bookingID, totalAmount) => {
        setFormData(prev => (
            {
                ...prev,
                paymentInfo: { 
                    ...prev.paymentInfo, 
                    bookingID, totalAmount 
                }
            }
        ));
    };

    const nextStep = () => {
        if(validateStep(currentStep)){
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    }

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }

    const goToStep = (step) => setCurrentStep(step);

    const resetForm = () => {
        setFormData({
            courtInfo: { court: null },
            dateTimeInfo: { date: "", time: [] },
            contactPersonInfo: { fullname: "", email: "", phoneNumber: "" },
            paymentInfo: { paymentMethod: null, bookingID: null, totalAmount: null }
        });
        setErrors({});
        setCurrentStep(1);
    };


    const steps = [
        { id:"1", key:"step1", icon: LucideServer, title:"Court", description:"Choose Available Courts" },
        { id:"2", key:"step2", icon: CalendarClockIcon, title:"Date & Time", description:"Pick Date & Time" },
        { id:"3", key:"step3", icon: FileText, title:"Contact Information", description:"Basic Information" },
        { id:"4", key:"step4", icon: ClipboardCheck, title:"Summary", description:"Final Checking" },
        // { id:"5", key:"step5", icon: BanknoteArrowDown, title:"Payment",description:"Complete Payment" }, 
    ];

    const value = { steps, currentStep, formData, errors, updateCourtSelected, updateDateTimeSelected, updateContactInfoSelected, updatePaymentMethod, updateBookingResult, nextStep, prevStep, resetForm, goToStep };

    return (
        <AppointmentFormContext.Provider value={value}>
            {children}
        </AppointmentFormContext.Provider>
    );
}
