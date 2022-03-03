const Page = require( '../page' );

class HomePage extends Page {
    constructor( app ) {
        super( app );
        this.route = '/';
    }

    async get( req, res, next ) {
        try {
            req.pageContent = {
                page_title: 'The Woodbury Gruop'
            };

            req.indexPath = 'home';
            next();
        }
        catch ( e ) {
            this.onError( req, res, next, e );
        }
    }
}

module.exports = app => new HomePage( app );