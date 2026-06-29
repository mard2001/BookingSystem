export const editBookingRules = {
    bookerFullName: { required: true },
    bookerEmail: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: "Invalid email format." },
    bookingStatus: { required: true },
    bookerContactNumber: { required: true, exactLength: 11, exactLengthMessage: "Incomplete contact number.", pattern: /^09\d{9}$/, patternMessage: "Contact number must start with 09."  },
};

export const newRecurringBookingRules = {
    accountID: { required: true }, 
    courtID: { required: true }, 
    dayOfWeek: { required: true, minLength: 1, minLengthMessage: "Select at least one day." }, 
    selectedTimes: { required: true, minLength: 1, minLengthMessage: "Select at least one time slot." },
    startDate: { required: true }, 
    totalAmount: { required: true },
}
