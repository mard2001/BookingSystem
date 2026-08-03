import React, { useEffect, useRef, useState } from 'react'
import { Modal } from '../Modal';
import { ArrowRight, ChevronDown, Eye, EyeOff, LockIcon, UserCircle2Icon, X } from 'lucide-react';
import { Login } from '../UserAuth/Login';
import Register from '../UserAuth/Register';
import { logout } from '../../api/services/authService';
import { useAuth } from '../../context/AuthContext';
import { getDecryptedRole } from '../../utils/Crypto';
import { BUSINESS_INFO } from '../../constants/contants';

const NAV_LINKS = ['Courts', 'Location', 'Rates', 'Reservation'];

// Single source of truth for the navbar's height. The header itself never
// grows or shrinks on scroll — only the logo resizes against this fixed
// height. Kept as a literal string (not built dynamically) so Tailwind's
// JIT scanner can see the class name.
const HEADER_HEIGHT = 'h-20'; // 5rem / 80px

export const LandingV2Header = () => {
    const role = getDecryptedRole();
    const isAdmin = role === 'admin' || role === 'superadmin';
    const { loggedInUser, handleLogout } = useAuth();

    const [isScrolled, setIsScrolled] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const userMenuRef = useRef(null);

    // Open a specific modal
    const openModal = (name) => {
        setActiveModal(name);
        setMenuOpen(false);
    };

    // Close all modals
    const closeModal = () => setActiveModal(null);

    // Throttled scroll listener (rAF) instead of firing a state update on every scroll event
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                setIsScrolled(window.scrollY > 50);
                ticking = false;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close the user dropdown on outside click or Escape — hover-only menus
    // don't work on touch devices, so this makes it a real click-toggle menu.
    useEffect(() => {
        if (!userMenuOpen) return;

        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') setUserMenuOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [userMenuOpen]);

    const closeUserMenuAnd = (fn) => (...args) => {
        setUserMenuOpen(false);
        fn?.(...args);
    };

    return (
        <>
        <header className={`sticky top-0 w-full z-50 ${HEADER_HEIGHT} transition-colors duration-500 pt-3 pb-20 ${
                isScrolled
                ? 'bg-primary-darker/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-primary-lightdark/30 '
                : 'bg-foreground text-black'
            }`}
        >

            <nav className={`${HEADER_HEIGHT} max-w-7xl mx-auto px-6 flex items-center justify-between`}>
                <div className="group relative flex items-center">
                    <div className="absolute -inset-2 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition" />
                    <img
                        src={`images/${BUSINESS_INFO.logoName}`}
                        alt={BUSINESS_INFO.name ?? 'CourtBook logo'}
                        className={`${isScrolled ? `${HEADER_HEIGHT} w-20` : "mt-20 h-32 w-32 max-md:h-24 max-md:w-24"} object-contain drop-shadow-lg relative z-10 transition-all duration-500`}
                    />
                </div>

                {/* Nav Links — center */}
                <ul className="hidden md:flex items-center gap-8">
                {NAV_LINKS.map((link) => (
                    <li key={link}>
                    <a href={`#${link.toLowerCase()}`}
                        className={`relative text-sm font-semibold tracking-widest uppercase transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm ${ isScrolled? "text-foreground hover:text-muted-foreground" : "text-primary-darker hover:text-primary-lightdark"}`}
                    >
                        {link}
                        {/* Underline accent on hover */}
                        <span className={`absolute -bottom-1 left-0 w-0 h-[2px] group-hover:w-full transition-all duration-300 rounded-full ${ isScrolled ? "bg-muted-foreground" : "bg-primary-lightdark"}`} />
                    </a>
                    </li>
                ))}
                </ul>

                {/* Right side CTAs */}
                <div className="flex items-center gap-3">
                {/* Ghost login */}
                {loggedInUser?.firstName ? (
                    // Logged in: click-toggle dropdown (works on touch + keyboard, not just hover)
                    <div className="relative hidden md:block" ref={userMenuRef}>
                        <button
                            onClick={() => setUserMenuOpen((v) => !v)}
                            aria-haspopup="menu"
                            aria-expanded={userMenuOpen}
                            aria-label="Open account menu"
                            className={`flex items-center gap-2 text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-md px-1 ${ isScrolled? "text-foreground hover:text-muted-foreground" : "text-primary-darker hover:text-primary-lightdark"}`}
                        >
                            <UserCircle2Icon size={18} />
                            {loggedInUser.firstName}
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        <div
                            role="menu"
                            className={`absolute right-0 top-full mt-2 w-44 bg-primary-darker/95 backdrop-blur-md border border-white/10 rounded-xl shadow-lg shadow-black/20 transition-all duration-150 z-50 ${
                                userMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'
                            }`}
                        >
                            <div className="px-4 py-3 border-b border-white/10">
                                <p className="text-white text-xs font-bold truncate">{loggedInUser.firstName + " " + loggedInUser.lastName}</p>
                                <p className="text-white/50 text-xs truncate">{loggedInUser.email}</p>
                            </div>
                            <div className="py-1">
                                {isAdmin && (
                                    <a href="dashboard" role="menuitem" className="block px-4 py-2 text-white/75 hover:text-white hover:bg-white/10 text-xs font-semibold tracking-wide transition-colors duration-150">
                                        Dashboard
                                    </a>
                                )}
                                <a href="profile" role="menuitem" className="block px-4 py-2 text-white/75 hover:text-white hover:bg-white/10 text-xs font-semibold tracking-wide transition-colors duration-150">
                                    My Profile
                                </a>
                                <button
                                    role="menuitem"
                                    onClick={closeUserMenuAnd(handleLogout)}
                                    className="w-full text-left px-4 py-2 text-red-300 hover:text-red-200 hover:bg-white/10 text-xs font-semibold tracking-wide transition-colors duration-150 cursor-pointer"
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
                        className={`hidden md:block text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-md px-1 ${ isScrolled? "text-foreground hover:text-muted-foreground" : "text-primary-darker hover:text-primary-lightdark"}`}
                    >
                        Log In
                    </button>
                )}

                {/* Divider */}
                <div className={`hidden md:block w-px h-5 ${ isScrolled ? "bg-muted-foreground/50" : "bg-primary-lightdark/50"}`} />

                {/* Book Now CTA */}
                <a href="#reservation">
                    <button className={`
                        relative overflow-hidden
                        bg-white text-primary-darker
                        px-3 py-2 lg:px-5 lg:py-2.5 rounded-lg
                        text-xs font-black tracking-wider uppercase
                        transition-all duration-300
                        hover:bg-primary-darker hover:text-white
                        hover:ring-2 hover:ring-white/40
                        active:scale-95
                        group
                        cursor-pointer
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                        ${ isScrolled ? "" : "ring-1 ring-primary-dark"}
                    `}>
                        {/* Shimmer sweep */}
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                        <span className="relative whitespace-nowrap">Book Now →</span>
                    </button>
                </a>

                {/* Mobile hamburger */}
                <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-md"
                    >
                        {menuOpen ? (
                            <X className={`${ isScrolled? "text-foreground hover:text-muted-foreground" : "text-primary-darker hover:text-primary-lightdark"}`} size={22} />
                        ) : (
                            <>
                                <span className={`w-5 h-0.5 ${ isScrolled? "bg-foreground hover:bg-muted-foreground" : "bg-primary-darker hover:bg-primary-lightdark"} rounded-full`} />
                                <span className={`w-4 h-0.5 ${ isScrolled? "bg-foreground hover:bg-muted-foreground" : "bg-primary-darker hover:bg-primary-lightdark"} rounded-full`} />
                                <span className={`w-5 h-0.5 ${ isScrolled? "bg-foreground hover:bg-muted-foreground" : "bg-primary-darker hover:bg-primary-lightdark"} rounded-full`} />
                            </>
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Dropdown — always uses the same solid background when open,
                regardless of scroll state, so it stays readable over any hero content */}
            <div className={`md:hidden transition-all duration-300 overflow-hidden ${
                menuOpen ? 'opacity-100 max-h-[28rem]' : 'max-h-0 opacity-0'
            }`}>
                <div className="border-t border-white/10 px-6 py-4 flex flex-col gap-4 bg-primary-darker/95 backdrop-blur-md text-end">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase()}`}
                            onClick={() => setMenuOpen(false)}
                            className="text-white/80 hover:text-white text-sm font-semibold tracking-widest uppercase transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm"
                        >
                            {link}
                        </a>
                    ))}

                    <hr className="border-white/20" />

                    {loggedInUser?.firstName ? (
                        <>
                            {/* User info */}
                            <div className="flex items-center justify-end gap-2">
                                <UserCircle2Icon size={16} className="text-white/60" />
                                <div>
                                    <p className="text-white text-xs font-bold">{loggedInUser.firstName + " " + loggedInUser.lastName}</p>
                                    <p className="text-white/50 text-xs">{loggedInUser.email}</p>
                                </div>
                            </div>
                            <div className="py-1">
                                {isAdmin && (
                                    <a href="dashboard" className="block px-4 py-2 text-white/75 hover:text-white hover:bg-white/10 text-xs font-semibold tracking-wide transition-colors duration-150">
                                        Dashboard
                                    </a>
                                )}
                                <a href="profile" className="block px-4 py-2 text-white/75 hover:text-white hover:bg-white/10 text-xs font-semibold tracking-wide transition-colors duration-150">
                                    My Profile
                                </a>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-end px-4 py-2 text-red-300 hover:text-red-200 hover:bg-white/10 text-xs font-semibold tracking-wide transition-colors duration-150 cursor-pointer"
                                >
                                    Log Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => openModal("login")}
                            className={`text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer text-foreground hover:text-muted-foreground text-end`}
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