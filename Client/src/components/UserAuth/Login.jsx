import React, { useEffect } from 'react'
import { useState } from 'react';
import { Modal } from '../Modal';
import { ArrowRight, Eye, EyeOff, LockIcon, UserCircle2Icon } from 'lucide-react';
import { useLogin } from '../../hooks/authApi';
import { validateForm } from '../../utils/ValueValidate';
import { loginRules } from '../../Rules/AuthInputRules';

export const Login = ({ open, onClose, onSwitchToRegister }) => {
    const [ isPasswordVisible, setIsPasswordVisible ] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const toggleVisibility = () => setIsPasswordVisible(!isPasswordVisible);
    const [fieldErrors, setFieldErrors] = useState({});
    const { mutate: login, isPending, error } = useLogin();

    const handleSubmit = () => {
        setFieldErrors({});
        const errors = validateForm({username,password}, loginRules);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors); 
            return;
        }

        login(
            { username, password },
            { onSuccess: () => onClose() }
        );
    };

    useEffect(() => {
        if (open) {
            setFieldErrors({});
            setUsername("");
            setPassword("");
        }
    }, [open]);

    return (
        <Modal open={open} onClose={onClose} size="md">
            <div className='text-center-w-56 mb-10'>
                <img src="./images/ylayaSmashRallyTransparent3.png" alt="" className='w-30 h-30 mx-auto' />
                <div className='mx-auto my-4 text-center'>
                    <h3 className='text-2xl font-semibold text-primary capitalize whitespace-nowrap'>Welcome Back, Champ!</h3>
                    <p className="text-sm text-gray-500">The court's been waiting — glad you're here.</p>
                    <p className="text-sm text-gray-500">Please enter your credentials.</p>
                </div>

                <div>
                    <div className='mb-10 w-[90%] mx-auto'>
                        <div className='mb-1'>
                            <span className='text-xs font-semibold uppercase tracking-widest text-primary'>Username</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-2xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap3 focus-within:ring-2 focus:bg-white/80
                            ${fieldErrors.username 
                                ? "border-red-500 focus:ring-red-300" 
                                : "border-gray-200 focus:ring-primary/30"
                            }`}>
                            <UserCircle2Icon size={20} className='text-gray-500' />
                            <input 
                                type="text" 
                                name="username" 
                                id="username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder='Joe123'
                                className='h-10 pl-5 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400' 
                            />
                        </div>
                        {fieldErrors.username && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.username} </span>)}
                    </div>
                </div>
                <div className='mb-10 w-[90%] mx-auto'>
                    <div className='flex items-center justify-between mb-1'>
                        <span className='text-xs font-semibold uppercase tracking-widest text-primary'>Password</span>
                        <span className='text-[10px] font-regular text-secondary uppercase tracking-widest hover:cursor-pointer hover:text-primary transition-colors duration-200'>Forgot Password?</span>
                    </div>
                    <div className={`flex items-center border border-gray-200 rounded-2xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap3 focus-within:ring-2 focus:bg-white/80
                            ${fieldErrors.password 
                                ? "border-red-500 focus:ring-red-300" 
                                : "border-gray-200 focus:ring-primary/30"
                            }`}>
                        <LockIcon size={20} className='text-gray-500' />
                        <input
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder='**********'
                            name="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='h-10 pl-5 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400'
                        />
                        <button type='button' className='text-gray-500 hover:text-primary transition-colors duration-200 hover:cursor-pointer' onClick={toggleVisibility}>
                            {isPasswordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                    </div>
                    {fieldErrors.password && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.password} </span>)}
                </div>
                <div>
                    <button type="button" onClick={handleSubmit} disabled={isPending} className='w-full rounded-2xl h-15 flex justify-center items-center space-x-4 bg-primary text-white shadow-sm hover:shadow-lg hover:bg-primary/90 hover:cursor-pointer'>
                        {isPending ? "Signing in..." : "Sign In"} <ArrowRight size={20} />
                    </button>
                    <span onClick={onSwitchToRegister} className='text-xs text-secondary'>Don't have an account? <span className='text-primary hover:text-primary-brighter hover:cursor-pointer'>Register Now!</span></span>
                </div>
                
    
            </div>
        </Modal>
    );
}
