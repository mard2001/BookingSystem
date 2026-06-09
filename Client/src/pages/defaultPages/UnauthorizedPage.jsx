import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/', { replace: true });
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50'>
            <div className='bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-md text-center'>
                <ShieldX className='w-16 h-16 text-red-400 mb-4' />
                <h1 className='text-2xl font-bold text-primary mb-2'>Unauthorized Access</h1>
                <p className='text-secondary text-sm mb-6'>
                    You don't have permission to access this page.
                </p>
                <p className='text-secondary text-xs'>
                    Redirecting to home page in <span className='font-bold text-primary'>{countdown}</span> seconds...
                </p>
            </div>
        </div>
    );
};