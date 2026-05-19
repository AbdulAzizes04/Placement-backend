
const loginUrl = 'http://localhost:5000/api/auth/login';
const createUrl = 'http://localhost:5000/api/students/create';

async function run() {
    try {
        console.log('Logging in...');
        const login = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
        });

        console.log('Login Status:', login.status);
        const loginData = await login.json();
        if (!login.ok) {
            console.log('Login Failed:', JSON.stringify(loginData));
            return;
        }

        const token = loginData.token;
        console.log('Token acquired.');

        const student = {
            name: 'Debug Student',
            roll_no: 'DBG' + Date.now(),
            email: 'dbg' + Date.now() + '@example.com',
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

        console.log('Create Status:', create.status);
        const body = await create.text();
        console.log('Create Body:', body);

    } catch (e) {
        console.error('Script Error:', e);
    }
}
run();
