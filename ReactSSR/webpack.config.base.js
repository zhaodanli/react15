const path = require('path');

module.exports = {
    mode: 'development',
    devtool: false,
    devtool: 'source-map', // 开启 Source Map
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    module: {
        rules: [
            {
                test: /\.js?$/, // 处理 .js 和 .jsx 文件
                enforce: 'pre',
                use: 'source-map-loader',
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader']
            },
            {
                test: /\.js/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ]
                    }
                },
                exclude: /node_modules/,

            }
        ]
    }
}