/**
 * Copyright 2022 Select Interactive, LLC. All rights reserved.
 * @author: The Select Interactive dev team (www.select-interactive.com)
 * Feb 2022: Remove polyfills for promise, fetch, and array as IE 11 support dropped.
 */
import '../fetch';

export default class Bootstrap {
    constructor() { }

    init() {
        return new Promise( ( resolve ) => {
            requestAnimationFrame( async () => {
                document.body.classList.add( 'page-is-animatable' );
                resolve();
            } );
        } );
    }
}