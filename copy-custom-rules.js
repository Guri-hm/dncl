const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, 'eslint-plugin-custom-rules');
const destDir = path.resolve(__dirname, 'node_modules', 'eslint-plugin-custom-rules');

function copyFolderSync(from, to) {
    fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        const stat = fs.statSync(path.join(from, element));
        if (stat.isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else if (stat.isDirectory()) {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}

// コピー先に既に存在する場合は削除
if (fs.existsSync(destDir)) {
    fs.rmdirSync(destDir, { recursive: true });
}

copyFolderSync(sourceDir, destDir);
console.log('eslint-plugin-custom-rules copied to node_modules successfully.');
