export const calculateAgeFromBirthDate = (birthDate) => {
    const birthDay = new Date(birthDate);
    const todaysDate = new Date();

    let age = todaysDate.getFullYear() - birthDay.getFullYear();

    // Check if birthday has passed this year
    const hasBirthdayPassed = 
        todaysDate.getMonth() > birthDay.getMonth() ||
        (todaysDate.getMonth() === birthDay.getMonth() && todaysDate.getDate() >= birthDay.getDate());

    if (!hasBirthdayPassed) age--;

    return age;
}

export const getCurrentTimestamp = () => {
    return new Date().toLocaleString('en-CA', {
        timeZone: 'Asia/Manila',
        hour12: false
    }).replace(',', '');
};