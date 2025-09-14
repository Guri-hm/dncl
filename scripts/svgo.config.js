module.exports = {
    multipass: true,
    floatPrecision: 2,
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    // viewBox は残す
                    removeViewBox: false,
                    // cleanupIDs の設定はここで行う
                    cleanupIDs: {
                        remove: true,
                        minify: true
                    }
                }
            }
        },
        // 個別プラグインはプリセット後に列挙
        'removeXMLProcInst',
        'removeDoctype',
        'convertStyleToAttrs',
        'convertPathData',
        'convertShapeToPath',
        'mergePaths',
        'collapseGroups',
        'removeDimensions',
        'removeComments',
        'removeMetadata',
        'removeTitle',
        'removeDesc',
        'removeUselessDefs',
        'removeHiddenElems'
    ]
};