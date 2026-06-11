import { ArrowRight, EditIcon, PlusCircle, Trash2Icon, UserCog2 } from 'lucide-react';
import React from 'react'
import { Tabs } from '../components/Tabs';
import { useState } from 'react';
import { shortFormatReadableDate } from '../utils/ValueFormat';
import { useMemo } from 'react';
import { getExportFilename } from '../utils/ExportTable';
import { DataTable } from '../components/DataTable';
import { useEffect } from 'react';
import CalendarClosureApp from '../components/Calendars/CalendarClosures';
import { Modal } from "../components/Modal";
import { validateForm } from '../utils/ValueValidate';
import { closureCreateRules } from '../Rules/CourtInputRules';
import { getAvailableCourts } from '../api/services/courtService';
import { toast } from 'sonner';

export const ClosurePage = () => {
    const [closureDates, setClosureDates] = useState([]);
    const [closureLoading, setClosureLoading] = useState(true);
    const [closureError, setClosureError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [closureModalOpen, setClosureModalOpen] = useState(false);
    const [availableCourts, setAvailableCourts] = useState([]);
    const [newClosure, setNewClosure] = useState({
        type:"", reason:"", blackoutDateStart:"", blackoutDateEnd:"", scope:"", courtID:"",remarks:""
    })

    const columnsClosure = useMemo(() => [
    { 
        header: "Reason",
        accessorFn: (row) => row.reason,
        cell: ({ row }) => (
            <div className='flex items-center'>
                <p className="text-xs">{row.original.reason}</p>
            </div>
        ),
    },
    { 
        header: "Closure Date",
        accessorKey: "blackoutDate",
        cell: ({ row }) => (
            <div>
                <p className="">{shortFormatReadableDate(row.original.blackoutDate)}</p>
            </div>
        ),
    },
    { 
        header: "Scope",
        accessorKey: "scope",
        cell: ({ row }) => (
            <div>
                <p className="">{row.original.scope}</p>
            </div>
        ),
    },
    { 
        header: "court Affected",
        accessorKey: "courtID",
        cell: ({ row }) => (
            <div>
                <p className="">{row.original.courtID}</p>
            </div>
        ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => console.log(row.original)}
            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 hover:cursor-pointer"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => console.log(row.original)}
            className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 hover:cursor-pointer"
          >
            <Trash2Icon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ], []);
    
    const tabs = [
        {
            id: "tab1",
            label: "Calendar View",
            content: 
                <div>
                    <DataTable
                        data={closureDates}
                        columns={columnsClosure}
                        loading={closureLoading}
                        error={closureError}
                        placeholder="Search Close Dates..."
                        pageSize={5}
                        exportable={true}
                        exportFilename={getExportFilename("CloseDates")}
                    />
                </div>
        },
        {
            id: "tab2",
            label: "Calendar View", 
            content:
                <div>
                    <CalendarClosureApp />
                </div>
        }
    ]

    const handleNewClosureChange = (e) => {
        const { name, value } = e.target;
        setNewClosure(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmitNewClosure = () => {
        console.log(newClosure)

        const errors = validateForm(newClosure, closureCreateRules);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors); 
            return;
        }
    }

    const fetchClosureDates = async () => {
        try {
            setClosureLoading(true);
            // const closeDates = await getAllActiveAdmin();
            // setClosureDates(closeDates);
        } catch (err) {
            setClosureError("Failed to load active admins.");
        } finally {
            setClosureLoading(false);
        }
    };

    const fetchAvailableCourts = async () => {
        try {
            const avail = await getAvailableCourts();
            if(avail.data?.length > 0){
                setAvailableCourts(avail.data);
            } else {
                toast.error(avail.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        fetchClosureDates();
        fetchAvailableCourts();
    },[])
    return (
        <>
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-2xl sm:text-3xl font-bold text-primary">Court Closures & Holidays</p>
                        <p className="text-sm text-secondary">Manage blackout dates and scheduled maintenance periods.</p>
                    </div>
                    <button onClick={() => {setFieldErrors({}); setClosureModalOpen(true)}}
                        className="flex items-center justify-center w-full sm:w-auto px-6 sm:px-10 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 hover:cursor-pointer">
                        <PlusCircle className="w-5 h-5 mr-2" /> Add Closure
                    </button>
                </div>
            </div>

            <div className='pt-5'>
                <Tabs tabs={tabs} defaultTab="tab1" />
            </div>

            
            <Modal open={closureModalOpen} onClose={() => { setClosureModalOpen(false);}}>
                <div>
                    <h2 className="text-xl font-bold text-primary mb-1">Add New Close Date</h2>
                    <p className="text-sm text-secondary mb-6">Set a date when the court will be unavailable for bookings.</p>

                    <hr className='max-md mb-5 text-secondary/30'/>
                    <div>
                        <div className=''>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Reason</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.reason 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <input 
                                    type="text" 
                                    name="reason" 
                                    id="reason"
                                    value={newClosure.reason}
                                    onChange={handleNewClosureChange}
                                    placeholder='e.g Annual Maintenance'
                                    className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400`}
                                />
                            </div>
                            {fieldErrors.reason && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.reason} </span>)}
                        </div>

                        <div className=''>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Closure Type</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.reason 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <select
                                    name='type'
                                    id="type" 
                                    value={newClosure.type}
                                    onChange={handleNewClosureChange}
                                    className='h-7 w-full text-secondary bg-transparent focus:outline-none text-gray-700 text-sm cursor-pointer'
                                >
                                    <option value="" disabled>Select Closure Type</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="holiday">Holiday</option>
                                    <option value="emergency">Emergency</option>
                                    <option value="others">Others</option>
                                </select>
                            </div>
                            {fieldErrors.type && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.type} </span>)}
                        </div>

                        <div className=''>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Start Date</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.reason 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <input 
                                    type="date" 
                                    name="blackoutDateStart" 
                                    id="blackoutDateStart"
                                    value={newClosure.blackoutDateStart}
                                    onChange={handleNewClosureChange}
                                    placeholder='e.g Annual Maintenance'
                                    className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400`}
                                />
                            </div>
                            {fieldErrors.blackoutDateStart && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.blackoutDateStart} </span>)}
                        </div>

                        <div className=''>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>End Date</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.reason 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <input 
                                    type="date" 
                                    name="blackoutDateEnd" 
                                    id="blackoutDateEnd"
                                    value={newClosure.blackoutDateEnd}
                                    onChange={handleNewClosureChange}
                                    placeholder='e.g Annual Maintenance'
                                    className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400`}
                                />
                            </div>
                            {fieldErrors.blackoutDateEnd && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.blackoutDateEnd} </span>)}
                        </div>

                        <div className=''>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Court Scope</span>
                            </div>

                            <div className="flex gap-2 mt-1 mb-2">
                                <button
                                    type="button"
                                    onClick={() => handleNewClosureChange({ target: { name: 'scope', value: 'all' } })}
                                    className={`px-3 py-1 text-xs rounded-full border transition-all hover:cursor-pointer
                                        ${newClosure.scope === 'all' 
                                            ? 'bg-primary text-white border-primary' 
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'
                                        }`}
                                >
                                    All Courts
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleNewClosureChange({ target: { name: 'scope', value: 'court' } })}
                                    className={`px-3 py-1 text-xs rounded-full border transition-all hover:cursor-pointer
                                        ${newClosure.scope === 'court' 
                                            ? 'bg-primary text-white border-primary' 
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'
                                        }`}
                                >
                                    Specific Courts
                                </button>
                            </div>

                            {newClosure.scope === 'court' && (
                                <div className={`flex flex-wrap gap-2 border rounded-xl px-4 py-3 bg-white/60 shadow-sm
                                        ${fieldErrors.courtID 
                                            ? 'border-red-500' 
                                            : 'border-gray-200'
                                        }`}>
                                    {availableCourts.length === 0 ? (
                                        <span className="text-xs text-gray-400">No courts available.</span>
                                    ) : (
                                        availableCourts.map(court => {
                                            const isSelected = newClosure.courtID?.includes(court.courtID);
                                            return (
                                                <button
                                                    key={court.courtID}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = newClosure.courtID ?? [];
                                                        const updated = isSelected
                                                            ? current.filter(id => id !== court.courtID)
                                                            : [...current, court.courtID];
                                                        handleNewClosureChange({ target: { name: 'courtID', value: updated } });
                                                    }}
                                                    className={`px-3 py-1 text-xs rounded-full border transition-all hover:cursor-pointer
                                                        ${isSelected 
                                                            ? 'bg-primary text-white border-primary' 
                                                            : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'
                                                        }`}
                                                >
                                                    {court.courtLabel} — {court.courtSport}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                            {fieldErrors.courtID && (
                                <span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.courtID}</span>
                            )}
                        </div>

                        <div className=''>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Notes / Remarks / Description</span>
                            </div>
                            <div className={`flex border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-2 shadow-sm hover:shadow-md transition-shadow duration-300 focus-within:ring-2
                                    ${fieldErrors.remarks 
                                        ? "border-red-500 focus-within:ring-red-300" 
                                        : "border-gray-200 focus-within:ring-primary/30"
                                    }`}>
                                <textarea
                                    name="remarks"
                                    id="remarks"
                                    rows={3}
                                    value={newClosure.remarks}
                                    onChange={handleNewClosureChange}
                                    placeholder='Optional details for admins and players...'
                                    className='w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400 resize-none text-sm'
                                />
                            </div>
                            {fieldErrors.remarks && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.remarks}</span>)}
                        </div>

                    </div>

                    <div className='mt-10'>
                        <button 
                            onClick={handleSubmitNewClosure}
                            type="button" 
                            className='w-full rounded-2xl h-12 flex justify-center items-center space-x-4 bg-primary text-white shadow-sm hover:shadow-lg hover:bg-primary/90 hover:cursor-pointer'>
                            Add New Closure <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
