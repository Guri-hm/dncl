const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, 'public');
const webpDir = path.join(publicDir, 'webp');

// webpフォルダがなければ作成
if (!fs.existsSync(webpDir)) {
    fs.mkdirSync(webpDir);
}

fs.readdirSync(publicDir)
    .filter(file => file.endsWith('.svg'))
    .forEach(file => {
        const inputPath = path.join(publicDir, file);
        const outputPath = path.join(webpDir, file.replace(/\.svg$/, '.webp'));

        sharp(inputPath)
            .webp()
            .toFile(outputPath)
            .then(() => console.log(`Converted: ${file} → webp/${path.basename(outputPath)}`))
            .catch(err => console.error(`Error converting ${file}:`, err));
    }); // ← ここが抜