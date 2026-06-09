export const registerRules = {
    username:      { required: true },
    password:      { required: true, minLength: 8, minLengthMessage: "Password must be at least 8 characters." },
    email:         { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: "Invalid email format." },
    firstName:     { required: true },
    middleName:    { required: true },
    lastName:      { required: true },
    suffix:        { required: false },
    birthDate:     { required: true },
    gender:        { required: true },
    contactNumber: { required: true, exactLength: 11, exactLengthMessage: "Incomplete contact number.", pattern: /^09\d{9}$/, patternMessage: "Contact number must start with 09."  },
};

export const loginRules = {
    username:      { required: true },
    password:      { required: true, minLength: 8, minLengthMessage: "Password must be at least 8 characters." },
};