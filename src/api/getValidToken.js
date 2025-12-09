const getValidToken = () => {
    let res = null;
    try {
        const session = sessionStorage.getItem("ApiToken");
        if (session) {
            res = JSON.parse(session);
        } else {
            const local = localStorage.getItem("ApiToken");
            if (local) {
                res = JSON.parse(local);
            }
        }
    } catch (e) {
        console.error("Error parsing token", e);
        return null;
    }

    if (!res && !res?.data?.jwtToken) return null;
    return res?.data?.jwtToken;
};

export { getValidToken };