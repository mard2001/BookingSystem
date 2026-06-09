import React, { useEffect } from 'react'
import { Modal } from '../Modal'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react';
import { toast } from 'sonner';
import { registerUserCustomer } from '../../api/services/usersService';
import { registerRules } from '../../Rules/AuthInputRules';
import { validateForm } from '../../utils/ValueValidate';

const Register = ({ open, onClose, onSwitchToLogin }) => {
    const [ isPasswordVisible, setIsPasswordVisible ] = useState(false);
    const toggleVisibility = () => setIsPasswordVisible(!isPasswordVisible);
    const [fieldErrors, setFieldErrors] = useState({});
    const [ newUser, setNewUser ] = useState({
        username: "", password: "", email: "", firstName: "", middleName: "", lastName: "", suffix: "", birthDate: "", gender: "", contactNumber: ""
    });

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };
    
    const handleRegisterUser = async () => {
        const errors = validateForm(newUser, registerRules);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors); 
            return;
        }

        try {
            const added = await registerUserCustomer(newUser);
            toast.success(added.message);
            setFieldErrors({});
            setNewUser({
                username: "", password: "", email: "", firstName: "", middleName: "", lastName: "", suffix: "", birthDate: "", gender: "", contactNumber: ""
            })
            onSwitchToLogin();
        } catch (err) {
            toast.error(err.message);
            if (err.errors?.missing) {
                const errors = Object.fromEntries(err.errors.missing.map(f => [f, "This field is required."]));
                setFieldErrors(errors);
            }
        }
    };
    
    useEffect(() => {
        if (open) {
            setFieldErrors({});
            setNewUser({
                username: "", password: "", email: "", firstName: "", middleName: "", lastName: "", suffix: "", birthDate: "", gender: "", contactNumber: ""
            });
        }
    }, [open]);

    return (
        <Modal open={open} onClose={onClose} size="lg">
            <div className='mb-10 '>
                <div className='flex justify-start items-center px-5'>
                    <img src="./images/ylayaSmashRallyTransparent3.png" alt="" className='w-17 h-17 mr-2' />
                    <div className='my-4 text-start'>
                        <h3 className='text-2xl font-semibold text-primary capitalize whitespace-nowrap'>Join the Rally!</h3>
                        <p className="text-sm text-gray-500">Create your account to start booking courts.</p>
                    </div>
                </div>
                    <hr className='max-md :mb-10'/>

                <div>
                    <div className='flex justify-center items-center w-full mt-7'>
                        <hr className='flex-1 text-secondary/30'/>
                        <span className='ml-5 uppercase text-[9px] text-secondary'>Account Details</span>
                    </div>

                    <div className='grid max-lg:grid-cols-1 grid-cols-2 min-lg:gap-4'>
                        <div className=''>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Username</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.username 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <input 
                                    type="text" 
                                    name="username" 
                                    id="username" 
                                    onChange={handleRegisterChange}
                                    placeholder='e.g JohnDC2026'
                                    className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400`}
                                />
                            </div>
                            {fieldErrors.username && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.username} </span>)}
                        </div>
                        <div className=''>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Email</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.email 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    onChange={handleRegisterChange}
                                    placeholder='e.g DelaCruz.John@email.com'
                                    className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                                />
                            </div>
                            {fieldErrors.email && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.email} </span>)}
                        </div>
                    </div>
                    <div className=''>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Password</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.password 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                            <input 
                                type={ isPasswordVisible? "text": "password" } 
                                name="password" 
                                id="password" 
                                onChange={handleRegisterChange}
                                placeholder='**********'
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                            />
                            <button type='button' className='text-gray-500 hover:text-primary transition-colors duration-200 hover:cursor-pointer' onClick={toggleVisibility}>
                            { isPasswordVisible ? <Eye size={20}/> : <EyeOff size={20}/> }
                            </button>
                        </div>
                        {fieldErrors.password && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.password} </span>)}
                    </div>
                    
                    <div className='flex justify-center items-center w-full mt-7'>
                        <hr className='flex-1 text-secondary/30'/>
                        <span className='ml-5 uppercase text-[9px] text-secondary'>Personal Details</span>
                    </div>

                    <div className='grid max-lg:grid-cols-1 grid-cols-6 min-lg:gap-4'>
                        <div className='min-lg:col-span-3'>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>First Name</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.firstName 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <input 
                                    type="text" 
                                    name="firstName" 
                                    id="firstName" 
                                    onChange={handleRegisterChange}
                                    placeholder='John'
                                    className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                                />
                            </div>
                            {fieldErrors.firstName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.firstName} </span>)}
                        </div>
                        <div className='min-lg:col-span-3'>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>middle Name</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.middleName 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <input 
                                    type="text" 
                                    name="middleName" 
                                    id="middleName" 
                                    onChange={handleRegisterChange}
                                    placeholder='Dela Cruz'
                                    className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                                />
                            </div>
                            {fieldErrors.middleName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.middleName} </span>)}
                        </div>
                        <div className='min-lg:col-span-4'>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Last Name</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.lastName 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <input 
                                    type="text" 
                                    name="lastName" 
                                    id="lastName" 
                                    onChange={handleRegisterChange}
                                    placeholder='Dela Cruz'
                                    className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                                />
                            </div>
                            {fieldErrors.lastName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.lastName} </span>)}
                        </div>
                        <div className='min-lg:col-span-2'>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Suffix</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.suffix 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <select
                                    name='suffix'
                                    onChange={handleRegisterChange}
                                    className='h-7 w-full text-secondary bg-transparent focus:outline-none text-gray-700 text-sm cursor-pointer'
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select suffix</option>
                                    <option value="jr">Jr.</option>
                                    <option value="sr">Sr.</option>
                                    <option value="ii">II</option>
                                    <option value="iii">III</option>
                                    <option value="iv">IV</option>
                                    <option value="">None</option>
                                </select>
                            </div>
                            {fieldErrors.suffix && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.suffix} </span>)}
                        </div>
                    </div>

                    <div className='grid max-lg:grid-cols-1 grid-cols-3 min-lg:gap-4'>
                        <div className=''>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary text-secondary'>Birthday</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.birthDate 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <input 
                                    type="date"
                                    name="birthDate"
                                    onChange={handleRegisterChange}
                                    className='h-7 w-full bg-transparent focus:outline-none text-gray-700 cursor-pointer text-secondary'
                                />
                            </div>
                            {fieldErrors.birthDate && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.birthDate} </span>)}
                        </div>
                        <div className=''>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Gender</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.gender 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <select
                                    name='gender'
                                    onChange={handleRegisterChange}
                                    className='h-7 w-full bg-transparent focus:outline-none text-gray-700 text-sm cursor-pointer text-secondary'
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            {fieldErrors.gender && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.gender} </span>)}
                        </div>
                        <div className=''>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Contact Number</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.contactNumber 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                <input 
                                    type="text" 
                                    name="contactNumber" 
                                    id="contactNumber" 
                                    onChange={handleRegisterChange}
                                    placeholder='09*********'
                                    className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                                    maxLength={11}
                                    onKeyDown={(e) => {
                                        const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"]
                                        if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
                                    }}
                                />
                            </div>
                            {fieldErrors.contactNumber && (
                                <span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>
                                    *{fieldErrors.contactNumber} 
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className='mt-10'>
                    <button 
                        onClick={handleRegisterUser}
                        type="button" 
                        className='w-full rounded-2xl h-15 flex justify-center items-center space-x-4 bg-primary text-white shadow-sm hover:shadow-lg hover:bg-primary/90 hover:cursor-pointer'>
                        Register <ArrowRight size={20} />
                    </button>
                    <span onClick={onSwitchToLogin} className='text-xs text-secondary'>Already have an account? <span className='text-primary hover:text-primary-brighter hover:cursor-pointer'>Login & Book!</span></span>
                </div>
            </div>
        </Modal>
    )
}

export default Register
