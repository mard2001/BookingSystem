import { Banknote, CalendarCheck2, Cctv, Clock2Icon, CreditCard, Lightbulb, MapPin, Pyramid, ShieldCheckIcon, Trophy, Users2 } from "lucide-react";

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


export const BUSINESS_INFO = {
    name: "Bunal Brad",
    logoName: "bunalBrad_Transparent1.png",
    tagline: "Premium Outdoor Pickleball Experience",
    address: "Sto. Nino Ylaya, Talamban, Cebu City",
    longlat: { lat: 10.373536281736298, lng: 123.92269220472345 },
    email: "info@ylayasmashrally.com",
    phone: "+09063220193",
};