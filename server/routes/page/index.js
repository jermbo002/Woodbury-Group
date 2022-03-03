const PrismicUtils = require( '../../prismic/utils' );
const logger = require( '../../utils/logger' );

class Page {
    set route( value ) {
        this._route = value;
        this.app.get( this._route, ( req, res, next ) => this.get( req, res, next ) );
    }

    constructor( app ) {
        this.app = app;
    }

    async get( req, res, next ) {
        // Must override
    }

    async prismicGetSingle( req, docType ) {
        try {
            return await PrismicUtils.getSinglePage( req, docType );
        }
        catch ( e ) {
            throw e;
        }
    }

    async prismicGetByUID( { prismic }, docType, uid ) {
        try {
            return await PrismicUtils.getByUID( prismic, docType, uid );
        }
        catch ( e ) {
            throw e;
        }
    }

    async prismicQueryByType( { prismic }, docType, filters = [], options = {} ) {
        try {
            return await PrismicUtils.queryByType( prismic, docType, filters, options );
        }
        catch ( e ) {
            throw e;
        }
    }

    onError( req, res, next, e ) {
        logger.error( e.message );

        if ( e?.message === '404' ) {
            return this.handle404( req, next );
        }

        return this.handleError( req, next, e );
    }

    handle404( req, next ) {
        req.pageContent = {
            page_title: 'Page Not Found',
            is404: true
        };

        req.indexPath = '404';
        return next();
    }

    handleError( req, next, e ) {
        req.pageContent = {
            page_title: 'Error',
            error_message: e.message,
            isError: true
        };

        req.indexPath = 'error';
        return next();
    }
}

module.exports = Page;