const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';

async function run() {
    try {
        console.log('1. Authenticating...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('   Token obtained.');

        console.log('2. Creating Student...');
        const rollNo = `SEC${Math.floor(1000 + Math.random() * 9000)}`;
        const payload = {
            name: "Security Test Student",
            roll_no: rollNo,
            email: `test_${rollNo}@example.com`,
            branch: "CSE",
            year: 4,
            cgpa: 8.5,
            batch: "2022-2026",
            status: "Unplaced",
            skills: ["Java", "Security"]
        };

        const createRes = await fetch(`${BASE_URL}/students/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!createRes.ok) {
            console.log('   Student Creation Failed:', createRes.status);
            console.log('   Response Body:', await createRes.text());
            process.exit(1);
        }

        console.log('   Student Created Code:', createRes.status);
        const result = await createRes.json();
        const initialPassword = result.initialPassword;
        console.log('   Initial Password:', initialPassword);

        if (!initialPassword) throw new Error("No initialPassword returned");

        console.log('3. Testing Login with RollNo (Expected Failure)...');
        const failRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: rollNo, password: rollNo })
        });

        if (failRes.status === 401 || failRes.status === 400) {
            console.log('   Success: Login failed as expected. Status:', failRes.status);
        } else {
            console.error('   CRITICAL FAILURE: Login with RollNo succeeded! Status:', failRes.status);
            process.exit(1);
        }

        console.log('4. Testing Login with Initial Password (Expected Success)...');
        const successRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: rollNo, password: initialPassword })
        });

        if (successRes.ok) {
            console.log('   Success: Login with Initial Password worked. Status:', successRes.status);
        } else {
            console.error('   FAILURE: Login with Initial Password failed. Status:', successRes.status);
            console.error('   Response:', await successRes.text());
            process.exit(1);
        }

        console.log('\nVERIFICATION COMPLETE: Secure Password Onboarding is working!');

    } catch (error) {
        console.error('ERROR OCCURREED:', error.message);
    }
}

run();
