const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/index.ts',
    mode: process.env.APP_ENV || "development",
    output: {
        filename: 'index.js', // <-- Important
        libraryTarget: 'this' // <-- Important
    },
    target: 'node', // <-- Important
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'
        ]
    },
    externals: [nodeExternals()
    ] // <-- Important
};