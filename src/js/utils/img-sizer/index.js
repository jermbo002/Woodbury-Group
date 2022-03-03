export default function checkImageSizes( file, minWidth, maxWidth, minHeight, maxHeight ) {
    return new Promise( async ( resolve, reject ) => {
        try {
            const reader = new FileReader();

            reader.onload = e => {
                const img = new Image();

                img.onload = () => {
                    const width = img.width;
                    const height = img.height;
                    let saveWidth = minWidth;
                    let saveHeight = minHeight;

                    if ( width < minWidth || height < minHeight ) {
                        return reject( 'min dimensions' );
                    }

                    // Landscape Image and Square
                    if ( width >= height ) {
                        if ( width > maxWidth ) {
                            const perc = maxWidth / width;
                            saveWidth = maxWidth;
                            saveHeight = Math.floor( height * perc );

                            if ( saveHeight < minHeight ) {
                                saveHeight = minHeight;
                            }
                        }
                        else {
                            saveWidth = width;
                            saveHeight = height;
                        }

                        saveHeight = Math.min( saveHeight, maxHeight );
                    }

                    // Portrait Image
                    else if ( height > width ) {
                        if ( height > maxHeight ) {
                            const perc = maxHeight / height;
                            saveHeight = maxHeight;
                            saveWidth = Math.floor( width * perc );

                            if ( saveWidth < minWidth ) {
                                saveWidth = minWidth;
                            }
                        }
                        else {
                            saveHeight = height;
                            saveWidth = width;
                        }

                        saveWidth = Math.min( saveWidth, maxWidth );
                    }

                    resolve( {
                        file,
                        width: saveWidth,
                        height: saveHeight
                    } );
                };

                img.setAttribute( 'src', e.target.result );
            };

            reader.readAsDataURL( file );
        }
        catch ( e ) {
            reject( e );
        }
    } );
}