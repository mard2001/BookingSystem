import { useState } from "react";

export const QRPaymentContent = ({ totalAmount, onPaid }) => {
    const [referenceNumber, setReferenceNumber] = useState("");

    return (
        <div className="text-center">
            <span className='uppercase text-xs text-primary/70 font-bold tracking-wider'>online payment</span>
            <h1 className='font-semibold text-3xl mb-1'>Scan to Pay</h1>
            <p className='text-sm text-secondary mb-6'>Scan the QR code and send the exact amount to complete your booking.</p>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
                <img src="/qr-code.png" alt="Payment QR" className="w-48 h-48 rounded-xl border" />
            </div>

            <p className="text-primary font-bold text-xl mb-6">₱{totalAmount.toLocaleString()}</p>

            {/* Reference number input */}
            <div className="w-[80%] mx-auto text-left mb-4">
                <label className="text-xs font-semibold uppercase tracking-widest text-secondary">
                    Reference Number
                </label>
                <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Enter GCash / Maya reference no."
                    className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2"
                />
            </div>
        </div>
    );
};