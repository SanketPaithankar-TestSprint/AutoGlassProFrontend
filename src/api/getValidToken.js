const getValidToken = () =>
{
    const res = JSON.parse(localStorage.getItem("ApiToken"));
    if (!res && !res?.data?.token) return null;
    return res?.data?.token;
};

export { getValidToken };