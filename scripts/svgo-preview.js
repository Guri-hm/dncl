const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');

const root = process.cwd();
const srcDir = path.join(root, 'public');
const outDir = path.join(root, 'optimized', 'public');

// 出力先作成
fs.mkdirSync(outDir, { recursive: true });

// svgo.config.js があれば読み込む（存在しなくてもOK）
const configPath = path.resolve(root, 'svgo.config.js');
let userConfig = {};
if (fs.existsSync(configPath)) {
    try {
        userConfig = require(configPath);
    } catch (e) {
        console.error('Failed to load svgo.config.js:', e);
        process.exit(1);
    }
}

function walk(dir, cb) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full, cb);
        else cb(full);
    }
}

let totalOriginal = 0;
let totalOptimized = 0;
let fileCount = 0;

console.log('svgo preview: src=', srcDir, ' out=', outDir);


walk(srcDir, (file) => {
    if (!file.toLowerCase().endsWith('.svg')) return;
    const rel = path.relative(srcDir, file);
    const dest = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    try {
        const svg = fs.readFileSync(file, 'utf8');
        const originalSize = Buffer.byteLength(svg, 'utf8');
        const options = Object.assign({}, userConfig, { path: file, multipass: true });
        const result = optimize(svg, options);
        if (result.error) {
            console.error('svgo optimize error for', file, result.error);
            process.exit(1);
        }
        const optimizedSize = Buffer.byteLength(result.data, 'utf8');
        fs.writeFileSync(dest, result.data, 'utf8');

        const saved = originalSize - optimizedSize;
        const savedPct = originalSize > 0 ? (saved / originalSize) * 100 : 0;

        console.log(
            `svgo: ${rel} — ${originalSize.toLocaleString()} → ${optimizedSize.toLocaleString()} bytes ` +
            `(${saved >= 0 ? '-' : '+'}${Math.abs(saved).toLocaleString()} bytes, ${savedPct.toFixed(1)}% ${saved >= 0 ? 'saved' : 'larger'})`
        );

        totalOriginal += originalSize;
        totalOptimized += optimizedSize;
        fileCount += 1;
    } catch (err) {
        console.error('svgo failed for', file, err);
        process.exit(1);
    }
});

if (fileCount > 0) {
    const totalSaved = totalOriginal - totalOptimized;
    const totalSavedPct = totalOriginal > 0 ? (totalSaved / totalOriginal) * 100 : 0;
    console.log('---- summary ----');
    console.log(`files: ${fileCount}`);
    console.log(`total: ${totalOriginal.toLocaleString()} → ${totalOptimized.toLocaleString()} bytes`);
    console.log(`saved: ${totalSaved.toLocaleString()} bytes (${totalSavedPct.toFixed(1)}%)`);
} else {
    console.log('No SVG files found.');
}

console.log('done.');