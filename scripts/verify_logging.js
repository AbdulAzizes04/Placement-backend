
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../app.log');
const url = 'http://localhost:5000/api/health';

async function run() {
    console.log('🔒 Verifying Structured Logging...');

    // 1. Make a request
    try {
        console.log('Sending request to generate log...');
        const res = await fetch(url);
        console.log(`Response Status: ${res.status}`);

        // Wait a bit for log to write
        await new Promise(r => setTimeout(r, 2000));

        // 2. Check if file exists
        if (!fs.existsSync(logFile)) {
            console.log('❌ FAILURE: app.log file not created.');
            return;
        }

        // 3. Read file and look for our request
        const logs = fs.readFileSync(logFile, 'utf8');
        const lines = logs.trim().split('\n');
        const lastLog = lines[lines.length - 1];

        console.log('\n--- HOST RECENT LOG ENTRY ---');
        console.log(lastLog);

        try {
            const jsonLog = JSON.parse(lastLog);
            if (jsonLog.message === 'HTTP Request' && jsonLog.url === '/api/health') {
                console.log('\n✅ SUCCESS: Structured JSON log found!');
                console.log(`   Method: ${jsonLog.method}`);
                console.log(`   URL: ${jsonLog.url}`);
                console.log(`   User: ${jsonLog.user_id}`);
                console.log(`   IP: ${jsonLog.ip}`);
            } else {
                console.log('\n⚠️ WARNING: Log found but content mismatch.');
            }
        } catch (e) {
            console.log('\n❌ FAILURE: Log entry is not valid JSON.');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}
run();
