const getValidToken = () => {
    const res = JSON.parse(localStorage.getItem("ApiToken"));
    if (!res && !res?.data?.jwtToken) return null;
    return res?.data?.jwtToken;
};

export { getValidToken };