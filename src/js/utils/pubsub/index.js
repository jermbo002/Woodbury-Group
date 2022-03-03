/**
* Copyright 2019 Select Interactive, LLC. All rights reserved.
* @author: The Select Interactive dev team (www.select-interactive.com)
*/
const _pubsubEvents = {};

export default class PubSub {
    static publish( name, data ) {
        const handlers = _pubsubEvents[name];

        if ( !!handlers === false ) {
            return;
        }

        handlers.forEach( handler => handler.call( this, data ) );
    }

    static subscribe( name, handler ) {
        let handlers = _pubsubEvents[name];

        if ( !!handlers === false ) {
            handlers = _pubsubEvents[name] = [];
        }

        handlers.push( handler );
    }

    static unsubscribe( name, handler ) {
        const handlers = _pubsubEvents[name];

        if ( !!handlers === false ) {
            return;
        }

        const index = handlers.indexOf( handler );
        handlers.splice( index );
    }
}