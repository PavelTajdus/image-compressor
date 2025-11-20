// Node 20 native fetch and FormData
const BASE_URL = 'http://localhost:5173';

async function testAuth() {
    console.log('Testing Authentication...');

    // 1. Access /stats without cookie -> Should redirect to /login
    try {
        const res = await fetch(`${BASE_URL}/stats`, { redirect: 'manual' });
        if (res.status === 303 && res.headers.get('location') === '/login') {
            console.log('✅ Unauthenticated access redirected to /login');
        } else {
            console.log(`❌ Failed: Expected 303 redirect, got ${res.status}`);
        }
    } catch (e) {
        console.log('❌ Error accessing /stats:', e.message);
    }

    // 2. Login with wrong password
    try {
        const formData = new FormData();
        formData.append('password', 'wrongpassword');
        
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            body: formData
        });

        // SvelteKit returns 200 with form error for fail(400) usually, or 400
        // Let's check if we got a cookie
        const cookie = res.headers.get('set-cookie');
        if (!cookie) {
            console.log('✅ Wrong password did not set cookie');
        } else {
            console.log('❌ Wrong password SET a cookie!');
        }
    } catch (e) {
        console.log('❌ Error logging in:', e.message);
    }

    // 3. Login with correct password
    let sessionCookie = '';
    try {
        const formData = new FormData();
        formData.append('password', 'secret123');
        
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            body: formData,
            redirect: 'manual'
        });

        if (res.status === 303 && res.headers.get('location') === '/stats') {
            console.log('✅ Correct password redirected to /stats');
            const cookies = res.headers.get('set-cookie');
            if (cookies && cookies.includes('admin_session')) {
                console.log('✅ Session cookie received');
                sessionCookie = cookies.split(';')[0];
            } else {
                console.log('❌ No session cookie found');
            }
        } else if (res.status === 200) {
            // SvelteKit might return a JSON redirect instruction for fetch requests
            const text = await res.text();
            try {
                const json = JSON.parse(text);
                if (json.type === 'redirect' && json.location === '/stats') {
                    console.log('✅ Correct password redirected to /stats (JSON response)');
                    const cookies = res.headers.get('set-cookie');
                    if (cookies && cookies.includes('admin_session')) {
                        console.log('✅ Session cookie received');
                        sessionCookie = cookies.split(';')[0];
                    } else {
                        console.log('❌ No session cookie found');
                    }
                } else {
                    console.log(`❌ Login failed: Unexpected JSON response: ${text}`);
                }
            } catch (e) {
                console.log(`❌ Login failed: Expected 303, got 200 and non-JSON body: ${text}`);
            }
        } else {
            console.log(`❌ Login failed: Expected 303, got ${res.status}`);
            console.log('Response body:', await res.text());
        }
    } catch (e) {
        console.log('❌ Error logging in:', e.message);
    }

    // 4. Access /stats with cookie
    if (sessionCookie) {
        try {
            const res = await fetch(`${BASE_URL}/stats`, {
                headers: {
                    'Cookie': sessionCookie
                },
                redirect: 'manual'
            });

            if (res.status === 200) {
                console.log('✅ Authenticated access to /stats successful');
            } else {
                console.log(`❌ Failed accessing /stats with cookie: Got ${res.status}`);
            }
        } catch (e) {
            console.log('❌ Error accessing /stats with cookie:', e.message);
        }
    }
}

testAuth();
