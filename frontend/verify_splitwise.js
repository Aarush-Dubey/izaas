const fs = require('fs');

async function run() {
    try {
        const res = await fetch('http://localhost:3000/api/splitwise/auth');
        const json = await res.json();
        fs.writeFileSync('debug_output_utf8.json', JSON.stringify(json, null, 2), 'utf8');
        console.log('done');
    } catch (e) {
        console.error(e);
        fs.writeFileSync('debug_output_utf8.json', JSON.stringify({ error: String(e) }), 'utf8');
    }
}

run();
