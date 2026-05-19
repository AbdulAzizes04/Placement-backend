
const loginUrl = 'http://localhost:5000/api/auth/login';
const createUrl = 'http://localhost:5000/api/students/create';
const placementUrl = 'http://localhost:5000/api/placements';

async function run() {
    try {
        console.log('Logging in...');
        const login = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
        });

        if (!login.ok) { console.log('Login Failed'); return; }
        const loginData = await login.json();
        const token = loginData.token;
        console.log('Token acquired.');

        const rollNo = 'IV_' + Date.now();
        const student = {
            name: 'Verify Student',
            roll_no: rollNo,
            email: rollNo + '@example.com',
            branch: 'CSE',
            year: 4,
            cgpa: 8.0,
            batch: '2022-2026',
            status: 'Unplaced',
            skills: ['Debug']
        };

        console.log('Creating Student...');
        const create = await fetch(createUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(student)
        });

        if (!create.ok) {
            console.log('Create Failed', create.status);
            console.log(await create.text());
            return;
        }

        console.log('Create Status:', create.status);
        const body = await create.text();
        const studentData = JSON.parse(body);
        const initialPass = studentData.initialPassword;

        console.log('Student Created. Logging in as Student...');

        const sLogin = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: rollNo, password: initialPass })
        });

        if (!sLogin.ok) {
            console.log('Student Login Failed', sLogin.status);
            console.log('RollNo:', rollNo);
            console.log('Pass:', initialPass);
            console.log('Body:', await sLogin.text());
            return;
        }
        const sLoginData = await sLogin.json();
        const sToken = sLoginData.token;
        console.log('Student Logged In.');

        console.log('ATTACK: Creating Placement...');
        const attack = await fetch(placementUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sToken
            },
            body: JSON.stringify({ company: "Evil", role: "Hacker", package: "1Cr" })
        });

        console.log('Attack Status:', attack.status);
        if (attack.status === 403) {
            console.log('✅ SUCCESS: 403 Forbidden received.');
        } else {
            console.log('❌ FAILURE: Received ' + attack.status);
        }

    } catch (e) {
        console.error('Script Error:', e);
    }
}
run();
