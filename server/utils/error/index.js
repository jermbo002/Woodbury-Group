const Status = require( 'http-status' );
const logger = require( '../logger/index.js' );

module.exports = class ErrorHandler extends Error {
    constructor( status = Status.INTERNAL_SERVER_ERROR, message, stack ) {
        super();

        if ( stack ) {
            this.stack = stack;
        }

        logger.error( message, {
            status,
            stack: this.stack
        } );

        this.status = status;
        this.message = message;
    }
};