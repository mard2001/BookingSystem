import { Banknote, CalendarCheck2, Cctv, Clock2Icon, CreditCard, Lightbulb, MapPin, Pyramid, ShieldCheckIcon, Trophy, Users2, Wallet } from "lucide-react";
import { formatShortHour } from "../utils/ValueFormat";

export const HeroCardsQualities = [
    {
        icon: Pyramid,
        title: "Pristine & Clean",
        description: "Meticulously maintained and cleaned daily to ensure a safe, slip-free, and premium environment for every match."
    },
    {
        icon: CalendarCheck2,
        title: "Easy Reservations",
        description: "Reserve your preferred court in just a few clicks with our fast and hassle-free online booking system."
    },
    {
        icon: Clock2Icon,
        title: "Seamless Convenience",
        description: "Easy online booking, ample parking, and fully-equipped locker rooms designed to fit your busy lifestyle."
    },
    {
        icon: Users2,
        title: "Thriving Community",
        description: "Join a welcoming community of beginners, enthusiasts, and competitive players through regular games and events."
    },
    {
        icon: MapPin,
        title: "Highly Accessible",
        description: "Conveniently located with tournament-grade LED lighting, making it easy to play day or night."
    },
    {
        icon: Lightbulb,
        title: "Premium LED Lighting",
        description: "Bright, evenly distributed lighting ensures exceptional visibility for evening games without glare."
    },
    {
        icon: ShieldCheckIcon,
        title: "Player Safety",
        description: "High-quality court surfaces help reduce impact on joints while providing excellent grip during fast-paced rallies."
    },
    
    {
        icon: Trophy,
        title: "Championship Courts",
        description: "Professional-grade acrylic courts engineered for consistent ball bounce, reliable traction, and tournament-level play."
    },
    
];

export const HeroCardsQualitiesV2 = [
    {
        icon: Users2,
        title: "Thriving Community",
        description: "Join a welcoming community of beginners, enthusiasts, and competitive players through regular games and events."
    },
    {
        icon: MapPin,
        title: "Highly Accessible",
        description: "Conveniently located with tournament-grade LED lighting, making it easy to play day or night."
    },
    {
        icon: Trophy,
        title: "Championship Courts",
        description: "Professional-grade acrylic courts engineered for consistent ball bounce, reliable traction, and tournament-level play."
    },
    
];

export const paymentOptions = [
    {
        id: "online",
        icon: <CreditCard className="w-5 h-5" />,
        label: "InstaPay",
        description: "Instant confirmation & secure checkout.",
    },
    {
        id: "court",
        icon: <Banknote className="w-5 h-5" />,
        label: "Pay at Court",
        description: "Pay upon arrival at the court.",
    },
];

export const ALLOCATED_SECONDS = 10 * 60;
export const ALLOWED_ROLES = ["admin","superadmin"]; 
export const ADMIN_ROLES = ["admin", "superadmin"];
export const ALL_ROLES = ["admin", "superadmin", "customer"];
export const WEEKDAY_PM_START = 17; // 5PM; set to undefined if no price difference for night hours.
export const WEEKEND_PM_START = 17; // 5PM; set to undefined if no price difference for night hours.


export const BUSINESS_INFO = {
    name: "Bunal Brad Pickleball Court",
    logoName: "bunalBrad_Transparent1.png",
    tagline: "Premium Outdoor Pickleball Experience",
    address: "Sto. Nino Ylaya, Talamban, Cebu City",
    openingHours: "03:00 PM",
    closingHours: "11:00 PM",
    longlat: { lat: 10.373536281736298, lng: 123.92269220472345 },
    googleMapLocation: "9WFG+MW4, Mandaue, 6014 Cebu, Philippines",
    email: "info@ylayasmashrally.com",
    phone: "09063220193",
    bankaccounts: [
        {
            accountProviderLogo: "GCash_Logo.png",
            accountProviderDisplayName: "GCash",
            accountProvider: "gcash",
            accountName: "Marvin Navarro",
            accountQR: "GCash_QR.jpg",
            accountNumber: "09063220193",
            description: "Direct Gcash payment."
        },
        {
            accountProviderLogo: "PayMaya_Logo.png",
            accountProviderDisplayName: "PayMaya",
            accountProvider: "paymaya",
            accountName: "Marvin Navarro",
            accountQR: "PayMaya_QR.jpg",
            accountNumber: "09063220193",
            description: "Direct Paymaya payment."
        },
        {
            accountProviderLogo: "BPI_Logo.png",
            accountProviderDisplayName: "BPI",
            accountProvider: "bpi",
            accountName: "Marvin Navarro",
            accountQR: "BPI_QR.jpg",
            accountNumber: "9939126683",
            description: "Direct BPI Payment."
        },
    ]
};



export const courtCards = [
    { title: "2 outdoor courts", desc: "Official Court Size" },
    { title: `${formatShortHour(BUSINESS_INFO.openingHours)} – ${formatShortHour(BUSINESS_INFO.closingHours)}`, desc: "Open every day" },
    { title: "Message us to book", desc: "We'll lock in your court" },
    { title: "₱250 – ₱300", desc: "Hourly rates, all-in" },
];

export const courtTypes = [
    {
        name: "PROFESSIONAL COURT",
        desc: "Standard full-size competition pickleball court, billed hourly.",
        rates: [
            { label: "Standard Rate", time: "2:00 PM – 4:00 PM", price: "₱250" },
            { label: "Peak Hours", time: "5:00 PM – 11:00 PM", price: "₱300" },
        ],
    },
];

export const allPaymentOptions = [
    ...paymentOptions,
    ...BUSINESS_INFO.bankaccounts.map((account) => ({
        id: account.accountProvider.toLowerCase(),
        icon: <Wallet className="w-5 h-5" />,
        label: account.accountProviderDisplayName,
        description: account.description,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        accountQR: account.accountQR,
    })),
];
