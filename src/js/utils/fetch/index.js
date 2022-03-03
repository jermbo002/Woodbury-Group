/**
* Copyright 2022 Select Interactive, LLC. All rights reserved.
* @author: The Select Interactive dev team (www.select-interactive.com)
*/
const STATUS_CODES = {
    OK: 200
};

if ( !self.fetch ) {
    console.warn( 'Fetch has not been polyfilled.' );
}

( () => {
    const doFetch = self.fetch;

    self.fetch = ( url, options ) => {
        // @ts-ignore
        if ( typeof url !== 'string' ) {
            return doFetch( url, options );
        }

        return new Promise( async ( resolve, reject ) => {
            try {
                const rsp = await doFetch( url, options );

                if ( rsp.status === STATUS_CODES.OK ) {
                    const result = await parseJSON( rsp );

                    if ( result.ok ) {
                        return resolve( result.data );
                    }
                    else {
                        return reject( result );
                    }
                }
                else {
                    return reject( {
                        message: await rsp.text(),
                        status: rsp.status
                    } );
                }
            }
            catch ( e ) {
                return reject( e );
            }
        } );
    };
} )();

function parseJSON( rsp ) {
    return new Promise( async ( resolve, reject ) => {
        try {
            const result = await rsp.json();

            resolve( {
                status: result.status,
                ok: rsp.ok,
                data: result.data,
                message: result.message || ''
            } );
        }
        catch ( e ) {
            reject( e );
        }
    } );
}