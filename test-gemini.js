const fs = require('fs');
const path = require('path');

// Read .env.local manually since we are running this with node directly
const envPath = path.join(__dirname, '.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
} catch {
    console.error("Could not read .env.local");
}

if (!apiKey) {
    console.error("No API Key found in .env.local");
    process.exit(1);
}

console.log("Testing API Key:", apiKey.substring(0, 10) + "...");

async function test() {
    try {
        // Use a direct fetch to list models to avoid SDK version issues for listing
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
            return;
        }

        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                // Check if it supports generateContent
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models returned.");
        }

    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

test();
