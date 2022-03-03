require( 'dotenv' ).config();
const { createLogger, format, transports } = require( 'winston' );

const logger = createLogger( {
    level: 'info',
    format: format.combine(
        format.timestamp( {
            format: 'YYYY-MM-DD HH:mm:ss'
        } ),
        format.errors( { stack: true } ),
        format.splat(),
        format.json()
    )
} );


// For local dev, console.log logs
if ( process.env.env === 'local' ) {
    logger.add( new transports.Console( {
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    } ) );
}
else {
    // Otherwise write to log files
    logger.add( new transports.File( { filename: './logs/error.log', level: 'error' } ) );
    logger.add( new transports.File( { filename: './logs/all.log' } ) );
}

module.exports = logger;