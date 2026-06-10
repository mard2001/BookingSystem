export const validateForm = (form, rules) => {
    const errors = {};

    Object.entries(rules).forEach(([field, checks]) => {
        const value = form[field];

        if (checks.required && !value) {
            errors[field] = checks.requiredMessage || "This field is required.";
            return; 
        }

        if (checks.minLength && value?.length < checks.minLength) {
            errors[field] = checks.minLengthMessage || `Minimum ${checks.minLength} characters.`;
        }

        if (checks.exactLength && value?.length !== checks.exactLength) {
            errors[field] = checks.exactLengthMessage || `Must be exactly ${checks.exactLength} characters.`;
        }

        if (checks.pattern && !checks.pattern.test(value)) {
            errors[field] = checks.patternMessage || "Invalid format.";
        }

        if (checks.match && value !== form[checks.match]) {
            errors[field] = checks.matchMessage || "Fields do not match.";
        }
    });

    return errors; 
};

export const statusTransitionTo = (current, next) => {
    const allowed = {
        pending:   ['booked', 'cancelled', 'rejected', 'deleted'],
        booked:    ['completed', 'cancelled', 'rejected', 'deleted'],
        completed: [],
        cancelled: ['deleted'],
        rejected:  ['deleted'],
    };

    return allowed[current]?.includes(next) ?? false;
};