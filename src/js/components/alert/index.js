class AlertMgr {
    #alert;

    constructor() {
        this.#alert = null;
    }

    /**
     * 
     * @param {object} config 
     * Config options for
     *  hdr: String
     *  msg: String (can be HTML)
     *  btnConfirmText: String = label of confirm action button
     *  fnConfirm: Function
     *  btnCancelText: String = label of cancel action button
     *  fnCancel: Function
     */
    async show( config ) {
        try {
            if ( this.#alert ) {
                await this.#alert.destroy();
            }
            
            this.#alert = new AlertItem( config );
            await this.#alert.show();
        }
        catch ( e ) {
            // @ts-ignore
            console.log( `Error showing alert: ${e.message}` );
        }
    }

    async close() {
        if ( this.#alert ) {
            await this.#alert.destroy();
            this.#alert = null;
        }
    }
}

class AlertItem {
    #root;

    constructor( config ) {
        this.#root = this._render( config );
    }

    _render( config ) {
        const {
            hdr = '',
            msg = '',
            btnConfirmText = ''
        } = config;

        if ( btnConfirmText === '' || !btnConfirmText ) {
            throw new Error( 'Alert element should provide confirm button text and function.' );
        }

        const { root, container } = this._buildRoot();
        this._buildHeader( container, hdr );
        this._buildBody( container, msg );
        this._buildFooter( container, config );

        return root;
    }   

    _buildRoot() {
        const root = document.createElement( 'div' );
        root.classList.add( 'c-alert' );

        const container = document.createElement( 'div' );
        container.classList.add( 'c-alert__container' );
        root.appendChild( container );

        return {
            root,
            container
        };
    }

    _buildHeader( container, hdr ) {
        const node = document.createElement( 'header' );
        node.classList.add( 'c-alert__header' );
        node.textContent = hdr;
        container.appendChild( node );
    }

    _buildBody( container, msg ) {
        const node = document.createElement( 'div' );
        node.classList.add( 'c-alert__content' );
        node.innerHTML = msg;
        container.appendChild( node );
    }

    _buildFooter( container, config ) {
        const {
            btnConfirmText = '',
            fnConfirm = null,
            btnCancelText = '',
            fnCancel = null
        } = config;

        const node = document.createElement( 'header' );
        node.classList.add( 'c-alert__footer' );

        this._addButton( node, {
            lbl: btnConfirmText,
            fn: fnConfirm
        } );

        if ( btnCancelText !== '' && fnCancel ) {
            this._addButton( node, {
                lbl: btnCancelText,
                fn: fnCancel
            } );
        }

        container.appendChild( node );
    }

    _addButton( node, opts ) {
        const { lbl, fn, className = 'c-btn' } = opts;
        const btn = document.createElement( 'button' );
        btn.classList.add( className );
        btn.textContent = lbl;
        btn.addEventListener( 'click', () => fn() );
        node.appendChild( btn );
    }

    show() {
        return new Promise( ( resolve ) => {
            requestAnimationFrame( () => {
                document.firstElementChild.insertBefore( this.#root, document.body );

                requestAnimationFrame( () => {
                    this.#root.classList.add( 'c-alert--is-visible' );
                    resolve();
                } );
            } );
        } );
    }

    destroy() {
        return new Promise( ( resolve ) => {
            this.#root.addEventListener( 'transitionend', () => {
                if ( this.#root ) {
                    this.#root.parentNode.removeChild( this.#root );
                    this.#root = null;
                }
                
                resolve();
            } );

            this.#root.classList.remove( 'c-alert--is-visible' );
        } );
    }
}

export default new AlertMgr();