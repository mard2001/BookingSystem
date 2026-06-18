import { useMemo, useState } from "react";
import QRPayment from "../Payment/QRPayment";
import { useAppointmentFormContext } from "../../context/AppointmentFormContext";
import { BookingConfirmation } from "./BookingConfirmation";

export const QRPaymentContent = ({ onSuccess }) => {
    const { formData, goToStep } = useAppointmentFormContext();
    const [isPaid, setIsPaid] = useState(false);

    const booking = useMemo(() => ({
        bookingID: formData.paymentInfo.bookingID,
        totalAmount: formData.paymentInfo.totalAmount,
        contactPersonInfo: formData.contactPersonInfo,
        bookerEmail: formData.contactPersonInfo.email,
    }), [formData.paymentInfo.bookingID, formData.paymentInfo.totalAmount, formData.contactPersonInfo]);

    if (isPaid) {
        return <BookingConfirmation bookingId={booking.bookingID} onReset={onSuccess} />;
    }

    return (
        <div>
            <QRPayment
                booking={booking}
                onClose={() => goToStep(4)}
                onPaymentSuccess={() => {
                    setIsPaid(true);
                    onSuccess?.();
                }}
            />

        </div>
    );
};