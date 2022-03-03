require( 'dotenv' ).config();
const fs = require( 'mz/fs' );
const path = require( 'path' );
const root = path.join( __dirname, '..', '..', '..' );
const config = require( '../../../package.json' );

module.exports = {
    selectTemplate: ( indexPath ) => {
        if ( indexPath.indexOf( '/-/' ) !== -1 ) {
            return path.join( root, 'views', 'pages', indexPath.replace( /\/-\//, '' ), 'index.hbs' );
        }
        else if ( indexPath.indexOf( '/admin/' ) !== -1 ) {
            return path.join( root, 'views', 'templates', 'admin.hbs' );
        }

        return path.join( root, 'views', 'templates', 'standard.hbs' );
    },

    constructData: ( htmlClass = '', bodyClass = '', scriptPaths, pageContent ) => {
        const env = process.env.env;

        return {
            htmlClass,
            bodyClass,
            page_title: 'Page Title',
            og_img: process.env.ogImg || '',
            cssVersion: process.env.mode === 'dev' ? `v${Date.parse( new Date().toString() )}` : `v-${config.cssVersion}`,
            ...scriptPaths,
            ...pageContent,
            currentYear: ( new Date() ).getFullYear(),
            env: {
                isLocal: env === 'local',
                isDev: env === 'dev',
                isStage: env === 'stage',
                isProd: env === 'prod'
            }
        };
    },

    registerPartials: ( hbs, indexPath ) => {
        try {
            hbs.registerPartial( 'partial', context => {
                const { src, isPage = 'false' } = context;
                let filePath = '';

                if ( isPage === 'true' ) {
                    filePath = path.join( root, 'views', 'pages', indexPath, 'index.hbs' );
                }
                else {
                    filePath = path.join( root, 'views', 'partials', `${src}.hbs` );
                }

                return fs.readFileSync( filePath ).toString( 'utf-8' );
            } );
        }
        catch ( e ) {
            throw e;
        }
    },

    compile: ( hbs, content, data ) => {
        let cntr = 1;

        while ( cntr <= 10 && content.match( /{{(.*?)}}/gm ) != null ) {
            content = hbs.compile( content )( data );
            cntr += 1;
        }

        return content;
    }
};