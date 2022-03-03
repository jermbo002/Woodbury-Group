/**
 * Copyright 2021 Select Interactive, LLC. All rights reserved.
 * @author: The Select Interactive dev team (www.select-interactive.com)
*/
require( 'dotenv' ).config();
const express = require( 'express' );
const app = express();

const compression = require( 'compression' );
const cookieParser = require( 'cookie-parser' );
const bodyParser = require( 'body-parser' );
const rewrite = require( 'express-urlrewrite' );
const path = require( 'path' );

const GetHandler = require( './utils/route-get-handler' );

// --------------------
// If production, force traffic to www.
// --------------------
if ( process.env.mode === 'prod' ) {
    app.use( ( req, res, next ) => {
        if ( req.hostname.indexOf( 'www.' ) !== 0 ) {
            res.redirect( 301, req.protocol + '://www.' + process.env.domain + ':80' + req.originalUrl );
        } else {
            next();
        }
    } );
}

// --------------------
// Cookie and Body Parser middleware
// --------------------
app.use( cookieParser() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );


// --------------------
// Compression
// --------------------
const compressResponse = req => {
    if ( req.headers['x-no-compression'] ) {
        return false;
    }

    return true;
};

app.use( compression( { filter: compressResponse } ) );


// --------------------
// Handle all needed rewrites for static assets
// --------------------
app.use( rewrite( /^(.+)(\.[v]\d+\.)(js|css|png|jpg|gif|webp|pdf|svg)$/, '$1.$3' ) );
app.use( rewrite( /^(.+)(\.[v]\d\.min\.)(js|css|png|jpg|gif|webp|pdf|svg)$/, '$1.$3' ) );
app.use( rewrite( /^(.+)(\.[v][-]\d.\d\.)(js|css|png|jpg|gif|webp|pdf|svg)$/, '$1.$3' ) );
app.use( rewrite( /^(.+)(\.[v][-]\d.\d\.min\.)(js|css|png|jpg|gif|webp|pdf|svg)$/, '$1.$3' ) );


// --------------------
// Static assets
// --------------------
const cacheMaxAge = 31536000000;
app.use( express.static( path.join( __dirname, '..', 'static' ), { maxAge: cacheMaxAge } ) );
app.use( '/node_modules', express.static( 'node_modules', { maxAge: cacheMaxAge } ) );
app.use( '/logs', express.static( 'logs' ) );


// --------------------
// Inject Prismic 
// --------------------
// require( './prismic' )( app );


// --------------------
// Set route handlers
// --------------------
require( './routes' )( app );


// --------------------
// Handle all requests to pages
// --------------------
app.get( '/*', ( req, res ) => GetHandler.get( req, res ) );


// --------------------
// Catch unhandledRejections
// --------------------
process.on( 'unhandledRejection', ( reason, promise ) => {
    console.log( `UnhandledRejection: ${reason}` );
} );


module.exports = app;