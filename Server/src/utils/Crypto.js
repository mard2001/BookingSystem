import CryptoJS from "crypto-js";

const PASSWORD_SECRET_KEY = process.env.PASSWORD_SECRET_KEY;

export const encrypt = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), PASSWORD_SECRET_KEY).toString();
};

export const decrypt = (ciphertext) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, PASSWORD_SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (err) {
        console.error("Decryption failed:", err);
        return null;
    }
};

export const compareEncryption = (plainText, ciphertext) => {
    try {
        const decrypted = decrypt(ciphertext);
        return decrypted === plainText;
    } catch (err) {
        console.error("Comparison failed:", err);
        return false;
    }
};