/**
 * Copyright 2020 Select Interactive, LLC. All rights reserved.
 * @author: The Select Interactive dev team (www.select-interactive.com)
*/
require( 'dotenv' ).config();

const multer = require( 'multer' );
const path = require( 'path' );
const { v4: uuidv4 } = require( 'uuid' );
const fs = require( 'fs' );
const azureStorage = require( 'azure-storage' );
const blobService = azureStorage.createBlobService( process.env.azureStorageConnectionString );

const rootPath = path.join( __dirname, '..', '..', '..' );
const TEMP_PATH = `${rootPath}/client/static/docs/uploads/`;
const containerName = process.env.azureStorageContainer;

const upload = multer( {
    dest: TEMP_PATH
} );

module.exports = app => {
    app.post( '/upload/file', upload.single( 'file' ), async ( req, res ) => {
        // Confirm we have a file
        if ( !req.file ) {
            return res.status( 401 ).json( {
                message: 'No file provided.'
            } );
        }

        const processFile = new ProcessFile( {
            type: req.body.type,
            path: req.body.filePath ? `${req.body.filePath}/` : 'docs/'
        } );

        const {
            fileName,
            filePath
        } = await processFile.save( req.file );

        fs.unlink( req.file.path, ( err ) => {
            if ( err ) {
                throw err;
            }
        } );

        return res.status( 200 ).json( {
            data: {
                fileName,
                filePath,
                storageHost: process.env.azureStorageHost,
                fullPath: process.env.azureStorageHost + filePath
            },
            status: 200
        } );
    } );
};

class ProcessFile {
    static generateFileName( ext ) {
        return `${uuidv4()}.${ext}`;
    }

    constructor( opts ) {
        this._opts = opts;
    }

    async save( file ) {
        const fileName = ProcessFile.generateFileName( file.originalname.split( '.' ).pop() );
        const filePath = this._getFilePath( fileName );

        fs.copyFileSync( file.path, filePath );

        // Push image to azure
        const azurePath = await this._uploadToAzure( fileName, filePath, file.mimetype );

        // Delete local copy
        this._deleteFile( filePath );

        return {
            fileName,
            filePath: azurePath.name
        };
    }

    _deleteFile( filePath ) {
        // Delete the local version
        fs.unlink( filePath, ( err ) => {
            if ( err ) {
                throw err;
            }
        } );
    }

    _getFilePath( fileName ) {
        return path.resolve( `${TEMP_PATH}${fileName}` );
    }

    _uploadToAzure( fileName, filePath, mimeType ) {
        return new Promise( async ( resolve, reject ) => {
            blobService.createBlockBlobFromLocalFile( containerName, `${this._opts.path}${fileName}`, filePath, {
                contentSettings: {
                    contentType: mimeType
                }
            }, ( error, result, response ) => {
                if ( error ) {
                    reject( error );
                }

                resolve( result );
            } );
        } );
    }
}