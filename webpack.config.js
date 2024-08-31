const path = require('path');

module.exports = {
    mode: 'development', // Или 'production', если вы хотите использовать минификацию
    entry: './src/index.js', // Убедитесь, что путь правильный
    output: {
        filename: 'bundle.js', // Имя выходного файла
        path: path.resolve(__dirname, 'dist'), // Папка для выхода
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    devtool: 'source-map',
};
