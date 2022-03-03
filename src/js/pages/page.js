/**
 * Copyright 2021 Select Interactive, LLC. All rights reserved.
 * @author: The Select Interactive dev team (www.select-interactive.com)
*/
import app from './app';

( async () => {

    class Program {
        static main( ...args ) {
            
        }
    }

    try {
        await app.init();
        Program.main();
    }
    catch( e ) { console.error( e ); }

} )();