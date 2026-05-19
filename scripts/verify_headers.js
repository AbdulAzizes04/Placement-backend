
const url = 'http://localhost:5000/api/health';

async function run() {
    console.log('🔒 Verifying Secure Headers...');
    try {
        const res = await fetch(url);
        console.log('--- ALL HEADERS ---');
        res.headers.forEach((v, k) => console.log(`${k}: ${v}`));
        console.log('-------------------');
        const headers = res.headers;

        const expected = [
            'Strict-Transport-Security',
            'Content-Security-Policy',
            'X-Content-Type-Options',
            'X-Frame-Options',
            'Referrer-Policy'
        ];

        let missing = [];

        expected.forEach(h => {
            const val = headers.get(h);
            if (val) {
                console.log(`✅ ${h}: ${val.substring(0, 50)}${val.length > 50 ? '...' : ''}`);
            } else {
                console.log(`❌ ${h}: MISSING`);
                missing.push(h);
            }
        });

        const xPoweredBy = headers.get('X-Powered-By');
        if (xPoweredBy) {
            console.log(`❌ X-Powered-By: DETECTED (${xPoweredBy}) -> Should be hidden`);
            missing.push('X-Powered-By');
        } else {
            console.log('✅ X-Powered-By: Hidden');
        }

        if (missing.length === 0) {
            console.log('\n🎉 ALL SECURE HEADERS CONFIRMED.');
        } else {
            console.log('\n⚠️ SOME HEADERS MISSING OR INSECURE.');
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}
run();
