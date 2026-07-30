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
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    reject(new Error(`Failed to parse JSON response: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(bodyData);
        req.end();
    });
}

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => { });
            reject(err);
        });
    });
}

async function run() {
    console.log('🚀 Connecting to Stitch MCP to retrieve new screens...');

    // First initialize MCP session
    await mcpRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'ConvoPilotClient', version: '1.0.0' }
    });

    const outputDir = path.join(__dirname, 'stitch_assets');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const screen of SCREENS) {
        console.log(`\n📥 Fetching screen details for ${screen.name} (${screen.id})...`);
        try {
            const result = await mcpRequest('tools/call', {
                name: 'get_screen',
                arguments: {
                    name: `projects/${PROJECT_ID}/screens/${screen.id}`
                }
            });

            if (result.result && result.result.content) {
                const textContent = result.result.content.find(c => c.type === 'text')?.text;
                if (textContent) {
                    const screenData = JSON.parse(textContent);
                    console.log(`✅ Got data for ${screen.name}`);

                    if (screenData.codeUrl) {
                        const htmlPath = path.join(outputDir, `${screen.name}.html`);
                        console.log(`Downloading HTML from ${screenData.codeUrl} to ${htmlPath}...`);
                        await downloadFile(screenData.codeUrl, htmlPath);
                    }
                    if (screenData.screenshotUrl) {
                        const pngPath = path.join(outputDir, `${screen.name}.png`);
                        console.log(`Downloading Screenshot from ${screenData.screenshotUrl} to ${pngPath}...`);
                        await downloadFile(screenData.screenshotUrl, pngPath);
                    }
                }
            } else {
                console.log(`⚠️ Response structure unexpected for ${screen.name}:`, JSON.stringify(result));
            }
        } catch (err) {
            console.error(`❌ Error fetching screen ${screen.name}:`, err.message);
        }
    }
    console.log('\n🎉 Finished fetching all 8 new Stitch screens into ./stitch_assets/');
}

run();
