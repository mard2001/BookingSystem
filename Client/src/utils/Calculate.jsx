export const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return null;
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

export const getTomorrowDate = () => {
    const now = new Date();
    const phNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
    phNow.setDate(phNow.getDate() + 1);

    const year = phNow.getFullYear();
    const month = String(phNow.getMonth() + 1).padStart(2, '0');
    const day = String(phNow.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};