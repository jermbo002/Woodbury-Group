class Toast {
    constructor() {
        this.root = document.createElement( 'div' );
        this.root.classList.add( 'c-toast-group' );
        document.firstElementChild.insertBefore( this.root, document.body );
        this._position = getComputedStyle( this.root ).getPropertyValue( '--toast-position' );
    }

    _createItem( html ) {
        const node = document.createElement( 'div' );
        node.innerHTML = `
            <div class="c-toast-item__col">${html}</div>
            <div class="c-toast-item__col">
                <button class="c-toast-item__btn-close">Dismiss</button>
            </div>
        `;
        node.classList.add( 'c-toast-item' );
        node.setAttribute( 'role', 'status' );
        node.setAttribute( 'aria-live', 'polite' );
        return node;
    }

    _addItem( toast ) {
        const { matches: motionOK } = window.matchMedia( '(prefers-reduced-motion: no-preference)' );

        this.root.children?.length && motionOK
            ? this._flip( toast )
            : this.root.appendChild( toast );
    }

    _flip( toast ) {
        const first = this.root.offsetHeight;
        
        if ( this._position.includes( 'top' ) ) {
            this.root.prepend( toast );
        }
        else {
            this.root.appendChild( toast );
        }

        const last = this.root.offsetHeight;
        const invert = this._position.includes( 'top' ) ? ( last - first ) * -1 : last - first;

        const animation = this.root.animate( [
            { transform: `translateY(${invert}px)` },
            { transform: 'translateY(0)' }
        ], {
            duration: 150,
            easing: 'ease-out'
        } );

        try {
            animation.startTime = document.timeline.currentTime;
        }
        catch ( e ) { }
    }

    show( html, clear = false ) {
        if ( clear ) {
            this.clear();
        }

        const toast = this._createItem( html );
        this._addItem( toast );

        const btn = toast.querySelector( '.c-toast-item__btn-close' );
        const dismissPromise = new Promise( ( resolve ) => {
            btn.addEventListener( 'click', () => resolve() );
        } );

        return new Promise( async ( resolve, reject ) => {
            const animationPromises = Promise.allSettled( toast.getAnimations().map( animation => animation.finished ) );
            
            await Promise.race( [
                dismissPromise,
                animationPromises
            ] );
            
            this.root.removeChild( toast );
            resolve();
        } );
    }

    clear() {
        if ( this.root.children?.length ) {
            [...this.root.children].forEach( el => this.root.removeChild( el ) );
        }
    }
}

export default new Toast();