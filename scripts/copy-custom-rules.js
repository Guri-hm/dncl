const fs = require('fs');
const path = require('path');

const candidates = [
    path.join(__dirname, 'eslint-plugin-custom-rules'),
    path.join(__dirname, '..', 'eslint-plugin-custom-rules'),
    path.join(process.cwd(), 'eslint-plugin-custom-rules'),
];

let sourceDir = null;
for (const c of candidates) {
    if (fs.existsSync(c)) {
        sourceDir = c;
        break;
    }
}

const targetDir = path.join(process.cwd(), 'node_modules', 'eslint-plugin-custom-rules');

try {
    console.log('script __dirname =', __dirname);
    console.log('process.cwd() =', process.cwd());
    console.log('候補 source dirs =', candidates);
    console.log('選択された sourceDir =', sourceDir);

    if (!sourceDir) {
        console.log('ソースディレクトリが見つかりません。スキップします。');
        process.exit(0);
    }

    // 既存ターゲットを消してから丸ごとコピー
    if (fs.existsSync(targetDir)) {
        console.log('既存のターゲットを削除しています:', targetDir);
        fs.rmSync(targetDir, { recursive: true, force: true });
    }

    console.log('カスタムルール（フォルダ丸ごと）をコピー:', sourceDir, '->', targetDir);
    fs.cpSync(sourceDir, targetDir, { recursive: true });
    console.log('コピー完了');
} catch (err) {
    console.warn('コピー中にエラー:', err && err.message ? err.message : err);
    process.exit(0);
}