const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'eslint-plugin-custom-rules');
const targetDir = path.join(__dirname, 'node_modules', 'eslint-plugin-custom-rules');

try {
    // ターゲットディレクトリが存在し、かつディレクトリの場合のみ削除
    if (fs.existsSync(targetDir)) {
        const stats = fs.statSync(targetDir);
        if (stats.isDirectory()) {
            console.log('既存のディレクトリを削除中...');
            fs.rmSync(targetDir, { recursive: true, force: true }); // rmdirSyncの代わりにrmSyncを使用
        } else {
            console.log('ファイルを削除中...');
            fs.unlinkSync(targetDir); // ファイルの場合は削除
        }
    }

    // ソースディレクトリが存在する場合のみコピー
    if (fs.existsSync(sourceDir)) {
        console.log('カスタムルールをコピー中...');
        fs.cpSync(sourceDir, targetDir, { recursive: true });
        console.log('カスタムルールのコピーが完了しました');
    } else {
        console.log('ソースディレクトリが見つかりません。スキップします。');
    }
} catch (error) {
    console.warn('カスタムルールのコピーでエラーが発生しましたが、ビルドを続行します:', error.message);
    // エラーでビルドを停止させない
    process.exit(0);
}