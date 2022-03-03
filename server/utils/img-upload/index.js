require( 'dotenv' ).config();

const multer = require( 'multer' );
const path = require( 'path' );
const { v4: uuidv4 } = require( 'uuid' );
const jimp = require( 'jimp' );
const fs = require( 'fs' );
//const webp = require( 'webp-converter' );
const azureStorage = require( 'azure-storage' );
const blobService = azureStorage.createBlobService( process.env.azureStorageConnectionString );

const rootPath = path.join( __dirname, '..', '..', '..' );
const TEMP_PATH = `${rootPath}/client/static/img/uploads/`;
const containerName = process.env.azureStorageContainer;

const logger = require( '../logger' );

const upload = multer( {
    dest: TEMP_PATH
} );

module.exports = app => {
    app.post( '/upload/img', upload.single( 'img' ), async ( req, res, next ) => {
        try {
            // Confirm we have a file
            if ( !req.file ) {
                return res.status( 401 ).json( {
                    message: 'No file provided.'
                } );
            }

            // Setup sizing and path
            const processImg = new ProcessImg( {
                type: req.body.type || 'image/jpeg',
                maxWidth: req.body.maxWidth || req.body.width || 64,
                maxHeight: req.body.maxHeight || req.body.height || 64,
                path: req.body.imgPath ? `${req.body.imgPath}/` : 'img/'
            } );

            // Resize and save the file
            const {
                fileName,
                filePath
            } = await processImg.save( req.file );

            // Delete the temp file
            try {
                fs.unlink( req.file.path, ( err ) => {
                    if ( err ) {
                        //throw err;
                    }
                } );
            }
            catch ( e ) { }

            res.status( 200 ).json( {
                data: {
                    fileName,
                    filePath,
                    storageHost: process.env.azureStorageHost,
                    fullPath: process.env.azureStorageHost + filePath
                },
                status: 200
            } );
        }
        catch ( e ) {
            res.status( 500 ).json( {
                message: e.message,
                status: 500
            } );
        }
    } );
};

class ProcessImg {
    static generateFileName( ext ) {
        return `${uuidv4()}.${ext}`;
    }

    constructor( opts ) {
        this._opts = opts;
    }

    async save( file ) {
        const ext = file.originalname.split( '.' ).pop();
        const fileName = ProcessImg.generateFileName( ext );
        const filePath = this._getFilePath( fileName );

        let isGif = false;
        let hasWebP = false;

        // Resize image with jimp
        if ( file.mimetype !== 'image/gif' ) {
            await new Promise( resolve => setTimeout( () => resolve(), 300 ) );
            const img = await jimp.read( file.path );
            img.cover( parseInt( this._opts.maxWidth, 10 ), parseInt( this._opts.maxHeight, 10 ) );
            await img.writeAsync( filePath );
        }
        else {
            await fs.rename( file.path, filePath, ( err ) => {
                logger.error( `Error renaming file.\n${err.message || err.toString()}` );
            } );

            isGif = true;
        }

        // Push image to azure
        await new Promise( resolve => setTimeout( () => resolve(), 300 ) );
        const azurePath = await this._uploadToAzure( fileName, filePath, file.mimetype, isGif );

        // Convert image to webp
        // if ( file.mimetype !== 'image/gif' ) {
        //     try {
        //         const webPFileName = filePath.replace( '.jpg', '.webp' ).replace( '.jpeg', '.webp' ).replace( '.png', '.webp' );
        //         await webp.cwebp( `${filePath}`, webPFileName, '-q 80' );

        //         // Push webP image to azure
        //         await new Promise( resolve => setTimeout( () => resolve(), 300 ) );
        //         await this._uploadToAzure( fileName.replace( '.jpg', '.webp' ).replace( '.jpeg', '.webp' ).replace( '.png', '.webp' ), webPFileName, 'image/webp', isGif );

        //         hasWebP = true;
        //     }
        //     catch ( e ) {
        //         logger.error( `Error converting image to webp.\n${e.message}` );
        //     }
        // }

        // Delete local copy
        try {
            this._deleteFile( filePath, hasWebP );
        }
        catch ( e ) { }

        return {
            fileName,
            filePath: azurePath.name
        };
    }

    _deleteFile( filePath, hasWebP ) {
        // Delete the local version
        fs.unlink( filePath, ( err ) => {
            if ( err ) {
                // throw err;
            }
        } );

        // Delete local webp version
        if ( hasWebP ) {
            fs.unlink( filePath.replace( '.jpg', '.webp' ).replace( '.jpeg', '.webp' ).replace( '.png', '.webp' ), ( err ) => {
                if ( err ) {
                    // throw err;
                }
            } );
        }
    }

    _getFilePath( fileName ) {
        return path.resolve( `${TEMP_PATH}${fileName}` );
    }

    _uploadToAzure( fileName, filePath, mimeType, isGif ) {
        return new Promise( async ( resolve, reject ) => {
            blobService.createBlockBlobFromLocalFile( containerName, `${this._opts.path}${fileName}`, filePath, {
                contentSettings: {
                    contentType: mimeType,
                    cacheControl: 'public:max-age=31536000'
                }
            }, ( error, result, response ) => {
                if ( error ) {
                    logger.error( `Error uploading to azure.\n${error.message || error.toString()}` );
                    reject( error );
                }

                resolve( result );
            } );
        } );
    }
}