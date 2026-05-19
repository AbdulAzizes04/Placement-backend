const API_URL = 'http://localhost:5000/api';
const email = 'shaikazizes04@gmail.com';
const password = 'shaik04';
const newPassword = 'shaik04_new';

function getCookie(cookies, name) {
    if (!cookies) return null;
    const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    // Also try simple split if regex fails or format differs
    const parts = cookies.split(';');
    for (const part of parts) {
        const [k, v] = part.trim().split('=');
        if (k === name) return v;
    }
    return null;
}

async function main() {
    try {
        console.log('1. Fetching CSRF Token...');
        const csrfRes = await fetch(`${API_URL}/csrf-token`);
        const setCookie = csrfRes.headers.get('set-cookie');

        if (!setCookie) {
            console.error('No Set-Cookie header received!');
            return;
        }

        console.log('CSRF Cookie received:', setCookie);
        const xsrfToken = getCookie(setCookie, 'XSRF-TOKEN');

        if (!xsrfToken) {
            console.error('XSRF-TOKEN not found in cookie!');
            return;
        }
        console.log('XSRF-TOKEN:', xsrfToken);

        const headers = {
            'Content-Type': 'application/json',
            'Cookie': setCookie,
            'X-XSRF-TOKEN': xsrfToken
        };

        console.log('2. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ identifier: email, password: password })
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.error('Login Failed:', loginData);
            return;
        }

        const token = loginData.token;
        console.log('Login successful.');
        console.log('Must Change Password:', loginData.user.mustChangePassword);

        // Update headers with Auth token AND keep previous cookies?
        // Login might set new cookies (auth token cookie).
        const loginSetCookie = loginRes.headers.get('set-cookie');
        const combinedCookie = loginSetCookie ? `${setCookie}; ${loginSetCookie}` : setCookie;

        const authHeaders = {
            ...headers,
            'Authorization': `Bearer ${token}`,
            'Cookie': combinedCookie
        };

        console.log('3. Changing password...');
        const changeRes = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                oldPassword: password,
                newPassword: newPassword,
                confirmPassword: newPassword
            })
        });

        const changeData = await changeRes.json();

        if (!changeRes.ok) {
            console.error('Change Password Failed:', changeData);
        } else {
            console.log('Change Password Successful:', changeData);
        }

    } catch (error) {
        console.error('Network Error:', error.message);
    }
}

main();
