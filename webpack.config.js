const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = 'development';
}
const ENV = process.env.ENV = process.env.NODE_ENV;

const isVendorModule = (module) => {
    if (!module.context) {
        return false;
    }
    return module.context.indexOf('node_modules') !== -1;
};

const extractCss = new ExtractTextPlugin({
    filename: '[name].css',
    disable: false,
    allChunks: true,
});

const moduleRules = [
    {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
    },
    {
        test: /\.(html)$/,
        loader: 'html-loader',
    },
    {
        test: /\.scss$/,
        use: extractCss.extract({
            use: [
                {
                    loader: 'css-loader',
                },
                {
                    loader: 'sass-loader',
                },
            ],
            publicPath: '../',
        }),
    },
];

const plugins = [
    new CleanWebpackPlugin([
        path.resolve(__dirname, 'build/*'),
    ]),
    // ref: https://github.com/angular/angular/issues/20357
    new webpack.ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)esm5/,
        path.resolve(__dirname, './src')),
    new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        chunks: ['vendor', 'main'],
    }),
    new CopyWebpackPlugin([
        { from: './src/manifest.json' },
        { from: './src/favicon.ico' },
        { from: './src/version.json' },
        { from: './src/browserconfig.xml' },
        { from: './src/app-id.json' },
        { from: './src/images', to: 'images' },
    ]),
    new webpack.SourceMapDevToolPlugin({
        filename: '[name].js.map',
        include: ['main.js'],
    }),
    extractCss,
    new webpack.DefinePlugin({
        'process.env': {
            'ENV': JSON.stringify(ENV)
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

const config = {
    mode: ENV,
    entry: {
        'main': './src/app/main.ts',
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            jslib: path.join(__dirname, 'jslib/src'),
        },
        symlinks: false,
        modules: [path.resolve('node_modules')],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: isVendorModule,
                    name: 'vendor',
                    chunks: 'initial',
                    enforce: true,
                }
            }
        }
    },
    module: { rules: moduleRules },
    plugins: plugins,
};

module.exports = config;
