export const userCreateRules = {
    username: { required: true, },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: "Invalid email format." },
    password: { required: true, minLength: 8, minLengthMessage: "Password must be at least 8 characters." },
    firstName: { required: true, },
    middleName: { required: true, },
    lastName: { required: true, },
    suffix: { required: false, },
    gender: { required: true, },
    birthDate: { required: true, },
    contactNumber: { required: true, exactLength: 11, exactLengthMessage: "Incomplete contact number.", pattern: /^09\d{9}$/, patternMessage: "Contact number must start with 09."  },
    role: { required: true, },
} 

export const userEditRules = {
    username: { required: true, },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: "Invalid email format." },
    password: { required: true, minLength: 8, minLengthMessage: "Password must be at least 8 characters." },
    firstName: { required: true, },
    middleName: { required: true, },
    lastName: { required: true, },
    suffix: { required: false, },
    gender: { required: true, },
    birthDate: { required: true, },
    contactNumber: { required: true, exactLength: 11, exactLengthMessage: "Incomplete contact number.", pattern: /^09\d{9}$/, patternMessage: "Contact number must start with 09."  },

} 

export const userProfileEditRules = {
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: "Invalid email format." },
    password: { required: true, minLength: 8, minLengthMessage: "Password must be at least 8 characters." },
    firstName: { required: true, },
    middleName: { required: true, },
    lastName: { required: true, },
    suffix: { required: false, },
    gender: { required: true, },
    birthDate: { required: true, },
    contactNumber: { required: true, exactLength: 11, exactLengthMessage: "Incomplete contact number.", pattern: /^09\d{9}$/, patternMessage: "Contact number must start with 09."  },
} 