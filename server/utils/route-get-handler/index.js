const stringMinifier = require( 'string-minify' );
const handlebars = require( 'handlebars' );
const crypto = require( 'crypto' );
const fs = require( 'mz/fs' );
const path = require( 'path' );
const Utils = require( '../helpers' );
const logger = require( '../logger' );
const HandlebarsHelpers = require( '../handlebars' );
const root = path.join( __dirname, '..', '..', '..' );
const scriptBuildDir = process.env.jsDir;

module.exports = class GetHandler {
    static async get( req, res ) {
        try {
            // User data
            const userData = req.userData || {};
            const isLoggedIn = userData.uid && userData.uid !== '' ? true : false;
            const profileData = req.profileData || {};

            // Determine the index path
            const indexPath = ( !req.indexPath || req.indexPath == undefined ) ? req.originalUrl : req.indexPath;
            const jsPath = ( !req.jsPath || req.jsPath == undefined ) ? indexPath : req.jsPath;


            // Determine Script and Css Paths
            const scriptPaths = Utils.getJsPaths( root, scriptBuildDir, isLoggedIn, false, jsPath.replace( /\//g, '_' ), 0 );

            // Compile all handlebars data
            const pageContent = {
                ...req.pageContent,
                ...userData,
                ...profileData,
                isLoggedIn
            };

            const handlebarsData = HandlebarsHelpers.constructData( '', req.bodyClass, scriptPaths, pageContent || {} );

            // Register Partials
            HandlebarsHelpers.registerPartials( handlebars, indexPath );

            // Load the base template based on route
            const template = HandlebarsHelpers.selectTemplate( indexPath );

            const templateContent = await fs.readFile( template );
            const utf8Content = await templateContent.toString( 'utf-8' );
            let outContent = HandlebarsHelpers.compile( handlebars, utf8Content, handlebarsData );

            if ( process.env.mode === 'prod' ) {
                outContent = stringMinifier( outContent );
            }

            const hash = crypto
                .createHash( 'sha256' )
                .update( outContent )
                .digest( 'hex' );

            res.set( {
                'ETag': hash,
                'Cache-Control': 'public, no-cache'
            } );

            if ( req?.pageContent?.is404 ) {
                return res.status( 404 ).send( outContent );
            }
            else if ( req?.pageContent?.isError ) {
                return res.status( 500 ).send( outContent );
            }

            return res.send( outContent );
        }
        catch ( e ) {
            if ( e.message && e.message.toLowerCase().indexOf( 'no such file or directory' ) !== -1 ) {
                logger.error( `${e.message}\nRoute: ${req.originalUrl}`, {
                    status: 404,
                    stack: e.stack
                } );

                req.pageContent = {
                    page_title: 'Page Not Found',
                    is404: true
                };

                req.indexPath = '404';

                return GetHandler.get( req, res );
            }
            else {
                logger.error( `${e.message}\nRoute: ${req.originalUrl}`, {
                    status: e.status,
                    stack: e.stack
                } );

                req.pageContent = {
                    page_title: 'Error',
                    error_message: e.message,
                    isError: true
                };

                req.indexPath = 'error';
                return GetHandler.get( req, res );
            }
        }
    }
};