require( 'dotenv' ).config();
const fs = require( 'mz/fs' );
const path = require( 'path' );

function getJsPaths( rootPath, scriptBuildDir, isLoggedIn, isAdmin, pageItem, counter ) {
    if ( !pageItem ) {
        return {
            commons: '',
            pageSrc: ''
        };
    }

    let item = pageItem.replace( /-/g, '_' );

    if ( item === '/' || item === '' || item === '_' ) {
        item = 'home';
    }

    if ( item.substring( item.length - 1 ) === '_' ) {
        item = item.substring( 0, item.length - 1 );
    }

    if ( item.indexOf( '_' ) === 0 ) {
        item = item.substring( 1 );
    }

    const data = {
        commons: '',
        pageSrc: ''
    };

    let dirPath = 'pages';

    if ( isAdmin ) {
        dirPath = 'admin';
    }

    const scriptPath = path.join( rootPath, 'static', 'js', scriptBuildDir, dirPath );
    const fileNames = fs.readdirSync( scriptPath );

    fileNames.forEach( f => {
        if ( f.toLowerCase().indexOf( 'license' ) === -1 ) {
            const fileName = f.substring( 0, f.indexOf( '.' ) );

            if ( fileName === 'commons' ) {
                data.commons = `/js/${scriptBuildDir}/${dirPath}/${f}`;
            }
            else if ( fileName === item ) {
                data.pageSrc = `/js/${scriptBuildDir}/${dirPath}/${f}`;
            }
        }
    } );

    if ( data.commons !== '' && data.pageSrc === '' ) {
        const matchedFiles = fileNames.filter( f => f.indexOf( 'page' ) === 0 );

        if ( matchedFiles?.length ) {
            data.pageSrc = `/js/${scriptBuildDir}/${dirPath}/${fileNames.filter( f => f.indexOf( 'page' ) === 0 )[0]}`;
        }
    }
    else if ( ( data.commons === '' || data.pageSrc === '' ) && counter < 5 ) {
        return getJsPaths( pageItem, counter + 1 );
    }

    return data;
}

module.exports = {
    getJsPaths,

    getCssPaths: ( rootPath, isAdmin ) => {
        if ( isAdmin && process.env.jsDir === 'dist' ) {
            const fileNames = fs.readdirSync( path.join( rootPath, 'static', 'js', 'dist', 'admin' ) )
                .filter( fileName => fileName.indexOf( '.css' ) !== -1 );

            if ( fileNames.length > 0 ) {
                return {
                    cssIncludes: fileNames.map( fileName => `
                    <link rel="stylesheet" href="/js/dist/admin/${fileName}">
                ` ).join( '' )
                };
            }
        }

        return {
            cssIncludes: ''
        };
    },

    createURLString: str => {
        const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
        const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
        const p = new RegExp( a.split( '' ).join( '|' ), 'g' )

        return str.toString().toLowerCase()
            .replace( /\s+/g, '-' ) // Replace spaces with -
            .replace( p, c => b.charAt( a.indexOf( c ) ) ) // Replace special characters
            .replace( /&/g, '-and-' ) // Replace & with 'and'
            .replace( /[^\w\-]+/g, '' ) // Remove all non-word characters
            .replace( /\-\-+/g, '-' ) // Replace multiple - with single -
            .replace( /^-+/, '' ) // Trim - from start of text
            .replace( /-+$/, '' ); // Trim - from end of text
    },

    militaryTimeToFormattedTime: time => {
        const hours24 = parseInt( time.toString().substring( 0, 2 ) );
        const hours = ( ( hours24 + 11 ) % 12 ) + 1;
        const amPm = hours24 > 11 ? 'pm' : 'am';
        const minutes = time.toString().substring( 2 );

        return `${hours}:${minutes} ${amPm}`;
    }
};