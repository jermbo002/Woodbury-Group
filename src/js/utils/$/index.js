/**
* Copyright 2019 Select Interactive, LLC. All rights reserved.
* @author: The Select Interactive dev team (www.select-interactive.com)
*/
import { loadArrayPolyfills } from '../utils/index';

/**
 * @param {any} expr
 * @param {any} context?
 * @returns {HTMLElement} DOM Element matched by expr selector in context
 */
export const $ = ( expr, context = document ) => typeof expr === 'string' ? ( context || document ).querySelector( expr ) : expr || null;

/**
 * @param {string} expr
 * @param {any} context?
 * @returns {array} Array of DOM Elements from a DOM Nodelist selected by expr selector in context
 */
export const $$ = ( expr, context = document ) => {
    if ( !Array.from ) {
        loadArrayPolyfills();
    }

    return Array.from( typeof expr === 'string' ? ( context || document ).querySelectorAll( expr ) : expr || null );
};