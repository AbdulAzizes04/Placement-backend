
const loginUrl = 'http://localhost:5000/api/auth/login';
const createStudentUrl = 'http://localhost:5000/api/students/create';
const getAllStudentsUrl = 'http://localhost:5000/api/students';
const placementByStudentUrl = (id) => `http://localhost:5000/api/placements/student/${id}`;

async function run() {
    console.log('🔒 Starting IDOR Verification...');
    try {
        // 1. Admin Login
        console.log('\n[1] Admin Login...');
        const adminLogin = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
        });
        const adminData = await adminLogin.json();
        const adminToken = adminData.token;
        console.log('✅ Admin Token Acquired');

        // 2. Create "Victim" Student
        const victimRoll = 'VICTIM_' + Date.now();
        console.log(`\n[2] Creating Victim Student (${victimRoll})...`);
        const victimRes = await fetch(createStudentUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + adminToken
            },
            body: JSON.stringify({
                name: 'Victim Student',
                roll_no: victimRoll,
                email: `${victimRoll}@example.com`,
                branch: 'CSE',
                year: 4,
                cgpa: 9.0,
                batch: '2022-2026',
                status: 'Placed',
                skills: ['Java']
            })
        });

        if (!victimRes.ok) throw new Error('Failed to create victim');
        const victimData = await victimRes.json();
        const victimProfileId = victimData.profile.id; // Correct path from response
        console.log(`✅ Victim Created. Profile ID: ${victimProfileId}`);

        // 3. Create "Attacker" Student
        const attackerRoll = 'ATTACKER_' + Date.now();
        console.log(`\n[3] Creating Attacker Student (${attackerRoll})...`);
        const attackerRes = await fetch(createStudentUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + adminToken
            },
            body: JSON.stringify({
                name: 'Attacker Student',
                roll_no: attackerRoll,
                email: `${attackerRoll}@example.com`,
                branch: 'ECE',
                year: 4,
                cgpa: 6.0,
                batch: '2022-2026',
                status: 'Unplaced',
                skills: ['Hacking']
            })
        });
        const attackerData = await attackerRes.json();
        const attackerPass = attackerData.initialPassword;
        console.log('✅ Attacker Created');

        // 4. Attacker Login
        console.log('\n[4] Attacker Login...');
        const attackerLogin = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: attackerRoll, password: attackerPass })
        });
        const attackerLoginData = await attackerLogin.json();
        const attackerToken = attackerLoginData.token;
        console.log('✅ Attacker Logged In');

        // 5. Attack: Access All Students (Privilege Escalation)
        console.log('\n[5] Test: Attacker accessing ALL students (Expect 403, currently 200)...');
        const getAllRes = await fetch(getAllStudentsUrl, {
            headers: { 'Authorization': 'Bearer ' + attackerToken }
        });
        console.log(`Status: ${getAllRes.status}`);
        if (getAllRes.status === 200) {
            console.log('❌ VULNERABLE: Student can view all student records!');
        } else if (getAllRes.status === 403) {
            console.log('✅ SECURE: Access Denied');
        }

        // 6. Attack: Access Victim's Placements (IDOR)
        console.log(`\n[6] Test: Attacker accessing Victim's Placements (Expect 403, currently 200)...`);
        const idorRes = await fetch(placementByStudentUrl(victimProfileId), {
            headers: { 'Authorization': 'Bearer ' + attackerToken }
        });
        console.log(`Status: ${idorRes.status}`);
        if (idorRes.status === 200) {
            console.log('❌ VULNERABLE: Student can view Victim\'s placements!');
        } else if (idorRes.status === 403) {
            console.log('✅ SECURE: Access Denied');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}
run();
