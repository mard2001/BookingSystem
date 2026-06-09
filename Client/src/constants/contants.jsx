import { Banknote, Cctv, Clock2Icon, CreditCard, MapPin, Pyramid } from "lucide-react";

export const HeroCardsQualities = [
    {
        icon: Pyramid,
        title:"Pristine & Clean",
        description:"Meticulously maintained and cleaned daily to ensure a safe, slip-free, and premium environment for every match."
    },
    {
        icon: Clock2Icon,
        title:"Seamless Convenience",
        description:"Easy online booking, ample parking, and fully-equipped locker rooms designed to fit your busy lifestyle."
    },
    {
        icon: MapPin,
        title:"Highly Accessible",
        description:"Centrally located with pro-grade lighting for night play, making premium pickleball available whenever you are ready."
    },
    {
        icon: Cctv,
        title:"CCTV & Security Monitoring",
        description:"24/7 camera coverage throughout the facility for the safety of players and their belongings."
    },
]

export const availableCourts = [
    { id: 1, courtLabel: "Court A", courtSport: "PickleBall", courtType: "Outdoor", courtDesc: "Climate Controlled • Pro-cushion surface", isActive: "Available", hourlyPrice1: 450.00, hourlyPrice2: 550.00 },
    { id: 2, courtLabel: "Court B", courtSport: "PickleBall", courtType: "Outdoor", courtDesc: "Natural Light • Wind-screened area", isActive: "Available", hourlyPrice1: 400.00, hourlyPrice2: 500.00 },
    { id: 3, courtLabel: "Court C", courtSport: "BasketBall", courtType: "Indoor",  courtDesc: "Climate Controlled • Pro-cushion surface", isActive: "Reserved", hourlyPrice1: 800.00, hourlyPrice2: 1000.00 },
]

export const paymentOptions = [
    {
        id: "online",
        icon: <CreditCard className="w-5 h-5" />,
        label: "Pay Online",
        description: "Instant confirmation & secure checkout",
    },
    {
        id: "court",
        icon: <Banknote className="w-5 h-5" />,
        label: "Pay at Court",
        description: "Pay upon arrival at the facility",
    },
];
 

export const ALLOWED_ROLES = ["admin","superadmin"]; 
export const ADMIN_ROLES = ["admin", "superadmin"];
export const ALL_ROLES = ["admin", "superadmin", "customer"];