
const loginUrl = 'http://localhost:5000/api/auth/login';

async function run() {
    console.log('🔒 Starting Rate Limit Verification...');

    // Attempt 10 logins (Limit should be 5)
    for (let i = 1; i <= 10; i++) {
        const start = Date.now();
        const res = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: 'admin@example.com', password: 'wrongpassword' })
        });
        const duration = Date.now() - start;

        console.log(`Request ${i}: Status ${res.status} (${duration}ms)`);

        if (res.status === 429) {
            console.log('✅ SUCCESS: Rate Limit Hit (429 Too Many Requests)');
            return;
        }
    }
    console.log('❌ FAILURE: Rate Limit Not Enforced');
}

run();
