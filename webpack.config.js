const path = require( 'path' );

const adminEntries = {
    home: './src/js/pages/home.js'
};

const pagesEntries = {
    home: './src/js/pages/home.js',
    page: './src/js/pages/page.js'
};

module.exports = ( env, arg ) => {
    const isProduction = arg.mode === 'production';

    let outPath = isProduction ? 'dist' : 'dev';
    let outFileNaming = isProduction ? '[name].[contenthash].js' : '[name].[fullhash].js';

    const loaders = {
        rules: []
    };

    const optimizations = {
        minimize: isProduction,

        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: 'initial',
                    minChunks: 2,
                    name: 'commons',
                    enforce: true
                }
            }
        }
    };

    // If building for production babel it all
    if ( isProduction ) {
        loaders.rules.push(
            {
                test: /\.js$/,
                exclude: /[\\/]node_modules[\\/](?!(lit-element|lit-html|lit)[\\/]).*/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    modules: false,
                                    targets: {
                                        ie: 11,
                                    },
                                },
                            ],
                        ],
                        plugins: [
                            [
                                '@babel/plugin-transform-runtime',
                                {
                                    regenerator: true,
                                },
                            ],
                            'babel-plugin-async-to-promises',
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-syntax-dynamic-import'
                        ]
                    }
                }
            }
        );
    }

    return [
        // Admin entry points
        {
            entry: adminEntries,

            output: {
                clean: true,
                filename: outFileNaming,
                path: path.resolve( __dirname, `static/js/${outPath}/admin/` ),
                publicPath: `/js/${outPath}/admin/`
            },

            target: isProduction ? ['web', 'es5'] : ['web'],
            module: loaders,
            optimization: optimizations
        },

        // Front end entry points
        {
            entry: pagesEntries,

            output: {
                clean: true,
                filename: outFileNaming,
                path: path.resolve( __dirname, `static/js/${outPath}/pages/` ),
                publicPath: `/js/${outPath}/pages/`
            },

            target: isProduction ? ['web', 'es5'] : ['web'],
            module: loaders,
            optimization: optimizations
        }
    ];
};