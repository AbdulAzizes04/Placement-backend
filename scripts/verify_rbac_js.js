
const loginUrl = 'http://localhost:5000/api/auth/login';
const createStudentUrl = 'http://localhost:5000/api/students/create';
const placementUrl = 'http://localhost:5000/api/placements';
const crtBatchUrl = 'http://localhost:5000/api/crt/batch';
const announcementUrl = 'http://localhost:5000/api/announcements/bulk-delete';

async function run() {
    console.log('🔒 Starting RBAC Verification (JS)...');
    try {
        // 1. Admin Login
        console.log('\n[1] Admin Login...');
        const login = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
        });

        if (!login.ok) throw new Error(`Admin login failed: ${login.status}`);
        const loginData = await login.json();
        const adminToken = loginData.token;
        console.log('✅ Admin Token acquired.');

        // 2. Create Student
        const rollNo = 'JS_RBAC_' + Date.now();
        console.log(`\n[2] Creating Student (${rollNo})...`);
        const studentPayload = {
            name: 'RBAC JS Student',
            roll_no: rollNo,
            email: `${rollNo}@example.com`,
            branch: 'CSE',
            year: 4,
            cgpa: 8.0,
            batch: '2022-2026',
            status: 'Unplaced',
            skills: ['Testing']
        };

        const create = await fetch(createStudentUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + adminToken
            },
            body: JSON.stringify(studentPayload)
        });

        const createText = await create.text();
        if (!create.ok) {
            throw new Error(`Student creation failed: ${create.status} ${createText}`);
        }

        const studentData = JSON.parse(createText);
        const studentPass = studentData.initialPassword;
        console.log('✅ Student Created.');

        // 3. Student Login
        console.log('\n[3] Student Login...');
        const curStudentLogin = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: rollNo, password: studentPass })
        });
        if (!curStudentLogin.ok) throw new Error('Student login failed');
        const studentLoginData = await curStudentLogin.json();
        const studentToken = studentLoginData.token;
        console.log('✅ Student Logged In.');

        // 4. Attack: Create Placement
        console.log('\n[4] Test: Student creates Placement (Expect 403)...');
        const attack1 = await fetch(placementUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + studentToken
            },
            body: JSON.stringify({ company: "Evil", role: "Hacker", package: "1Cr" })
        });

        if (attack1.status === 403) {
            console.log('✅ BLOCKED (403)');
        } else {
            console.error(`❌ FAILED: Status ${attack1.status}`);
            process.exit(1);
        }

        // 5. Attack: Create Batch
        console.log('\n[5] Test: Student creates CRT Batch (Expect 403)...');
        const attack2 = await fetch(crtBatchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + studentToken
            },
            body: JSON.stringify({ name: "Hacker Batch" })
        });

        if (attack2.status === 403) {
            console.log('✅ BLOCKED (403)');
        } else {
            console.error(`❌ FAILED: Status ${attack2.status}`);
            process.exit(1);
        }

        console.log('\n🎉 ALL SECURITY CHECKS PASSED.');

    } catch (e) {
        console.error('Script Error:', e);
        process.exit(1);
    }
}

run().catch(e => console.error('Top-Level Error:', e));
