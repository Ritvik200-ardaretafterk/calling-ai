const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'YOUR_API_KEY_HERE';
const PROJECT_ID = '18387566506369735962';

const SCREENS = [
    { name: 'Login_with_Animated_Assistant', id: '6d336e3191c84493a546814954c375c0' },
    { name: 'Welcome_Screen', id: '6b7b16acacd840ed8e3640164414ff6e' },
    { name: 'Welcome_Screen_First_Time_User', id: 'f603e97bf92e4ac9b8d9b71e5567eb6e' },
    { name: 'Signup_with_Animated_Assistant', id: 'b0145fd2f37e4e1a928af1568dc48540' },
    { name: 'Home_Dashboard', id: 'c08704d23a3443ec846a3ed103c8d9d8' },
    { name: 'Todo_List', id: 'ca00febfb4ea4cdd82faf16a28c9bf03' },
    { name: 'Voice_Notes', id: '9018181d75c14d809c1b8fb578541f1c' },
    { name: 'Profile_Settings', id: '7e09a9893792499bb968957ee5d27a0e' }
];

function mcpRequest(method, params) {
    return new Promise((resolve, reject) => {
        const bodyData = JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: method,
            params: params || {}
        });

        const req = https.request('https://stitch.googleapis.com/mcp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed parsing response: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(bodyData);
        req.end();
    });
}

function downloadUrl(url, targetPath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return downloadUrl(res.headers.location, targetPath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            }
            const file = fs.createWriteStream(targetPath);
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', reject);
    });
}

async function run() {
    console.log('🚀 Connecting to Stitch API...');
    const outputDir = path.join(__dirname, 'stitch_assets');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    for (const screen of SCREENS) {
        console.log(`\n🔍 Requesting details for: ${screen.name}...`);
        try {
            const resp = await mcpRequest('tools/call', {
                name: 'get_screen',
                arguments: { name: `projects/${PROJECT_ID}/screens/${screen.id}` }
            });

            if (resp.result && resp.result.content && resp.result.content[0]) {
                const jsonText = resp.result.content[0].text;
                const data = JSON.parse(jsonText);
                console.log(`✨ Screen Title: "${data.title || data.name}"`);

                const htmlUrl = data.htmlCode?.downloadUrl || data.codeUrl;
                const pngUrl = data.screenshot?.downloadUrl || data.screenshotUrl;

                if (htmlUrl) {
                    const htmlFile = path.join(outputDir, `${screen.name}.html`);
                    console.log(`⬇️ Downloading HTML to ${screen.name}.html ...`);
                    await downloadUrl(htmlUrl, htmlFile);
                } else {
                    console.log(`⚠️ No htmlUrl found for ${screen.name}`);
                }

                if (pngUrl) {
                    const pngFile = path.join(outputDir, `${screen.name}.png`);
                    console.log(`⬇️ Downloading PNG to ${screen.name}.png ...`);
                    await downloadUrl(pngUrl, pngFile);
                } else {
                    console.log(`⚠️ No pngUrl found for ${screen.name}`);
                }
            } else {
                console.error(`⚠️ Missing result content for ${screen.name}:`, JSON.stringify(resp));
            }
        } catch (e) {
            console.error(`❌ Failed ${screen.name}:`, e.message);
        }
    }
    console.log('\n🎉 ALL 8 STITCH SCREENS DOWNLOADED SUCCESSFULLY!');
}

run();
