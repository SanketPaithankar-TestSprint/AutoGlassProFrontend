import urls from '../config';
async function login({ usernameOrEmail, password, deviceType, browserInfo })
{
    const response = await fetch(`${urls.javaApiUrl}/auth/login`, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            usernameOrEmail,
            password,
            deviceType,
            browserInfo,
        }),
    });
    const data = await response.json();
    return data;
}

export { login };