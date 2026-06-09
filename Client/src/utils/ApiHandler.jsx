export async function apiHandler(apiCall) {
    try {
        return await apiCall();
    } catch (error) {
        console.error(error);

        return null;
    }
}

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));