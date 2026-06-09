import { CheckCircle, InfoIcon } from "lucide-react"
import { useState } from "react"
import { useAppointmentFormContext } from "../../context/AppointmentFormContext"
import { useEffect } from "react";
import { apiHandler } from "../../utils/ApiHandler";
import { getCourts } from "../../api/services/courtService";
// import { availableCourts } from "../../constants/contants";


export const ServiceFormContent = () => {
    const {formData, errors, updateCourtSelected} = useAppointmentFormContext();
    const selectedCourt = formData.courtInfo.court;
    const [availableCourts, setAvailableCourts] = useState([]);

    useEffect(() => {
        getCourtsData();
    }, []);

    const getCourtsData = async () => {
        const data = await apiHandler(() => getCourts());

        if (data) {
        setAvailableCourts(data);
        }
    };
    return (
        <div>
            
            <p className='mb-5 font-bold'>Available Courts</p>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {availableCourts.map((court) => {
                    const isSelected = selectedCourt?.courtID === court.courtID
                    const isReserved = court.isActive != 1 
                    const courtStatus = court.isActive == 1? "Available":"Unavailable" 

                    return (
                        <div
                        key={"availableCourt" + court.courtID}
                        onClick={() => !isReserved && updateCourtSelected(isSelected ? null : court)}
                        className={`border rounded-2xl p-5 shadow-xl/10 transition-all duration-300 cursor-pointer border-2
                            ${isReserved ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-1"}
                            ${isSelected ? "border-primary bg-primary/5 " : "border-slate-200"}
                        `}
                        >
                        <div className='flex justify-between items-start gap-2'>
                            <span className='font-semibold text-sm'>{court.courtLabel} - {court.courtSport}</span>
                            <span className={`text-[8px] uppercase flex items-center justify-center px-3 py-1 rounded-full font-semibold
                            ${court.isActive === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                            `}>
                            {courtStatus}
                            </span>
                        </div>

                        <p className='text-secondary text-sm mt-1'>{court.courtType} · {court.courtDesc} </p>

                        <button
                            disabled={isReserved}
                            className={`mt-5 w-full text-center rounded-md py-1 font-bold text-sm transition-all duration-300 flex justify-center items-center
                            ${isReserved ? "opacity-40 cursor-not-allowed border border-slate-300 text-slate-400" :
                                isSelected
                                ? "bg-primary text-surface border border-primary"
                                : "outline-2 outline-offset-2 border border-primary text-primary hover:bg-primary hover:text-surface hover:cursor-pointer"
                            }
                            `}
                        >
                            {isSelected && <CheckCircle className="w-5 mr-2" />}
                            {isSelected ? "Selected" : "Select Court"}
                        </button>
                        </div>
                    )
                })}
            </div>

            {availableCourts.length == 0 && (
                <div className='mt-4 p-3 bg-secondary/5 border border-secondary/10 rounded-lg text-sm text-secondary/60 font-medium flex items-center'>
                    <InfoIcon className="w-4 mr-2" /> Not available as of the moment.
                </div>
            )}

            {errors && errors.courtID && !formData.courtInfo.court && (
                availableCourts.length != 0? 
                    <div className='mt-4 p-3 bg-[#FF0000]/5 border border-[#FF0000]/10 rounded-lg text-sm text-[#FF0000]/60 font-medium flex items-center'>
                        <InfoIcon className="w-4 mr-2" /> {errors.courtID}
                    </div>:
                    <div className='mt-4 p-3 bg-[#FF0000]/5 border border-[#FF0000]/10 rounded-lg text-sm text-[#FF0000]/60 font-medium flex items-center'>
                        <InfoIcon className="w-4 mr-2" /> Cannot Proceed.
                    </div>
            )}

            {selectedCourt && (
                <div className='mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm text-primary font-medium flex items-center '>
                <CheckCircle className="w-4 mr-2" /> {selectedCourt.courtLabel} ({selectedCourt.courtSport}, {selectedCourt.courtType}) selected
                </div>
            )}
        </div>
    )
}