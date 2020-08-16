const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const pjson = require('./package.json');

if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = 'development';
}
const ENV = process.env.ENV = process.env.NODE_ENV;

const moduleRules = [
    {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'eslint-loader',
    },
    {
        test: /\.(html)$/,
        loader: 'html-loader',
    },
    {
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        exclude: /loading.svg/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'fonts/',
            },
        }],
    },
    {
        test: /\.(jpe?g|png|gif|svg)$/i,
        exclude: /.*(fontawesome-webfont)\.svg/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'images/',
            },
        }],
    },
    {
        test: /\.scss$/,
        use: [
            {
                loader: MiniCssExtractPlugin.loader,
                options: {
                    publicPath: '../',
                },
            },
            'css-loader',
            'sass-loader',
        ],
    },
    // Hide System.import warnings. ref: https://github.com/angular/angular/issues/21560
    {
        test: /[\/\\]@angular[\/\\].+\.js$/,
        parser: { system: true },
    },
];

const plugins = [
    new CleanWebpackPlugin([
        path.resolve(__dirname, 'build/*'),
    ]),
    // ref: https://github.com/angular/angular/issues/20357
    new webpack.ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)fesm5/,
        path.resolve(__dirname, './src')),
    new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        chunks: ['app/polyfills', 'app/vendor', 'app/main'],
    }),
    new HtmlWebpackPlugin({
        template: './src/connectors/duo.html',
        filename: 'duo-connector.html',
        chunks: ['connectors/duo'],
    }),
    new HtmlWebpackPlugin({
        template: './src/connectors/u2f.html',
        filename: 'u2f-connector.html',
        chunks: ['connectors/u2f'],
    }),
    new HtmlWebpackPlugin({
        template: './src/connectors/sso.html',
        filename: 'sso-connector.html',
        chunks: ['connectors/sso'],
    }),
    new CopyWebpackPlugin([
        { from: './src/.nojekyll' },
        { from: './src/manifest.json' },
        { from: './src/favicon.ico' },
        { from: './src/browserconfig.xml' },
        { from: './src/app-id.json' },
        { from: './src/images', to: 'images' },
        { from: './src/locales', to: 'locales' },
        { from: './src/scripts', to: 'scripts' },
        { from: './node_modules/qrious/dist/qrious.min.js', to: 'scripts' },
        { from: './node_modules/braintree-web-drop-in/dist/browser/dropin.js', to: 'scripts' },
    ]),
    new MiniCssExtractPlugin({
        filename: '[name].[hash].css',
        chunkFilename: '[id].[hash].css',
    }),
    new webpack.DefinePlugin({
        'process.env': {
            'ENV': JSON.stringify(ENV),
            'SELF_HOST': JSON.stringify(process.env.SELF_HOST === 'true' ? true : false),
            'APPLICATION_VERSION': JSON.stringify(pjson.version),
            'CACHE_TAG': JSON.stringify(Math.random().toString(36).substring(7)),
        }
    }),
];

if (ENV === 'production') {
    moduleRules.push({
        test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
        loader: '@ngtools/webpack',
    });
    plugins.push(new AngularCompilerPlugin({
        tsConfigPath: 'tsconfig.json',
        entryModule: 'src/app/app.module#AppModule',
        sourceMap: true,
    }));
} else {
    moduleRules.push({
        test: /\.ts$/,
        loaders: ['ts-loader', 'angular2-template-loader'],
        exclude: path.resolve(__dirname, 'node_modules'),
    });
}

// ref: https://webpack.js.org/configuration/dev-server/#devserver
let certSuffix = fs.existsSync('dev-server.local.pem') ? '.local' : '.shared';
const devServer = {
    https: {
        key: fs.readFileSync('dev-server' + certSuffix + '.pem'),
        cert: fs.readFileSync('dev-server' + certSuffix + '.pem'),
    },
    // host: '192.168.1.9',
    hot: false,
};

const config = {
    mode: ENV,
    devtool: 'source-map',
    devServer: devServer,
    entry: {
        'app/polyfills': './src/app/polyfills.ts',
        'app/main': './src/app/main.ts',
        'connectors/u2f': './src/connectors/u2f.js',
        'connectors/duo': './src/connectors/duo.ts',
        'connectors/sso': './src/connectors/sso.ts',
    },
    externals: {
        'u2f': 'u2f',
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'app/vendor',
                    chunks: (chunk) => {
                        return chunk.name === 'app/main';
                    },
                },
            },
        },
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    safari10: true,
                },
            }),
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            jslib: path.join(__dirname, 'jslib/src'),
            tldjs: path.join(__dirname, 'jslib/src/misc/tldjs.noop'),
        },
        symlinks: false,
        modules: [path.resolve('node_modules')],
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, 'build'),
    },
    module: { rules: moduleRules },
    plugins: plugins,
};

module.exports = config;
