import { $$ } from '../../utils/$';

class IOMgr {
    constructor() {
        requestAnimationFrame( () => {
            this.elements = $$( '.c-io-element' );
            this.initIO();
        } );
    }

    initIO() {
        this.observer = new IntersectionObserver( entries => this.handleIntersect( entries ), {
            root: null,
            rootMargin: '0px',
            threshold: .35
        } );

        this.elements.forEach( el => this.observer.observe( el ) );
    }

    handleIntersect( entries ) {
        entries.forEach( entry => {
            if ( entry.isIntersecting ) {
                entry.target.classList.add( 'is-visible' );
                this.observer.unobserve( entry.target );
            }
        } );
    }
}

requestAnimationFrame( () => new IOMgr() );