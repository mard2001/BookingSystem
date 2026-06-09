import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, EditIcon, XCircle, Trash2Icon } from 'lucide-react';

export const ActionDropdownBooking = ({ row, onEdit, onCancel, onDelete }) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Recalculate position on scroll/resize
    useEffect(() => {
        if (!open) return;
        const update = () => {
            if (!buttonRef.current) return;
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 192, // 192px = w-48
            });
        };
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [open]);

    const handleOpen = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 192,
            });
        }
        setOpen(prev => !prev);
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleOpen}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
            >
                <MoreHorizontal className="w-5 h-5" />
            </button>

            {open && createPortal(
                <div
                    ref={dropdownRef}
                    style={{ top: coords.top, left: coords.left }}
                    className="absolute w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-[9999] overflow-hidden"
                >
                    <button
                        onClick={() => { onEdit(row.original); setOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                    >
                        <EditIcon className="w-4 h-4 text-primary" />
                        Edit Booking
                    </button>

                    <button
                        onClick={() => { onCancel(row.original); setOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-yellow-600 hover:bg-yellow-50 hover:cursor-pointer"
                    >
                        <XCircle className="w-4 h-4" />
                        Cancel Booking
                    </button>

                    <div className="border-t border-gray-100" />

                    <button
                        onClick={() => { onDelete(row.original); setOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:cursor-pointer"
                    >
                        <Trash2Icon className="w-4 h-4" />
                        Delete Booking
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
};