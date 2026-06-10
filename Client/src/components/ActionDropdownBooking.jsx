import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, EditIcon, XCircle, Trash2Icon, CheckCircle, CheckCheck } from 'lucide-react';
import { statusTransitionTo } from '../utils/ValueValidate';

export const ActionDropdownBooking = ({ row, onEdit, onConfirm, onComplete, onCancel, onDelete }) => {
    const status = row.original.bookingStatus;
    const canConfirm  = statusTransitionTo(status, 'booked');
    const canComplete = statusTransitionTo(status, 'completed');
    const canEdit   = statusTransitionTo(status, 'booked') || statusTransitionTo(status, 'completed');
    const canCancel = statusTransitionTo(status, 'cancelled');
    const canDelete = statusTransitionTo(status, 'deleted');

    if (!canEdit && !canConfirm && !canComplete && !canCancel && !canDelete) return null;

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
                    {canEdit && (
                        <button
                            onClick={() => { onEdit(row.original); setOpen(false); }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                        >
                            <EditIcon className="w-4 h-4 text-primary" />
                            Edit Booking
                        </button>
                    )}

                    {canConfirm && (
                        <button onClick={() => { onConfirm(row.original); setOpen(false); }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 hover:cursor-pointer">
                            <CheckCircle className="w-4 h-4" />
                            Confirm Booking
                        </button>
                    )}

                    {canComplete && (
                        <button onClick={() => { onComplete(row.original); setOpen(false); }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:cursor-pointer">
                            <CheckCheck className="w-4 h-4" />
                            Mark as Completed
                        </button>
                    )}

                    {canCancel && (
                        <button
                            onClick={() => { onCancel(row.original); setOpen(false); }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-yellow-600 hover:bg-yellow-50 hover:cursor-pointer"
                        >
                            <XCircle className="w-4 h-4" />
                            Cancel Booking
                        </button>
                    )}

                    {canDelete && (<div className="border-t border-gray-100" />)}

                    {canDelete && (
                        <button
                            onClick={() => { onDelete(row.original); setOpen(false); }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:cursor-pointer"
                        >
                            <Trash2Icon className="w-4 h-4" />
                            Delete Booking
                        </button>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};