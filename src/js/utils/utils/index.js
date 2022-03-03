/**
 * Copyright 2019 Select Interactive, LLC. All rights reserved.
 * @author: The Select Interactive dev team (www.select-interactive.com)
 */

/**
 * @export
 * @returns {Boolean}
 */
export function isRetina() {
    if ( window.matchMedia ) {
        var mq = window.matchMedia( 'only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)' );
        return ( mq && mq.matches || ( window.devicePixelRatio > 1 ) );
    }

    return false;
}

/**
* @export
* @param {any} obj1
* @param {any} obj2
* @returns {object}
*/
export function extend( obj1, obj2 ) {
    let obj = obj1;

    for ( var key in obj2 ) {
        obj[key] = obj2[key];
    }

    return obj;
}

/**
 * @export
 * @returns {number} - The current scroll position of the window
 */
export function getWindowScrollPosition() {
    if ( typeof window.scrollY === 'undefined' ) {
        return document.documentElement.scrollTop;
    }
    else {
        return window.scrollY;
    }
}

/**
 * @export
 * @param {string} mediaQuery
 * @returns {boolean}
 */
export function mq( mediaQuery ) {
    return !( window.matchMedia ) || ( window.matchMedia && window.matchMedia( mediaQuery ).matches );
}


// Probably can rewrite with Map()?
/** @type{Array} */
const _registry = [];

/** @type{Array} */
const _registryPromises = [];

/**
 * @export
 * @param {string} url
 * @param {any} callback
 * @returns {Promise}
 */
export function loadScript( url, callback = () => { } ) {
    let cached = false;
    let cachedIndex = -1;

    _registry.some( ( r, i ) => {
        if ( r === url ) {
            cached = true;
            cachedIndex = i;
            return true;
        }
    } );

    if ( cached ) {
        return _registryPromises[cachedIndex];
    }

    // @ts-ignore
    if ( typeof self.Promise === 'undefined' || !self.Promise ) {
        return {
            // @ts-ignore
            then: fn => polyfillPromises( _ => loadScript( url, fn ) )
        };
    }

    const p = new Promise( ( resolve, reject ) => {
        const script = document.createElement( 'script' );
        script.src = url;
        script.async = true;

        _registry.push( url );

        script.onload = _ => {
            resolve( script );

            if ( callback && typeof callback === 'function' ) {
                callback( script );
            }
        };

        script.onerror = reject;

        document.body.appendChild( script );
    } );

    _registryPromises.push( p );
    return p;
}

/**
 * @export
 * @param {string} url
 * @param {any} callback
 * @returns {Promise}
 */
export function preloadImage( url, callback ) {
    // @ts-ignore
    if ( typeof self.Promise === 'undefined' || !self.Promise ) {
        return {
            // @ts-ignore
            then: fn => polyfillPromises( _ => preloadImage( url, fn ) )
        };
    }

    return new Promise( ( resolve, reject ) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = reject;

        if ( callback && typeof callback === 'function' ) {
            callback();
        }
    } );
}

/**
 * @export
 * @param {any} predicate
 * @param {string} msg
 * @returns {boolean}
 */
export function assert( predicate, msg ) {
    if ( predicate ) {
        return true;
    }

    console.error( msg );
    return false;
}

/**
 * @export
 * @param {any} fn
 */
export function polyfillPromises( fn ) {
    // @ts-ignore
    if ( !window.Promise ) {
        const script = document.createElement( 'script' );
        script.src = '/promise-polyfill/dist/polyfill.min.js';
        script.async = true;
        script.onload = fn;
        document.body.appendChild( script );
    }
}

/**
 * @export
 * @param {any} fn
 */
export function polyfillFetch( fn ) {
    return new Promise( async ( resolve ) => {
        const script = document.createElement( 'script' );
        script.src = '/whatwg-fetch/dist/fetch.umd.js';
        script.async = true;
        script.onload = () => resolve( fn );
        document.body.appendChild( script );
    } );
}

/**
 * @export
 * Adds polyfill for custom events for IE and Safari
 */
export function loadCustomEventPolyfill() {
    // @ts-ignore
    if ( typeof window.CustomEvent === 'function' ) return false;

    // @ts-ignore
    function CustomEvent( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    // @ts-ignore
    window.CustomEvent = CustomEvent;
}

/**
 * @export
 */
export function loadArrayPolyfills() {
    // Polyfill for Array.from
    /* eslint-disable */
    // @ts-ignore
    if ( !Array.from ) { Array.from = function() { var l = Object.prototype.toString, h = function( c ) { return 'function' === typeof c || '[object Function]' === l.call( c ) }, m = Math.pow( 2, 53 ) - 1; return function( c ) { var k = Object( c ); if ( null == c ) throw new TypeError( 'Array.from requires an array-like object - not null or undefined' ); var d = 1 < arguments.length ? arguments[1] : void 0, f; if ( 'undefined' !== typeof d ) { if ( !h( d ) ) throw new TypeError( 'Array.from: when provided, the second argument must be a function' ); 2 < arguments.length && ( f = arguments[2] ) } var a; a = Number( k.length ); a = isNaN( a ) ? 0 : 0 !== a && isFinite( a ) ? ( 0 < a ? 1 : -1 ) * Math.floor( Math.abs( a ) ) : a; a = Math.min( Math.max( a, 0 ), m ); for ( var g = h( this ) ? Object( new this( a ) ) : Array( a ), b = 0, e; b < a; )e = k[b], g[b] = d ? 'undefined' === typeof f ? d( e, b ) : d.call( f, e, b ) : e, b += 1; g.length = a; return g } }(); }
    if ( !Array.prototype.findIndex ) {
        Object.defineProperty( Array.prototype, 'findIndex', {
            // @ts-ignore
            value: function( predicate ) {
                // 1. Let O be ? ToObject(this value).
                if ( this == null ) {
                    throw new TypeError( '"this" is null or not defined' );
                }

                var o = Object( this );

                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;

                // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                if ( typeof predicate !== 'function' ) {
                    throw new TypeError( 'predicate must be a function' );
                }

                // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                var thisArg = arguments[1];

                // 5. Let k be 0.
                var k = 0;

                // 6. Repeat, while k < len
                while ( k < len ) {
                    // a. Let Pk be ! ToString(k).
                    // b. Let kValue be ? Get(O, Pk).
                    // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                    // d. If testResult is true, return k.
                    var kValue = o[k];
                    if ( predicate.call( thisArg, kValue, k, o ) ) {
                        return k;
                    }
                    // e. Increase k by 1.
                    k++;
                }

                // 7. Return -1.
                return -1;
            },
            configurable: true,
            writable: true
        } );
    }
    /* eslint-enable */
}

/**
 * @exports
 * @returns {String}
 */
export function getTodayClientDate() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const year = today.getFullYear();
    const fullDate = `${month}/${day}/${year}`;
    return fullDate;
}

/**
 * @exports
 * @returns {String}
 */
export function getTodayClientDateTime() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const year = today.getFullYear();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();
    const fullDate = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    return fullDate;
}

/**
 * @exports
 * @returns {number}
 */
export function getTimezoneOffset() {
    return ( new Date() ).getTimezoneOffset();
}


/** 
 * @exports
 * @param {String} time - The military time to convert to 12 hour am/pm time
 * @returns {String}
 */
export function militaryTimeToFormattedTime( time ) {
    const hours24 = parseInt( time.toString().substring( 0, 2 ) );
    const hours = ( ( hours24 + 11 ) % 12 ) + 1;
    const amPm = hours24 > 11 ? 'pm' : 'am';
    const minutes = time.toString().substring( 2 );
    return `${hours}:${minutes} ${amPm}`;
}

export function createUrlString( str ) {
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
}

export function createFirebaseSearchTerms( phrase = '' ) {
    let searchTerms = [''];

    const generateTerms = phrase => {
        if ( phrase === '' ) {
            return;
        }

        for ( let i = 1; i <= phrase.length; i++ ) {
            const term = phrase.substring( 0, i );
            searchTerms.push( term );
        }

        const words = phrase.split( ' ' );
        const nextTerm = words.filter( ( word, i ) => i > 0 ).map( word => word ).join( ' ' );
        generateTerms( nextTerm );
    };

    generateTerms( phrase.toLowerCase() );
    return searchTerms;
}