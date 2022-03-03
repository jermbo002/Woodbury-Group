require( 'dotenv' ).config();

const prismic = require( '@prismicio/client' );
const PrismicUtils = require( './utils' );
const fetch = require( 'node-fetch' );

const apiEndPoint = process.env.prismicApiEndPoint;
const accessToken = process.env.prismicAccessToken;

const client = prismic.createClient( apiEndPoint, {
    accessToken,
    fetch,
    routes: PrismicUtils.routes()
} );

module.exports = app => {
    app.use( ( req, res, next ) => {
        req.prismic = {
            client
        };

        next();
    } );
};