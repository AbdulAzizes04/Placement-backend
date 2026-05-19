
// Wrapper not needed in clean node 20 environment usually, but just using global fetch
// If global fetch isn't available, we might error. Node 20 has it.
// Let's assume standard fetch usage.

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';

async function main() {
    console.log('🔒 Starting RBAC Security Verification...');

    // 1. Login as Admin
    console.log('\n[1] Logging in as Admin...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${adminLoginRes.status}`);
    const adminData = await adminLoginRes.json() as any;
    const adminToken = adminData.token;
    console.log('✅ Admin logged in.');

    // 2. Create Student
    const rollNo = `TEST_${Math.floor(Math.random() * 10000)}`;
    console.log(`\n[2] Creating Test Student (${rollNo})...`);
    const studentPayload = {
        name: "RBAC Test Student",
        roll_no: rollNo,
        email: `${rollNo.toLowerCase()}@example.com`,
        branch: "CSE",
        year: 4,
        cgpa: 8.0,
        batch: "2022-2026",
        status: "Unplaced",
        skills: ["Testing"]
    };

    const createStudentRes = await fetch(`${BASE_URL}/students/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(studentPayload),
    });

    if (!createStudentRes.ok) {
        const err = await createStudentRes.text();
        console.error(`Status: ${createStudentRes.status}`);
        console.error(`Body: ${err}`);
        throw new Error(`Failed to create student: ${err}`);
    }
    const studentData = await createStudentRes.json() as any;
    const initialPassword = studentData.initialPassword;
    console.log('✅ Student created.');

    // 3. Login as Student
    console.log('\n[3] Logging in as Student...');
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: rollNo, password: initialPassword }),
    });

    if (!studentLoginRes.ok) throw new Error(`Student login failed: ${studentLoginRes.status}`);
    const studentLoginData = await studentLoginRes.json() as any;
    const studentToken = studentLoginData.token;
    console.log('✅ Student logged in.');

    // 4. Test Attack: Create Placement (Should fail)
    console.log('\n[4] ATTACK: Student attempting to CREATE Placement Record...');
    const attack1 = await fetch(`${BASE_URL}/placements`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ company: "Evil Corp", role: "Hacker", package: "1Cr" }),
    });

    if (attack1.status === 403 || attack1.status === 401) {
        console.log(`✅ BLOCKED: Server returned ${attack1.status} Forbidden/Unauthorized.`);
    } else {
        console.error(`❌ FAILED: Student was able to create placement! Status: ${attack1.status}`);
        process.exit(1);
    }

    // 5. Test Attack: Create Batch (Should fail)
    console.log('\n[5] ATTACK: Student attempting to CREATE CRT Batch...');
    const attack2 = await fetch(`${BASE_URL}/crt/batch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ name: "Hacker Batch" }),
    });

    if (attack2.status === 403 || attack2.status === 401) {
        console.log(`✅ BLOCKED: Server returned ${attack2.status} Forbidden/Unauthorized.`);
    } else {
        console.error(`❌ FAILED: Student was able to create batch! Status: ${attack2.status}`);
        process.exit(1);
    }

    console.log('\n🎉 SUCCESS: All RBAC checks passed. Resources are secure.');
}

main().catch(err => {
    console.error('Test Failed:', err);
    process.exit(1);
});
