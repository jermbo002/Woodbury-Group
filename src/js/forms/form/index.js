/**
* Copyright 2020 Select Interactive, LLC. All rights reserved.
* @author: The Select Interactive dev team (www.select-interactive.com)
*/
import { $, $$ } from '../../utils/$';
import * as Utils from '../../utils/utils';

export default class Form {
    static get DEFAULTS() {
        return {
            DATE: '1970-01-01'
        };
    }

    static get CKEDITOR_CONFIGS() {
        return {
            DEFAULT: {
                allowedContent: true,
                height: 350,
                toolbar: 'Simple'
            },
            BASIC: {
                toolbar: 'Basic'
            },
            BASIC_ALT: {
                toolbar: 'BasicAlt'
            },
            INLINE: {
                toolbar: 'Inline'
            }
        };
    }

    static get SELECTORS() {
        return {
            CHOSEN_SELECT: 'chosen-select',
            CKEDITOR: 'use-ckeditor',
            CKEDITOR_BASIC: 'ckeditor-basic',
            CKEDITOR_BASIC_ALT: 'ckeditor-basic-alt',
            CKEDITOR_INLINE: 'ckeditor-inline',
            INPUT_CURRENCY: 'input-currency',
            INPUT_DATE: 'input-date',
            INPUT_EMAIL: 'input-email',
            INPUT_INTEGER: 'input-integer',
            INPUT_INTEGER_POS: 'input-integer-pos',
            INPUT_NUMBER: 'input-number',
            INPUT_NUMBER_POS: 'input-number-pos',
            INPUT_TEL: 'input-tel',
            INVALID: 'is-invalid',
            HIDDEN: 'hidden',
            REQ_FIELD: 'req'
        };
    }

    static get SCRIPT_PATHS() {
        return {
            CHOSEN: '/chosen-js/chosen.jquery.min.js',
            CKEDITOR: '/js/libs/ckeditor/ckeditor.js',
            DRAGULA: '/dragula/dist/dragula.min.js',
            JQUERY: '/jquery/dist/jquery.min.js',
            MOMENT: '/moment/min/moment.min.js',
            PIKADAY: '/pikaday/pikaday.js',
            TEXT_MASK: '/vanilla-text-mask/dist/vanillaTextMask.js',
            TEXT_MASK_EMAIL: '/text-mask-addons/dist/emailMask.js',
            TEXT_MASK_NUMBER: '/text-mask-addons/dist/createNumberMask.js'
        };
    }

    static get STYLE_PATHS() {
        return {
            CHOSEN: '/node_modules/chosen-js/chosen.min.css',
            DRAGULA: '/node_modules/dragula/dist/dragula.min.css'
        };
    }

    static get TYPE_REGEX() {
        return {
            EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            TEL: /^$|\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
        };
    }

    constructor( el, opts, data ) {
        if ( typeof el === 'string' ) {
            el = $( el, document );
        }

        this._root = el;

        this._opts = Utils.extend( {
            debug: false
        }, opts );

        this._fields = $$( 'input:not([type="file"]),textarea,select', this._root );
        this._reqFields = this._fields.filter( f => f.classList.contains( Form.SELECTORS.REQ_FIELD ) );

        // For backwards compatibilty
        this.fields = this._fields;

        this._formData = Utils.extend( {}, data );
        this._hasChanges = false;

        // expose the root
        this.container = this._root;

        this._initFields();
    }

    getFields() {
        return this._fields;
    }

    getReqFields() {
        return this._reqFields;
    }

    updateReqFields() {
        this._reqFields = this._fields.filter( f => f.classList.contains( Form.SELECTORS.REQ_FIELD ) );
    }

    /**
     * Loop through all form fields and determine what events
     *   or upgrades should be added.
     *
     * @memberof Form
     */
    _initFields() {
        this._fields.forEach( f => {
            const tag = f.tagName.toLowerCase();
            const type = f.type ? f.type.toLowerCase() : '';

            // Check for text editors
            if ( tag === 'textarea' ) {
                this._initEditor( f );
            }
            else if ( tag === 'input' ) {
                this._initInput( f, type );
            }
            else if ( tag === 'select' ) {
                this._initSelect( f );
            }
        } );
    }

    /**
     * Check if a text editor should be used in place of the textarea element
     *
     * @param {*} f
     * @memberof Form
     */
    async _initEditor( f ) {
        // Don't attempt to instatiate a text editor multiple times
        if ( f.isTextEditor ) {
            return;
        }

        if ( f.classList.contains( Form.SELECTORS.CKEDITOR ) ) {
            // Make sure we have the ckeditor script
            await Utils.loadScript( Form.SCRIPT_PATHS.CKEDITOR );

            if ( f.classList.contains( Form.SELECTORS.CKEDITOR_BASIC ) ) {
                CKEDITOR.replace( f.id, Form.CKEDITOR_CONFIGS.BASIC );
            }
            else if ( f.classList.contains( Form.SELECTORS.CKEDITOR_BASIC_ALT ) ) {
                CKEDITOR.replace( f.id, Form.CKEDITOR_CONFIGS.BASIC_ALT );
            }
            else if ( f.classList.contains( Form.SELECTORS.CKEDITOR_INLINE ) ) {
                CKEDITOR.inline( f.id, Form.CKEDITOR_CONFIGS.INLINE );
            }
            else {
                CKEDITOR.replace( f.id, Form.CKEDITOR_CONFIGS.DEFAULT );
            }

            f.isTextEditor = true;
        }
    }

    /**
     * Check if any upgrades should be added to the input.
     * Upgrades can include date picker, input masks, validation, events.
     *
     * @param {HTMLInputElement} f
     * @memberof Form
     */
    _initInput( f, type ) {
        // Check if input should include a date picker
        if ( type === 'date' || f.classList.contains( Form.SELECTORS.INPUT_DATE ) ) {
            this._addDatePicker( f );
        }

        // Apply any masks if applicable
        this._applyMasks( f, type );

        // Add validation to fields on blur
        f.addEventListener( 'blur', _ => {
            // Validate the field
            this._validateField( f );

            // Check if the value has been modified
            this._compareData();

            const val = f.value.trim();

            if ( val === '' ) {
                f.placeholder = f.getAttribute( 'data-placeholder' ) || '';
            }
        } );

        f.addEventListener( 'focus', _ => f.removeAttribute( 'placeholder' ) );
        f.setAttribute( 'data-placeholder', f.getAttribute( 'placeholder' ) || '' );
    }

    /**
     * Check if any upgrades/events need to be added to the select
     *
     * @param {HTMLSelectElement} select
     */
    _initSelect( select ) {
        // Apply chosen
        if ( select.classList.contains( Form.SELECTORS.CHOSEN_SELECT ) ) {
            this._initChosenSelect( select );
        }
        else {
            // Add validation to fields on blur
            select.addEventListener( 'change', _ => {
                // Validate the field
                this._validateField( select );

                // Check of the value has been modified
                this._compareData();
            } );
        }

    }

    /**
     * Upgrade to use chosen select
     *
     * @param {HTMLSelectElement} select
     */
    async _initChosenSelect( select ) {
        if ( select.hasAttribute( 'is-chosen-upgrade' ) ) {
            return;
        }

        await Utils.loadScript( Form.SCRIPT_PATHS.JQUERY );
        await Utils.loadScript( Form.SCRIPT_PATHS.CHOSEN );

        jQuery( select ).chosen();
        select.setAttribute( 'is-chosen-upgrade', '' );
    }

    /**
     * Add the Pikaday datepicker
     *
     * @param {HTMLInputElement} f
     * @returns
     * @memberof Form
     */
    async _addDatePicker( f ) {
        if ( f.hasAttribute( 'is-upgraded' ) ) {
            return;
        }

        // if touch device use default date picker
        if ( 'ontouchstart' in document.documentElement && Utils.mq( '(max-width:1024px)' ) ) {
            f.type = 'date';
            return;
        }

        f.type = 'text';

        await Promise.all( [
            Utils.loadScript( Form.SCRIPT_PATHS.MOMENT ),
            Utils.loadScript( Form.SCRIPT_PATHS.PIKADAY )
        ] );

        const picker = new Pikaday( {
            field: f,
            format: 'MM/DD/YYYY',
            onSelect: date => {
                f.value = moment( date ).format( 'MM/DD/YYYY' );
                f.setAttribute( 'data-date', moment( date ).format( 'YYYY-MM-DD' ) );
            }
        } );

        f.setAttribute( 'is-upgraded', '' );
    }

    /**
     * Check if the respective field requires any input masks to be applied
     *
     * @param {HTMLInputElement} f - the element to apply a mask to
     * @param {String} type - the input type of the element
     * @memberof Form
     */
    async _applyMasks( f, type ) {
        if ( f.classList.contains( 'no-mask' ) ) {
            return;
        }

        if (
            type === 'email'
            || type === 'tel'
            || f.classList.contains( Form.SELECTORS.INPUT_EMAIL )
            || f.classList.contains( Form.SELECTORS.INPUT_TEL )
            || f.classList.contains( Form.SELECTORS.INPUT_INTEGER )
            || f.classList.contains( Form.SELECTORS.INPUT_INTEGER_POS )
            || f.classList.contains( Form.SELECTORS.INPUT_NUMBER )
            || f.classList.contains( Form.SELECTORS.INPUT_NUMBER_POS )
            || f.classList.contains( Form.SELECTORS.INPUT_CURRENCY )
        ) {
            await Promise.all( [
                Utils.loadScript( Form.SCRIPT_PATHS.TEXT_MASK ),
                Utils.loadScript( Form.SCRIPT_PATHS.TEXT_MASK_EMAIL ),
                Utils.loadScript( Form.SCRIPT_PATHS.TEXT_MASK_NUMBER )
            ] );

            if ( f.classList.contains( Form.SELECTORS.INPUT_TEL ) || f.type === 'tel' ) {
                // Add placeholder
                f.setAttribute( 'placeholder', '(212) 123-1234' );

                vanillaTextMask.maskInput( {
                    guide: false,
                    inputElement: f,
                    mask: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
                } );
            }
            else if ( f.classList.contains( 'input-email' ) || type === 'email' ) {
                // Add placeholder
                f.setAttribute( 'placeholder', 'name@domain.com' );

                //f.type = 'text';

                // vanillaTextMask.maskInput( {
                //     guide: false,
                //     inputElement: f,
                //     mask: emailMask.default,
                //     placeholderChar: '\u2000'
                // } );
            }
            else if ( f.classList.contains( Form.SELECTORS.INPUT_NUMBER ) ) {
                vanillaTextMask.maskInput( {
                    guide: false,
                    inputElement: f,
                    mask: createNumberMask.default( {
                        allowDecimal: true,
                        allowNegative: true,
                        prefix: '',
                        includeThousandsSeparator: false
                    } )
                } );
            }
            else if ( f.classList.contains( Form.SELECTORS.INPUT_NUMBER_POS ) ) {
                vanillaTextMask.maskInput( {
                    guide: false,
                    inputElement: f,
                    mask: createNumberMask.default( {
                        allowDecimal: true,
                        allowNegative: false,
                        prefix: '',
                        includeThousandsSeparator: false
                    } )
                } );
            }
            else if ( f.classList.contains( Form.SELECTORS.INPUT_INTEGER ) ) {
                vanillaTextMask.maskInput( {
                    guide: false,
                    inputElement: f,
                    mask: createNumberMask.default( {
                        allowDecimal: false,
                        allowNegative: true,
                        prefix: '',
                        includeThousandsSeparator: false
                    } )
                } );
            }
            else if ( f.classList.contains( Form.SELECTORS.INPUT_INTEGER_POS ) ) {
                vanillaTextMask.maskInput( {
                    guide: false,
                    inputElement: f,
                    mask: createNumberMask.default( {
                        allowDecimal: false,
                        allowNegative: false,
                        prefix: '',
                        includeThousandsSeparator: false
                    } )
                } );
            }
            else if ( f.classList.contains( Form.SELECTORS.INPUT_CURRENCY ) ) {
                vanillaTextMask.maskInput( {
                    guide: false,
                    inputElement: f,
                    mask: createNumberMask.default( {
                        allowDecimal: true
                    } )
                } );
            }
        }
    }

    /**
     * Validate one field, can be input or select
     *
     * @param {*} f
     * @returns {Boolean} if field is valid
     * @memberof Form
     */
    _validateField( f ) {
        const tag = f.tagName.toLowerCase();
        const type = f.type.toLowerCase();
        let val = f.value.trim();
        let isValid = true;

        // Do nothing for chosen select fields
        if ( f.classList.contains( Form.SELECTORS.CHOSEN_SELECT ) ) {
            return isValid;
        }

        if ( tag === 'select' ) {
            val = f.options[f.selectedIndex].value;
        }
        else if ( f.isTextEditor ) {
            val = CKEDITOR.instances[f.id].getData().trim();
        }

        if ( f.classList.contains( Form.SELECTORS.REQ_FIELD ) && ( val === '' || val === '-1' || val === -1 ) ) {
            isValid = false;
        }

        if ( isValid ) {
            if ( ( f.classList.contains( Form.SELECTORS.INPUT_EMAIL ) || type === 'email' ) && val.length > 0 && !Form.TYPE_REGEX.EMAIL.test( val ) ) {
                isValid = false;
            }
            else if ( ( f.classList.contains( Form.SELECTORS.INPUT_TEL ) || type === 'tel' ) && val.length > 0 && !Form.TYPE_REGEX.TEL.test( val ) ) {
                isValid = false;
            }

            if ( f.hasAttribute( 'data-min-length' ) ) {
                const minLength = parseInt( f.getAttribute( 'data-min-length' ), 10 );

                if ( val.length < minLength ) {
                    isValid = false;
                }
            }

            if ( f.hasAttribute( 'data-length' ) ) {
                const length = parseInt( f.getAttribute( 'data-length' ), 10 );

                if ( val.length !== length ) {
                    isValid = false;
                }
            }

            if ( f.hasAttribute( 'data-match' ) ) {
                const selector = f.getAttribute( 'data-match' );
                const matchEl = $( `#${selector}` );
                const matchVal = matchEl.value.trim();

                if ( val !== matchVal ) {
                    isValid = false;
                }
            }
        }

        if ( isValid && f.classList.contains( Form.SELECTORS.INVALID ) ) {
            f.classList.remove( Form.SELECTORS.INVALID );
        }
        else if ( !isValid && !f.classList.contains( Form.SELECTORS.INVALID ) ) {
            f.classList.add( Form.SELECTORS.INVALID );
        }

        if ( !isValid ) {
            console.log( 'Invalid field:', f );
        }

        return isValid;
    }

    validateField( f ) {
        return this._validateField( f );
    }

    /**
     * Compare all fields to data when the form was loaded
     *   to determine if form has changes
     *
     * @memberof Form
     */
    _compareData() {
        this._hasChanges = false;

        this._fields.forEach( f => {
            let key = f.getAttribute( 'name' );

            if ( !key || key === '' ) {
                console.warn( 'No key for field: ', f );
            }
            else {
                const tag = f.tagName.toLowerCase();
                const type = f.type ? f.type.toLowerCase() : '';

                /** @type{any} */
                let val = '';

                if ( type === 'checkbox' ) {
                    val = f.checked;
                }
                else if ( type === 'radio' ) {
                    if ( f.checked ) {
                        val = f.value;
                    }
                    else {
                        key = null;
                    }
                }
                else if ( f.isTextEditor ) {
                    val = CKEDITOR.instances[f.id].getData().trim();
                }
                else if ( tag === 'select' ) {
                    if ( !f.classList.contains( Form.SELECTORS.CHOSEN_SELECT ) ) {
                        val = f.options[f.selectedIndex].value;
                    }
                }
                else {
                    val = f.value.trim();

                    if ( f.classList.contains( Form.SELECTORS.INPUT_INTEGER ) ) {
                        val = parseInt( val, 10 );
                    }
                    else if ( f.classList.contains( Form.SELECTORS.INPUT_DECIMAL ) ) {
                        val = parseFloat( val );
                    }
                    else if ( f.classList.contains( Form.SELECTORS.INPUT_DATE ) && val === '' ) {
                        val = Form.DEFAULTS.DATE;
                    }
                }

                if ( val !== this._formData[key] ) {
                    this._hasChanges = true;
                }
            }
        } );
    }

    /**
     * Validate the form and return true/false depending on validation
     *
     * @returns {Boolean} status of form's validation
     * @memberof Form
     */
    validate() {
        let isValid = true;

        this._fields.forEach( f => {
            if ( !this._validateField( f ) ) {
                isValid = false;
            }
        } );

        return isValid;
    }

    /**
     * Provide backwards compatibility for older projects
     *
     * @returns {Boolean} status of form's validation
     * @memberof Form
     */
    validateFileds() {
        return this.validate();
    }

    /**
     * Collects all from form based on field name attribue as key
     *
     * @returns {Object} JSON object of form data
     * @memberof Form
     */
    collectData() {
        const data = {};

        this._fields.forEach( f => {
            let key = f.getAttribute( 'name' );

            if ( !key || key === '' ) {
                console.warn( 'No key for field: ', f );
            }
            else {
                const tag = f.tagName.toLowerCase();
                const type = f.type ? f.type.toLowerCase() : '';

                /** @type{any} */
                let val = '';

                if ( type === 'checkbox' ) {
                    val = f.checked;
                }
                else if ( type === 'radio' ) {
                    if ( f.checked ) {
                        val = f.value;
                    }
                    else {
                        key = null;
                    }
                }
                else if ( f.isTextEditor ) {
                    val = CKEDITOR.instances[f.id].getData().trim();
                }
                else if ( tag === 'select' ) {
                    if ( !f.classList.contains( Form.SELECTORS.CHOSEN_SELECT ) ) {
                        val = f.options[f.selectedIndex].value;

                        if ( f.classList.contains( Form.SELECTORS.INPUT_INTEGER ) ) {
                            val = parseInt( val, 10 );
                        }
                        else if ( f.classList.contains( Form.SELECTORS.INPUT_DECIMAL ) ) {
                            val = parseFloat( val );
                        }
                    }
                }
                else {
                    val = f.value.trim();

                    if ( f.classList.contains( Form.SELECTORS.INPUT_INTEGER ) ) {
                        val = parseInt( val, 10 );
                    }
                    else if ( f.classList.contains( Form.SELECTORS.INPUT_DECIMAL ) ) {
                        val = parseFloat( val );
                    }
                    else if ( f.classList.contains( Form.SELECTORS.INPUT_CURRENCY ) ) {
                        val = val.replace( /,/g, '' ).replace( '$', '' );
                    }
                    else if ( f.classList.contains( Form.SELECTORS.INPUT_DATE ) ) {
                        if ( val === '' ) {
                            val = Form.DEFAULTS.DATE;
                        }
                        else {
                            val = f.getAttribute( 'data-date' );
                        }
                    }
                }

                if ( key !== null ) {
                    data[key] = val;
                }
            }
        } );

        return data;
    }

    /**
     * Set the values of each form field based on the data passed in
     *
     * @param {Object} data - JSON object of data to set form fields
     * @memberof Form
     */
    setFieldValues( data ) {
        this._formData = data;
        this._hasChanges = false;

        this._fields.forEach( f => {
            let val = data[f.getAttribute( 'name' )];
            const tag = f.tagName.toLowerCase();
            const type = f.type ? f.type.toLowerCase() : '';

            if ( this._opts.debug ) {
                console.log( f.getAttribute( 'name' ) + ' --- ' + val );
            }

            if ( type === 'checkbox' || ( val || val === 0 ) ) {
                if ( type === 'checkbox' ) {
                    f.checked = val;
                }
                else if ( f.isTextEditor ) {
                    val = CKEDITOR.instances[f.id].setData( val );
                }
                else {
                    if ( f.classList.contains( Form.SELECTORS.INPUT_DATE ) ) {
                        if ( data[f.getAttribute( 'name' ) + 'Str'] ) {
                            val = data[f.getAttribute( 'name' ) + 'Str'];
                            val = moment( val ).format( 'MM/DD/YYYY' );
                        }
                        else if ( moment( val ) <= moment( '1970-01-01' ) ) {
                            val = '';
                        }
                        else {
                            val = moment( val ).format( 'MM/DD/YYYY' );
                            f.setAttribute( 'data-date', moment( val ).format( 'YYYY-MM-DD' ) );
                        }
                    }

                    f.value = val;
                }
            }
            else {
                console.warn( 'Property does not exist for key ' + f.getAttribute( 'name' ) );
            }
        } );
    }

    /**
     * Clear form fields
     *
     * @memberof Form
     */
    clearForm() {
        this._fields.forEach( f => {
            const tag = f.tagName.toLowerCase();
            const type = f.type ? f.type.toLowerCase() : '';

            if ( type === 'checkbox' ) {
                f.checked = false;
            }
            else if ( tag === 'textarea' ) {
                if ( f.isTextEditor ) {
                    CKEDITOR.instances[f.id].setData( '' );
                }
                else {
                    f.value = '';
                }
            }
            else if ( tag === 'select' ) {
                if ( f.multiple && f.classList.contains( Form.SELECTORS.CHOSEN_SELECT ) ) {
                    $$( 'option', f ).forEach( opt => opt.selected = false );
                    jQuery( f ).trigger( 'chosen:updated' );
                }
                else {
                    f.value = '-1';
                }
            }
            else {
                f.value = '';
            }

            f.classList.remove( Form.SELECTORS.INVALID );
        } );

        $$( '.row-preview', this._root ).forEach( row => row.innerHTML = '' );
    }

    setFormData( data ) {
        this._formData = data;
    }

    isFormDirty() {
        return this._hasChanges;
    }

    markFormSaved( data ) {
        this._hasChanges = false;
        this._formData = data;
    }

    show() {
        this._root.classList.remove( Form.SELECTORS.HIDDEN );
    }

    hide() {
        this._root.classList.add( Form.SELECTORS.HIDDEN );
    }
}
