import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runScript = (scriptName, args = []) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, scriptName);
        console.log(`\n🚀 Running ${scriptName}...`);

        const child = spawn('node', [scriptPath, ...args], {
            stdio: 'inherit',
            shell: true
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${scriptName} completed successfully.`);
                resolve();
            } else {
                console.error(`❌ ${scriptName} failed with code ${code}.`);
                reject(new Error(`${scriptName} failed`));
            }
        });
    });
};

const seedAll = async () => {
    try {
        console.log('🌱 Starting Full Database Seed...');

        // 1. Seed Categories (Force clear and re-seed: option '3')
        await runScript('seedCategories.js', ['3']);

        // 2. Seed Products (Force clear and re-seed: option '3')
        await runScript('seedProducts.js', ['3']);

        console.log('\n✨ All seeding tasks completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedAll();
