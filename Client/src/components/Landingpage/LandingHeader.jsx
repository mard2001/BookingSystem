import React, { useEffect, useState } from 'react'
import { Modal } from '../Modal';
import { ArrowRight, ChevronDown, Eye, EyeOff, LockIcon, UserCircle2Icon, X } from 'lucide-react';
import { Login } from '../UserAuth/Login';
import Register from '../UserAuth/Register';
import { logout } from '../../api/services/authService';
import { useAuth } from '../../context/AuthContext';
import { getDecryptedRole } from '../../utils/Crypto';

export const LandingHeader = () => {
    const role = getDecryptedRole();
    const { loggedInUser, handleLogout } = useAuth();

    const [isScrolled, setIsScrolled] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false); 

    // Open a specific modal
    const openModal = (name) => {
        setActiveModal(name);
        setMenuOpen(false); 
    };

    // Close all modals
    const closeModal = () => setActiveModal(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        }

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    },[])

    return (
        <>
       <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                isScrolled
                ? 'bg-[#005c9d]/95 backdrop-blur-md py-3 border-b border-white/10 shadow-lg shadow-[#005c9d]/30'
                : 'bg-transparent py-5'
            }`}
        >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

            <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <div className="relative flex items-center">
                {/* Glow behind logo */}
                <div className="absolute -inset-2 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition" />
                <img
                    src="images/ylayaSmashRallyTransparent3.png"
                    className={`${isScrolled ? "w-25 h-25" : "max-md:w-30 max-md:h-30 w-40 h-40"} max-md:w-30 max-md:h-30 object-contain drop-shadow-lg relative z-10 transition-all duration-900`}
                />
                </div>

                {/* Nav Links — center */}
                <ul className="hidden md:flex items-center gap-8">
                {['Courts', 'Features', 'Pricing', 'Reservation'].map((link) => (
                    <li key={link}>
                    
                    <a href={`#${link.toLowerCase()}`}
                        className="relative text-white/80 hover:text-white text-sm font-semibold tracking-widest uppercase transition-colors duration-200 group"
                    >
                        {link}
                        {/* Underline accent on hover */}
                        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white group-hover:w-full transition-all duration-300 rounded-full" />
                    </a>
                    </li>
                ))}
                </ul>

                {/* Right side CTAs */}
                <div className="flex items-center gap-3">
                {/* Ghost login */}
                {loggedInUser?.firstName ? (
                    // Logged in: show dropdown
                    <div className="relative hidden md:block group">
                        <button className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold tracking-wide transition-colors duration-200 hover:cursor-pointer">
                        <UserCircle2Icon size={18} />
                        {loggedInUser.firstName}
                        <span className="text-xs opacity-60"><ChevronDown className='w-3 h-3'/></span>
                        </button>

                        {/* Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-44 bg-[#005c9d]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-lg shadow-black/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="px-4 py-3 border-b border-white/10">
                            <p className="text-white text-xs font-bold truncate">{loggedInUser.firstName +" "+ loggedInUser.lastName}</p>
                            <p className="text-white/50 text-xs truncate">{loggedInUser.email}</p>
                        </div>
                        <div className="py-1">
                            {role == 'admin' || role == 'superadmin' && (
                                <a href="dashboard" className="block px-4 py-2 text-white/75 hover:text-white hover:bg-white/10 text-xs font-semibold tracking-wide transition-colors duration-150">
                                    Dashboard
                                </a>
                            )}
                            <a href="profile" className="block px-4 py-2 text-white/75 hover:text-white hover:bg-white/10 text-xs font-semibold tracking-wide transition-colors duration-150">
                                My Profile
                            </a>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-red-300 hover:text-red-200 hover:bg-white/10 text-xs font-semibold tracking-wide transition-colors duration-150 hover:cursor-pointer"
                            >
                                Log Out
                            </button>
                        </div>
                        </div>
                    </div>
                    ) : (
                    // Not logged in: show Log In button
                    <button
                        onClick={() => openModal("login")}
                        className="hidden md:block text-white/75 hover:text-white text-sm font-semibold tracking-wide transition-colors duration-200 hover:cursor-pointer"
                    >
                        Log In
                    </button>
                )}
                

                {/* Divider */}
                <div className="hidden md:block w-px h-5 bg-white/20" />

                {/* Book Now CTA */}
                <button className="
                    relative overflow-hidden
                    bg-white text-[#005c9d]
                    px-3 py-2 lg:px-5 lg:py-2.5 rounded-lg
                    text-xs lg:text-sm font-black tracking-wider uppercase
                    transition-all duration-300
                    hover:bg-[#005c9d] hover:text-white
                    hover:ring-2 hover:ring-white/40
                    active:scale-95
                    group
                    hover:cursor-pointer
                ">
                    {/* Shimmer sweep */}
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    <span className="relative whitespace-nowrap">Book Now →</span>
                </button>

                {/* Mobile hamburger */}
                <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden flex flex-col gap-1.5 p-2 hover:cursor-pointer"
                    >
                        {menuOpen ? (
                            <X className="text-white" size={22} />
                        ) : (
                            <>
                                <span className="w-5 h-0.5 bg-white rounded-full" />
                                <span className="w-4 h-0.5 bg-white/60 rounded-full" />
                                <span className="w-5 h-0.5 bg-white rounded-full" />
                            </>
                        )}
                    </button>
                </div>  
            </nav>

            {/* Mobile Menu Dropdown */}
            <div className={`md:hidden transition-all duration-300 overflow-hidden ${
                menuOpen ? 'opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="bg-[#005c9d]/95 backdrop-blur-md border-t border-white/10 px-6 py-4 flex flex-col gap-4">
                    {['Courts', 'Features', 'Pricing', 'Reservation'].map((link) => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase()}`}
                            onClick={() => setMenuOpen(false)}
                            className="text-white/80 hover:text-white text-sm font-semibold tracking-widest uppercase transition-colors duration-200"
                        >
                            {link}
                        </a>
                    ))}

                    <hr className="border-white/20" />

                    {loggedInUser?.firstName ? (
                        <>
                            {/* User info */}
                            <div className="flex items-center gap-2">
                                <UserCircle2Icon size={16} className="text-white/60" />
                                <div>
                                    <p className="text-white text-xs font-bold">{loggedInUser.firstName +" "+ loggedInUser.lastName}</p>
                                    <p className="text-white/50 text-xs">{loggedInUser.email}</p>
                                </div>
                            </div>

                            <a href="#profile"
                                onClick={() => setMenuOpen(false)}
                                className="text-white/80 hover:text-white text-sm font-semibold tracking-wide transition-colors duration-200"
                            >
                                My Profile
                            </a>
                            
                            <a href="#bookings"
                                onClick={() => setMenuOpen(false)}
                                className="text-white/80 hover:text-white text-sm font-semibold tracking-wide transition-colors duration-200"
                            >
                                My Bookings
                            </a>
                            
                            <button
                                onClick={() => { handleLogout(); setMenuOpen(false); }}
                                className="text-red-300 hover:text-red-200 text-sm font-semibold tracking-wide text-left transition-colors duration-200 hover:cursor-pointer"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => openModal("login")}
                            className="text-white/80 hover:text-white text-sm font-semibold tracking-wide text-left transition-colors duration-200 hover:cursor-pointer"
                        >
                            Log In
                        </button>
                    )}
                </div>
            </div>
        </header>

        <Login 
            open={activeModal === "login"} 
            onClose={closeModal}
            onSwitchToRegister={() => openModal("register")} 
        />

        <Register
            open={activeModal === "register"}
            onClose={closeModal}
            onSwitchToLogin={() => openModal("login")}
        />

        </>
    )
    }
