import { LogOutIcon, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getStoredUser } from '../../utils/LocalVariables';
import { getDecryptedRole } from '../../utils/Crypto';

export const Header = () => {
    const user = getStoredUser();
    const role = getDecryptedRole();
    const [userName, setUserName] = useState("");

    useEffect(() => {
        setUserName(user.firstName + " " + user.lastName);
    }, [])

    return (
        <div className='py-3 px-5 border-b border-secondary/30 mb-2 bg-white/30'>
            <div className="flex items-center justify-end">
                <div className="px-2 text-end">
                    <p className='text-sm text-primary truncate font-semibold'>{userName}</p>
                    <p className='text-[10px] text-secondary capitalize'>{role}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-secondary-brighter/40 flex items-center justify-center ring-1 ring-white/20 shrink-0">
                    <User className='w-5 h-5 text-secondary'/>
                </div>
            </div>
        </div>
    )
}
